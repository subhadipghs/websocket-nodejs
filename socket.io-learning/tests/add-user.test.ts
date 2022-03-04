import test from "tape";
import Client from "socket.io-client";
import { WsServerImpl, server as httpServer } from "../app";
import { Socket } from "socket.io";
import { MemoryStoreImpl, Store } from "../store";

let store: Store;
let ws: WsServerImpl;

let server: Socket, client: any;

test("setup", (t) => {
  store = new MemoryStoreImpl();
  ws = new WsServerImpl(httpServer, store);
  const port = ws.getPort();
  ws.start();
  ws.on("connection", (socket) => {
    server = socket;
  });
  client = Client("http://localhost:" + port);
  client.on("connect", t.end);
});

test("should join a user correctly", (t) => {
  t.plan(1);
  let user = {
    name: "john",
  };
  client.emit("join", user);
  server.on("join", () => {
    t.equal(store.getNumOfUsers(), 1, "should be 1");
  });
  t.teardown(() => {
    store.purge();
  });
});

test.onFinish(() => {
  ws.close();
  client.close();
  store.purge();
});

test.onFailure(() => {
  ws.close();
  client.close();
  store.purge();
});
