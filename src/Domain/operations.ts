export enum Operations {
    /// <summary>
    /// Desfazimento(Estorno) - Compra
    /// </summary>
    CHARGEBACKBUY = 1,

    /// <summary>
    /// Desfazimento(Estorno) - Saque
    /// </summary>
    CHARGEBACKWITHDRAW = 2,

    /// <summary>
    /// Desfazimento(Estorno) - Fast Funds
    /// </summary>
    CHARGEBACKFASTFUND = 3,

    /// <summary>
    /// Operação de compra
    /// </summary>
    BUY = 4,

    /// <summary>
    /// Operação de saque
    /// </summary>
    WITHDRAW = 5,

    /// <summary>
    /// Ajuste a Crédito FastFund
    /// </summary>
    CREDITFASTFUND = 6,

    /// <summary>
    /// Teste de Conexão Ativa
    /// </summary>
    MESSAGE0800 = 7
}