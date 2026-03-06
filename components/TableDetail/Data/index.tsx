import { CheckCircle2Icon, HardDriveIcon, KeyboardIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import DatabaseTable from '@/components/DatabaseTable'
import { useSchema } from '@/hooks'
import { IQueryResult } from '@/interfaces'
import { databaseService } from '@/services'
import { useDataEditorStore, useTabsStore } from '@/stores'
import { formatDataSize, getTablePath, notifyError } from '@/utils'
import Actions from './Actions'

const Data = () => {
	const { activeTab } = useTabsStore()
	const [result, setResult] = useState<IQueryResult | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const { schema, hasCachedSchema } = useSchema(
		activeTab!.dataSourceId!,
		activeTab!.database!,
	)
	const { initializeTable, discardTableChanges } = useDataEditorStore()
	const tablePath = getTablePath()

	const columns = schema?.[activeTab?.table || ''] || []
	const primaryColumnName =
		columns.find((col) => col.is_primary)?.column_name || 'id'

	const refreshData = useCallback(async () => {
		if (!hasCachedSchema) return

		setIsLoading(true)

		try {
			const { data } = await databaseService.getTablePreview()

			setResult(data.data)
			discardTableChanges(tablePath)
			initializeTable(tablePath, data.data.rows || [])
		} catch (error) {
			notifyError(error, 'Failed to fetch table preview.')
		} finally {
			setIsLoading(false)
		}
	}, [hasCachedSchema, initializeTable, tablePath, discardTableChanges])

	useEffect(() => {
		refreshData()
	}, [refreshData])

	return (
		<>
			<Actions
				refreshData={refreshData}
				primaryColumnName={primaryColumnName}
			/>

			{isLoading ?
				<div className='w-full h-64 flex items-center justify-center gap-2 text-primary'>
					<CheckCircle2Icon
						size={18}
						className='animate-spin'
					/>
					<span>Loading data...</span>
				</div>
			:	result && (
					<DatabaseTable
						columns={columns}
						initialData={result?.rows || []}
						primaryColumnName={primaryColumnName}
					/>
				)
			}

			{result && !isLoading && (
				<div className='shrink-0 p-4 flex items-center justify-between border-t bg-neutral-50 dark:bg-neutral-900'>
					<div className='flex items-center gap-2'>
						<CheckCircle2Icon
							className='text-green-600'
							size={18}
						/>

						<div className='text-sm text-neutral-600 dark:text-neutral-300'>
							<span className='font-semibold'>
								{result.rows?.length}
							</span>{' '}
							rows affected in{' '}
							<span className='font-semibold'>
								{result.durationMs?.toFixed(2)}
							</span>{' '}
							ms
						</div>
					</div>

					<div className='flex items-center gap-4'>
						<div className='flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300'>
							<HardDriveIcon />
							<span>
								Memory: {formatDataSize(result.sizeBytes || 0)}
							</span>
						</div>

						<div className='w-0.5 h-8 bg-neutral-600 dark:bg-neutral-700'></div>

						<div className='flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300'>
							<KeyboardIcon />
							<span>UTF8</span>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

export default Data
