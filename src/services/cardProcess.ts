import { OutputParameters } from './att/model/OutputParameters';
import { CardPersist } from './cardPersist';
import { AuthorizerTransaction } from '../domain/authorizerTransaction';
import { Operations } from '../domain/operations';

//import ISO8583 from 'iso8583-js';
//const ISO8583 = require('./iSO8583');
const ISO8583 = require('../../iso8583/iSO8583');

export class CardProcess {
    private _cardPersist: CardPersist;

    constructor () {
        this._cardPersist = new CardPersist();
    }

    public async processMessage(data: string) : Promise<AuthorizerTransaction | null> {
        let authorizerTransaction = new AuthorizerTransaction();

        switch (data.substring(0, 4)) {
            case "0800":
                authorizerTransaction = this.M0800(data);
                break;

            case "0200":
                authorizerTransaction = await this.M0200(data);
                break;

            case "0420":
                authorizerTransaction = await this.M0420(data);
                break;            

            default:
                console.log(`Tipo de mensagem invalida. Type=${data.substring(0, 4)}`);
                return null;
        }

        if (!authorizerTransaction.ReturnMessage) {
            console.log('Processar - Retorno de processamento invalido.');            
            return null;
        }

        // Adiciona cabeçalho a mensagem
        if (!(data.substring(0, 4) === "0800")) {
            authorizerTransaction.ReturnMessage = '\0U' + authorizerTransaction.ReturnMessage;
        }

        return authorizerTransaction;
    }

    private M0800(message: string) : AuthorizerTransaction {
        let authorizerTransaction = new AuthorizerTransaction();
        const testConnection = new ISO8583({ mti: true });

        testConnection.init([
            [1,   { bitmap: 1,  length: 16 }],    
            [7,   { bitmap: 7,  length: 10 }],    
            [12,  { bitmap: 12, length: 6  }],
            [13,  { bitmap: 13, length: 4  }],
            [39,  { bitmap: 22, length: 2  }]
        ]);

        const msg = testConnection.unWrapMsg(message);
        
        authorizerTransaction.ShippingMessage = message;
        authorizerTransaction.ShippingDate = new Date();
        authorizerTransaction.Description = 'TESTE CONEXAO VIVA';
        authorizerTransaction.MsgCode = '0800',
        authorizerTransaction.Operation = Operations.MESSAGE0800;
        authorizerTransaction.ReturnMessage = this.Response0810(msg, '00');
        authorizerTransaction.RCMsg = "00";
        authorizerTransaction.RCMsgDescription = this.GetResponseCodeDescription('00');
        authorizerTransaction.ReturnDate = new Date();

        return authorizerTransaction;
    }

    private Response0810(message: ISO8583, responseCode: string) : string {
        let response0810 = new ISO8583({
            header: '0810'
        });

        response0810.init([
            [1,  { bitmap: 1,  length: 16 }],
            [7,  { bitmap: 7,  length: 10 }],
            [12, { bitmap: 12, length: 6  }],
            [13, { bitmap: 13, length: 4  }],
            [39, { bitmap: 39, length: 2  }]
        ]);

        const date  = new Date();
        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const day   = ("0" + date.getDate()).slice(-2);
        const hours = ("0" + date.getHours()).slice(-2);
        const min   = ("0" + date.getMinutes()).slice(-2);
        const sec   = ("0" + date.getSeconds()).slice(-2);
        
        response0810.set(7, `${month}${day}${hours}${min}${sec}`);        
        response0810.set(12, message.get(12));
        response0810.set(13, message.get(13));        
        response0810.set(39, responseCode);
        
        return response0810.wrapMsg().toUpperCase();        
        //return '081002180000020000000706134619134618070600';
    }

