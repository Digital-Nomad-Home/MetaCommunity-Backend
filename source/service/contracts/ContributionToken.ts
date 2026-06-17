import { getAddress } from 'ethers';

import { ContractResult, hash, invokeContract } from '../ChainMaker';

export function createContributionTokenService(contractName: string) {
    return {
        async increaseBackedQuota(amount: bigint, proofHash: string): Promise<ContractResult> {
            return invokeContract(contractName, 'increaseBackedQuota', {
                amount: amount.toString(),
                proofHash
            });
        },

        async setBackedQuota(newBackedQuota: bigint, proofHash: string): Promise<ContractResult> {
            return invokeContract(contractName, 'setBackedQuota', {
                newBackedQuota: newBackedQuota.toString(),
                proofHash
            });
        },

        async grantRole(role: string, account: string): Promise<ContractResult> {
            return invokeContract(contractName, 'grantRole', {
                role: hash(role),
                account: getAddress(account)
            });
        },

        async name(): Promise<ContractResult> {
            return invokeContract(contractName, 'name', {});
        },

        async symbol(): Promise<ContractResult> {
            return invokeContract(contractName, 'symbol', {});
        },

        async decimals(): Promise<ContractResult> {
            return invokeContract(contractName, 'decimals', {});
        },

        async totalSupply(): Promise<ContractResult> {
            return invokeContract(contractName, 'totalSupply', {});
        },

        async cap(): Promise<ContractResult> {
            return invokeContract(contractName, 'cap', {});
        },

        async backedQuota(): Promise<ContractResult> {
            return invokeContract(contractName, 'backedQuota', {});
        },

        async releasedAmount(): Promise<ContractResult> {
            return invokeContract(contractName, 'releasedAmount', {});
        },

        async burnedAmount(): Promise<ContractResult> {
            return invokeContract(contractName, 'burnedAmount', {});
        },

        async balanceOf(addr: string): Promise<ContractResult> {
            return invokeContract(contractName, 'balanceOf', {
                addr: getAddress(addr)
            });
        },

        async cumulativeEarned(addr: string): Promise<ContractResult> {
            return invokeContract(contractName, 'cumulativeEarned', {
                addr: getAddress(addr)
            });
        },

        async issuer(): Promise<ContractResult> {
            return invokeContract(contractName, 'issuer', {});
        }
    };
}
