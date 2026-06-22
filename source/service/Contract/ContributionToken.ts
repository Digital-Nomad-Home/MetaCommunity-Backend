import { getAddress } from 'ethers';

import { ContractResult, hash, invokeContract } from '../ChainMaker';

export class ContributionTokenService {
    constructor(private readonly contractName: string) {}

    async increaseBackedQuota(amount: bigint, proofHash: string): Promise<ContractResult> {
        return invokeContract(this.contractName, 'increaseBackedQuota', {
            amount: amount.toString(),
            proofHash
        });
    }

    async setBackedQuota(newBackedQuota: bigint, proofHash: string): Promise<ContractResult> {
        return invokeContract(this.contractName, 'setBackedQuota', {
            newBackedQuota: newBackedQuota.toString(),
            proofHash
        });
    }

    async grantRole(role: string, account: string): Promise<ContractResult> {
        return invokeContract(this.contractName, 'grantRole', {
            role: hash(role),
            account: getAddress(account)
        });
    }

    async name(): Promise<ContractResult> {
        return invokeContract(this.contractName, 'name', {});
    }

    async symbol(): Promise<ContractResult> {
        return invokeContract(this.contractName, 'symbol', {});
    }

    async decimals(): Promise<ContractResult> {
        return invokeContract(this.contractName, 'decimals', {});
    }

    async totalSupply(): Promise<ContractResult> {
        return invokeContract(this.contractName, 'totalSupply', {});
    }

    async cap(): Promise<ContractResult> {
        return invokeContract(this.contractName, 'cap', {});
    }

    async backedQuota(): Promise<ContractResult> {
        return invokeContract(this.contractName, 'backedQuota', {});
    }

    async releasedAmount(): Promise<ContractResult> {
        return invokeContract(this.contractName, 'releasedAmount', {});
    }

    async burnedAmount(): Promise<ContractResult> {
        return invokeContract(this.contractName, 'burnedAmount', {});
    }

    async balanceOf(addr: string): Promise<ContractResult> {
        return invokeContract(this.contractName, 'balanceOf', {
            addr: getAddress(addr)
        });
    }

    async cumulativeEarned(addr: string): Promise<ContractResult> {
        return invokeContract(this.contractName, 'cumulativeEarned', {
            addr: getAddress(addr)
        });
    }

    async issuer(): Promise<ContractResult> {
        return invokeContract(this.contractName, 'issuer', {});
    }
}
