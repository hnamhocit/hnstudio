import { useTabsStore } from '@/stores'

export const getTablePath = (path?: string) => {
	const { activeTab } = useTabsStore.getState()

	if (!activeTab) {
		return ''
	}

	const { database, dataSourceId, table } = activeTab

	let tablePath = `/data_sources/${dataSourceId}/databases/${database}/tables/${table}`

	if (path) {
		tablePath += `/${path}`
	}

	return tablePath
}
