import { getAddress } from 'ethers';

import { CONTRACT_ADDRESSES, ContractResult, hash, invokeContract } from '../ChainMaker';

export enum IssuerType {
    ResidentsCommittee = 1,
    PropertyManagement = 2,
    CoBuildingEnterprise = 3
}

export class ContributionTokenFactoryService {
    static readonly ADDRESS = CONTRACT_ADDRESSES.ContributionTokenFactory;
    private readonly NAME = 'ContributionTokenFactory';

    async setIssuerApproval(
        issuer: string,
        approved: boolean,
        issuerType: IssuerType,
        orgIdHash: string,
        metadataURI: string
    ): Promise<ContractResult> {
        return invokeContract(this.NAME, 'setIssuerApproval', {
            issuer: getAddress(issuer),
            approved: String(approved),
            issuerType: String(issuerType),
            orgIdHash,
            metadataURI
        });
    }

    async createToken(
        name: string,
        symbol: string,
        cap: bigint,
        issuer: string,
        communityIdHash: string,
        metadataURI: string
    ): Promise<ContractResult> {
        return invokeContract(this.NAME, 'createToken', {
            name,
            symbol,
            cap: cap.toString(),
            issuer: getAddress(issuer),
            communityIdHash,
            metadataURI
        });
    }

    async setTokenManager(
        token: string,
        manager: string,
        approved: boolean
    ): Promise<ContractResult> {
        return invokeContract(this.NAME, 'setTokenManager', {
            token: getAddress(token),
            manager: getAddress(manager),
            approved: String(approved)
        });
    }

    async setTokenRedemptionManager(
        token: string,
        redemptionManager: string,
        approved: boolean
    ): Promise<ContractResult> {
        return invokeContract(this.NAME, 'setTokenRedemptionManager', {
            token: getAddress(token),
            redemptionManager: getAddress(redemptionManager),
            approved: String(approved)
        });
    }

    async increaseTokenBackedQuota(
        token: string,
        amount: bigint,
        proofHash: string
    ): Promise<ContractResult> {
        return invokeContract(this.NAME, 'increaseTokenBackedQuota', {
            token: getAddress(token),
            amount: amount.toString(),
            proofHash
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

    async certifiedIssuers(issuer: string): Promise<ContractResult> {
        return invokeContract(this.NAME, 'certifiedIssuers', {
            issuer: getAddress(issuer)
        });
    }

    async registeredTokens(token: string): Promise<ContractResult> {
        return invokeContract(this.NAME, 'registeredTokens', {
            token: getAddress(token)
        });
    }

    async activeTokenByCommunity(communityIdHash: string): Promise<ContractResult> {
        return invokeContract(this.NAME, 'activeTokenByCommunity', { communityIdHash });
    }

    async allTokensLength(): Promise<ContractResult> {
        return invokeContract(this.NAME, 'allTokensLength', {});
    }

    async issuers(issuer: string): Promise<ContractResult> {
        return invokeContract(this.NAME, 'issuers', { issuer: getAddress(issuer) });
    }

    async tokensByIssuer(issuer: string): Promise<ContractResult> {
        return invokeContract(this.NAME, 'tokensByIssuer', { issuer: getAddress(issuer) });
    }

    async paused(): Promise<ContractResult> {
        return invokeContract(this.NAME, 'paused', {});
    }
}

export const service = new ContributionTokenFactoryService();
