import { AuthorizerServer } from './AuthorizerServer';

let app = new AuthorizerServer().app;

export { app };