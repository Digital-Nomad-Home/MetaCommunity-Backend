# 后端与合约交互说明书

> 本文档面向后端开发者，描述每个业务场景下需要调用的合约函数、参数、权限要求及返回值。

---

## 0. 合约地址与角色私钥

部署完成后，链上存在以下 4 个核心合约：

| 合约                       | 说明                                   |
| -------------------------- | -------------------------------------- |
| `ContributionTokenFactory` | Token 工厂（管理发行主体、创建 Token） |
| `TaskEscrowManager`        | 任务托管（锁定、结算、退款、争议）     |
| `ContributionBadgeSBT`     | 徽章合约（规则设置、铸造）             |
| `RedemptionManager`        | 核销合约（商户消费、积分销毁）         |

ContributionToken 不由后端直接部署，由 Factory 的 `createToken()` 内部创建。

后端 relayer 需要的链上角色：

| 角色 keccak256              | 用途                    | 授予到哪个合约           |
| --------------------------- | ----------------------- | ------------------------ |
| `DEFAULT_ADMIN_ROLE` (0x00) | 最高管理员              | 部署者持有全部合约       |
| `TASK_MANAGER_ROLE`         | 发布/结算/退款/争议任务 | `TaskEscrowManager`      |
| `PAYMENT_MANAGER_ROLE`      | 触发商户消费            | `RedemptionManager`      |
| `REDEMPTION_OPERATOR_ROLE`  | 触发核销销毁            | `RedemptionManager`      |
| `FINANCE_ROLE`              | 增发 backedQuota        | 每个 `ContributionToken` |
| `BADGE_ADMIN_ROLE`          | 设置徽章规则            | `ContributionBadgeSBT`   |
| `BADGE_MINTER_ROLE`         | 铸造徽章                | `TaskEscrowManager` 地址 |
| `PAUSER_ROLE`               | 紧急暂停                | 全部 4 个合约            |

---

## 1. 部署与初始化

部署顺序固定：

```
1. 部署 ContributionTokenFactory(platformAdmin)
2. 部署 ContributionBadgeSBT(name, symbol, platformAdmin)
3. 部署 TaskEscrowManager(platformAdmin, badgeAddress)
4. 部署 RedemptionManager(platformAdmin)

5. escrowManager.setTokenFactory(factoryAddress)
6. badge.setTokenFactory(factoryAddress)
7. badge.grantRole(BADGE_MINTER_ROLE, escrowManager地址)
```

初始化后，relayer 地址需要获得对应角色：

```solidity
// 给 relayer 授予 TASK_MANAGER_ROLE
escrowManager.grantRole(keccak256("TASK_MANAGER_ROLE"), relayer);

// 给 relayer 授予 PAYMENT_MANAGER_ROLE, REDEMPTION_OPERATOR_ROLE
redemptionManager.grantRole(keccak256("PAYMENT_MANAGER_ROLE"), relayer);
redemptionManager.grantRole(keccak256("REDEMPTION_OPERATOR_ROLE"), relayer);

// 给 relayer 授予 PAUSER_ROLE（全部 4 个合约都需要）
factory.grantRole(keccak256("PAUSER_ROLE"), relayer);
escrowManager.grantRole(keccak256("PAUSER_ROLE"), relayer);
// ... 依此类推
```

---

## 2. 认证发行主体 & 创建积分 Token

### 2.1 认证（链下审核后）

后端审核居委会/物业/共建企业资质通过后：

```
Factory.setIssuerApproval(
    issuer,          // 发行主体的链上地址
    true,            // 认证通过
    issuerType,      // IssuerType 枚举: 1=ResidentsCommittee, 2=PropertyManagement, 3=CoBuildingEnterprise
    orgIdHash,       // keccak256(organizationId + salt) — 链上不存明文
    metadataURI      // 链下元数据 URI（如 ipfs://...）
)
调用方：DEFAULT_ADMIN_ROLE
```

> 简化版可用 `setCertifiedIssuer(issuer, true)` 但缺少 IssuerType/orgIdHash 信息。

查询：

```solidity
factory.certifiedIssuers(issuer)  // → bool
factory.issuers(issuer)           // → IssuerInfo 结构体
```

### 2.2 创建 Token

认证后，由 **Issuer 本人** 或 **平台管理员** 调用：

