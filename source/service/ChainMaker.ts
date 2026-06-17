import { keccak256, toUtf8Bytes } from 'ethers';
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

    const code = result.Code ?? -1;

    if (code !== 0)
        throw new Error(
            `Contract invocation failed: [${code}] ${result.CodeMessage}: ${result.Message}`
        );

    return {
        code,
        codeMessage: result.CodeMessage ?? '',
        txId: result.TxId ?? '',
        gasUsed: result.GasUsed ?? 0,
        message: result.Message ?? '',
        data: result.Result ? Buffer.from(result.Result, 'base64').toString('utf8') : ''
    };
}

// TBaaS demo API limits to 1 request per second !!!
const MIN_INTERVAL_MS = 1100;
let lastCallTime = 0;

async function throttle() {
    const now = Date.now();
    const wait = MIN_INTERVAL_MS - (now - lastCallTime);

    if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));

    lastCallTime = Date.now();
}

export async function invokeContract(
    contractName: ContractName,
    funcName: string,
    funcParam: Record<string, string> = {},
    asyncFlag = 0
): Promise<ContractResult> {
    await throttle();

    const response = await client.InvokeChainMakerDemoContract({
        ClusterId: TBAAS_CLUSTER_ID!,
        ChainId: TBAAS_CHAIN_ID!,
        ContractName: contractName,
        FuncName: funcName,
        FuncParam: JSON.stringify(funcParam),
        AsyncFlag: asyncFlag
    });

    return parseResult(response.Result);
}

export function hash(value: string): string {
    return keccak256(toUtf8Bytes(value));
}
