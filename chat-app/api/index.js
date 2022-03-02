import e from 'express'

const api = e.Router()

api.get('/', (_, res) => {
  return res.json({
    ok: true,
  })
})


export { api }
