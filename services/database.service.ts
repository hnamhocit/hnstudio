import { api } from '@/config'
import { useTabsStore } from '@/stores'

const basePath = 'data_sources'

export const databaseService = {
	getTablePreview: async () => {
		const { activeTab } = useTabsStore.getState()
		return api.get(
			`/${basePath}/${activeTab?.dataSourceId}/databases/${activeTab?.database}/tables/${activeTab?.table}/preview`,
		)
	},

	getTableRelationships: async () => {
		const { activeTab } = useTabsStore.getState()
		return api.get(
			`/${basePath}/${activeTab?.dataSourceId}/databases/${activeTab?.database}/tables/${activeTab?.table}/relationships`,
		)
	},

	getTableSchema: async (dataSourceId: string, database: string) => {
		return api.get(
			`/${basePath}/${dataSourceId}/databases/${database}/schema`,
		)
	},
}
