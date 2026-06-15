import { Body, HttpCode, JsonController, Post } from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import {
    ContractCallData,
    ContractCallResult,
    ContractTransactionResult,
    SignedContractTransactionData
} from '../model';
import { contractService } from '../service';

@JsonController('/contract')
export class ContractController {
    @Post('/call')
    @HttpCode(201)
    @ResponseSchema(ContractCallResult)
    call(@Body() data: ContractCallData) {
        return contractService.call(data);
    }

    @Post('/transaction/signed')
    @HttpCode(201)
    @ResponseSchema(ContractTransactionResult)
    sendSignedTransaction(@Body() data: SignedContractTransactionData) {
        return contractService.sendSignedTransaction(data);
    }
}
