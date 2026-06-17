import { getAddress, ZeroAddress } from 'ethers';

import { CONTRACT_ADDRESSES, ContractResult, hash, invokeContract } from '../ChainMaker';

const NAME = 'TaskEscrowManager' as const;
const ADDRESS = CONTRACT_ADDRESSES.TaskEscrowManager;

export enum RefundMode {
    FullRefundToPublisher = 0,
    PartialPayToWorker = 1,
    FullPayToWorker = 2,
    ReturnReserveAndRefundPublisher = 3
}

export async function createTaskEscrow(
    taskId: string,
    token: string,
    publisher: string,
    reward: bigint,
    taskHash: string,
    deadline: number
): Promise<ContractResult> {
    return invokeContract(NAME, 'createTaskEscrow', {
        taskId,
        token: getAddress(token),
        publisher: getAddress(publisher),
        reward: reward.toString(),
        taskHash,
        deadline: String(deadline)
    });
}

export async function settleTask(
    taskId: string,
    worker: string,
    validationHash: string
): Promise<ContractResult> {
    return invokeContract(NAME, 'settleTask', {
        taskId,
        worker: getAddress(worker),
        validationHash
    });
}

export async function refundTask(
    taskId: string,
    mode: RefundMode,
    reasonHash: string,
    worker?: string,
    workerAmount?: bigint
): Promise<ContractResult> {
    return invokeContract(NAME, 'refundTask', {
        taskId,
        mode: String(mode),
        worker: worker ? getAddress(worker) : ZeroAddress,
        workerAmount: workerAmount?.toString() ?? '0',
        reasonHash
    });
}

export async function openDispute(taskId: string, disputeHash: string): Promise<ContractResult> {
    return invokeContract(NAME, 'openDispute', {
        taskId,
        disputeHash
    });
}

export async function resolveDispute(
    taskId: string,
    worker: string,
    workerAmount: bigint,
    resolutionHash: string
): Promise<ContractResult> {
    return invokeContract(NAME, 'resolveDispute', {
        taskId,
        worker: getAddress(worker),
        workerAmount: workerAmount.toString(),
        resolutionHash
    });
}

export async function setTokenFactory(factoryAddress: string): Promise<ContractResult> {
    return invokeContract(NAME, 'setTokenFactory', {
        factoryAddress: getAddress(factoryAddress)
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

export async function getTaskEscrow(taskId: string): Promise<ContractResult> {
    return invokeContract(NAME, 'getTaskEscrow', { taskId });
}

export async function paused(): Promise<ContractResult> {
    return invokeContract(NAME, 'paused', {});
}

export { ADDRESS };
