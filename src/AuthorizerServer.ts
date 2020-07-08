import express from 'express';
import net from 'net';
import { AuthorizerEvent } from './constants';
import { InputParameters } from './Domain/ATT/InputParameters';
import { AttService } from './Services/AttService';

var cors = require('cors');

export class AuthorizerServer {
    public static readonly PORT: number = 2502;
    private _app: express.Application;
    private _server: net.Server;
    private _port: number;
    private _host: string;
    private _attService: AttService;
  
    constructor () {
      this._attService = new AttService();
      this._host = '0.0.0.0';
      this._app = express();
      this._port = Number(process.env.PORT) || AuthorizerServer.PORT;
      this._app.use(cors());
      this._app.options('*', cors());
      this._server = new net.Server();
      this.listen();
    }
  
    private listen (): void {
      this._server.listen(this._port, this._host, () => {
        console.log(`Server listening for connection requests on socket localhost: ${this._port}.`);
      });
  
      this._server.on(AuthorizerEvent.CONNECT, async (socket: any) => {
        console.log('Connected client on port %s.', this._port);
        const address = socket.address();
        console.log('address: %s', address);
        const ip = address.address;
        console.log('ip: %s', ip);
        const port = address.port;
        console.log('port: %s', port);

        let inputParameters = new InputParameters();
        inputParameters.creditAccount = 10999779;
        inputParameters.debitAccount = 11004967;
        inputParameters.value = 1;
        inputParameters.obsCredit = 'NOME ESTABELECIMENTO';
        inputParameters.obsDebit = 'NOME ESTABELECIMENTO';
        inputParameters.toleranceValue = 1;
        inputParameters.creditHistory = 828;
        const result = await this._attService.proccessCall(inputParameters);
        console.log(result);

        // Now that a TCP connection has been established, the server can send data to the client by writing to its socket.
        socket.write('081002180000020000000706134619134618070600');        
  
        socket.on(AuthorizerEvent.MESSAGE, (msg: any) => {
          console.log('01 - [server](message): %s', JSON.stringify(msg));
          console.log('02 - [server](message): %s', msg);
          //socket.emit('message', msg);
        });        
  
        // When the client requests to end the TCP connection with the server, the server ends the connection.
        socket.on(AuthorizerEvent.DISCONNECT, () => {
          console.log('Client disconnected');
        });

        socket.on(AuthorizerEvent.ERROR, (err: any) => {
            console.log(`Error: ${err}`);
        });
      });
    }
  
    get app (): express.Application {
      return this._app;
    }
  }