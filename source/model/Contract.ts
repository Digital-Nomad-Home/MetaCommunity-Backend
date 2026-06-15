import {
    IsInt,
    IsObject,
    IsOptional,
    IsString,
    IsUrl,
    Matches,
    Min
} from 'class-validator';

export const HexStringPattern = /^0x[0-9a-fA-F]*$/;
export const AddressPattern = /^0x[0-9a-fA-F]{40}$/;

export class ContractCallData {
    @IsUrl({ require_tld: false })
    @IsOptional()
    rpcUrl?: string;

    @Matches(AddressPattern)
    to: string;

    @Matches(AddressPattern)
    @IsOptional()
    from?: string;

    @Matches(HexStringPattern)
    data: string;

    @Matches(HexStringPattern)
    @IsOptional()
    value?: string;

    @IsString()
    @IsOptional()
    blockTag?: string = 'latest';
}

export class ContractCallResult {
    @Matches(HexStringPattern)
    result: string;
}

export class SignedContractTransactionData {
    @IsUrl({ require_tld: false })
    @IsOptional()
    rpcUrl?: string;

    @Matches(HexStringPattern)
    signedTransaction: string;
}

export class ContractTransactionResult {
    @Matches(/^0x[0-9a-fA-F]{64}$/)
    transactionHash: string;
}

export class ContractRpcError {
    @IsInt()
    code: number;

    @IsString()
    message: string;

    @IsObject()
    @IsOptional()
    data?: unknown;
}

export class ContractRpcRequest {
    @IsString()
    jsonrpc: '2.0';

    @IsInt()
    @Min(1)
    id: number;

    @IsString()
    method: string;

    params: unknown[];
}
