import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { IColumn, IDataSource, IRelationship } from '@/interfaces'

type Schema = Record<string, IColumn[]>

// database <dataSourceId, string[]>
// schema <dataSourceId-databaseId, <table, columns[]>>
// relationships <dataSourceId-databaseId-table, IRelationship[]>

interface DataSourcesStore {
	datasources: IDataSource[]
	setDatasources: (datasources: IDataSource[]) => void

	dataSourceId: string | null
	setDataSourceId: (id: string | null) => void

	cachedDatabases: Record<string, string[]>
	setCachedDatabases: (dataSourceId: string, databases: string[]) => void

	cachedSchema: Record<string, Schema>
	setCachedSchema: (id: string, schema: Schema) => void

	database: string | null
	setDatabase: (db: string | null) => void

	table: string | null
	setTable: (table: string | null) => void

	cachedRelationships: Record<string, IRelationship[]>
	setCachedRelationships: (id: string, relationships: IRelationship[]) => void
}

export const useDataSourcesStore = create<DataSourcesStore>()(
	persist(
		(set) => ({
			datasources: [],
			setDatasources: (datasources) => set({ datasources }),

			dataSourceId: null,
			setDataSourceId: (dataSourceId) => set({ dataSourceId }),

			cachedDatabases: {},
			setCachedDatabases: (dataSourceId, databases) =>
				set((state) => ({
					cachedDatabases: {
						...state.cachedDatabases,
						[dataSourceId]: databases,
					},
				})),

			cachedSchema: {},
			setCachedSchema: (id, schema) =>
				set((state) => ({
					cachedSchema: {
						...state.cachedSchema,
						[id]: schema,
					},
				})),

			database: null,
			setDatabase: (database) => set({ database }),

			table: null,
			setTable: (table) => set({ table }),

			cachedRelationships: {},
			setCachedRelationships: (id, relationships) =>
				set((state) => ({
					cachedRelationships: {
						...state.cachedRelationships,
						[id]: relationships,
					},
				})),
		}),
		{
			name: 'datasources-store',
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				dataSourceId: state.dataSourceId,
				database: state.database,
				table: state.table,
			}),
		},
	),
)