    private async M0200(message: string) : Promise<AuthorizerTransaction> {
        let result = new OutputParameters();
        let authorizerTransaction = new AuthorizerTransaction();
        const debit = new ISO8583({ mti: true });

        // debit.init([
        //     [1,   { bitmap: 1,   length: 16  }],
        //     [2,   { bitmap: 2,   length: 18  }],
        //     [3,   { bitmap: 3,   length: 6   }],
        //     [4,   { bitmap: 4,   length: 12  }],
        //     [7,   { bitmap: 7,   length: 10  }],
        //     [11,  { bitmap: 11,  length: 6   }],
        //     [12,  { bitmap: 12,  length: 6   }],
        //     [13,  { bitmap: 13,  length: 4   }],
        //     [22,  { bitmap: 22,  length: 3   }],
        //     [32,  { bitmap: 32,  length: 8   }],
        //     [39,  { bitmap: 39,  length: 2   }],
        //     [41,  { bitmap: 41,  length: 7   }],
        //     [42,  { bitmap: 42,  length: 16  }],
        //     [43,  { bitmap: 43,  length: 41  }],
        //     [49,  { bitmap: 49,  length: 3   }],
        //     [52,  { bitmap: 52,  length: 16  }],
        //     [55,  { bitmap: 55,  length: 999 }],
        //     [120, { bitmap: 120, length: 999 }]
        // ]);

        debit.init([
            [1,   { bitmap: 1,   length: 16          }],
            [2,   { bitmap: 2,   variableLength: 48  }],
            [3,   { bitmap: 3,   length: 6           }],
            [4,   { bitmap: 4,   length: 12          }],
            [7,   { bitmap: 7,   length: 10          }],
            [11,  { bitmap: 11,  length: 6           }],
            [12,  { bitmap: 12,  length: 6           }],
            [13,  { bitmap: 13,  length: 4           }],
            [22,  { bitmap: 22,  length: 3           }],
            [32,  { bitmap: 32,  variableLength: 11  }],
            [41,  { bitmap: 41,  length: 8           }],
            [42,  { bitmap: 42,  length: 15          }],
            [43,  { bitmap: 43,  length: 40          }],
            [49,  { bitmap: 49,  length: 3           }],
            [52,  { bitmap: 52,  length: 16          }],
            [120, { bitmap: 120, variableLength: 999 }]
        ]);

        const msg = debit.unWrapMsg(message);
        // TODO: PEGAR DO PARÂMETRO        
        let creditAccount = '10999779';
        let account = message.substring(message.lastIndexOf('@') + 1);        
        //const cardNumber = MaskCardNumber(msg[2]);
        const cardNumber = msg.get(2);
        const processCode = msg.get(3);
        const value = Number(msg.get(4)) / 100;
        const nsu = msg.get(11);
        const name = msg.get(43);
        let desc = '';
        let obs = msg.get(43);
        let hist = 0;        

        authorizerTransaction.ShippingMessage = message;
        authorizerTransaction.ShippingDate = new Date();

        switch (processCode) {
            case '002000':
                desc = 'COMPRA DEBITO/CREDITO';
                obs = msg.get(43).substring(0, 25).trim();
                // TODO: PEGAR DO PARÂMETRO
                hist = 828;

                authorizerTransaction.MsgProduct = processCode;
                authorizerTransaction.NSUMsg = nsu;
                authorizerTransaction.MsgName = name;
                authorizerTransaction.Description = desc;
                authorizerTransaction.DebitAccount = account;
                authorizerTransaction.CreditAccount = creditAccount;
                authorizerTransaction.Value = value;
                authorizerTransaction.Historic = hist.toString();
                authorizerTransaction.Observation = obs;
                authorizerTransaction.MsgCode = "0200";
                authorizerTransaction.Operation = Operations.BUY;
                authorizerTransaction.Chargeback = false;
                authorizerTransaction.CardNumber = cardNumber;
                
                result = await this._cardPersist.Transaction(authorizerTransaction);
                authorizerTransaction.IntegrateCode = String(result. ErrorCode);
                authorizerTransaction.IntegrateMessage = result.ErrorMessage.trim();
            break;

            case '022000':
                desc = 'SAQUE DEBITO/ CREDITO';
                obs = msg.get(43).substring(0, 25).trim();
                // TODO: PEGAR DO PARÂMETRO
                hist = 817;

                authorizerTransaction.MsgProduct = processCode;
                authorizerTransaction.NSUMsg = nsu;
                authorizerTransaction.MsgName = name;
                authorizerTransaction.Description = desc;
                authorizerTransaction.DebitAccount = account;
                authorizerTransaction.CreditAccount = creditAccount;
                authorizerTransaction.Value = value;
                authorizerTransaction.Historic = hist.toString();
                authorizerTransaction.Observation = obs;
                authorizerTransaction.MsgCode = "0200";
                authorizerTransaction.Operation = Operations.WITHDRAW;
                authorizerTransaction.Chargeback = false;
                authorizerTransaction.CardNumber = cardNumber;

                result = await this._cardPersist.Transaction(authorizerTransaction);
                authorizerTransaction.IntegrateCode = String(result. ErrorCode);
                authorizerTransaction.IntegrateMessage = result.ErrorMessage.trim();
            break;

            case '941000':
                creditAccount = account;
                // TODO: PEGAR DO PARÂMETRO - CONTA TRANSITÓRIA DO FASTFUND
                account = '10996885'
                desc = 'DESFAZIMENTO FASTFUND';
                obs = msg.get(43).substring(0, 25).trim();
                // TODO: PEGAR DO PARÂMETRO
                hist = 807;

                authorizerTransaction.MsgProduct = processCode;
                authorizerTransaction.NSUMsg = nsu;
                authorizerTransaction.MsgName = name;
                authorizerTransaction.Description = desc;                
                authorizerTransaction.DebitAccount = account;
                authorizerTransaction.CreditAccount = creditAccount;
                authorizerTransaction.Value = value;
                authorizerTransaction.Historic = hist.toString();
                authorizerTransaction.Observation = obs;
                authorizerTransaction.MsgCode = "0200";
                authorizerTransaction.Operation = Operations.CHARGEBACKFASTFUND;
                authorizerTransaction.CardNumber = cardNumber;

                result = await this._cardPersist.Transaction(authorizerTransaction);
                authorizerTransaction.IntegrateCode = String(result. ErrorCode);
                authorizerTransaction.IntegrateMessage = result.ErrorMessage.trim();
                authorizerTransaction.Chargeback = ((result. ErrorCode === 1) || (result. ErrorCode === 0));
            break;

            default:
                console.log('Código de processamento inválido.');
                return authorizerTransaction;
        }

        const responseCode = this.GetResponseCode(Number(authorizerTransaction.IntegrateCode));
        authorizerTransaction.ReturnMessage = this.Response0210(msg, responseCode);
        authorizerTransaction.RCMsg = responseCode;
        authorizerTransaction.RCMsgDescription = this.GetResponseCodeDescription(responseCode);
        authorizerTransaction.ReturnDate = new Date();

        console.log(authorizerTransaction);
        return authorizerTransaction;
    }

