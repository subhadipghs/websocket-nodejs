import { WsServerImpl, server } from "./app";
import {MemoryStoreImpl} from "./store";

const store = new MemoryStoreImpl();
const ws = new WsServerImpl(server, store);

ws.start();

ws.once("listening", (port: number) => {
  console.log(`ws server is running on http://localhost:${port}`);
});

ws.on("connection", (socket) => {
  console.log(socket.id, "has joined");
});
