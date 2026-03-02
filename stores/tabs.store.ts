import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { ITab } from '@/interfaces'

type ContentById = Record<string, string>

type TabsState = {
	tabs: ITab[]
	setTabs: (tabs: ITab[]) => void

	activeTab: ITab | null
	setActiveTab: (tab: ITab | null) => void

	contentById: ContentById
	commitContent: (id: string, content: string) => void

	removeTab: (id: string) => void
}

export const useTabsStore = create<TabsState>()(
	persist(
		(set) => ({
			tabs: [],
			setTabs: (tabs) => set({ tabs }),

			activeTab: null,
			setActiveTab: (activeTab) => set({ activeTab }),

			contentById: {},
			commitContent: (id, content) =>
				set((s) => ({
					contentById: { ...s.contentById, [id]: content },
				})),

			removeTab: (id) =>
				set((state) => {
					const closedTabIndex = state.tabs.findIndex(
						(tab) => tab.id === id,
					)
					const newTabs = state.tabs.filter((tab) => tab.id !== id)

					let newActiveTab = state.activeTab

					// Nếu tab đang mở bị đóng
					if (state.activeTab?.id === id) {
						if (newTabs.length > 0) {
							// Tính toán tab kế tiếp để focus
							const nextActiveIndex =
								closedTabIndex === newTabs.length ?
									closedTabIndex - 1
								:	closedTabIndex
							newActiveTab = newTabs[nextActiveIndex]
						} else {
							// Trả về null chắc chắn 100% ăn
							newActiveTab = null
						}
					}

					// Cập nhật CÙNG LÚC cả tabs và activeTab
					return {
						tabs: newTabs,
						activeTab: newActiveTab,
					}
				}),
		}),
		{
			name: 'tabs-store',
			storage: createJSONStorage(() => localStorage),
			partialize: (s) => ({
				tabs: s.tabs,
				activeTab: s.activeTab,
				contentById: s.contentById,
			}),
		},
	),
)