    private Response0210(message: ISO8583, responseCode: string) : string {
        let response0210 = new ISO8583({
            header: '0210'
        });

        response0210.init([
            [1,  { bitmap: 1,  length: 16         }],
            [3,  { bitmap: 3,  length: 6          }],
            [4,  { bitmap: 4,  length: 12         }],
            [7,  { bitmap: 7,  length: 10         }],
            [11, { bitmap: 11, length: 6          }],
            [12, { bitmap: 12, length: 6          }],
            [13, { bitmap: 13, length: 4          }],           
            [32, { bitmap: 32, variableLength: 11 }],
            [39, { bitmap: 39, length: 2          }],
            [41, { bitmap: 41, length: 8          }],
            [42, { bitmap: 42, length: 15         }],
            [43, { bitmap: 43, length: 40         }],
            [49, { bitmap: 49, length: 3          }]
        ]);

        const date  = new Date();
        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const day   = ("0" + date.getDate()).slice(-2);
        const hours = ("0" + date.getHours()).slice(-2);
        const min   = ("0" + date.getMinutes()).slice(-2);
        const sec   = ("0" + date.getSeconds()).slice(-2);

        response0210.set(3, message.get(3));
        response0210.set(4, message.get(4));
        response0210.set(7, `${month}${day}${hours}${min}${sec}`);
        response0210.set(11, message.get(11));
        response0210.set(12, message.get(12));
        response0210.set(13, message.get(13));
        response0210.set(32, message.get(32));
        response0210.set(39, responseCode);
        response0210.set(41, message.get(41));
        response0210.set(42, message.get(42));
        response0210.set(43, message.get(43));
        response0210.set(49, message.get(49));

        return response0210.wrapMsg().toUpperCase();
    }

