# 部署文档

- 腾讯云长安链[地址](https://console.cloud.tencent.com/tbaas/chainmaker/chain)
- 参考腾讯云上的 长安链ChainMaker [开发文档](https://cloud.tencent.com/document/product/663/72542) 以及 长安链官网 [使用 Solidity 进行智能合约开发](https://docs.chainmaker.org.cn/v2.2.1/html/operation/%E6%99%BA%E8%83%BD%E5%90%88%E7%BA%A6.html#solidity)

## Compile Contract

- 首先，我们要编译5个合约
- Contracts/managers/ContributionTokenFactory.sol
- Contracts/tokens/ContributionBadgeSBT.sol
- Contracts/managers/TaskEscrowManager.sol
- Contracts/managers/RedemptionManager.sol
- Contracts/tokens/ContributionToken.sol
- ContributionToken 合约要通过调用 createToken() 来部署，这一步我们只编译不部署。

### 部署合约

- 生成账户

```bash
# Generate Account
cast wallet new
```

#### ContributionTokenFactory

- 首先，生成一个 platformAdmin account
- 把 `ContributionTokenFactory.abi` 和 `ContributionTokenFactory.bin` 上传到长安链上
- 初始化参数
    - key: `platformAdmin`, value: `0x4394a57A06098404dCA9133a06bd2A8C81afDf12`
- 合约地址： `9e69161dc547e7715c3868795d930e0dcc941ab4`

#### ContributionBadgeSBT

- 先部署 Badge，才能部署后面的 TaskEscrowManager
- 初始化参数
    - key: `name_`, value: `ContributionBadge`
    - key: `symbol_`, value: `CBADGE`
    - key: `platformAdmin`, value: `0x4394a57A06098404dCA9133a06bd2A8C81afDf12`
- 合约地址： `91e06173a1c633a1e794ed827b66b06a58c9df8b`

#### TaskEscrowManager

- 需要 ContributionBadgeSBT 的合约地址
- 初始化参数
    - key: `badgeSBT_`, value: `91e06173a1c633a1e794ed827b66b06a58c9df8b`
    - key: `platformAdmin`, value: `0x4394a57A06098404dCA9133a06bd2A8C81afDf12`
- 合约地址： `2ec33a5b5ca386170658f915eb35a356a1a5297d`

#### RedemptionManager

- 初始化参数
    - key: `platformAdmin`, value: `0x4394a57A06098404dCA9133a06bd2A8C81afDf12`
- 合约地址： `a652274b64f4c07a4b9eefdc73bd8cf85e1d4e7d`

#### ContributionToken

- 通过 Factory 的 createToken 内部创建，非直接部署
