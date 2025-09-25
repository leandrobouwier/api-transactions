import fastify from 'fastify'
import cookie from '@fastify/cookie'


import { transactionsRoutes } from './routes/transactions'

export const app = fastify()

//cadastro de cookies
app.register(cookie)

app.register(transactionsRoutes, {
  prefix: 'transactions'
})