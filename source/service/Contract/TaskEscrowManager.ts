import { getAddress, ZeroAddress } from 'ethers';

import { CONTRACT_ADDRESSES, ContractResult, hash, invokeContract } from '../ChainMaker';

export enum RefundMode {
    FullRefundToPublisher = 0,
    PartialPayToWorker = 1,
    FullPayToWorker = 2,
    ReturnReserveAndRefundPublisher = 3
}

export const ADDRESS = CONTRACT_ADDRESSES.TaskEscrowManager;

export class TaskEscrowManagerService {
    private readonly NAME = 'TaskEscrowManager';

    async createTaskEscrow(
        taskId: string,
        token: string,
        publisher: string,
        reward: bigint,
        taskHash: string,
        deadline: number
    ): Promise<ContractResult> {
        return invokeContract(this.NAME, 'createTaskEscrow', {
            taskId,
            token: getAddress(token),
            publisher: getAddress(publisher),
            reward: reward.toString(),
            taskHash,
            deadline: String(deadline)
        });
    }

    async settleTask(
        taskId: string,
        worker: string,
        validationHash: string
    ): Promise<ContractResult> {
        return invokeContract(this.NAME, 'settleTask', {
            taskId,
            worker: getAddress(worker),
            validationHash
        });
    }

    async refundTask(
        taskId: string,
        mode: RefundMode,
        reasonHash: string,
        worker?: string,
        workerAmount?: bigint
    ): Promise<ContractResult> {
        return invokeContract(this.NAME, 'refundTask', {
            taskId,
            mode: String(mode),
            worker: worker ? getAddress(worker) : ZeroAddress,
            workerAmount: workerAmount?.toString() ?? '0',
            reasonHash
        });
    }

    async openDispute(taskId: string, disputeHash: string): Promise<ContractResult> {
        return invokeContract(this.NAME, 'openDispute', {
            taskId,
            disputeHash
        });
    }

    async resolveDispute(
        taskId: string,
        worker: string,
        workerAmount: bigint,
        resolutionHash: string
    ): Promise<ContractResult> {
        return invokeContract(this.NAME, 'resolveDispute', {
            taskId,
            worker: getAddress(worker),
            workerAmount: workerAmount.toString(),
            resolutionHash
        });
    }

    async setTokenFactory(factoryAddress: string): Promise<ContractResult> {
        return invokeContract(this.NAME, 'setTokenFactory', {
            factoryAddress: getAddress(factoryAddress)
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

    async getTaskEscrow(taskId: string): Promise<ContractResult> {
        return invokeContract(this.NAME, 'getTaskEscrow', { taskId });
    }

    async paused(): Promise<ContractResult> {
        return invokeContract(this.NAME, 'paused', {});
    }
}

export const service = new TaskEscrowManagerService();
