import { getAddress } from 'ethers';

import { CONTRACT_ADDRESSES, hash, invokeContract } from '../ChainMaker';

export enum IssuerType {
    ResidentsCommittee = 1,
    PropertyManagement = 2,
    CoBuildingEnterprise = 3
}

export const ADDRESS = CONTRACT_ADDRESSES.ContributionTokenFactory;

export class ContributionTokenFactoryService {
    private readonly NAME = 'ContributionTokenFactory';

    setIssuerApproval(
        issuer: string,
        approved: boolean,
        issuerType: IssuerType,
        orgIdHash: string,
        metadataURI: string
    ) {
        return invokeContract(this.NAME, 'setIssuerApproval', {
            issuer: getAddress(issuer),
            approved,
            issuerType,
            orgIdHash,
            metadataURI
        });
    }

    createToken(
        name: string,
        symbol: string,
        cap: bigint,
        issuer: string,
        communityIdHash: string,
        metadataURI: string
    ) {
        return invokeContract(this.NAME, 'createToken', {
            name,
            symbol,
            cap,
            issuer: getAddress(issuer),
            communityIdHash,
            metadataURI
        });
    }

    setTokenManager(token: string, manager: string, approved: boolean) {
        return invokeContract(this.NAME, 'setTokenManager', {
            token: getAddress(token),
            manager: getAddress(manager),
            approved
        });
    }

    setTokenRedemptionManager(token: string, redemptionManager: string, approved: boolean) {
        return invokeContract(this.NAME, 'setTokenRedemptionManager', {
            token: getAddress(token),
            redemptionManager: getAddress(redemptionManager),
            approved
        });
    }

    increaseTokenBackedQuota(token: string, amount: bigint, proofHash: string) {
        return invokeContract(this.NAME, 'increaseTokenBackedQuota', {
            token: getAddress(token),
            amount,
            proofHash
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

    certifiedIssuers(issuer: string) {
        return invokeContract(this.NAME, 'certifiedIssuers', {
            issuer: getAddress(issuer)
        });
    }

    registeredTokens(token: string) {
        return invokeContract(this.NAME, 'registeredTokens', {
            token: getAddress(token)
        });
    }

    activeTokenByCommunity(communityIdHash: string) {
        return invokeContract(this.NAME, 'activeTokenByCommunity', { communityIdHash });
    }

    allTokensLength() {
        return invokeContract(this.NAME, 'allTokensLength', {});
    }

    issuers(issuer: string) {
        return invokeContract(this.NAME, 'issuers', { issuer: getAddress(issuer) });
    }

    tokensByIssuer(issuer: string) {
        return invokeContract(this.NAME, 'tokensByIssuer', { issuer: getAddress(issuer) });
    }

    paused() {
        return invokeContract(this.NAME, 'paused', {});
    }
}

export const service = new ContributionTokenFactoryService();