```
Factory.createToken(
    name,             // string — Token 名称
    symbol,           // string — Token 符号
    cap,              // uint256 — 最大发行上限（decimals=0，所以 1000000 就是 100 万分）
    issuer,           // address — 必须是已认证的发行主体
    communityIdHash,  // bytes32 — keccak256(communityId + salt)
    metadataURI       // string — 元数据 URI
)
→ returns (address token)  // 返回新创建的 Token 合约地址

调用方：issuer 本人 或 DEFAULT_ADMIN_ROLE
```

限制：

- `issuer` 必须是已认证的
- 同一个 `communityIdHash` 只能有一个 active token
- `cap > 0`, `name`/`symbol` 非空

创建成功后自动完成：

- Token 合约部署
- `registeredTokens[token] = true`
- `activeTokenByCommunity[communityIdHash] = token`
- `tokensByIssuer[issuer].push(token)`

事件：`ContributionTokenCreated(token, issuer, communityIdHash, name, symbol, cap, metadataURI)`

### 2.3 Token 创建后的配置

Token 创建后，平台管理员需要通过 Factory 配置 manager 权限：

```solidity
// 授权 TaskEscrowManager 操作该 Token（必须！否则无法发布任务）
factory.setTokenManager(token, escrowManagerAddress, true);

// 授权 RedemptionManager 销毁权限（必须！否则无法核销）
factory.setTokenRedemptionManager(token, redemptionManagerAddress, true);

// 如果 RedemptionManager 还需要 merchant spending 的 managerTransfer 权限
factory.setTokenManager(token, redemptionManagerAddress, true);
```

---

## 3. 增发基础额度 (backedQuota)

居委会收到基础资金或赞助承诺后：

```
Token.increaseBackedQuota(
    amount,      // uint256 — 增加额度
    proofHash    // bytes32 — 链下资金凭证哈希
)
调用方：FINANCE_ROLE（Token 自身的 issuer 也持有 FINANCE_ROLE）

// 或直接设置额度
Token.setBackedQuota(
    newBackedQuota,  // uint256 — 新额度（不能 < releasedAmount）
    proofHash        // bytes32
)
```

也可以通过 Factory 的便捷函数（DEFAULT_ADMIN_ROLE）：

```solidity
factory.increaseTokenBackedQuota(token, amount, proofHash);
```

限制：

- `amount > 0`
- `backedQuota + amount <= cap`
- `proofHash != bytes32(0)`

事件：`BackedQuotaIncreased(amount, newBackedQuota, proofHash)`

查询：

```solidity
token.backedQuota()     // → uint256
token.releasedAmount()  // → uint256 (已释放量)
token.cap()             // → uint256 (最大上限)
```

---

## 4. 发布任务 & 锁定积分

后端在小程序收到任务发布请求后，生成 `taskId` 和 `taskHash`：

```
EscrowManager.createTaskEscrow(
    taskId,     // bytes32 — keccak256(backendTaskUUID)
    token,      // address — 积分 Token 合约地址
    publisher,  // address — 发布人地址
    reward,     // uint256 — 奖励积分数量
    taskHash,   // bytes32 — keccak256(canonicalTaskPayload) 任务详情JSON的哈希
    deadline    // uint64  — 任务截止时间的 Unix timestamp
)
调用方：TASK_MANAGER_ROLE
```

**锁定逻辑**（合约自动处理）：

| 条件                          | 行为                                        |
| ----------------------------- | ------------------------------------------- |
| publisher ≠ issuer, 余额足够  | 从 publisher 余额锁定 reward                |
| publisher ≠ issuer, 余额不足  | **revert** — 发布失败                       |
| publisher == issuer, 余额足够 | 从 publisher 余额锁定 reward                |
| publisher == issuer, 余额不足 | 先用 publisher 余额，差额从 issuer 储备释放 |

创建成功后：

- 任务状态 → `Locked`
- 积分转到 `EscrowManager` 地址托管

事件：`TaskEscrowCreated(taskId, token, publisher, reward, taskHash, deadline, fromPublisherBalance, fromIssuerReserve)`

查询：

```solidity
escrowManager.getTaskEscrow(taskId)
// → TaskEscrow 结构体: token, publisher, worker, reward, taskHash, deadline, status, ...
```

**重要**：`taskId` 不可重复，`deadline > block.timestamp`，`token` 必须是 Factory 注册过的。

---

## 5. 任务验收 & 积分拨付

验收通过后：

```
EscrowManager.settleTask(
    taskId,         // bytes32
    worker,         // address — 任务完成人地址
    validationHash  // bytes32 — keccak256(canonicalValidationPayload) 验收单哈希
)
调用方：TASK_MANAGER_ROLE
```

执行后：

