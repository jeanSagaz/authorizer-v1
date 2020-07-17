import { AuthorizerServer } from "./authorizerServer";

let app = new AuthorizerServer().app;

export { app };