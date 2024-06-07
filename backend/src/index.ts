import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './auth/signup'
const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.use("*", cors({
  origin: 'http://localhost:3000',
  allowMethods: ['POST', 'GET', "OPTIONS"],
}))

app.route('/auth', auth)

export default app