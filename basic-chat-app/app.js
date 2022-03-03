import e from "express"
import http from "http"
import { Server } from "socket.io"
import { api } from "./api/index.js"
const app = e()
app.use(e.static("public"))
app.use("/api", api)


function buildServer(app, callback) {
  // http server
  const server = http.createServer(app)
  const io = new Server(server)
  io.on("connection", callback)
  return { server, io }
}


function buildEvents(socket) {
  const users = new Map()
  // add a user inside the db
  socket.on("add", (user) => {
    console.log("Adding user " + user.name + " with id " + socket.id)
    if (!users.get(socket.id)) {
      users.set(socket.id, user.name)
    }
  })

  // when a user is typing broadcast to other users that
  // the current user is typing
  socket.on("typing", (p) => {
    let uid = users.get(socket.id)
    console.log("on typing ", uid, "typing", p.typing)
    if (uid) {
      socket.broadcast.emit("typing", { uid, typing: p.typing })
    } else {
      console.log("user not found ", socket.id)
    }
  })
  // when user sends a message to everyone
  socket.on("msg", (p) => {
    let uid = users.get(socket.id)
    if (uid) {
      socket.broadcast.emit("msg", { uid, msg: p.msg })
    } else {
      console.log("user not found ", socket.id)
    }
  })

  // on disconnect
  socket.on("disconnect", (reason) => {
    console.log("socket " + socket.id + " disconnected due to " + reason)
  })
}

const { server, io } = buildServer(app, buildEvents)

export { io, buildServer, server }
