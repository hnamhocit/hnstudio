import { clsx } from 'clsx'
import { EllipsisVerticalIcon } from 'lucide-react'
import { Dispatch, SetStateAction, useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { IColumn } from '@/interfaces'
import { getTypeInfo } from '@/utils'
import EditableCell from './EditableCell'

interface RowProps {
	i: number
	columns: IColumn[]
	row: Record<string, unknown>
	keys: (string | number)[]
	setKeys: Dispatch<SetStateAction<(string | number)[]>>
	primaryColumnName: string
}

const Row = ({
	i,
	columns,
	keys,
	setKeys,
	row,
	primaryColumnName,
}: RowProps) => {
	const [isHover, setIsHover] = useState(false)
	const isSelected = keys.includes(row[primaryColumnName] as string | number)

	return (
		<tr
			className={clsx(
				'odd:bg-primary/5 hover:bg-primary/10 transition-colors duration-150',
				isSelected && 'bg-primary/20!',
			)}
			onMouseEnter={() => setIsHover(true)}
			onMouseLeave={() => setIsHover(false)}>
			<td className='border p-2 select-none text-neutral-500 font-mono text-center'>
				<div className='flex items-center justify-center gap-4'>
					<span className='min-w-5'>{i + 1}</span>

					<div
						className={clsx(
							'flex items-center gap-4 transition-all duration-300',
							isHover || isSelected ?
								'opacity-100 visible'
							:	'opacity-0 invisible',
						)}>
						<Checkbox
							className='w-6 h-6 bg-white'
							checked={isSelected}
							onCheckedChange={(isSelected) => {
								if (isSelected) {
									setKeys([
										...keys,
										row[primaryColumnName] as
											| string
											| number,
									])
								} else {
									setKeys(
										keys.filter(
											(key) =>
												key !== row[primaryColumnName],
										),
									)
								}
							}}
						/>

						<button
							title='re-arrange'
							className='cursor-pointer'>
							<EllipsisVerticalIcon size={20} />
						</button>
					</div>
				</div>
			</td>

			{columns.map((col) => {
				const color = getTypeInfo(col.data_type).color

				return (
					<td
						key={col.column_name}
						className={clsx(
							'border p-2 select-none font-mono',
							color,
						)}>
						<EditableCell
							initialValue={row[col.column_name]}
							colName={col.column_name}
							dataType={col.data_type}
							onSave={(colName, newValue) => {
								// TODO: Xử lý lưu dữ liệu ở đây
								console.log(
									'Cần update:',
									colName,
									'thành',
									newValue,
								)
							}}
						/>
					</td>
				)
			})}
		</tr>
	)
}

export default Row
