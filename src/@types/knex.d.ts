// Falar que quero reaproveitar todos os tipo que já existem dentro do Knex e declarar novos
import { Knex } from 'knex'

declare module 'knex/types/tables' {
    export interface Tables {
        transactions:{
            id: string
            title: string
            amount: number
            created_at: string
            session_id?: string
        }
    }
}
