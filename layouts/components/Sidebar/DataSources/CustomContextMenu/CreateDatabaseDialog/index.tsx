'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { dataSourcesService } from '@/services'
import { useDataSourceContextMenuStore, useDataSourcesStore } from '@/stores'
import { notifyError } from '@/utils'
// TODO: Import service thực tế
// import { databaseService } from '@/services'

interface CreateDatabaseDialogProps {
	id: string
}

const formSchema = z.object({
	databaseName: z
		.string()
		.min(1, 'Database name is required')
		.regex(
			/^[a-zA-Z0-9_.-]+$/,
			'Only letters, numbers, dashes, underscores, and dots are allowed',
		),
})

type FormData = z.infer<typeof formSchema>

const CreateDatabaseDialog = ({ id }: CreateDatabaseDialogProps) => {
	const { actionType, dataSourceId, closeAction } =
		useDataSourceContextMenuStore()
	const { datasources } = useDataSourcesStore()
	const isOpen = id === dataSourceId && actionType === 'create-database'

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: { databaseName: '' },
	})

	const onSubmit = async (data: FormData) => {
		try {
			await dataSourcesService.runQuery(
				id,
				`CREATE DATABASE ${data.databaseName}`,
				datasources.find((ds) => ds.id === id)!.type,
			)

			toast.success('Created successfully')

			closeAction()
		} catch (error) {
			notifyError(error, 'Failed to create database.')
		}
	}

	return (
		<Dialog
			open={isOpen}
			onOpenChange={closeAction}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Database</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)}>
					<div className='py-4'>
						<Input
							{...register('databaseName')}
							placeholder='Enter new database name'
							autoFocus
						/>
						{errors.databaseName && (
							<p className='text-sm text-red-500 mt-2 font-medium'>
								{errors.databaseName.message}
							</p>
						)}
					</div>

					<DialogFooter>
						<Button
							type='button'
							variant='outline'
							onClick={closeAction}
							disabled={isSubmitting}>
							Cancel
						</Button>

						<Button
							type='submit'
							disabled={isSubmitting}>
							{isSubmitting ? 'Creating...' : 'Create'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}

export default CreateDatabaseDialog
