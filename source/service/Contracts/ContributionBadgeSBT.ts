import { getAddress } from 'ethers';

import { CONTRACT_ADDRESSES, ContractResult, hash, invokeContract } from '../ChainMaker';

export class ContributionBadgeSBTService {
    static readonly ADDRESS = CONTRACT_ADDRESSES.ContributionBadgeSBT;
    private readonly NAME = 'ContributionBadgeSBT';

    async setBadgeRule(
        token: string,
        threshold: bigint,
        badgeName: string,
        metadataURI: string,
        active: boolean
    ): Promise<ContractResult> {
        return invokeContract(this.NAME, 'setBadgeRule', {
            token: getAddress(token),
            threshold: threshold.toString(),
            badgeName,
            metadataURI,
            active: String(active)
        });
    }

    async claimBadge(token: string, threshold: bigint): Promise<ContractResult> {
        return invokeContract(this.NAME, 'claimBadge', {
            token: getAddress(token),
            threshold: threshold.toString()
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

    async balanceOf(user: string): Promise<ContractResult> {
        return invokeContract(this.NAME, 'balanceOf', { user: getAddress(user) });
    }

    async ownerOf(tokenId: bigint): Promise<ContractResult> {
        return invokeContract(this.NAME, 'ownerOf', { tokenId: tokenId.toString() });
    }

    async tokenURI(tokenId: bigint): Promise<ContractResult> {
        return invokeContract(this.NAME, 'tokenURI', { tokenId: tokenId.toString() });
    }

    async getBadgeRule(token: string, threshold: bigint): Promise<ContractResult> {
        return invokeContract(this.NAME, 'getBadgeRule', {
            token: getAddress(token),
            threshold: threshold.toString()
        });
    }

    async thresholdCount(token: string): Promise<ContractResult> {
        return invokeContract(this.NAME, 'thresholdCount', { token: getAddress(token) });
    }

    async thresholdAt(token: string, index: number): Promise<ContractResult> {
        return invokeContract(this.NAME, 'thresholdAt', {
            token: getAddress(token),
            index: String(index)
        });
    }

    async tokenIdOf(token: string, user: string, threshold: bigint): Promise<ContractResult> {
        return invokeContract(this.NAME, 'tokenIdOf', {
            token: getAddress(token),
            user: getAddress(user),
            threshold: threshold.toString()
        });
    }

    async setTokenFactory(factoryAddress: string): Promise<ContractResult> {
        return invokeContract(this.NAME, 'setTokenFactory', {
            factoryAddress: getAddress(factoryAddress)
        });
    }

    async locked(tokenId: bigint): Promise<ContractResult> {
        return invokeContract(this.NAME, 'locked', { tokenId: tokenId.toString() });
    }

    async paused(): Promise<ContractResult> {
        return invokeContract(this.NAME, 'paused', {});
    }
}

export const service = new ContributionBadgeSBTService();