1. 任务状态 → `Settled`
2. 积分从 EscrowManager 转到 worker
3. `token.cumulativeEarned[worker]` 自动增加 reward
4. 触发 `BadgeSBT.mintIfEligible()` 检查是否达到徽章阈值

事件：

- `TaskSettled(taskId, token, publisher, worker, reward, validationHash, settledAt)`
- 如果铸币成功：`BadgeMinted(tokenId, token, user, threshold, badgeName, metadataURI)`

限制：

- task 状态必须是 `Locked`
- worker != address(0)
- 不可重复 settle

---

## 6. 任务退款 / 取消

### 6.1 全额退款（无 worker）

```
EscrowManager.refundTask(
    taskId,       // bytes32
    mode,         // RefundMode — 0=FullRefundToPublisher 或 3=ReturnReserveAndRefundPublisher
    reasonHash    // bytes32 — keccak256(canonicalReasonPayload)
)
调用方：TASK_MANAGER_ROLE
```

两种模式行为相同：publisher 余额退回 publisher，issuer 储备退回储备池。

### 6.2 部分支付 + 退款

```
EscrowManager.refundTask(
    taskId,         // bytes32
    mode,           // RefundMode — 1=PartialPayToWorker
    worker,         // address
    workerAmount,   // uint256 — 支付给 worker 的金额 (0 < workerAmount < reward)
    reasonHash      // bytes32
)
调用方：TASK_MANAGER_ROLE
```

`workerAmount` 优先从 `fromPublisherBalance` 支付，不足部分从 `fromIssuerReserve` 补足，剩余分别退回。

### 6.3 全额支付（等价于 settle）

```
EscrowManager.refundTask(
    taskId,         // bytes32
    mode,           // RefundMode — 2=FullPayToWorker
    worker,         // address
    workerAmount,   // uint256 — 传 0 或 reward 均可
    reasonHash      // bytes32
)
```

效果同 `settleTask`，但标记为争议补偿。Event 同时发出 `TaskRefunded` 和 `TaskSettled`。

事件：`TaskRefunded(taskId, token, publisher, worker, mode, workerAmount, publisherRefund, reserveReturned, reasonHash, refundedAt)`

限制：

- task 状态不能是 `Settled` / `Refunded` / `Closed`
- `reasonHash != bytes32(0)`

---

## 7. 任务争议 & 仲裁

### 7.1 开启争议

```
EscrowManager.openDispute(
    taskId,       // bytes32 — 必须是 Locked 状态的任务
    disputeHash   // bytes32 — 争议内容哈希
)
调用方：TASK_MANAGER_ROLE
```

状态变化：`Locked` → `Disputed`

事件：`TaskDisputed(taskId, disputeHash, disputedAt)`

### 7.2 解决争议

```
EscrowManager.resolveDispute(
    taskId,          // bytes32 — 必须是 Disputed 状态
    worker,          // address — worker 地址（全额/部分支付时必填）
    workerAmount,    // uint256 — 支付给 worker 的金额
    resolutionHash   // bytes32 — 仲裁结果哈希
)
调用方：TASK_MANAGER_ROLE
```

| workerAmount 值 | 效果                           |
| :-------------: | ------------------------------ |
|        0        | 全额退款给 publisher，储备退回 |
|    == reward    | 全额支付给 worker              |
| 0 < x < reward  | 部分支付，剩余退款             |

事件：`DisputeResolved(taskId, worker, workerAmount, resolutionHash, resolvedAt)`

---

## 8. 商户消费

### 8.1 添加认证商户

```
RedemptionManager.setMerchant(
    merchant,   // address
    approved    // bool
)
调用方：DEFAULT_ADMIN_ROLE
```

事件：`MerchantApprovalUpdated(merchant, approved)`

### 8.2 开启商户消费功能

```
RedemptionManager.setMerchantSpendEnabled(true)
调用方：DEFAULT_ADMIN_ROLE
```

### 8.3 用户消费积分

```
RedemptionManager.spendToMerchant(
    orderId,     // bytes32 — keccak256(backendOrderUUID)
    token,       // address
    user,        // address — 消费者
    merchant,    // address — 商户（必须已认证）
    amount,      // uint256
    orderHash    // bytes32 — keccak256(canonicalOrderPayload)
)
调用方：PAYMENT_MANAGER_ROLE
```

积分从 user 转到 merchant。后续商户可申请核销。

事件：`MerchantSpend(orderId, token, user, merchant, amount, orderHash)`

限制：

- `merchantSpendEnabled == true`
- `merchant` 必须在 `approvedMerchants` 中
- `orderId` 不可重复

---

