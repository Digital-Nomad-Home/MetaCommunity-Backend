import { getAddress } from 'ethers';

import { hash, invokeContract } from '../ChainMaker';

export class ContributionTokenService {
    constructor(private readonly contractName: string) {}

    increaseBackedQuota(amount: bigint, proofHash: string) {
        return invokeContract(this.contractName, 'increaseBackedQuota', {
            amount,
            proofHash
        });
    }

    setBackedQuota(newBackedQuota: bigint, proofHash: string) {
        return invokeContract(this.contractName, 'setBackedQuota', {
            newBackedQuota,
            proofHash
        });
    }

    grantRole(role: string, account: string) {
        return invokeContract(this.contractName, 'grantRole', {
            role: hash(role),
            account: getAddress(account)
        });
    }

    name() {
        return invokeContract(this.contractName, 'name', {});
    }

    symbol() {
        return invokeContract(this.contractName, 'symbol', {});
    }

    decimals() {
        return invokeContract(this.contractName, 'decimals', {});
    }

    totalSupply() {
        return invokeContract(this.contractName, 'totalSupply', {});
    }

    cap() {
        return invokeContract(this.contractName, 'cap', {});
    }

    backedQuota() {
        return invokeContract(this.contractName, 'backedQuota', {});
    }

    releasedAmount() {
        return invokeContract(this.contractName, 'releasedAmount', {});
    }

    burnedAmount() {
        return invokeContract(this.contractName, 'burnedAmount', {});
    }

    balanceOf(addr: string) {
        return invokeContract(this.contractName, 'balanceOf', {
            addr: getAddress(addr)
        });
    }

    cumulativeEarned(addr: string) {
        return invokeContract(this.contractName, 'cumulativeEarned', {
            addr: getAddress(addr)
        });
    }

    issuer() {
        return invokeContract(this.contractName, 'issuer', {});
    }
}