    private async M0420(message: string) : Promise<AuthorizerTransaction> {
        let result = new OutputParameters();
        let authorizerTransaction = new AuthorizerTransaction();
        const reversal = new ISO8583({ mti: true });

        // reversal.init([
        //     [1,   { bitmap: 1,   length: 16  }],
        //     [2,   { bitmap: 2,   length: 18  }],
        //     [3,   { bitmap: 3,   length: 6   }],
        //     [4,   { bitmap: 4,   length: 12  }],
        //     [7,   { bitmap: 7,   length: 10  }],
        //     [11,  { bitmap: 11,  length: 6   }],
        //     [12,  { bitmap: 12,  length: 6   }],
        //     [13,  { bitmap: 13,  length: 4   }],
        //     [22,  { bitmap: 22,  length: 3   }],
        //     [32,  { bitmap: 32,  length: 8   }],
        //     [39,  { bitmap: 39,  length: 2   }],
        //     [41,  { bitmap: 41,  length: 7   }],
        //     [42,  { bitmap: 42,  length: 16  }],
        //     [43,  { bitmap: 43,  length: 41  }],
        //     [49,  { bitmap: 49,  length: 3   }],
        //     [52,  { bitmap: 52,  length: 16  }],
        //     [55,  { bitmap: 55,  length: 999 }],
        //     [120, { bitmap: 120, length: 999 }]
        // ]);

        reversal.init([
            [1,   { bitmap: 1,   length: 16          }],
            [2,   { bitmap: 2,   variableLength: 48  }],
            [3,   { bitmap: 3,   length: 6           }],
            [4,   { bitmap: 4,   length: 12          }],
            [7,   { bitmap: 7,   length: 10          }],
            [11,  { bitmap: 11,  length: 6           }],
            [12,  { bitmap: 12,  length: 6           }],
            [13,  { bitmap: 13,  length: 4           }],
            [32,  { bitmap: 32,  variableLength: 32  }],
            [39,  { bitmap: 39,  length: 2           }],
            [41,  { bitmap: 41,  length: 8           }],
            [49,  { bitmap: 49,  length: 3           }],
            [61,  { bitmap: 61,  variableLength: 999 }],
            [90,  { bitmap: 90,  variableLength: 999 }],
            [120, { bitmap: 120, variableLength: 999 }]
        ]);

        const msg = reversal.unWrapMsg(message);
        // TODO: PEGAR DO PARÂMETRO        
        let creditAccount = '10999779';
        let account = message.substring(message.lastIndexOf('@') + 1);        
        //const cardNumber = MaskCardNumber(msg[2]);
        const cardNumber = msg.get(2);
        const processCode = msg.get(3);
        const value = Number(msg.get(4)) / 100;
        const nsu = msg.get(11);
        const name = msg.get(43);
        let desc = '';
        let obs = msg.get(43);
        let hist = 0;

        authorizerTransaction.ShippingMessage = message;
        authorizerTransaction.ShippingDate = new Date();

        switch (processCode) {
            case '004200':
                desc = 'CANCELAMENTO/AJUSTE COMPRA DEBITO/CREDITO';
                obs = desc;
                // TODO: PEGAR DO PARÂMETRO
                hist = 652;
                
                authorizerTransaction.MsgProduct = processCode;
                authorizerTransaction.NSUMsg = nsu;
                authorizerTransaction.MsgName = name;
                authorizerTransaction.Description = desc;
                authorizerTransaction.DebitAccount = creditAccount;
                authorizerTransaction.CreditAccount = account;
                authorizerTransaction.Value = value;
                authorizerTransaction.Historic = hist.toString();
                authorizerTransaction.Observation = obs;
                authorizerTransaction.MsgCode = "0420";
                authorizerTransaction.Operation = Operations.CHARGEBACKBUY;
                authorizerTransaction.CardNumber = cardNumber;
                
                result = await this._cardPersist.Transaction(authorizerTransaction);
                authorizerTransaction.IntegrateCode = String(result. ErrorCode);
                authorizerTransaction.IntegrateMessage = result.ErrorMessage.trim();
                authorizerTransaction.Chargeback = ((result. ErrorCode === 1) || (result. ErrorCode === 0));
            break;

            case "044200":
                desc = 'CANCELAMENTO/AJUSTE SAQUE DEBITO/ CREDITO';
                obs = desc;
                // TODO: PEGAR DO PARÂMETRO
                hist = 647;

                authorizerTransaction.MsgProduct = processCode;
                authorizerTransaction.NSUMsg = nsu;
                authorizerTransaction.MsgName = name;
                authorizerTransaction.Description = desc;
                authorizerTransaction.DebitAccount = creditAccount;
                authorizerTransaction.CreditAccount = account;
                authorizerTransaction.Value = value;
                authorizerTransaction.Historic = hist.toString();
                authorizerTransaction.Observation = obs;
                authorizerTransaction.MsgCode = "0420";
                authorizerTransaction.Operation = Operations.CHARGEBACKWITHDRAW;
                authorizerTransaction.CardNumber = cardNumber;
                
                result = await this._cardPersist.Transaction(authorizerTransaction);
                authorizerTransaction.IntegrateCode = String(result. ErrorCode);
                authorizerTransaction.IntegrateMessage = result.ErrorMessage.trim();
                authorizerTransaction.Chargeback = ((result. ErrorCode === 1) || (result. ErrorCode === 0));
            break;

            // Fast Fund - Ajuste a crédito
            case "941000":
                creditAccount = account;
                // TODO: PEGAR DO PARÂMETRO - CONTA TRANSITÓRIA DO FASTFUND
                account = '10996885';
                desc = 'AJUSTE A CREDITO FASTFUND';
                obs = desc;                
                hist = 857;
                
                authorizerTransaction.MsgProduct = processCode;
                authorizerTransaction.NSUMsg = nsu;
                authorizerTransaction.MsgName = name;
                authorizerTransaction.Description = desc;
                authorizerTransaction.DebitAccount = creditAccount;
                authorizerTransaction.CreditAccount = account;
                authorizerTransaction.Value = value;
                authorizerTransaction.Historic = hist.toString();
                authorizerTransaction.Observation = obs;
                authorizerTransaction.MsgCode = "0420";
                authorizerTransaction.Operation = Operations.CREDITFASTFUND;
                authorizerTransaction.CardNumber = cardNumber;
                authorizerTransaction.Chargeback = false;
                
                result = await this._cardPersist.Transaction(authorizerTransaction);
                authorizerTransaction.IntegrateCode = String(result. ErrorCode);
                authorizerTransaction.IntegrateMessage = result.ErrorMessage.trim();
            break;

            default:
                console.log('Código de processamento inválido.');
                return authorizerTransaction;
        }

        const responseCode = this.GetResponseCode(Number(authorizerTransaction.IntegrateCode));
        authorizerTransaction.ReturnMessage = this.Response0430(msg, responseCode);
        authorizerTransaction.RCMsg = responseCode;
        authorizerTransaction.RCMsgDescription = this.GetResponseCodeDescription(responseCode);

        return authorizerTransaction;
    }

