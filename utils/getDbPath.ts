import { useDataSourcesStore } from '@/stores'

export const getDbPath = (path: string) => {
	const state = useDataSourcesStore.getState()
	const { database, dataSourceId, table } = state

	return `/data_sources/${dataSourceId}/databases/${database}/tables/${table}/${path}`
}
