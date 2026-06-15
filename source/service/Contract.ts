import { BadRequestError, HttpError } from 'routing-controllers';

import {
    ContractCallData,
    ContractCallResult,
    ContractRpcError,
    ContractRpcRequest,
    ContractTransactionResult,
    SignedContractTransactionData
} from '../model';
import { BLOCKCHAIN_RPC_URL } from '../utility';

type JsonRpcResponse<T> = {
    jsonrpc: '2.0';
    id: number;
    result?: T;
    error?: ContractRpcError;
};

export class ContractService {
    private id = 0;

    getRpcUrl(rpcUrl?: string) {
        const url = rpcUrl || BLOCKCHAIN_RPC_URL;

        if (!url) throw new BadRequestError('Blockchain RPC URL is required');

        return url;
    }

    async request<T>(rpcUrl: string | undefined, method: string, params: unknown[]) {
        const body: ContractRpcRequest = {
            jsonrpc: '2.0',
            id: ++this.id,
            method,
            params
        };
        const response = await fetch(this.getRpcUrl(rpcUrl), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok)
            throw new HttpError(502, `RPC request failed with HTTP ${response.status}`);

        const payload = (await response.json()) as JsonRpcResponse<T>;

        if (payload.error)
            throw new HttpError(502, `RPC ${payload.error.code}: ${payload.error.message}`);

        if (payload.result == null) throw new HttpError(502, 'RPC response has no result');

        return payload.result;
    }

    async call({
        rpcUrl,
        blockTag = 'latest',
        ...transaction
    }: ContractCallData): Promise<ContractCallResult> {
        const result = await this.request<string>(rpcUrl, 'eth_call', [
            transaction,
            blockTag
        ]);

        return { result };
    }

    async sendSignedTransaction({
        rpcUrl,
        signedTransaction
    }: SignedContractTransactionData): Promise<ContractTransactionResult> {
        const transactionHash = await this.request<string>(
            rpcUrl,
            'eth_sendRawTransaction',
            [signedTransaction]
        );

        return { transactionHash };
    }
}

export const contractService = new ContractService();
