import { Trash2Icon } from 'lucide-react'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip'

interface DeleteButtonProps {
	keysLength: number
	onClick: () => Promise<void>
	isDeleting: boolean
}

const DeleteButton = ({
	onClick,
	isDeleting,
	keysLength,
}: DeleteButtonProps) => {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							disabled={isDeleting}
							size='icon'
							variant='ghost'>
							<Trash2Icon />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Delete selected rows</p>
					</TooltipContent>
				</Tooltip>
			</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Are you sure you want to delete?
					</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. There will be{' '}
						<strong className='text-foreground'>
							{keysLength} row(s)
						</strong>{' '}
						deleted and permanently removed from the Database.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>

					<AlertDialogAction
						onClick={onClick}
						className='bg-red-600 hover:bg-red-700 text-white'>
						Confirm
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}

export default DeleteButton
