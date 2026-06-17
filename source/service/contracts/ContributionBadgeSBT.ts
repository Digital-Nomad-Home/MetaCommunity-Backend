import { getAddress } from 'ethers';

import { CONTRACT_ADDRESSES, ContractResult, hash, invokeContract } from '../ChainMaker';

const NAME = 'ContributionBadgeSBT' as const;
const ADDRESS = CONTRACT_ADDRESSES.ContributionBadgeSBT;

export async function setBadgeRule(
    token: string,
    threshold: bigint,
    badgeName: string,
    metadataURI: string,
    active: boolean
): Promise<ContractResult> {
    return invokeContract(NAME, 'setBadgeRule', {
        token: getAddress(token),
        threshold: threshold.toString(),
        badgeName,
        metadataURI,
        active: String(active)
    });
}

export async function claimBadge(token: string, threshold: bigint): Promise<ContractResult> {
    return invokeContract(NAME, 'claimBadge', {
        token: getAddress(token),
        threshold: threshold.toString()
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

export async function balanceOf(user: string): Promise<ContractResult> {
    return invokeContract(NAME, 'balanceOf', { user: getAddress(user) });
}

export async function ownerOf(tokenId: bigint): Promise<ContractResult> {
    return invokeContract(NAME, 'ownerOf', { tokenId: tokenId.toString() });
}

export async function tokenURI(tokenId: bigint): Promise<ContractResult> {
    return invokeContract(NAME, 'tokenURI', { tokenId: tokenId.toString() });
}

export async function getBadgeRule(token: string, threshold: bigint): Promise<ContractResult> {
    return invokeContract(NAME, 'getBadgeRule', {
        token: getAddress(token),
        threshold: threshold.toString()
    });
}

export async function thresholdCount(token: string): Promise<ContractResult> {
    return invokeContract(NAME, 'thresholdCount', { token: getAddress(token) });
}

export async function thresholdAt(token: string, index: number): Promise<ContractResult> {
    return invokeContract(NAME, 'thresholdAt', {
        token: getAddress(token),
        index: String(index)
    });
}

export async function tokenIdOf(
    token: string,
    user: string,
    threshold: bigint
): Promise<ContractResult> {
    return invokeContract(NAME, 'tokenIdOf', {
        token: getAddress(token),
        user: getAddress(user),
        threshold: threshold.toString()
    });
}

export async function setTokenFactory(factoryAddress: string): Promise<ContractResult> {
    return invokeContract(NAME, 'setTokenFactory', {
        factoryAddress: getAddress(factoryAddress)
    });
}

export async function locked(tokenId: bigint): Promise<ContractResult> {
    return invokeContract(NAME, 'locked', { tokenId: tokenId.toString() });
}

export async function paused(): Promise<ContractResult> {
    return invokeContract(NAME, 'paused', {});
}

export { ADDRESS };
