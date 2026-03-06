import { api } from '@/config'
import { DataSourceFormData } from '@/schemas'
import { supabaseClient } from '@/utils'

const basePath = 'data_sources'

export const dataSourcesService = {
	addDataSource: async (
		dataSource: DataSourceFormData & { userId: string },
	) => {
		return api.post(`/${basePath}/new`, dataSource)
	},

	testConnection: async (dataSource: DataSourceFormData) => {
		return api.post(`/${basePath}/test-connection`, dataSource)
	},

	getDatabases(dataSourceId: string, showAll: boolean) {
		return api.get(
			`/${basePath}/${dataSourceId}/databases?showAll=${showAll}`,
		)
	},

	runQuery: async (
		dataSourceId: string,
		query: string,
		dialect: string,
		forced: boolean = false,
		database: string | null = null,
	) => {
		return api.post(`/${basePath}/${dataSourceId}/query`, {
			query,
			dialect,
			forced,
			database,
		})
	},

	queryPlan: async (
		dataSourceId: string,
		query: string,
		database: string | null = null,
	) => {
		return api.post(`/${basePath}/${dataSourceId}/query-plan`, {
			query,
			database,
		})
	},

	getDataSourcesByUserId: async (user_id: string) => {
		return supabaseClient.from(basePath).select('*').eq('user_id', user_id)
	},

	rename: async (id: string, newName: string) => {
		return supabaseClient
			.from(basePath)
			.update({ name: newName })
			.eq('id', id)
	},

	delete: async (id: string) => {
		return supabaseClient.from(basePath).delete().eq('id', id)
	},

	async update(id: string, updatedFields: Partial<DataSourceFormData>) {
		return supabaseClient.from(basePath).update(updatedFields).eq('id', id)
	},

	async disconnect(id: string) {
		return api.get(`/${basePath}/${id}/disconnect`)
	},

	async reconnect(id: string) {
		return api.get(`/${basePath}/${id}/reconnect`)
	},

	async getBulkStatus(ids: string[]) {
		return api.post(`/${basePath}/bulk-status`, { ids })
	},
}
