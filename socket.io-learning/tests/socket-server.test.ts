import test from "tape";
import Client from "socket.io-client";
import { WsServerImpl, server as httpServer } from "../app";
import { Socket } from "socket.io";
import { MemoryStoreImpl, Store } from "../store";
import { users } from "./fixtures/user.fixture";
import jwt from "jsonwebtoken";
import { Config } from "../config";

let token: string,
  store: Store,
  ws: WsServerImpl,
  port: number,
  server: Socket,
  client: any;

test("setup", (t) => {
  store = new MemoryStoreImpl();
  ws = new WsServerImpl(httpServer, store);
  token = jwt.sign(users[0], Config.jwtSecret, {
    expiresIn: Config.expiresIn,
    algorithm: "HS256",
  });
  t.ok(token);
  port = ws.getPort();
  ws.start();
  ws.on("connection", (socket) => {
    server = socket;
  });
  client = Client("http://localhost:" + port, {
    auth: {
      token,
    },
  });

  client.on("connect", t.end);
  client.on("connect_error", (e: Error) => {
    t.fail("Setup Failed! Client could not connect to the server");
  });
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
  t.timeoutAfter(10000);
  t.plan(2);
  const client2 = Client("http://localhost:" + port, {
    auth: {
      token,
    },
  });
  const msg = "hello";
  client2.on("connect", () => {
    client.emit("message", client2.id, msg);
  });
  client2.on("connect_error", () => {
    t.fail("oops! client2 could not connect");
  });
  client2.on("message", (id, message) => {
    t.equal(message, msg, "message content should be same");
    t.equal(id, client.id, "fromId should be the senders id");
  });
  t.teardown(() => {
    client2.close();
  });
});

test("should authenticate user before adding them to users group", (t) => {
  t.plan(1);
  t.timeoutAfter(10000);
  const client2 = Client("http://localhost:" + port);
  client2.on("connect_error", (e: Error) => {
    t.equal(e.message, "Oops! token is required");
    t.end();
  });
});

test("should verify the users token before connection", (t) => {
  t.timeoutAfter(10000);
  const clnt = Client("http://localhost:" + port, {
    auth: {
      token: "oops! not a valid token",
    },
  });
  clnt.on("connect", () => {
    t.fail("should not connect");
    t.end();
  });
  clnt.on("connect_error", (e) => {
    t.equal(e.message, "invalid token");
    t.end();
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
