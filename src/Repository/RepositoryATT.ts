import { InputParameters } from '../services/att/model/InputParameters';

import * as sql from 'mssql';

export class RepositoryATT {
    private config: any;
    private pool: any;

    constructor() {
        this.config = {
            user: 'appSemearCardAuthorizer',
            password: 'appSemearCardAuthorizer',
            server: '192.168.103.217',
            database: 'db_finsys_pro',
            port: 1433,
            pool: {
                max: 10,
                min: 0
            }
        };
        this.pool = new sql.ConnectionPool(this.config);
        this.pool.on('error', (err: any) => {
            console.error(`[${this.constructor.name}__ConnectionPool] :: Step:ERROR - Can't connect to ATT repository`, err);
        });
    }

    private connectDB() {
        return this.pool.connect();
    }

    async call(inputParameters: InputParameters) {
        let poolConnect: any;
        try {
            console.log(`[${this.constructor.name}__call] :: Step:START - ProcCcoStpEnvMovCartao | InputParameters: ${InputParameters} `);
            poolConnect = await this.connectDB();
            const result = await poolConnect.request()
            .input('ctanum_deb', sql.Int, inputParameters.debitAccount)
			.input('ctanum_cre', sql.Int, inputParameters.creditAccount)
			.input('movval', inputParameters.value)
			.input('obs_deb', inputParameters.obsDebit)
			.input('obs_cre', inputParameters.obsCredit)
			.input('valtolerancia', inputParameters.toleranceValue)
			.input('hst_cre', inputParameters.creditHistory)
			.output('CodigoErro', sql.Int)
			.output('MensagemErro', sql.VarChar(255))
			.execute('CCOSTPENVMOVCARTAO');

            console.log(`[${this.constructor.name}__call] :: Step:END - ProcCcoStpEnvMovCartao: ${JSON.stringify(result)}`);
            return result.output;
        } catch (err) {
            console.error(`[${this.constructor.name}__call] :: Step:ERROR - Can't call ProcCcoStpEnvMovCartao on ATT`, err);
            throw err;
        } finally {
            poolConnect?.close();
        }
    }
}