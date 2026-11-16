import {config} from 'dotenv'
import {resolve} from 'node:path'

type Env = 'development' | 'production'
const NODE_ENV = (process.env.NODE_ENV ?? 'development') as Env
const envPath ={
    development :'.env.development',
    production :'.env.production',
}

config({path:resolve(`${envPath[NODE_ENV]}`)})
export const PORT=+process.env.PORT!
export const DB_URI=process.env.DB_URI!
export const REDIS_URI=process.env.REDIS_URI!
export const ENCRYPT_KEY=process.env.ENCRYPT_KEY!
export const IV_LENGTH = +process.env.IV_LENGTH!
export const EMAIL=process.env.EMAIL!
export const PASSWORD=process.env.PASSWORD!
export const CLIENT_SECRET=process.env.CLIENT_SECRET!
export const CLIENT_ID=process.env.CLIENT_ID!