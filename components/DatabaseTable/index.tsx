import { useVirtualizer } from '@tanstack/react-virtual'
import { CircleIcon } from 'lucide-react'
import { Dispatch, SetStateAction, useRef } from 'react'

import { IColumn } from '@/interfaces'
import { getTypeInfo } from '@/utils'
import Row from './Row'

interface DatabaseTableProps {
	columns: IColumn[]
	rows: Record<string, unknown>[]
	keys: (string | number)[]
	setKeys: Dispatch<SetStateAction<(string | number)[]>>
	primaryColumnName: string
}

const DatabaseTable = ({
	columns,
	rows,
	keys,
	setKeys,
	primaryColumnName,
}: DatabaseTableProps) => {
	// 2. Tham chiếu đến khung chứa thanh cuộn
	const parentRef = useRef<HTMLDivElement>(null)

	// 3. Khởi tạo Virtualizer
	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		// Ước lượng chiều cao của 1 dòng Row (VD: 45px).
		// Số này không cần chính xác 100%, Virtualizer sẽ tự chỉnh lại khi render thật.
		estimateSize: () => 45,
		overscan: 10,
	})

	const virtualItems = rowVirtualizer.getVirtualItems()

	// 4. Tính toán khoảng trống bên trên và bên dưới để đẩy thanh cuộn (Scrollbar)
	const paddingTop = virtualItems.length > 0 ? virtualItems[0]?.start || 0 : 0
	const paddingBottom =
		virtualItems.length > 0 ?
			rowVirtualizer.getTotalSize() -
			(virtualItems[virtualItems.length - 1]?.end || 0)
		:	0

	return (
		// Bắt buộc container phải có chiều cao cụ thể (w-full h-full) và overflow-auto
		<div
			ref={parentRef}
			className='w-full h-full overflow-auto relative'>
			<table className='w-full border-collapse whitespace-nowrap'>
				<thead>
					<tr>
						<th className='border p-2 sticky top-0 bg-primary z-20'>
							<CircleIcon className='text-white mx-auto' />
						</th>

						{columns.map((col) => {
							const { icon: Icon } = getTypeInfo(col.data_type)

							return (
								<th
									key={col.column_name}
									className='border p-2 text-left select-none sticky top-0 bg-primary text-primary-foreground z-20'>
									<div className='text-lg font-semibold'>
										{col.column_name}
									</div>

									<div className='flex items-center gap-2 text-neutral-300 dark:text-neutral-700'>
										<Icon size={18} />
										<div className='text-sm uppercase'>
											{col.data_type}
										</div>
									</div>
								</th>
							)
						})}
					</tr>
				</thead>

				<tbody>
					{/* Dòng đệm phía trên (Đẩy phần nội dung xuống đúng vị trí cuộn) */}
					{paddingTop > 0 && (
						<tr>
							<td
								style={{ height: `${paddingTop}px` }}
								colSpan={columns.length + 1}
							/>
						</tr>
					)}

					{/* Chỉ render những dòng đang lọt vào khung hình */}
					{virtualItems.map((virtualRow) => {
						const row = rows[virtualRow.index]
						return (
							<Row
								key={virtualRow.index} // Dùng index làm key tạm, hoặc dùng row[primaryColumnName] nếu chắc chắn ID không trùng
								keys={keys}
								setKeys={setKeys}
								columns={columns}
								row={row}
								primaryColumnName={primaryColumnName}
								i={virtualRow.index}
							/>
						)
					})}

					{/* Dòng đệm phía dưới (Kéo giãn thanh cuộn cho khớp với tổng số dòng) */}
					{paddingBottom > 0 && (
						<tr>
							<td
								style={{ height: `${paddingBottom}px` }}
								colSpan={columns.length + 1}
							/>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	)
}

export default DatabaseTable
