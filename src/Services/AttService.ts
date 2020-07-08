import { RepositoryATT } from '../Repository/RepositoryATT';
import { InputParameters } from '../Domain/ATT/InputParameters';
import { OutputParameters } from '../Domain/ATT/OutputParameters';

export class AttService {
    private _repositoryATT: RepositoryATT;

    constructor() {
        this._repositoryATT = new RepositoryATT();
    }

    async proccessCall(inputParameters: InputParameters): Promise<OutputParameters> {
        let outputParameters = new OutputParameters();        

        try {
            const result = await this._repositoryATT.call(inputParameters);

            outputParameters.errorCode = result.CodigoErro;
            outputParameters.errorMessage = result.MensagemErro;
            outputParameters.error = false;
            return outputParameters;
        }catch (err) {
            console.error(`error 'proccessCall': ${err}`);
            outputParameters.errorCode = -1;
            outputParameters.errorMessage = err;
            outputParameters.error = true;            
            return outputParameters;
        }
    }
}