import clsx from 'clsx'
import { CornerDownLeftIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { AccordionContent } from '@/components/ui/accordion'
import { api } from '@/config'
import { ITab } from '@/interfaces'
import { useDataSourcesStore, useTabsStore } from '@/stores'
import { notifyError } from '@/utils'

interface TablesProps {
	database: string
}

const Tables = ({ database }: TablesProps) => {
	const {
		setTable,
		table,
		dataSourceId,
		cachedSchema,
		setCachedSchema,
		database: globalActiveDatabase,
	} = useDataSourcesStore()
	const { tabs, setTabs, setActiveTab } = useTabsStore()
	const [isLoading, setIsLoading] = useState(false)

	const cacheKey = `${dataSourceId}-${database}`
	const hasCachedData = !!cachedSchema[cacheKey]

	const isAccordionOpen = globalActiveDatabase === database

	useEffect(() => {
		if (!dataSourceId || !isAccordionOpen || hasCachedData) return

		const fetchSchema = async () => {
			setIsLoading(true)

			try {
				const { data } = await api.get(
					`/data_sources/${dataSourceId}/databases/${database}/schema`,
				)
				setCachedSchema(cacheKey, data.data)
			} catch (error) {
				notifyError(error, 'Failed to fetch schema.')
			} finally {
				setIsLoading(false)
			}
		}

		fetchSchema()
	}, [dataSourceId, database, isAccordionOpen, hasCachedData, cacheKey])

	const tableList =
		cachedSchema[cacheKey] ? Object.keys(cachedSchema[cacheKey]) : []

	return (
		<AccordionContent>
			{isLoading ?
				<div className='text-center text-gray-500 py-2'>
					Loading tables...
				</div>
			: tableList.length === 0 ?
				<div className='text-center text-gray-500 py-2'>
					No tables found.
				</div>
			:	tableList.map((t) => (
					<div
						onClick={(e) => {
							e.stopPropagation()

							const id = `${database}-${t}`
							const newTab: ITab = {
								id,
								type: 'table',
								title: t,
								dataSourceId: dataSourceId,
								database: database,
								table: t,
							}

							setActiveTab(newTab)
							setTable(t)

							if (tabs.find((tab) => tab.id === id)) return

							setTabs([...tabs, newTab])
						}}
						key={t}
						className={clsx(
							'select-none flex items-center justify-between gap-4 py-2 px-4 hover:text-primary transition-colors duration-300 cursor-pointer font-mono text-lg',
							table === t && globalActiveDatabase === database ?
								'text-primary'
							:	'text-gray-500',
						)}>
						{t}
						{table === t && database === globalActiveDatabase && (
							<CornerDownLeftIcon size={18} />
						)}
					</div>
				))
			}
		</AccordionContent>
	)
}

export default Tables
