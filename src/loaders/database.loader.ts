import path from 'path'
import { DataSource } from  'typeorm'

import { appConfig } from '@/configs/app-config'
import { logger } from '@/configs/logger'
import {dataSource} from '@/data-source'

export default async () => {
	try {
		const dataSource = await connectPostgres()
		logger.info(`Connect Database Success`)
		return { dataSource }
	} catch (error) {
		logger.error(`Error Database Connect::`, error)
		process.exit(1)
	}
}

const connectPostgres = async () => {
	const connection = appConfig.db.DATABASE_CONNECTION

	await  dataSource.initialize()

	return  dataSource
}