'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
	AlertTriangleIcon,
	CheckCircle2Icon,
	ChevronLeftIcon,
	ExternalLinkIcon,
	Loader2Icon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ReactNode, useEffect, useRef, useState } from 'react'
import {
	Controller,
	FieldErrors,
	SubmitHandler,
	useForm,
	useWatch,
} from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { supportDataSources } from '@/constants/supportDataSources'
import {
	DataSourceFormData,
	datasourceSchema,
	dataSourceSchema,
} from '@/schemas'
import { dataSourcesService } from '@/services'
import { useDataSourcesStore, useUserStore } from '@/stores'
import { notifyError } from '@/utils'

interface DataSourceDialogProps {
	children?: ReactNode
	dataSourceId?: string | null
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

const DEFAULT_FORM_VALUES = {
	name: '',
	type: 'postgresql' as const,
	method: 'host' as const,
	host: 'localhost',
	port: 5432,
	database_name: '',
	savePassword: true,
	showAllDatabases: true,
	username: 'postgres',
	password: '',
}

const DataSourceDialog = ({
	children,
	dataSourceId,
	open,
	onOpenChange,
}: DataSourceDialogProps) => {
	const [internalIsOpen, setInternalIsOpen] = useState(false)
	const isDialogOpen = open !== undefined ? open : internalIsOpen
	const initializedForOpenRef = useRef(false)

	const [step, setStep] = useState<1 | 2>(1)
	const [isTesting, setIsTesting] = useState(false)
	const [isTestSuccessful, setIsTestSuccessful] = useState(false)

	const {
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
		reset,
		setValue,
		getValues,
		trigger,
		watch,
	} = useForm<DataSourceFormData>({
		resolver: zodResolver(dataSourceSchema),
		defaultValues: DEFAULT_FORM_VALUES,
	})

	const { datasources, setDatasources } = useDataSourcesStore()
	const { user } = useUserStore()

	const method = useWatch({ control, name: 'method' })
	const dbType = useWatch({ control, name: 'type' })
	const hostValue = useWatch({ control, name: 'host' })

	const hostErrors = errors as FieldErrors<{
		host: string
		port: string
		database_name: string
	}>
	const urlErrors = errors as FieldErrors<{ url: string }>

	const isEditMode = !!dataSourceId
	const normalizedHost = hostValue?.trim().toLowerCase() || ''
	const isBlockedLocalHost =
		method === 'host' &&
		dbType !== 'sqlite' &&
		['localhost', '127.0.0.1', '::1'].includes(normalizedHost)

	// Cập nhật form data khi mở dialog
	useEffect(() => {
		if (!isDialogOpen) {
			initializedForOpenRef.current = false
			return
		}

		if (initializedForOpenRef.current) {
			return
		}

		if (isEditMode) {
			const existingDs = datasources.find((ds) => ds.id === dataSourceId)
			if (!existingDs) {
				return
			}

			// Trải phẳng dữ liệu từ config ra để reset vào form
			const formDataToReset: DataSourceFormData = {
				name: existingDs.name,
				type: existingDs.type as z.infer<typeof datasourceSchema>,
				method: existingDs.config.method || 'host',
				host: existingDs.config.host || '',
				port: existingDs.config.port,
				database_name: existingDs.config.database_name || '',
				savePassword: existingDs.config.savePassword ?? true,
				showAllDatabases: existingDs.config.showAllDatabases ?? true,
				username: existingDs.config.username || '',
				password: existingDs.config.password || '', // Mật khẩu có thể rỗng nếu user chọn không lưu
				url: existingDs.config.url || '',
			}

			reset(formDataToReset)
			setStep(2)
		} else {
			reset(DEFAULT_FORM_VALUES)
			setStep(1)
		}

		setIsTestSuccessful(false)
		initializedForOpenRef.current = true
	}, [isDialogOpen, isEditMode, dataSourceId, datasources, reset])

	// Cập nhật giá trị mặc định khi đổi loại Database (Chỉ áp dụng khi ở Add Mode)
	useEffect(() => {
		if (isEditMode) return // Bỏ qua nếu đang ở Edit Mode để không ghi đè dữ liệu cũ

		if (dbType === 'postgresql') {
			setValue('port', 5432)
			setValue('username', 'postgres')
		} else if (dbType === 'mysql' || dbType === 'maria-db') {
			setValue('port', 3306)
			setValue('username', 'root')
		} else if (dbType === 'sql-server') {
			setValue('port', 1433)
			setValue('username', 'sa')
		} else if (dbType === 'sqlite') {
			setValue('port', undefined as unknown as number)
			setValue('username', undefined as unknown as string)
			setValue('method', 'host')
		}
	}, [dbType, setValue, isEditMode])

	useEffect(() => {
		const subscription = watch(() => {
			if (isTestSuccessful) {
				setIsTestSuccessful(false)
			}
		})
		return () => subscription.unsubscribe()
	}, [watch, isTestSuccessful])

	const handleOpenChange = (newOpen: boolean) => {
		if (onOpenChange) onOpenChange(newOpen)
		setInternalIsOpen(newOpen)

		if (!newOpen) {
			setTimeout(() => {
				if (!isEditMode) setStep(1)
				reset(DEFAULT_FORM_VALUES)
				setIsTestSuccessful(false)
			}, 300)
		}
	}

	const handleSelectDatabase = (type: z.infer<typeof datasourceSchema>) => {
		setValue('type', type)
		setIsTestSuccessful(false)
		setStep(2)
	}

	const handleTestConnection = async () => {
		if (isBlockedLocalHost) {
			toast.error(
				'Localhost is blocked. Use ngrok host URL to continue.',
				{ position: 'top-center' },
			)
			return
		}

		const isValid = await trigger()
		if (!isValid) return

		setIsTesting(true)
		setIsTestSuccessful(false)

		try {
			const formData = getValues()

			await dataSourcesService.testConnection(formData)

			setIsTestSuccessful(true)
			toast.success('Connection successful!', { position: 'top-center' })
		} catch (error) {
			notifyError(error, 'Connection failed. Please check your config.')
		} finally {
			setIsTesting(false)
		}
	}

	const onSubmit: SubmitHandler<DataSourceFormData> = async (formData) => {
		if (isBlockedLocalHost) {
			toast.error(
				'Cannot continue with localhost. Please use ngrok tunnel host.',
				{ position: 'top-center' },
			)
			return
		}

		try {
			if (isEditMode) {
				const { error } = await dataSourcesService.update(
					dataSourceId,
					formData,
				)

				if (error) {
					toast.error(error.message, { position: 'top-center' })
					return
				}

				// Cập nhật lại store: Gói các trường connection vào object config
				setDatasources(
						datasources.map((ds) => {
							if (ds.id === dataSourceId) {
								const { name, type, ...configData } = formData
								return {
									...ds,
									name,
									type,
									config: {
										...ds.config,
										...configData,
									},
								}
						}
						return ds
					}),
				)

				toast.success('Data source updated successfully!', {
					position: 'top-center',
				})
			} else {
				const { data } = await dataSourcesService.addDataSource({
					...formData,
					userId: user!.id,
				})

				setDatasources([...datasources, data.data])

				toast.success('Data source added successfully!', {
					position: 'top-center',
				})
			}

			handleOpenChange(false)
		} catch (error) {
			notifyError(
				error,
				isEditMode ?
					'Failed to update data source.'
				:	'Failed to add data source.',
			)
		}
	}

	const selectedDbInfo = supportDataSources.find((ds) => ds.id === dbType)

	return (
		<Dialog
			open={isDialogOpen}
			onOpenChange={handleOpenChange}>
			{children && <DialogTrigger asChild>{children}</DialogTrigger>}

			<DialogContent className='max-w-md'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						{step === 2 && !isEditMode && (
							<button
								title='go back'
								onClick={() => setStep(1)}
								className='p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors'>
								<ChevronLeftIcon size={20} />
							</button>
						)}
						{step === 1 ?
							'Select Data Source'
						: isEditMode ?
							`Edit ${selectedDbInfo?.name || 'Connection'}`
						:	`Configure ${selectedDbInfo?.name || 'Database'}`}
					</DialogTitle>
				</DialogHeader>

				{step === 1 && !isEditMode && (
					<div className='grid grid-cols-2 gap-4 py-4'>
						{supportDataSources.map((ds) => (
							<button
								key={ds.id}
								onClick={() =>
									handleSelectDatabase(
										ds.id as z.infer<
											typeof datasourceSchema
										>,
									)
								}
								className='flex flex-col items-center justify-center p-6 gap-3 border rounded-xl hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-200 group'>
								<Image
									src={
										ds.photoURL || '/default-datasource.png'
									}
									alt={ds.name}
									width={40}
									height={40}
									className='group-hover:scale-110 transition-transform duration-200'
								/>
								<span className='font-mono font-medium text-sm text-gray-600 dark:text-gray-300 group-hover:text-primary'>
									{ds.name}
								</span>
							</button>
						))}
					</div>
				)}

				{step === 2 && (
					<form
						onSubmit={handleSubmit(onSubmit)}
						className='animate-in fade-in slide-in-from-right-4 duration-300'>
						<FieldSet>
							<FieldGroup className='mb-4'>
								<div className='space-y-2'>
									<Field orientation='horizontal'>
										<FieldLabel>Name</FieldLabel>
										<Controller
											control={control}
											name='name'
											render={({ field }) => (
												<Input
													{...field}
													type='text'
													placeholder='e.g. My Production DB'
													value={field.value || ''}
												/>
											)}
										/>
									</Field>
									{errors.name && (
										<FieldError>
											{errors.name.message as string}
										</FieldError>
									)}
								</div>
							</FieldGroup>

							{dbType !== 'sqlite' && (
								<div className='text-indigo-500 font-semibold font-mono'>
									Server
								</div>
							)}

							<FieldGroup>
								{dbType !== 'sqlite' && (
									<Field orientation='horizontal'>
										<FieldLabel>Connected by</FieldLabel>

										<Controller
											control={control}
											name='method'
											render={({
												field: { value, onChange },
											}) => (
												<RadioGroup
													value={value}
													onValueChange={onChange}
													orientation='horizontal'>
													<div className='flex items-center gap-3'>
														<RadioGroupItem
															value='host'
															id='host'
														/>
														<Label htmlFor='host'>
															Host
														</Label>
													</div>

													<div className='flex items-center gap-3'>
														<RadioGroupItem
															value='url'
															id='url'
														/>
														<Label htmlFor='url'>
															URL
														</Label>
													</div>
												</RadioGroup>
											)}
										/>
									</Field>
								)}

								{method === 'url' && dbType !== 'sqlite' && (
									<div className='space-y-2'>
										<Field orientation='horizontal'>
											<FieldLabel>URL</FieldLabel>
											<Controller
												control={control}
												name='url'
												render={({ field }) => (
													<Input
														{...field}
														type='text'
														placeholder='e.g. postgres://user:pass@localhost:5432/db'
														value={
															field.value || ''
														}
													/>
												)}
											/>
										</Field>
										{urlErrors.url && (
											<FieldError>
												{urlErrors.url?.message}
											</FieldError>
										)}
									</div>
								)}

								{method === 'host' && (
									<div className='space-y-2'>
										{dbType !== 'sqlite' && (
											<>
												<Field orientation='horizontal'>
													<FieldLabel>Host</FieldLabel>
													<Controller
														control={control}
														name='host'
														render={({
															field,
														}) => (
															<Input
																{...field}
																type='text'
																placeholder='e.g. localhost'
																className={
																	isBlockedLocalHost ?
																		'border-amber-500 focus-visible:ring-amber-500/30'
																	:	''
																}
																value={
																	field.value ||
																	''
																}
															/>
														)}
													/>

													<FieldLabel>Port</FieldLabel>
													<Controller
														control={control}
														name='port'
														render={({
															field,
														}) => (
															<Input
																{...field}
																type='number'
																placeholder='e.g. 5432'
																className='max-w-24 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
																value={
																	field.value ||
																	''
																}
																onChange={(e) =>
																	field.onChange(
																		parseInt(
																			e
																				.target
																				.value,
																			10,
																		) ||
																			undefined,
																	)
																}
															/>
														)}
													/>
												</Field>
												{isBlockedLocalHost && (
													<div className='rounded-md border border-amber-400/40 bg-amber-50/70 dark:bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200'>
														<div className='inline-flex items-center gap-1 font-semibold'>
															<AlertTriangleIcon
																size={12}
															/>
															Localhost is not
															allowed
														</div>
														<div className='mt-1'>
															When API runs on VPS,
															`localhost` points to
															the VPS itself. Please
															use ngrok tunnel host
															to continue.
														</div>
														<div className='mt-2'>
															<Link
																href={{
																	pathname:
																		'/help/connect-localhost',
																	query: {
																		source: dbType,
																		name:
																			selectedDbInfo?.name ||
																			dbType,
																	},
																}}
																className='inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-100/80 dark:bg-amber-500/20 px-2 py-1 text-xs font-semibold text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-500/30 transition-colors'>
																How to connect
																localhost
																(ngrok)
																<ExternalLinkIcon
																	size={12}
																/>
															</Link>
														</div>
													</div>
												)}
											</>
										)}

										{hostErrors.host && (
											<FieldError>
												{hostErrors.host?.message}
											</FieldError>
										)}
										{hostErrors.port && (
											<FieldError>
												{hostErrors.port?.message}
											</FieldError>
										)}
									</div>
								)}

								<div className='space-y-2'>
									<Field orientation='horizontal'>
										{method === 'host' && (
											<>
												<FieldLabel>
													{dbType === 'sqlite' ?
														'File Path'
													:	'Database'}
												</FieldLabel>
												<Controller
													control={control}
													name='database_name'
													render={({ field }) => (
														<Input
															{...field}
															type='text'
															placeholder={
																(
																	dbType ===
																	'sqlite'
																) ?
																	'e.g. ./data.sqlite'
																:	'e.g. my_database'
															}
															value={
																field.value ||
																''
															}
														/>
													)}
												/>
											</>
										)}

										{dbType !== 'sqlite' && (
											<>
												<Controller
													control={control}
													name='showAllDatabases'
													render={({ field }) => (
														<Checkbox
															id='show-all-databases'
															checked={
																field.value
															}
															onCheckedChange={
																field.onChange
															}
														/>
													)}
												/>
												<FieldLabel htmlFor='show-all-databases'>
													Show all databases
												</FieldLabel>
											</>
										)}
									</Field>

									{hostErrors?.database_name && (
										<FieldError>
											{hostErrors?.database_name?.message}
										</FieldError>
									)}
								</div>
							</FieldGroup>

							{/* CHỈ HIỂN THỊ KHI method === 'host' */}
							{dbType !== 'sqlite' && method === 'host' && (
								<>
									<div className='text-indigo-500 font-semibold font-mono'>
										Authentication
									</div>

									<FieldGroup>
										<div className='space-y-2'>
											<Field orientation='horizontal'>
												<FieldLabel>
													Username
												</FieldLabel>
												<Controller
													control={control}
													name='username'
													render={({ field }) => (
														<Input
															{...field}
															type='text'
															placeholder='e.g. admin'
															value={
																field.value ||
																''
															}
														/>
													)}
												/>
											</Field>
											{errors.username && (
												<FieldError>
													{errors.username?.message}
												</FieldError>
											)}
										</div>

										<div className='space-y-2'>
											<Field orientation='horizontal'>
												<FieldLabel>
													Password
												</FieldLabel>
												<Controller
													control={control}
													name='password'
													render={({ field }) => (
														<Input
															{...field}
															type='password'
															placeholder='Enter your password'
															value={
																field.value ||
																''
															}
														/>
													)}
												/>

												<Controller
													control={control}
													name='savePassword'
													render={({ field }) => (
														<Checkbox
															id='save-password'
															checked={
																field.value
															}
															onCheckedChange={
																field.onChange
															}
														/>
													)}
												/>
												<FieldLabel htmlFor='save-password'>
													Save password
												</FieldLabel>
											</Field>
											{errors.password && (
												<FieldError>
													{errors.password?.message}
												</FieldError>
											)}
										</div>
									</FieldGroup>
								</>
							)}

							<div className='flex justify-end gap-3 pt-4 border-t mt-4'>
								<Button
									variant='outline'
									type='button'
									onClick={handleTestConnection}
									disabled={isTesting || isBlockedLocalHost}
									className={
										isTestSuccessful ?
											'border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700'
										:	''
									}>
									{isTesting ?
										<>
											<Loader2Icon className='mr-2 h-4 w-4 animate-spin' />{' '}
											Testing...
										</>
									: isTestSuccessful ?
										<>
											<CheckCircle2Icon className='mr-2 h-4 w-4' />{' '}
											Tested OK
										</>
									:	'Test connection'}
								</Button>

								<Button
									type='submit'
									disabled={
										!isTestSuccessful ||
										isSubmitting ||
										isBlockedLocalHost
									}>
									{isEditMode ? 'Save Connection' : 'Connect'}
								</Button>
							</div>
						</FieldSet>
					</form>
				)}
			</DialogContent>
		</Dialog>
	)
}

export default DataSourceDialog
