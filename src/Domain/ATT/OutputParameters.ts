export class OutputParameters
{
    /// <summary>
    /// CodigoErro 
    /// </summary>
    errorCode: number;

    /// <summary>
    /// MensagemErro 
    /// </summary>
    errorMessage: string;

    error: boolean;

    constructor() {
        this.errorCode = 0;
        this.errorMessage = '';
        this.error = false;
    }
}
