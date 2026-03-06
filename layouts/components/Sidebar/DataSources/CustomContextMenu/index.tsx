import {
	ChevronsLeftRightEllipsisIcon,
	EvChargerIcon,
	FilePlusIcon,
	PencilIcon,
	PenIcon,
	PlusIcon,
	RotateCcwIcon,
	ScrollIcon,
	Trash2Icon,
	UnplugIcon,
} from 'lucide-react'
import { ReactNode } from 'react'

import DataSourceDialog from '@/components/DataSourceDialog'
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { useDatabases } from '@/hooks'
import { IDataSource } from '@/interfaces'
import { dataSourcesService } from '@/services'
import { useDataSourceContextMenuStore } from '@/stores'
import CreateDatabaseDialog from './CreateDatabaseDialog'
import DeleteDialog from './DeleteDialog'
import RenameDialog from './RenameDialog' // Import thêm RenameDialog

interface CustomContextMenuProps {
	ds: IDataSource
	children: ReactNode
}

const CustomContextMenu = ({ ds, children }: CustomContextMenuProps) => {
	const { reload } = useDatabases(ds.id)

	const {
		isSubmitting,
		dataSourceId,
		setDataSourceId,
		openAction,
		closeAction,
		actionType,
	} = useDataSourceContextMenuStore()
	const isOpen = dataSourceId === ds.id && actionType === 'edit'

	return (
		<>
			<ContextMenu
				onOpenChange={(isOpen) => {
					if (isOpen) setDataSourceId(ds.id)
				}}>
				<ContextMenuTrigger>{children}</ContextMenuTrigger>

				<ContextMenuContent>
					<ContextMenuSub>
						<ContextMenuSubTrigger>
							SQL Editor
						</ContextMenuSubTrigger>
						<ContextMenuSubContent>
							<ContextMenuItem>
								<ScrollIcon className='mr-2 h-4 w-4' />
								Open SQL script
							</ContextMenuItem>
							<ContextMenuItem>
								<FilePlusIcon className='mr-2 h-4 w-4' />
								New SQL script
							</ContextMenuItem>
							<ContextMenuItem>
								<ChevronsLeftRightEllipsisIcon className='mr-2 h-4 w-4' />
								Open Query console
							</ContextMenuItem>
						</ContextMenuSubContent>
					</ContextMenuSub>

					<ContextMenuSeparator />

					<ContextMenuGroup>
						<ContextMenuItem
							onSelect={() => openAction('create-database')}>
							<PlusIcon className='mr-2 h-4 w-4' />
							Create database
						</ContextMenuItem>

						<ContextMenuItem onSelect={() => openAction('edit')}>
							<PenIcon className='mr-2 h-4 w-4' />
							Edit connection
						</ContextMenuItem>
					</ContextMenuGroup>

					<ContextMenuSeparator />

					<ContextMenuGroup>
						<ContextMenuItem
							onClick={() => dataSourcesService.reconnect(ds.id)}>
							<EvChargerIcon className='mr-2 h-4 w-4' />
							Invalidate/Reconnect
						</ContextMenuItem>

						<ContextMenuItem
							onClick={() =>
								dataSourcesService.disconnect(ds.id)
							}>
							<UnplugIcon className='mr-2 h-4 w-4' />
							Disconnect
						</ContextMenuItem>
					</ContextMenuGroup>

					<ContextMenuSeparator />

					<ContextMenuGroup>
						<ContextMenuItem
							disabled={isSubmitting}
							variant='destructive'
							onSelect={() => openAction('delete')}>
							<Trash2Icon className='mr-2 h-4 w-4' />
							Delete
						</ContextMenuItem>

						<ContextMenuItem
							disabled={isSubmitting}
							onSelect={() => openAction('rename')}>
							<PencilIcon className='mr-2 h-4 w-4' />
							Rename
						</ContextMenuItem>
					</ContextMenuGroup>

					<ContextMenuSeparator />

					<ContextMenuGroup>
						<ContextMenuItem onClick={reload}>
							<RotateCcwIcon className='mr-2 h-4 w-4' />
							Refresh
						</ContextMenuItem>
					</ContextMenuGroup>
				</ContextMenuContent>
			</ContextMenu>

			{/* Render 2 Modal ở đây */}
			<DeleteDialog id={ds.id} />
			<RenameDialog
				id={ds.id}
				currentName={ds.name || ds.type}
			/>
			<DataSourceDialog
				dataSourceId={ds.id}
				open={isOpen}
				onOpenChange={closeAction}
			/>
			<CreateDatabaseDialog id={ds.id} />
		</>
	)
}

export default CustomContextMenu
