import { getAddress, ZeroAddress } from 'ethers';

import { CONTRACT_ADDRESSES, hash, invokeContract } from '../ChainMaker';

export enum RefundMode {
    FullRefundToPublisher = 0,
    PartialPayToWorker = 1,
    FullPayToWorker = 2,
    ReturnReserveAndRefundPublisher = 3
}

export const ADDRESS = CONTRACT_ADDRESSES.TaskEscrowManager;

export class TaskEscrowManagerService {
    private readonly NAME = 'TaskEscrowManager';

    createTaskEscrow(
        taskId: string,
        token: string,
        publisher: string,
        reward: bigint,
        taskHash: string,
        deadline: number
    ) {
        return invokeContract(this.NAME, 'createTaskEscrow', {
            taskId,
            token: getAddress(token),
            publisher: getAddress(publisher),
            reward,
            taskHash,
            deadline
        });
    }

    settleTask(taskId: string, worker: string, validationHash: string) {
        return invokeContract(this.NAME, 'settleTask', {
            taskId,
            worker: getAddress(worker),
            validationHash
        });
    }

    refundTask(
        taskId: string,
        mode: RefundMode,
        reasonHash: string,
        worker?: string,
        workerAmount?: bigint
    ) {
        return invokeContract(this.NAME, 'refundTask', {
            taskId,
            mode,
            worker: worker ? getAddress(worker) : ZeroAddress,
            workerAmount: workerAmount ?? 0n,
            reasonHash
        });
    }

    openDispute(taskId: string, disputeHash: string) {
        return invokeContract(this.NAME, 'openDispute', {
            taskId,
            disputeHash
        });
    }

    resolveDispute(taskId: string, worker: string, workerAmount: bigint, resolutionHash: string) {
        return invokeContract(this.NAME, 'resolveDispute', {
            taskId,
            worker: getAddress(worker),
            workerAmount,
            resolutionHash
        });
    }

    setTokenFactory(factoryAddress: string) {
        return invokeContract(this.NAME, 'setTokenFactory', {
            factoryAddress: getAddress(factoryAddress)
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

    getTaskEscrow(taskId: string) {
        return invokeContract(this.NAME, 'getTaskEscrow', { taskId });
    }

    paused() {
        return invokeContract(this.NAME, 'paused', {});
    }
}

export const service = new TaskEscrowManagerService();
