import { getAddress } from 'ethers';

import { CONTRACT_ADDRESSES, ContractResult, hash, invokeContract } from '../ChainMaker';

const NAME = 'ContributionTokenFactory' as const;
const ADDRESS = CONTRACT_ADDRESSES.ContributionTokenFactory;

export enum IssuerType {
    ResidentsCommittee = 1,
    PropertyManagement = 2,
    CoBuildingEnterprise = 3
}

export async function setIssuerApproval(
    issuer: string,
    approved: boolean,
    issuerType: IssuerType,
    orgIdHash: string,
    metadataURI: string
): Promise<ContractResult> {
    return invokeContract(NAME, 'setIssuerApproval', {
        issuer: getAddress(issuer),
        approved: String(approved),
        issuerType: String(issuerType),
        orgIdHash,
        metadataURI
    });
}

export async function createToken(
    name: string,
    symbol: string,
    cap: bigint,
    issuer: string,
    communityIdHash: string,
    metadataURI: string
): Promise<ContractResult> {
    return invokeContract(NAME, 'createToken', {
        name,
        symbol,
        cap: cap.toString(),
        issuer: getAddress(issuer),
        communityIdHash,
        metadataURI
    });
}

export async function setTokenManager(
    token: string,
    manager: string,
    approved: boolean
): Promise<ContractResult> {
    return invokeContract(NAME, 'setTokenManager', {
        token: getAddress(token),
        manager: getAddress(manager),
        approved: String(approved)
    });
}

export async function setTokenRedemptionManager(
    token: string,
    redemptionManager: string,
    approved: boolean
): Promise<ContractResult> {
    return invokeContract(NAME, 'setTokenRedemptionManager', {
        token: getAddress(token),
        redemptionManager: getAddress(redemptionManager),
        approved: String(approved)
    });
}

export async function increaseTokenBackedQuota(
    token: string,
    amount: bigint,
    proofHash: string
): Promise<ContractResult> {
    return invokeContract(NAME, 'increaseTokenBackedQuota', {
        token: getAddress(token),
        amount: amount.toString(),
        proofHash
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

export async function certifiedIssuers(issuer: string): Promise<ContractResult> {
    return invokeContract(NAME, 'certifiedIssuers', {
        issuer: getAddress(issuer)
    });
}

export async function registeredTokens(token: string): Promise<ContractResult> {
    return invokeContract(NAME, 'registeredTokens', {
        token: getAddress(token)
    });
}

export async function activeTokenByCommunity(communityIdHash: string): Promise<ContractResult> {
    return invokeContract(NAME, 'activeTokenByCommunity', { communityIdHash });
}

export async function allTokensLength(): Promise<ContractResult> {
    return invokeContract(NAME, 'allTokensLength', {});
}

export async function issuers(issuer: string): Promise<ContractResult> {
    return invokeContract(NAME, 'issuers', { issuer: getAddress(issuer) });
}

export async function tokensByIssuer(issuer: string): Promise<ContractResult> {
    return invokeContract(NAME, 'tokensByIssuer', { issuer: getAddress(issuer) });
}

export async function paused(): Promise<ContractResult> {
    return invokeContract(NAME, 'paused', {});
}

export { ADDRESS };
