import { getAddress } from 'ethers';

import { CONTRACT_ADDRESSES, ContractResult, hash, invokeContract } from '../ChainMaker';

const NAME = 'RedemptionManager' as const;
const ADDRESS = CONTRACT_ADDRESSES.RedemptionManager;

export async function setMerchant(merchant: string, approved: boolean): Promise<ContractResult> {
    return invokeContract(NAME, 'setMerchant', {
        merchant: getAddress(merchant),
        approved: String(approved)
    });
}

export async function setMerchantSpendEnabled(enabled: boolean): Promise<ContractResult> {
    return invokeContract(NAME, 'setMerchantSpendEnabled', {
        enabled: String(enabled)
    });
}

export async function spendToMerchant(
    orderId: string,
    token: string,
    user: string,
    merchant: string,
    amount: bigint,
    orderHash: string
): Promise<ContractResult> {
    return invokeContract(NAME, 'spendToMerchant', {
        orderId,
        token: getAddress(token),
        user: getAddress(user),
        merchant: getAddress(merchant),
        amount: amount.toString(),
        orderHash
    });
}

export async function redeemAndBurn(
    redemptionId: string,
    token: string,
    from: string,
    amount: bigint,
    redemptionHash: string
): Promise<ContractResult> {
    return invokeContract(NAME, 'redeemAndBurn', {
        redemptionId,
        token: getAddress(token),
        from: getAddress(from),
        amount: amount.toString(),
        redemptionHash
    });
}

export async function grantRole(role: string, account: string): Promise<ContractResult> {
    return invokeContract(NAME, 'grantRole', {
        role: hash(role),
        account: getAddress(account)
    });
}

export async function pause(): Promise<ContractResult> {
    return invokeContract(NAME, 'pause', {});
}

export async function unpause(): Promise<ContractResult> {
    return invokeContract(NAME, 'unpause', {});
}

export async function usedOrders(orderId: string): Promise<ContractResult> {
    return invokeContract(NAME, 'usedOrders', { orderId });
}

export async function usedRedemptions(redemptionId: string): Promise<ContractResult> {
    return invokeContract(NAME, 'usedRedemptions', { redemptionId });
}

export async function approvedMerchants(merchant: string): Promise<ContractResult> {
    return invokeContract(NAME, 'approvedMerchants', {
        merchant: getAddress(merchant)
    });
}

export async function merchantSpendEnabled(): Promise<ContractResult> {
    return invokeContract(NAME, 'merchantSpendEnabled', {});
}

export async function paused(): Promise<ContractResult> {
    return invokeContract(NAME, 'paused', {});
}

export { ADDRESS };
