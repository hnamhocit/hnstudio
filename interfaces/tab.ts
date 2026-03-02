export type TabType = 'query' | 'table' | 'database'

export interface ITab {
	id: string
	type: TabType
	title: string

	dataSourceId: string | null
	database: string | null
	table: string | null
}
