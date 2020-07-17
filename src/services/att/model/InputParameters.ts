export class InputParameters {
    /// <summary>
    /// ctanum_deb 
    /// </summary>
    debitAccount: number;

    /// <summary>
    /// ctanum_cre 
    /// </summary>
    creditAccount: number;

    /// <summary>
    /// movval
    /// </summary>
    value: number;

    /// <summary>
    /// obs_deb
    /// </summary>
    obsDebit: string;

    /// <summary>
    /// obs_cre
    /// </summary>
    obsCredit: string;

    /// <summary>
    /// valtolerancia
    /// </summary>
    toleranceValue: number;

    /// <summary>
    /// hst_cre 
    /// </summary>
    creditHistory: number;

    constructor() {
        this.debitAccount = 0;
        this.creditAccount = 0;
        this.value = 0;
        this.obsDebit = '';
        this.obsCredit = '';
        this.toleranceValue = 1;
        this.creditHistory = 0;
    }
}
