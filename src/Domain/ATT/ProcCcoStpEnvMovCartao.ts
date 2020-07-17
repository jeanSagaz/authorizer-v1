import { InputParameters } from '../../services/att/model/InputParameters';
import { OutputParameters } from '../../services/att/model/OutputParameters';

export class ProcCcoStpEnvMovCartao {
    inputParameters: InputParameters;
    outputParameters: OutputParameters;

    constructor() {
        this.inputParameters = new InputParameters();
        this.outputParameters = new OutputParameters();
    }
}
