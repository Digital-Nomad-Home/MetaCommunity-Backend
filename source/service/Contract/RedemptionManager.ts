import { getAddress } from 'ethers';

import { CONTRACT_ADDRESSES, hash, invokeContract } from '../ChainMaker';

export const ADDRESS = CONTRACT_ADDRESSES.RedemptionManager;

export class RedemptionManagerService {
    private readonly NAME = 'RedemptionManager';

    setMerchant(merchant: string, approved: boolean) {
        return invokeContract(this.NAME, 'setMerchant', {
            merchant: getAddress(merchant),
            approved
        });
    }

    setMerchantSpendEnabled(enabled: boolean) {
        return invokeContract(this.NAME, 'setMerchantSpendEnabled', {
            enabled
        });
    }

    spendToMerchant(
        orderId: string,
        token: string,
        user: string,
        merchant: string,
        amount: bigint,
        orderHash: string
    ) {
        return invokeContract(this.NAME, 'spendToMerchant', {
            orderId,
            token: getAddress(token),
            user: getAddress(user),
            merchant: getAddress(merchant),
            amount,
            orderHash
        });
    }

    redeemAndBurn(
        redemptionId: string,
        token: string,
        from: string,
        amount: bigint,
        redemptionHash: string
    ) {
        return invokeContract(this.NAME, 'redeemAndBurn', {
            redemptionId,
            token: getAddress(token),
            from: getAddress(from),
            amount,
            redemptionHash
        });
    }

    grantRole(role: string, account: string) {
        return invokeContract(this.NAME, 'grantRole', {
            role: hash(role),
            account: getAddress(account)
        });
    }

    pause() {
        return invokeContract(this.NAME, 'pause', {});
    }

    unpause() {
        return invokeContract(this.NAME, 'unpause', {});
    }

    usedOrders(orderId: string) {
        return invokeContract(this.NAME, 'usedOrders', { orderId });
    }

    usedRedemptions(redemptionId: string) {
        return invokeContract(this.NAME, 'usedRedemptions', { redemptionId });
    }

    approvedMerchants(merchant: string) {
        return invokeContract(this.NAME, 'approvedMerchants', {
            merchant: getAddress(merchant)
        });
    }

    merchantSpendEnabled() {
        return invokeContract(this.NAME, 'merchantSpendEnabled', {});
    }

    paused() {
        return invokeContract(this.NAME, 'paused', {});
    }
}

export const service = new RedemptionManagerService();
