import { getAddress } from 'ethers';

import { CONTRACT_ADDRESSES, ContractResult, hash, invokeContract } from '../ChainMaker';

export class RedemptionManagerService {
    static readonly ADDRESS = CONTRACT_ADDRESSES.RedemptionManager;
    private readonly NAME = 'RedemptionManager';

    async setMerchant(merchant: string, approved: boolean): Promise<ContractResult> {
        return invokeContract(this.NAME, 'setMerchant', {
            merchant: getAddress(merchant),
            approved: String(approved)
        });
    }

    async setMerchantSpendEnabled(enabled: boolean): Promise<ContractResult> {
        return invokeContract(this.NAME, 'setMerchantSpendEnabled', {
            enabled: String(enabled)
        });
    }

    async spendToMerchant(
        orderId: string,
        token: string,
        user: string,
        merchant: string,
        amount: bigint,
        orderHash: string
    ): Promise<ContractResult> {
        return invokeContract(this.NAME, 'spendToMerchant', {
            orderId,
            token: getAddress(token),
            user: getAddress(user),
            merchant: getAddress(merchant),
            amount: amount.toString(),
            orderHash
        });
    }

    async redeemAndBurn(
        redemptionId: string,
        token: string,
        from: string,
        amount: bigint,
        redemptionHash: string
    ): Promise<ContractResult> {
        return invokeContract(this.NAME, 'redeemAndBurn', {
            redemptionId,
            token: getAddress(token),
            from: getAddress(from),
            amount: amount.toString(),
            redemptionHash
        });
    }

    async grantRole(role: string, account: string): Promise<ContractResult> {
        return invokeContract(this.NAME, 'grantRole', {
            role: hash(role),
            account: getAddress(account)
        });
    }

    async pause(): Promise<ContractResult> {
        return invokeContract(this.NAME, 'pause', {});
    }

    async unpause(): Promise<ContractResult> {
        return invokeContract(this.NAME, 'unpause', {});
    }

    async usedOrders(orderId: string): Promise<ContractResult> {
        return invokeContract(this.NAME, 'usedOrders', { orderId });
    }

    async usedRedemptions(redemptionId: string): Promise<ContractResult> {
        return invokeContract(this.NAME, 'usedRedemptions', { redemptionId });
    }

    async approvedMerchants(merchant: string): Promise<ContractResult> {
        return invokeContract(this.NAME, 'approvedMerchants', {
            merchant: getAddress(merchant)
        });
    }

    async merchantSpendEnabled(): Promise<ContractResult> {
        return invokeContract(this.NAME, 'merchantSpendEnabled', {});
    }

    async paused(): Promise<ContractResult> {
        return invokeContract(this.NAME, 'paused', {});
    }
}

export const service = new RedemptionManagerService();
