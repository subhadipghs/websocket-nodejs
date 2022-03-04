import test from "tape";
import Client from "socket.io-client";
import { WsServerImpl, server as httpServer } from "../app";
import { Socket } from "socket.io";
import { MemoryStoreImpl, Store } from "../store";

let store: Store, ws: WsServerImpl, port: number;

let server: Socket, client: any;

test("setup", (t) => {
  store = new MemoryStoreImpl();
  ws = new WsServerImpl(httpServer, store);
  port = ws.getPort();
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

test("send private message correctly", (t) => {
  t.plan(2);
  const client2 = Client("http://localhost:" + port);
  const msg = "hello";
  client2.on("connect", () => {
    client.emit("message", client2.id, msg);
  });
  client2.on("message", (id, message) => {
    t.equal(message, msg, "message content should be same");
    t.equal(id, client.id, "fromId should be the senders id");
  });
  t.teardown(() => {
    client2.close();
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
