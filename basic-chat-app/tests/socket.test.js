import test from "tape"
import Client from "socket.io-client"
import { server, io } from '../app.js'


let sws, client


test("setup", (t) => {
  server.listen(() => {
    const port = server.address().port
    client = new Client(`http://localhost:${port}`)
    io.on("connection", (socket) => {
      sws = socket
    })
    client.on("connect", t.end)
  })
})

test("it works", (t) => {
  t.plan(1)
  const data = { name: "joe" }
  client.emit("add", data)
  sws.on("add", (d) => {
    t.deepEqual(d, data)
  })
})

test.onFinish(() => {
  io.close()
  client.close()
})
