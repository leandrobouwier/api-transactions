import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "node:crypto";
import { checkSessionIdExists } from "../middlewares/check-session-id-exist";

// Request Body: HTTPs -> Serve para criar ou editar algum recurso.
// Cookie -> Formas da gente manter contexto entre requisições

export async function transactionsRoutes(app: FastifyInstance) {

  // O usuário deve poder criar uma nova transação;
  app.get('/', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
    const { sessionId } = request.cookies

    const transactions = await knex('transactions').select()
      .where('session_id', sessionId).select()

    return { transactions }
  })

  // Pegar transação por id - O usuário deve poder visualizar uma transação única;
  app.get('/:id',{ preHandler: [checkSessionIdExists] }, async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTransactionParamsSchema.parse(request.params)

    const { sessionId } = request.cookies

    const transaction = await knex('transactions').where({ session_id: sessionId, id: id }).first()

    return { transaction }
  })

  app.get('/summary',{ preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies

    const summary = await knex('transactions').sum('amount', { as: 'amount' }).where('session_id', sessionId).first()

    return summary;
  })

  // validação de transação com zod - O usuário deve poder criar uma nova transação;
  app.post("/", async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body
    );

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge:   60 * 60 * 24 * 7
      })
    }

    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      //A transação pode ser do tipo crédito que somará ao valor total, ou débito subtrairá;
      session_id: sessionId
    });

    return reply.status(201).send();
  });
}
