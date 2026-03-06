import { create } from 'zustand'

export type ContextMenuAction =
	| 'delete'
	| 'rename'
	| 'edit'
	| 'create-database'
	| null

interface DataSourceContextMenuStore {
	isSubmitting: boolean
	setIsSubmitting: (value: boolean) => void

	dataSourceId: string | null
	setDataSourceId: (id: string | null) => void
	actionType: ContextMenuAction

	openAction: (type: ContextMenuAction) => void
	closeAction: () => void
}

export const useDataSourceContextMenuStore = create<DataSourceContextMenuStore>(
	(set) => ({
		isSubmitting: false,
		setIsSubmitting: (value) => set({ isSubmitting: value }),

		dataSourceId: null,
		setDataSourceId: (id) => set({ dataSourceId: id }),

		actionType: null,
		openAction: (type) => set({ actionType: type }),
		closeAction: () => set({ actionType: null, dataSourceId: null }),
	}),
)
