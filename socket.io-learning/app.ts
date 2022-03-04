import App from "express";
import http, { createServer } from "node:http";
import { EventEmitter } from "node:events";
import { Server, Socket } from "socket.io";
import { Store } from "./store";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

const app = App();
const server = createServer(app);

interface WsServer {
  start: () => void;
  listen: () => void;
  getPort: () => number;
  close: () => void;
  getSocketHandlers: (socket: Socket) => void;

  // events
  on(event: "listening", cb: (port: number) => void): void;
  on(event: "connection", cb: (id: string) => void): void;
  on(event: "error", cb: (err: any) => void): void;
}

class WsServerImpl extends EventEmitter implements WsServer {
  private ws: Server;
  private server: http.Server;
  private port: number;
  private store: Store;

  constructor(httpServer: http.Server, store: Store, port: number = 4444) {
    super();
    this.server = httpServer;
    this.ws = new Server(httpServer);
    this.port = port;
    this.store = store;
    this.onListening = this.onListening.bind(this);
    // listen to websocket server events
    this.listen();
    this.middlewares();
  }

  public listen() {
    // on connection
    this.ws.on("connection", (socket: Socket) => {
      this.onConnection(socket);
    });
    // on connection error
    this.ws.engine.on("connection_error", this.onError);
  }

  public start() {
    this.server.listen(this.port, this.onListening);
  }

  public getPort() {
    return this.port;
  }

  public close() {
    this.ws.close();
    this.server.close();
  }

  private middlewares() {}

  private onConnection(socket: Socket) {
    this.emit("connection", socket);
    this.getSocketHandlers(socket);
  }

  private onError(err: any) {
    this.emit("error", err);
  }

  private onListening() {
    this.emit("listening", this.port);
  }

  public async getSocketHandlers(socket: Socket) {
    // join the sockets group
    socket.on("join", ({ name }) => {
      this.store.addUser(socket.id, name);
    });
    // send private message to particular user
    socket.on("message", (toSocketId, msg) => {
      socket.to(toSocketId).emit("message", socket.id, msg);
    });
  }
}

export { WsServerImpl, WsServer, server };
