import { clsx } from 'clsx'
import { InfoIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IColumn } from '@/interfaces'
import { useDataSourcesStore } from '@/stores'

interface RecordModalProps {
	isOpen: boolean
	onOpenChange: () => void
	columns: IColumn[]
	row?: Record<string, unknown> | null
	primaryKeyColumn?: string
	onSubmit: (sql: string) => void
}

const RecordModal = ({
	isOpen,
	onOpenChange,
	columns,
	row,
	primaryKeyColumn = 'id',
	onSubmit,
}: RecordModalProps) => {
	const isUpdate = !!row
	const [formData, setFormData] = useState<Record<string, unknown>>({})
	const { table } = useDataSourcesStore()

	useEffect(() => {
		if (isOpen) {
			if (isUpdate && row) {
				setFormData({ ...row })
			} else {
				const emptyData: Record<string, unknown> = {}
				columns.forEach((col) => {
					emptyData[col.column_name] = ''
				})
				setFormData(emptyData)
			}
		}
	}, [isOpen, row, columns, isUpdate])

	const handleInputChange = (colName: string, value: string) => {
		setFormData((prev) => ({ ...prev, [colName]: value }))
	}

	const formatSqlValue = (val: unknown, dataType: string) => {
		if (val === null || val === undefined || val === '') return 'NULL'
		const typeLower = dataType.toLowerCase()
		if (
			typeLower.includes('int') ||
			typeLower.includes('float') ||
			typeLower.includes('double') ||
			typeLower.includes('numeric') ||
			typeLower.includes('decimal') ||
			typeLower.includes('bool') ||
			typeLower.includes('bit')
		) {
			return String(val)
		}
		const escapedVal = String(val).replace(/'/g, "''")
		return `'${escapedVal}'`
	}

	const handleSave = () => {
		let generatedSql = ''

		if (isUpdate && row) {
			const setClauses = columns
				.filter((col) => col.column_name !== primaryKeyColumn)
				.map((col) => {
					const val = formatSqlValue(
						formData[col.column_name],
						col.data_type,
					)
					return `${col.column_name} = ${val}`
				})

			const pkColDef = columns.find(
				(c) => c.column_name === primaryKeyColumn,
			)
			const pkValue = formatSqlValue(
				row[primaryKeyColumn],
				pkColDef?.data_type || 'int',
			)

			generatedSql = `UPDATE ${table} \nSET ${setClauses.join(', \n    ')} \nWHERE ${primaryKeyColumn} = ${pkValue};`
		} else {
			const activeCols = columns.filter(
				(col) => formData[col.column_name] !== '',
			)
			const colNames = activeCols.map((col) => col.column_name).join(', ')
			const values = activeCols
				.map((col) =>
					formatSqlValue(formData[col.column_name], col.data_type),
				)
				.join(', ')

			generatedSql = `INSERT INTO ${table} (${colNames}) \nVALUES (${values});`
		}

		onSubmit(generatedSql)
		onOpenChange()
	}

	return (
		<Dialog
			open={isOpen}
			onOpenChange={onOpenChange}>
			<DialogContent className='max-w-2xl max-h-[85vh] flex flex-col'>
				<DialogHeader>
					<DialogTitle>
						{isUpdate ?
							`Edit row in ${table}`
						:	`Insert new row into ${table}`}
					</DialogTitle>
					<DialogDescription>
						{isUpdate ?
							'Update the specific values below.'
						:	'Fill in the values. Fields with default generators can be left blank.'
						}
					</DialogDescription>
				</DialogHeader>

				<div className='flex-1 overflow-y-auto py-4 space-y-6 px-1'>
					{columns.map((col) => {
						const isPk = col.column_name === primaryKeyColumn
						// Xác định xem cột này có Default không (chỉ quan tâm lúc Create)
						const hasDefault =
							!isUpdate && col.column_default !== null

						return (
							<div
								key={col.column_name}
								className='grid grid-cols-4 items-start gap-4'>
								<Label
									htmlFor={col.column_name}
									className='text-right wrap-pbreak-words mt-3 flex items-center justify-end gap-1'>
									{col.column_name}
									{isPk && (
										<span className='text-amber-500'>
											*
										</span>
									)}
								</Label>

								<div className='col-span-3 flex flex-col gap-1'>
									{/* Highlight Badge cho nhãn (Tùy chọn hiển thị phía trên input) */}
									{hasDefault && (
										<div className='flex w-fit items-center gap-1.5 px-2 py-0.5 mb-1 rounded-md bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'>
											<InfoIcon size={14} />
											<span className='text-xs font-semibold'>
												Để trống sẽ dùng:{' '}
												<code className='font-mono'>
													{String(
														col.column_default,
													).replace(/'/g, '')}
												</code>
											</span>
										</div>
									)}

									<Input
										id={col.column_name}
										value={
											(formData[
												col.column_name
											] as string) ?? ''
										}
										onChange={(e) =>
											handleInputChange(
												col.column_name,
												e.target.value,
											)
										}
										disabled={isUpdate && isPk}
										placeholder={
											col.is_nullable ? 'NULL' : ''
										}
										// Đổi màu nền của ô Input nếu có Default
										className={clsx(
											'font-mono transition-colors',
											hasDefault ?
												'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 focus-visible:ring-blue-500'
											:	'',
										)}
									/>

									<div className='flex items-center gap-2 flex-wrap mt-0.5'>
										<span className='text-xs text-neutral-400 uppercase font-mono'>
											{col.data_type}{' '}
											{col.is_primary ? '(Primary)' : ''}
										</span>
									</div>
								</div>
							</div>
						)
					})}
				</div>

				<DialogFooter className='shrink-0 pt-4 border-t'>
					<Button
						variant='outline'
						onClick={onOpenChange}>
						Cancel
					</Button>
					<Button onClick={handleSave}>
						{isUpdate ? 'Generate UPDATE' : 'Generate INSERT'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export default RecordModal