    private Response0430(message: ISO8583, responseCode: string) : string {
        let response0430 = new ISO8583({
            header: '0430'
        });

        response0430.init([
            [1,  { bitmap: 1,  length: 16         }],
            [3,  { bitmap: 3,  length: 6          }],
            [4,  { bitmap: 4,  length: 12         }],
            [7,  { bitmap: 7,  length: 10         }],
            [11, { bitmap: 11, length: 6          }],
            [12, { bitmap: 12, length: 6          }],
            [13, { bitmap: 13, length: 4          }],           
            [32, { bitmap: 32, variableLength: 11 }],
            [39, { bitmap: 39, length: 2          }],
            [41, { bitmap: 41, length: 8          }],            
            [49, { bitmap: 49, length: 3          }]
        ]);

        const date  = new Date();
        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const day   = ("0" + date.getDate()).slice(-2);
        const hours = ("0" + date.getHours()).slice(-2);
        const min   = ("0" + date.getMinutes()).slice(-2);
        const sec   = ("0" + date.getSeconds()).slice(-2);

        response0430.set(3, message.get(3));
        response0430.set(4, message.get(4));
        response0430.set(7, `${month}${day}${hours}${min}${sec}`);
        response0430.set(11, message.get(11));
        response0430.set(12, message.get(12));
        response0430.set(13, message.get(13));
        response0430.set(32, message.get(32));
        response0430.set(39, responseCode);
        response0430.set(41, message.get(41));        
        response0430.set(49, message.get(49));

        return response0430.wrapMsg().toUpperCase();
    }    