## 9. 核销 & 销毁积分

商户/居委会申请核销，居委会线下确认基础资金支付后：

```
RedemptionManager.redeemAndBurn(
    redemptionId,    // bytes32 — keccak256(backendRedemptionUUID)
    token,           // address
    from,            // address — 商户或持有积分的地址
    amount,          // uint256
    redemptionHash   // bytes32 — keccak256(canonicalRedemptionPayload)
)
调用方：REDEMPTION_OPERATOR_ROLE
```

执行后：

- `from` 的积分被 burn
- `totalSupply` 减少
- `burnedAmount` 增加
- `releasedAmount` 不减少（积分已进入流通）

事件：`RedeemedAndBurned(redemptionId, token, from, amount, redemptionHash, burnedAt)`

限制：`redemptionId` 不可重复。

---

## 10. 徽章规则 & 铸造

### 10.1 设置徽章规则

```
BadgeSBT.setBadgeRule(
    token,        // address — 对应的 ContributionToken 地址
    threshold,    // uint256 — 累计获得积分的阈值（MVP 用 1000）
    badgeName,    // string — 徽章名称（如 "社区共建者"）
    metadataURI,  // string — 徽章元数据 URI
    active        // bool — 是否生效
)
调用方：BADGE_ADMIN_ROLE
```

事件：`BadgeRuleSet(token, threshold, badgeName, metadataURI, active)`

### 10.2 自动铸造（任务结算时）

`settleTask` / `FullPayToWorker` / `PartialPayToWorker` 均会自动调用 `badge.mintIfEligible(token, worker)`。

如果 `cumulativeEarned[worker] >= threshold` 且徽章尚未铸造，自动 mint。

无需后端额外调用。

### 10.3 手动补救铸造

如果某次结算因故未铸造徽章（如合约 pause），用户可自行 claim：

```
BadgeSBT.claimBadge(
    token,       // address
    threshold    // uint256
)
调用方：用户本人（msg.sender）
→ returns (uint256 tokenId)
```

限制：该用户的 `cumulativeEarned` 必须达到 threshold，且该徽章尚未铸造。

### 10.4 查询

```solidity
badge.ownerOf(tokenId)          // → address — 徽章持有者
badge.balanceOf(user)           // → uint256 — 用户持有徽章数量
badge.locked(tokenId)           // → bool — 始终 true
badge.tokenURI(tokenId)         // → string — 元数据 URI
badge.getBadgeRule(token, threshold) // → BadgeRule 结构体
badge.thresholdCount(token)     // → uint256
badge.thresholdAt(token, index) // → uint256
badge.tokenIdOf(token, user, threshold) // → uint256（离线计算 tokenId）
```

---

## 11. 紧急暂停 & 恢复

全部 4 个核心合约均支持独立暂停。由 PAUSER_ROLE 调用：

```solidity
factory.pause()        // 暂停 Factory（禁止 createToken, setCertifiedIssuer）
escrowManager.pause()  // 暂停任务相关操作
redemptionManager.pause() // 暂停消费和核销
badge.pause()          // 暂停徽章规则设置和铸造
```

暂停时 read-only 函数正常可用，写入函数 revert。

恢复：`contract.unpause()`

事件：`Paused(msg.sender)` / `Unpaused(msg.sender)`

查询：`contract.paused()` → bool

---

## 12. ID 生成规范

所有业务 ID 统一使用 `bytes32`，由后端 UUID 派生：

```javascript
// 伪代码
taskId = keccak256(backendTaskUUID);
orderId = keccak256(backendOrderUUID);
redemptionId = keccak256(backendRedemptionUUID);
communityIdHash = keccak256(communityId + salt);
taskHash = keccak256(canonicalTaskPayload); // 任务详情 JSON 的规范化哈希
orderHash = keccak256(canonicalOrderPayload); // 订单详情 JSON 的规范化哈希
validationHash = keccak256(canonicalValidationPayload); // 验收单 JSON 的哈希
reasonHash = keccak256(canonicalReasonPayload); // 退款/争议原因的哈希
proofHash = keccak256(auditProof); // 资金凭证的哈希
```

> 链上不得保存明文身份证号、手机号、微信 openid、详细地址、任务完整描述、交付图片/视频原文。

---

## 13. 幂等性保证

以下 ID 链上保证不可重复使用：

- `taskId` — 重复创建/结算/退款均 revert
- `orderId` — 重复消费 revert
- `redemptionId` — 重复核销 revert
- 每个 Token 内部的 `referenceId`（由合约自动生成）—— 同一操作不可重放

