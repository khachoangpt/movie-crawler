import  dotenv  from  'dotenv'

dotenv.config()

export const appConfig = {
db: {
		DATABASE_CONNECTION: process.env.DATABASE_CONNECTION,
	},
}