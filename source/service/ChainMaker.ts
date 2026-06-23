import { keccak256, toUtf8Bytes } from 'ethers';
import pThrottle from 'p-throttle';
import * as tencentcloud from 'tencentcloud-sdk-nodejs-tbaas';

import {
    TBAAS_CHAIN_ID,
    TBAAS_CLUSTER_ID,
    TENCENT_SECRET_ID,
    TENCENT_SECRET_KEY
} from '../utility';

export type ContractName =
    | 'ContributionTokenFactory'
    | 'ContributionBadgeSBT'
    | 'TaskEscrowManager'
    | 'RedemptionManager'
    | (string & {});

export const CONTRACT_ADDRESSES = {
    ContributionTokenFactory: '0x9e69161dc547e7715c3868795d930e0dcc941ab4',
    ContributionBadgeSBT: '0x91e06173a1c633a1e794ed827b66b06a58c9df8b',
    TaskEscrowManager: '0x2ec33a5b5ca386170658f915eb35a356a1a5297d',
    RedemptionManager: '0xa652274b64f4c07a4b9eefdc73bd8cf85e1d4e7d'
} as const;

const TbaasClient = tencentcloud.tbaas.v20180416.Client;

const clientConfig = {
    credential: {
        secretId: TENCENT_SECRET_ID,
        secretKey: TENCENT_SECRET_KEY
    },
    region: 'ap-beijing',
    profile: {
        httpProfile: {
            endpoint: 'tbaas.tencentcloudapi.com'
        }
    }
};

const client = new TbaasClient(clientConfig);

export interface ContractResult {
    code: number;
    codeMessage: string;
    txId: string;
    gasUsed: number;
    message: string;
    data: string;
}

export type ContractParam = string | number | boolean | bigint;

interface RawContractResult {
    Code?: number;
    CodeMessage?: string;
    TxId?: string;
    GasUsed?: number;
    Message?: string;
    Result?: string;
}

function parseResult(result?: RawContractResult): ContractResult {
    if (!result) throw new Error('TBaaS returned empty result');

    const { Code, CodeMessage, Message, TxId, GasUsed, Result } = result;
    const code = Code ?? -1;

    if (code !== 0)
        throw new Error(`Contract invocation failed: [${code}] ${CodeMessage}: ${Message}`);

    return {
        code,
        codeMessage: CodeMessage ?? '',
        txId: TxId ?? '',
        gasUsed: GasUsed ?? 0,
        message: Message ?? '',
        data: Result ? Buffer.from(Result, 'base64').toString('utf8') : ''
    };
}

const stringifyValues = (params: Record<string, ContractParam>): Record<string, string> =>
    Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)]));

// TBaaS demo API limits to 1 request per second !!!
const throttle = pThrottle({ limit: 1, interval: 1500, strict: true });

export const invokeContract = throttle(
    async (
        contractName: ContractName,
        funcName: string,
        funcParam: Record<string, ContractParam> = {},
        asyncFlag: number = 0
    ): Promise<ContractResult> => {
        const { Result } = await client.InvokeChainMakerDemoContract({
            ClusterId: TBAAS_CLUSTER_ID!,
            ChainId: TBAAS_CHAIN_ID!,
            ContractName: contractName,
            FuncName: funcName,
            FuncParam: JSON.stringify(stringifyValues(funcParam)),
            AsyncFlag: asyncFlag
        });

        return parseResult(Result);
    }
);

export const hash = (value: string) => keccak256(toUtf8Bytes(value));
