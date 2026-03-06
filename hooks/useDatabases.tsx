import { useCallback, useEffect, useState } from 'react'

import { dataSourcesService } from '@/services'
import { useDataSourcesStore } from '@/stores'
import { notifyError } from '@/utils'

export const useDatabases = (dataSourceId: string) => {
	const [isLoading, setIsLoading] = useState(false)

	const { cachedDatabases, datasources, setCachedDatabases } =
		useDataSourcesStore()

	const databases = cachedDatabases[dataSourceId]

	const fetchDatabases = useCallback(
		async (forceReload = false) => {
			if (!dataSourceId) return

			if (!forceReload && cachedDatabases[dataSourceId]) {
				return
			}

			setIsLoading(true)
			const currentDataSource = datasources.find(
				(ds) => ds.id === dataSourceId,
			)

			try {
				const { data } = await dataSourcesService.getDatabases(
					dataSourceId,
					currentDataSource?.config?.showAllDatabases || false,
				)
				setCachedDatabases(dataSourceId, data.data)
			} catch (error) {
				notifyError(error, 'Failed to fetch databases.')
			} finally {
				setIsLoading(false)
			}
		},
		[dataSourceId, datasources, cachedDatabases, setCachedDatabases],
	)

	useEffect(() => {
		fetchDatabases()
	}, [fetchDatabases])

	const reload = useCallback(() => {
		fetchDatabases(true)
	}, [fetchDatabases])

	return { databases, isLoading, reload }
}
