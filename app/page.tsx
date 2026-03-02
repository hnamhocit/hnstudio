'use client'

import QueryBuilder from '@/components/QueryBuilder'
import TableDetail from '@/components/TableDetail'
import { useTabsStore } from '@/stores'

export default function Home() {
	const { activeTab } = useTabsStore()

	return (
		!activeTab ?
			<div className='h-full flex items-center justify-center text-gray-500'>
				No active tab. Click &quot;New&quot; to create a query tab.
			</div>
		: activeTab.type === 'query' ? <QueryBuilder />
		: activeTab.type === 'table' && <TableDetail />
	)
}
