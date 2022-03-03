import { server } from './app.js'


server.listen(4444, () => {
  const address = server.address()
  console.log(`app is running on http://localhost:${address.port}`)
})
