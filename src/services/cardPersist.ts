import { AttService } from "./att/attService";
import { InputParameters } from "./att/model/InputParameters";
import { OutputParameters } from "./att/model/OutputParameters";
import { AuthorizerTransaction } from "../domain/authorizerTransaction";


export class CardPersist {
    private _attService: AttService;

    constructor() {
        this._attService = new AttService();
    }

    public async Transaction(authorizerTransaction: AuthorizerTransaction) : Promise<OutputParameters> {
        const inputParameters = new InputParameters();
        inputParameters.creditAccount = Number(authorizerTransaction.CreditAccount);
        inputParameters.debitAccount = Number(authorizerTransaction.DebitAccount);
        inputParameters.value = authorizerTransaction.Value;
        inputParameters.obsCredit = authorizerTransaction.Observation;
        inputParameters.obsDebit = authorizerTransaction.Observation;
        inputParameters.toleranceValue = 1;
        inputParameters.creditHistory = Number(authorizerTransaction.Historic);

        const result = await this._attService.proccessCall(inputParameters);
        console.log(result);
        return result;
    }
}