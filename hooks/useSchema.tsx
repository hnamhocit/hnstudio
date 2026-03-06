import { useCallback, useEffect, useState } from 'react'

import { databaseService } from '@/services'
import { useDataSourcesStore } from '@/stores'
import { notifyError } from '@/utils'

export const useSchema = (dataSourceId: string, database: string) => {
	const { cachedSchema, setCachedSchema } = useDataSourcesStore()
	const [isLoading, setIsLoading] = useState(false)

	const cacheKey = `${dataSourceId}-${database}`
	const schema = cachedSchema[cacheKey] || {}
	const hasCachedSchema = !!cachedSchema[cacheKey]

	const fetchSchema = useCallback(async () => {
		if (!dataSourceId || !database) return

		setIsLoading(true)

		try {
			const { data } = await databaseService.getTableSchema(
				dataSourceId,
				database,
			)
			setCachedSchema(cacheKey, data.data)
		} catch (error) {
			notifyError(error, 'Failed to fetch schema.')
		} finally {
			setIsLoading(false)
		}
	}, [dataSourceId, database, cacheKey, setCachedSchema])

	useEffect(() => {
		if (!hasCachedSchema) {
			fetchSchema()
		}
	}, [hasCachedSchema, fetchSchema])

	return { schema, isLoading, reload: fetchSchema, hasCachedSchema }
}
