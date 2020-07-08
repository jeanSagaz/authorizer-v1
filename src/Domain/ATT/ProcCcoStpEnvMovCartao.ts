import { InputParameters } from "./InputParameters";
import { OutputParameters } from "./OutputParameters";

export class ProcCcoStpEnvMovCartao {
    inputParameters: InputParameters;
    outputParameters: OutputParameters;

    constructor() {
        this.inputParameters = new InputParameters();
        this.outputParameters = new OutputParameters();
    }
}
