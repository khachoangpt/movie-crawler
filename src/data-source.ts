import { DataSource } from "typeorm";
import path from 'path'
import { appConfig } from "./configs/app-config";

console.log(appConfig.db.DATABASE_CONNECTION);

export const dataSource = new DataSource({
    type: 'postgres',
    url: appConfig.db.DATABASE_CONNECTION,
    schema: 'public',
    entities: [path.join(__dirname, 'entities/*.{ts,js}')],
    migrations: [path.join(__dirname, 'migrations/*.{ts,js}')],
    logging: ['query', 'error', 'schema'],
  })