后端在调用前可查询：

```solidity
escrowManager.getTaskEscrow(taskId).status // → None 表示未使用
redemptionManager.usedOrders(orderId)       // → bool
redemptionManager.usedRedemptions(redemptionId) // → bool
```

---

## 14. 完整业务流程示例

### 发布-结算流程

```
1. 用户在微信小程序发布任务
2. 后端生成 taskId = keccak256(uuid), taskHash = keccak256(taskJson)
3. 后端验证：实名、风控、余额、deadline
4. relayer 调用: escrowManager.createTaskEscrow(taskId, token, publisher, reward, taskHash, deadline)
5. 监听事件 TaskEscrowCreated → 数据库标记任务"已发布"

6. Worker 提交成果（链下保存交付材料）
7. Validator 验收通过
8. 后端生成 validationHash = keccak256(validationJson)
9. relayer 调用: escrowManager.settleTask(taskId, worker, validationHash)
10. 监听事件 TaskSettled → 数据库更新 worker 余额和贡献
11. 监听事件 BadgeMinted → 数据库记录徽章（如有）
```

### 商户消费-核销流程

```
1. 用户在合作商户消费积分
2. 后端生成 orderId = keccak256(uuid), orderHash = keccak256(orderJson)
3. relayer 调用: redemptionManager.spendToMerchant(orderId, token, user, merchant, amount, orderHash)
4. 监听事件 MerchantSpend → 数据库记录消费

5. 商户申请核销
6. 居委会线下确认基础资金支付
7. 后端生成 redemptionId = keccak256(uuid), redemptionHash = keccak256(redemptionJson)
8. relayer 调用: redemptionManager.redeemAndBurn(redemptionId, token, merchant, amount, redemptionHash)
9. 监听事件 RedeemedAndBurned → 数据库记录核销
```

---

## 15. 常用查询一览

### Token 状态

| 查询                           | 返回值                 |
| ------------------------------ | ---------------------- |
| `token.name()`                 | string                 |
| `token.symbol()`               | string                 |
| `token.decimals()`             | uint8 (固定 0)         |
| `token.totalSupply()`          | 当前总流通量           |
| `token.cap()`                  | 最大发行上限           |
| `token.backedQuota()`          | 已储备支持的最大释放量 |
| `token.releasedAmount()`       | 已从储备释放的净量     |
| `token.burnedAmount()`         | 已销毁量               |
| `token.balanceOf(addr)`        | addr 当前可用余额      |
| `token.cumulativeEarned(addr)` | addr 累计任务获得积分  |
| `token.issuer()`               | 发行主体地址           |

### 任务状态

| 查询                                  | 返回值                         |
| ------------------------------------- | ------------------------------ |
| `escrowManager.getTaskEscrow(taskId)` | TaskEscrow 结构体（含 status） |

### 用户徽章

| 查询                                      | 返回值                |
| ----------------------------------------- | --------------------- |
| `badge.balanceOf(user)`                   | 持有徽章数量          |
| `badge.tokenIdOf(token, user, threshold)` | tokenId（可离线计算） |
| `badge.ownerOf(tokenId)`                  | 徽章持有者            |
| `badge.tokenURI(tokenId)`                 | 徽章元数据 URI        |

---

## 16. 错误处理

合约 revert 时返回自定义 error。后端应解析这些 error selector：

| Error                           | 原因                   |
| ------------------------------- | ---------------------- |
| `IssuerNotCertified()`          | 发行主体未认证         |
| `TaskAlreadyExists()`           | taskId 已存在          |
| `TaskNotFound()`                | taskId 不存在          |
| `InvalidTaskState()`            | 任务状态不允许当前操作 |
| `InsufficientBalance()`         | 余额不足               |
| `InsufficientBackedQuota()`     | 储备额度不足           |
| `CapExceeded()`                 | 超过发行上限           |
| `ReferenceAlreadyUsed()`        | referenceId 已使用     |
| `ContractPaused()`              | 合约已暂停             |
| `CommunityTokenAlreadyExists()` | 社区已有 active token  |
| `MerchantNotApproved()`         | 商户未认证             |
| `MerchantSpendDisabled()`       | 商户消费功能未开启     |
| `OrderAlreadyUsed()`            | orderId 重复           |
| `RedemptionAlreadyUsed()`       | redemptionId 重复      |
| `BadgeAlreadyMinted()`          | 徽章已铸造             |
| `BadgeNotEligible()`            | 不满足徽章条件         |

> Solidity 自定义 error 的 selector = `bytes4(keccak256("ErrorName()"))`
