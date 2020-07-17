export class AuthorizerTransaction {
    /// <summary>
    /// Key
    /// </summary>
    Id: number;

    /// <summary>
    /// MensagemRetorno
    /// </summary>
    ReturnMessage: string;

    /// <summary>
    /// MensagemRemessa
    /// </summary>
    ShippingMessage: string;

    /// <summary>
    /// DataRetorno
    /// </summary>
    ReturnDate: Date;

    /// <summary>
    /// DataRemessa
    /// </summary>
    ShippingDate: Date;

    /// <summary>
    /// Operacao
    /// </summary>
    Operation: number;

    /// <summary>
    /// Desfazimento
    /// </summary>
    Chargeback: boolean;

    /// <summary>
    /// MSgRCDescricao
    /// </summary>
    RCMsgDescription: string;

    /// <summary>
    /// MsgRC
    /// </summary>
    RCMsg: string;

    /// <summary>
    /// MsgNSU
    /// </summary>
    NSUMsg: string;

    /// <summary>
    /// MsgProduto
    /// </summary>
    MsgProduct: string;

    /// <summary>
    /// MsgNome
    /// </summary>
    MsgName: string;

    /// <summary>
    /// IntegraMensagem
    /// </summary>
    IntegrateMessage: string;

    /// <summary>
    /// IntegraCodigo
    /// </summary>
    IntegrateCode: string;

    /// <summary>
    /// Descricao
    /// </summary>
    Description: string;

    /// <summary>
    /// Observacao 
    /// </summary>
    Observation: string;

    /// <summary>
    ///  Historico
    /// </summary>
    Historic: string;

    /// <summary>
    /// Valor
    /// </summary>
    Value: number;

    /// <summary>
    /// ContaCredito
    /// </summary>
    CreditAccount: string;

    /// <summary>
    /// ContaDebito
    /// </summary>
    DebitAccount: string;

    /// <summary>
    /// ProcessId
    /// </summary>
    ProcessId: string;

    /// <summary>
    /// MsgCodigo 
    /// </summary>
    MsgCode: string;

    /// <summary>
    /// NumeroCartao 
    /// </summary>
    CardNumber: string;

    /// <summary>
    /// TransacaoReversaId
    /// </summary>
    ReverseTransactionId: number;

    constructor() {
        this.Id = 0;
        this.ReturnMessage = '';
        this.ShippingMessage = '';
        this.ReturnDate = new Date;
        this.ShippingDate = new Date;
        this.Operation = 0;
        this.Chargeback = false;
        this.RCMsgDescription = '';
        this.RCMsg = '';
        this.NSUMsg = '';
        this.MsgProduct = '';
        this.MsgName = '';
        this.IntegrateMessage = '';
        this.IntegrateCode = '';
        this.Description = '';
        this.Observation = '';
        this.Historic = '';
        this.Value = 0;
        this.CreditAccount = '';
        this.DebitAccount = '';
        this.ProcessId = '';
        this.MsgCode = '';
        this.CardNumber = '';
        this.ReverseTransactionId = 0;
    }
}