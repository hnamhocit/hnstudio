import clsx from 'clsx'
import {
	ArrowDownToLineIcon,
	DatabaseIcon,
	HistoryIcon,
	PlayIcon,
	SaveIcon,
	TimerIcon,
	WandSparklesIcon,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { IQueryResult } from '@/interfaces'
import { dataSourcesService } from '@/services'
import { useDataSourcesStore, useTabsStore } from '@/stores'
import { exportToCsv, notifyError } from '@/utils'
import { AxiosError } from 'axios'
import { Button } from '../ui/button'
import ConfirmQueryDialog from './ConfirmQueryDialog'
import SQLEditor from './SQLEditor'
import TabContent from './TabContent'

const tabs = [
	{
		id: 'results',
		title: 'Results',
	},
	{
		id: 'execution-log',
		title: 'Execution Log',
	},
	{
		id: 'query-plan',
		title: 'Query Plan',
	},
] as const

export type TabId = (typeof tabs)[number]['id']

const QueryBuilder = () => {
	const { contentById, activeTab } = useTabsStore()
	const { datasources } = useDataSourcesStore()
	const [currentTab, setCurrentTab] = useState<TabId>('results')
	const [isLoading, setIsLoading] = useState(false)
	const [result, setResult] = useState<IQueryResult | null>(null)
	const [isOpen, setIsOpen] = useState(false)

	const toggleIsOpen = () => setIsOpen((prev) => !prev)

	const handleRunQuery = async (forced: boolean = false) => {
		setIsLoading(true)

		if (!activeTab!.dataSourceId) {
			toast.error('No data source selected', {
				position: 'top-center',
			})
			return
		}

		try {
			const query = contentById[activeTab!.id] || ''
			const { data } = await dataSourcesService.runQuery(
				activeTab!.dataSourceId,
				query,
				datasources.find((ds) => ds.id === activeTab!.dataSourceId)
					?.type || '',
				forced,
				activeTab?.database,
			)

			setResult(data.data)

			if (data.data.rows.length === 0) {
				setCurrentTab('execution-log')
			}
		} catch (error) {
			if (error instanceof AxiosError) {
				const errorMsg = error.response?.data?.message || ''
				const errorCode = error.response?.data?.error || ''

				if (
					error.response?.status === 403 &&
					(errorMsg.includes('DANGEROUS') ||
						errorCode.includes('DANGEROUS'))
				) {
					setIsOpen(true)
					return
				}
			}

			notifyError(error, 'Failed to run query')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='flex flex-col h-full'>
			<div className='flex items-center justify-between p-4 border-b'>
				<div className='flex items-center gap-4'>
					<Button
						onClick={() => handleRunQuery()}
						disabled={isLoading}>
						<PlayIcon />
						Execute
					</Button>

					<div className='w-0.5 h-6 bg-neutral-400'></div>

					<Button
						size='icon'
						variant='ghost'>
						<SaveIcon />
					</Button>

					<Button
						size='icon'
						variant='ghost'>
						<WandSparklesIcon />
					</Button>

					<Button
						size='icon'
						variant='ghost'>
						<HistoryIcon />
					</Button>
				</div>

				<div className='flex items-center gap-4 text-sm'>
					<div className='text-neutral-700'>Dialect:</div>
					<div className='py-2 px-4 rounded bg-primary text-white uppercase font-mono'>
						{datasources.find(
							(ds) => ds.id === activeTab?.dataSourceId,
						)?.type || '-'}
					</div>
				</div>
			</div>

			<SQLEditor />

			{result && (
				<>
					{/* Thanh Tabs & Stats (Đã thêm border-b để tách biệt với nội dung bên dưới) */}
					<div className='flex items-center justify-between pt-2 px-4 shrink-0 border-b dark:border-slate-800'>
						<div className='flex items-center gap-4'>
							{tabs.map((tab) => (
								<div
									key={tab.id}
									className={clsx(
										'py-2 px-4 cursor-pointer transition-colors',
										{
											'border-b-2 border-primary text-primary font-bold':
												currentTab === tab.id,
											'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 font-semibold':
												currentTab !== tab.id,
										},
									)}
									onClick={() => setCurrentTab(tab.id)}>
									{tab.title}
								</div>
							))}
						</div>

						{/* Stats chỉ hiện ở tab Results */}
						{currentTab === 'results' && (
							<div className='flex items-center gap-4 text-neutral-700 dark:text-neutral-400 font-mono font-medium text-sm'>
								<div className='flex items-center gap-2'>
									<TimerIcon size={16} />
									<div>
										{result.durationMs?.toFixed(2) || 0}ms
									</div>
								</div>

								<div className='flex items-center gap-2'>
									<DatabaseIcon size={16} />
									<div>
										{result.rows.length ||
											result.affectedRows ||
											0}{' '}
										rows
									</div>
								</div>

								{result?.rows.length > 0 && (
									<>
										<div className='w-0.5 h-4 bg-neutral-300 dark:bg-neutral-700'></div>

										<div
											className='flex items-center gap-2 cursor-pointer hover:text-primary transition-colors'
											onClick={() => {
												const timestamp = new Date()
													.toISOString()
													.replace(/[:.]/g, '-')
												exportToCsv(
													`query-result-${timestamp}`,
													result.rows as Record<
														string,
														unknown
													>[],
												)
											}}>
											<ArrowDownToLineIcon size={16} />
											<div>CSV</div>
										</div>
									</>
								)}
							</div>
						)}
					</div>

					<TabContent
						currentTab={currentTab}
						result={result}
					/>
				</>
			)}

			<ConfirmQueryDialog
				isOpen={isOpen}
				onOpenChange={toggleIsOpen}
				onRunQuery={handleRunQuery}
			/>
		</div>
	)
}

export default QueryBuilder
