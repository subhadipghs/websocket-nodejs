import test from "tape"
import Client from "socket.io-client"
import { server, buildEvents } from '../app.js'
import { Server } from "socket.io"


let sws, client, users, io


test("setup", (t) => {
  users = new Map() // mock users database
  io = new Server(server)

  server.listen(() => {
    const port = server.address().port
    client = new Client(`http://localhost:${port}`)
    io.on("connection", (socket) => {
      sws = socket
      buildEvents(socket, users)
    })
    client.on("connect", t.end)
  })
})

test("should correctly add user to the store", (t) => {
  t.plan(1)
  const data = { name: "joe" }
  client.emit("add", data)
  sws.on("add", (d) => {
    if (!users) {
      t.fail('oops! users db not found')
    } else {
      let flag = false
      for (let [_, name] of users) {
        if (name === data.name) {
          flag = true
          break
        }
      }
      t.equal(flag, true, `expected ${data.user} to be found`)
    }
  })
})

test.onFinish(() => {
  io.close()
  client.close()
})
