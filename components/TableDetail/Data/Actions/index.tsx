import {
	CheckIcon,
	CopyPlusIcon,
	PenIcon,
	PlayIcon,
	PlusIcon,
	XIcon,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ITab } from '@/interfaces'
import { dataSourcesService } from '@/services'
import { useDataEditorStore, useDataSourcesStore, useTabsStore } from '@/stores'
import { generateSqlStatements, getTablePath, notifyError } from '@/utils'
import DeleteButton from './DeleteButton'
import RefreshButton from './RefreshButton'
import SettingsButton from './SettingsButton'
import UploadCsvButton from './UploadCsvButton'

interface ActionsProps {
	refreshData: () => Promise<void>
	primaryColumnName: string
}

const Actions = ({ refreshData, primaryColumnName }: ActionsProps) => {
	const [isSaving, setIsSaving] = useState(false)

	const { activeTab, tabs, commitContent, setActiveTab, setTabs } =
		useTabsStore()
	const { dataSourceId, database, datasources } = useDataSourcesStore()
	const {
		addEmptyRow,
		tablesState,
		discardTableChanges,
		markSelectedRowsAsDeleted,
	} = useDataEditorStore()

	const tablePath = getTablePath()
	const tableState = tablesState[tablePath]

	const canSave =
		Object.keys(tableState?.insertChangeset || {}).length > 0 ||
		Object.keys(tableState?.updateChangeset || {}).length > 0 ||
		Object.keys(tableState?.deleteChangeset || {}).length > 0

	const handleDeleteClick = () => {
		if (!tableState) return
		markSelectedRowsAsDeleted(tablePath)
	}

	const handleSave = async () => {
		if (!tableState || !activeTab) return

		const sqlQueries = generateSqlStatements(primaryColumnName)
		if (sqlQueries.length === 0) return

		setIsSaving(true)

		try {
			await dataSourcesService.runQuery(
				dataSourceId!,
				sqlQueries.join('\n'),
				datasources.find((ds) => ds.id === dataSourceId)!.type,
				true, // forced execution to allow multiple statements
				database!,
			)

			await refreshData()

			toast.success('All changes saved successfully!')
		} catch (error) {
			notifyError(error, 'Failed to save changes.')
		} finally {
			setIsSaving(false)
		}
	}

	const handleNewQueryTab = () => {
		const id = Date.now().toString()
		const newTab: ITab = {
			id,
			title: `Query ${tabs.length + 1}`,
			type: 'query',
			dataSourceId: activeTab!.dataSourceId,
			database: activeTab!.database,
			table: activeTab!.table,
		}

		commitContent(id, '\n\n\n\n\n\n\n\n\n\n\n')

		setTabs([...tabs, newTab])
		setActiveTab(newTab)
	}

	return (
		<div className='flex items-center justify-between p-4 border-b'>
			<div className='flex items-center gap-3'>
				<Button
					onClick={() => addEmptyRow(tablePath)}
					size='icon'
					variant='ghost'>
					<PlusIcon />
				</Button>

				<Button
					size='icon'
					variant='ghost'>
					<PenIcon />
				</Button>

				<Button
					size='icon'
					variant='ghost'>
					<CopyPlusIcon />
				</Button>

				<DeleteButton
					disabled={isSaving}
					keysLength={
						Object.keys(tableState?.selectedRows || {}).length
					}
					onClick={handleDeleteClick}
				/>

				{canSave && (
					<>
						<div className='w-0.5 h-8 bg-neutral-200 dark:bg-neutral-400'></div>

						<Button
							onClick={() => discardTableChanges(tablePath)}
							variant='ghost'
							className='text-red-500'>
							<XIcon />
							Cancel
						</Button>

						<Button
							disabled={isSaving}
							onClick={handleSave}
							variant='ghost'
							className='text-green-500'>
							<CheckIcon />
							Save
						</Button>
					</>
				)}

				<div className='w-0.5 h-8 bg-neutral-200 dark:bg-neutral-400'></div>

				<RefreshButton onClick={refreshData} />

				<UploadCsvButton />

				<SettingsButton />
			</div>

			<Button onClick={handleNewQueryTab}>
				<PlayIcon />
				<span>Execute query</span>
			</Button>
		</div>
	)
}

export default Actions
