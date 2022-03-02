import e from "express"
import http from "http"
import { Server } from "socket.io"

const app = e()
const server = http.createServer(app)
const io = new Server(server)

app.use(e.static("public"))

const users = new Map()

io.on("connection", (socket) => {
  // add a user inside the db
  socket.on("add", (user) => {
    console.log("Adding user " + user.name + " with id " + socket.id)
    if (!users.get(socket.id)) {
      users.set(socket.id, user.name)
    }
    users.forEach((v, k) => {
      console.dir({ v, k })
    })
  })
  
  // when a user is typing broadcast to other users that 
  // the current user is typing
  socket.on('typing', p => {
    let uid = users.get(socket.id)
    console.log('on typing ', uid, 'typing', p.typing)
    if (uid) {
      socket.broadcast.emit("typing", { uid, typing: p.typing })
    } else {
      console.log('user not found ', socket.id)
    } 
  })

  // when user sends a message to everyone
  socket.on("msg", (p) => {
    let uid = users.get(socket.id)
    if (uid) {
      socket.broadcast.emit("msg", { uid, msg: p.msg })
    } else {
      console.log('user not found ', socket.id)
    }
  })

  // on disconnect
  socket.on("disconnect", (reason) => {
    console.log("socket " + socket.id + " disconnected due to " + reason)
  })
})

server.listen(4444, () => console.log("app is running *:4444"))
