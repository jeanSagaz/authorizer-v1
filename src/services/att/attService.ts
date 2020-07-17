import { RepositoryATT } from '../../repository/RepositoryATT';
import { InputParameters } from './model/InputParameters';
import { OutputParameters } from './model/OutputParameters';

export class AttService {
    private _repositoryATT: RepositoryATT;

    constructor() {
        this._repositoryATT = new RepositoryATT();
    }

    async proccessCall(inputParameters: InputParameters): Promise<OutputParameters> {
        let outputParameters = new OutputParameters();        

        try {
            const result = await this._repositoryATT.call(inputParameters);

            outputParameters.ErrorCode = result.CodigoErro;
            outputParameters.ErrorMessage = result.MensagemErro;
            outputParameters.Error = false;
            return outputParameters;
        }catch (err) {
            console.error(`error 'proccessCall': ${err}`);
            outputParameters.ErrorCode = -1;
            outputParameters.ErrorMessage = err;
            outputParameters.Error = true;            
            return outputParameters;
        }
    }
}