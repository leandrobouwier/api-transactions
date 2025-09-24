import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "node:crypto";

// Request Body: HTTPs -> Serve para criar ou editar algum recurso.

export async function transactionsRoutes(app: FastifyInstance) {

  // O usuário deve poder criar uma nova transação;
  app.get('/', async () => {
    const transactions = await knex('transactions').select()

    return { transactions }
  })

  // Pegar transação por id - O usuário deve poder visualizar uma transação única;
  app.get('/:id', async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTransactionParamsSchema.parse(request.params)
    const transaction = await knex('transactions').where('id', id).first()
    return { transaction }
  })

  app.get('/summary', async () =>{
    const summary = await knex('transactions').sum('amount', { as: 'amount' }).first()

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

    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      //A transação pode ser do tipo crédito que somará ao valor total, ou débito subtrairá;
    });

    return reply.status(201).send();
  });
}
