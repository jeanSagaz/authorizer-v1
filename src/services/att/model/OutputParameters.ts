export class OutputParameters {
    /// <summary>
    /// CodigoErro 
    /// </summary>
    ErrorCode: number;

    /// <summary>
    /// MensagemErro 
    /// </summary>
    ErrorMessage: string;

    Error: boolean;

    constructor() {
        this.ErrorCode = 0;
        this.ErrorMessage = '';
        this.Error = false;
    }
}
