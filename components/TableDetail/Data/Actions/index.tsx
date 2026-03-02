import { CopyPlusIcon, PenIcon, PlayIcon, PlusIcon } from 'lucide-react'
import { Dispatch, SetStateAction, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { api } from '@/config'
import { IColumn } from '@/interfaces'
import { useDataSourcesStore } from '@/stores'
import { notifyError } from '@/utils'
import DeleteButton from './DeleteButton'
import RecordModal from './RecordModal'
import RefreshButton from './RefreshButton'
import SettingsButton from './SettingsButton'
import UploadCsvButton from './UploadCsvButton'

interface ActionsProps {
	keys: (string | number)[]
	setKeys: Dispatch<SetStateAction<(string | number)[]>>
	refreshData: () => Promise<void>
	columns: IColumn[]
	primaryColumnName: string
}

const Actions = ({
	keys,
	setKeys,
	refreshData,
	primaryColumnName,
	columns,
}: ActionsProps) => {
	const [isDeleting, setIsDeleting] = useState(false)
	const [isOpen, setIsOpen] = useState(false)
	const { dataSourceId, table, database } = useDataSourcesStore()

	const toggleIsOpen = () => setIsOpen((prev) => !prev)

	const handleDelete = async () => {
		const selectedKeys = keys

		if (selectedKeys.length === 0) return

		setIsDeleting(true)

		try {
			const formattedKeys = selectedKeys
				.map((k) => (typeof k === 'string' ? `'${k}'` : k))
				.join(', ')
			const sql = `DELETE FROM ${table} WHERE ${primaryColumnName} IN (${formattedKeys});`

			await api.post(
				`/data_sources/${dataSourceId}/databases/${database}/query`,
				{ query: sql },
			)

			await refreshData()

			setKeys([])
			toast.success(`Deleted ${selectedKeys.length} row(s)!`)
		} catch (error) {
			notifyError(error, 'Failed to delete rows.')
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<div className='flex items-center justify-between p-4 border-b'>
			<div className='flex items-center gap-3'>
				<Button
					onClick={toggleIsOpen}
					size='icon'
					variant='ghost'>
					<PlusIcon />
				</Button>

				<RecordModal
					isOpen={isOpen}
					onOpenChange={toggleIsOpen}
					columns={columns}
					onSubmit={(sql) => {
						console.log({ sql })
					}}
				/>

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
					keysLength={keys.length}
					onClick={handleDelete}
					isDeleting={isDeleting}
				/>

				<div className='w-0.5 h-8 bg-black'></div>

				<RefreshButton onClick={refreshData} />

				<UploadCsvButton />

				<SettingsButton />
			</div>

			<Button>
				<PlayIcon />
				<span>Execute query</span>
			</Button>
		</div>
	)
}

export default Actions