    private GetResponseCode(code: number) : string {
        switch (code) {
            case -1: return "06"; //                                               06 ERRO TENTE NOVAMENTE
            case 0:  return "00"; // TRANSAÇÃO EFETUADA COM SUCESSO                00 TRANSACAO EFETIVADA COM SUCESSO
            case 1:  return "00"; // TRANSAÇÃO EFETUADA COM SUCESSO                00 TRANSACAO EFETIVADA COM SUCESSO                
            case 2:  return "46"; // CONTA CORRENTE DEBITADA INEXISTENTE           46 CONTA INEXISTENTE
            case 3:  return "46"; // CONTA CORRENTE CREDITADA INEXISTENTE          46 CONTA INEXISTENTE
            case 4:  return "51"; // SALDO INSUFICIENTE PARA EFETUAR TRANSFERENCIA 51 SALDO INSUFICIENTE   
            case 5:  return "12"; // TRANSACAO CANCELADA                           12 TRANSACAO CANCELADA
            case 6:  return "01"; // TRANSACAO NAO AUTORIZADA PROCURE SUA AGENCIA  01 TRANSACAO NAO AUTORIZADA PROCURE SUA AGENCIA
            default: return "01"; //                                               01 TRANSACAO NAO AUTORIZADA PROCURE SUA AGENCIA              
        }
    }

    private GetResponseCodeDescription(responseCode: string) : string {
        switch (responseCode) {
            case "00": return "TRANSACAO EFETIVADA COM SUCESSO";
            case "01": return "TRANSACAO NAO AUTORIZADA PROCURE SUA AGENCIA";
            case "06": return "ERRO TENTE NOVAMENTE";
            case "14": return "CARTAO INVALIDO";
            case "12": return "TRANSACAO CANCELADA";
            case "46": return "CONTA INEXISTENTE";
            case "51": return "SALDO INSUFICIENTE";
            default:   return "ERRO TENTE NOVAMENTE";
        }
    }
}