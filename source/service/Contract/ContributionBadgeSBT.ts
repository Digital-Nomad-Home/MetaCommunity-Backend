import { getAddress } from 'ethers';

import { CONTRACT_ADDRESSES, hash, invokeContract } from '../ChainMaker';

export const ADDRESS = CONTRACT_ADDRESSES.ContributionBadgeSBT;

export class ContributionBadgeSBTService {
    private readonly NAME = 'ContributionBadgeSBT';

    setBadgeRule(
        token: string,
        threshold: bigint,
        badgeName: string,
        metadataURI: string,
        active: boolean
    ) {
        return invokeContract(this.NAME, 'setBadgeRule', {
            token: getAddress(token),
            threshold,
            badgeName,
            metadataURI,
            active
        });
    }

    claimBadge(token: string, threshold: bigint) {
        return invokeContract(this.NAME, 'claimBadge', {
            token: getAddress(token),
            threshold
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

    balanceOf(user: string) {
        return invokeContract(this.NAME, 'balanceOf', { user: getAddress(user) });
    }

    ownerOf(tokenId: bigint) {
        return invokeContract(this.NAME, 'ownerOf', { tokenId });
    }

    tokenURI(tokenId: bigint) {
        return invokeContract(this.NAME, 'tokenURI', { tokenId });
    }

    getBadgeRule(token: string, threshold: bigint) {
        return invokeContract(this.NAME, 'getBadgeRule', {
            token: getAddress(token),
            threshold
        });
    }

    thresholdCount(token: string) {
        return invokeContract(this.NAME, 'thresholdCount', { token: getAddress(token) });
    }

    thresholdAt(token: string, index: number) {
        return invokeContract(this.NAME, 'thresholdAt', {
            token: getAddress(token),
            index
        });
    }

    tokenIdOf(token: string, user: string, threshold: bigint) {
        return invokeContract(this.NAME, 'tokenIdOf', {
            token: getAddress(token),
            user: getAddress(user),
            threshold
        });
    }

    setTokenFactory(factoryAddress: string) {
        return invokeContract(this.NAME, 'setTokenFactory', {
            factoryAddress: getAddress(factoryAddress)
        });
    }

    locked(tokenId: bigint) {
        return invokeContract(this.NAME, 'locked', { tokenId });
    }

    paused() {
        return invokeContract(this.NAME, 'paused', {});
    }
}

export const service = new ContributionBadgeSBTService();
