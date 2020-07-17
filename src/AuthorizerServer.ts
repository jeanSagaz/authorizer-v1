import express from 'express';
import net from 'net';

import { AuthorizerEvent } from './constants';
import { CardProcess } from './services/cardProcess';

var cors = require('cors');

export class AuthorizerServer {
    public static readonly PORT: number = 2502;
    private _app: express.Application;
    private _server: net.Server;
    private _port: number;
    private _host: string;
    private _cardProcess: CardProcess;
  
    constructor () {
      this._cardProcess = new CardProcess();
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
        console.log(`Server listening for connection requests on socket ${this._host}: ${this._port}.`);
      });
  
      this._server.on(AuthorizerEvent.CONNECT, async (socket: any) => {
        console.log('Connected client on port %s.', this._port);
        const address = socket.address();
        console.log('address: %s', address);
        const ipClient = address.address;
        console.log('ip: %s', ipClient);
        const portClient = address.port;
        console.log('port: %s', portClient);        
  
        socket.on(AuthorizerEvent.MESSAGE, async (message: any) => {
          console.log('01 - [server](message): %s', JSON.stringify(message));
          console.log('02 - [server](message): %s', message);
          // TODO: FAZER CONTROLE DE IP
          // if (!_configSettings.AuthorizedIP.Contains(ipClient.ToString())) {
          //   console.log(`Processar - !!! IP (${ipClient}) [${portClient}] nao autorizado.`);
          //   socket.destroy();
          //   return;
          // }          

          const msg = String(message);
          if (!msg || msg.length < 4) {
            console.log('Mensagem inválida');
            return null;
          }
          
          let returnMessage = '';
          if (msg.substring(0, 3).toUpperCase() === 'GET') {
            returnMessage = 'HTTP/1.1 200 OK\r\n\r\n';
          } else {
            const result = await this._cardProcess.processMessage(msg);            
            returnMessage = String(result?.ReturnMessage);
          }
          
          // Now that a TCP connection has been established, the server can send data to the client by writing to its socket.
          //socket.write('081002180000020000000706134619134618070600');          
          //socket.write('\0U02103238000102E08000022000000000000100071509412532116809412307150648940900WW334830000000067283551SEMEAR VISA SIMULADOR    BELO HORIZONTBR986');
          socket.write(returnMessage);
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