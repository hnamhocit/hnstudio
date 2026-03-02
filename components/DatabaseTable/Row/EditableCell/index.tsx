import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'

interface EditableCellProps {
	initialValue: unknown
	colName: string
	dataType?: string
	enumValues?: string[]
	onSave: (colName: string, newValue: unknown) => void
}

// Hàm "Giáp bảo vệ" chống lỗi [object Object] từ Node.js Buffer & JSON
const getSafeDisplayValue = (val: unknown, dataType: string) => {
	if (val === null || val === undefined) return null

	let parsed = val

	if (typeof val === 'object' && val !== null) {
		// 1. Xử lý Buffer (MySQL trả về Buffer cho kiểu BIT, BLOB)
		if (
			'type' in val &&
			val.type === 'Buffer' &&
			Array.isArray((val as any).data)
		) {
			parsed = (val as any).data[0] ?? 0 // Lấy bit đầu tiên (0 hoặc 1)
		} else {
			// 2. Xử lý kiểu JSON (Chuyển Object thành chuỗi hiển thị cho đẹp)
			return JSON.stringify(val) // Nếu muốn format đẹp có thể dùng JSON.stringify(val, null, 2)
		}
	}

	const strVal = String(parsed)
	const typeLower = dataType.toLowerCase()

	// 3. Chuẩn hóa hiển thị cho mọi thể loại Boolean (TINYINT(1), BIT(1), BOOL)
	if (
		typeLower.includes('bool') ||
		typeLower.includes('bit') ||
		typeLower.includes('tinyint(1)')
	) {
		if (strVal === '1' || strVal.toLowerCase() === 'true') return 'true'
		if (strVal === '0' || strVal.toLowerCase() === 'false') return 'false'
	}

	return strVal
}

const EditableCell = ({
	initialValue,
	colName,
	dataType = '',
	enumValues = [],
	onSave,
}: EditableCellProps) => {
	// Gọi hàm bảo vệ trước khi đưa vào State
	const safeInitialValue = getSafeDisplayValue(initialValue, dataType)

	const [isEditing, setIsEditing] = useState(false)
	const [value, setValue] = useState(
		safeInitialValue === null ? '' : safeInitialValue,
	)
	const inputRef = useRef<any>(null)

	// --- PHÂN TÍCH KIỂU DỮ LIỆU ---
	const typeLower = dataType.toLowerCase()

	const isBoolean =
		typeLower.includes('bool') ||
		typeLower.includes('bit') ||
		typeLower.includes('tinyint(1)')
	const isNumber =
		['int', 'float', 'double', 'numeric', 'decimal', 'real'].some((t) =>
			typeLower.includes(t),
		) && !typeLower.includes('tinyint(1)')
	const isYear = typeLower.includes('year') // Nhận diện kiểu YEAR

	const isEnum = typeLower.includes('enum') || enumValues.length > 0
	const parsedEnums =
		isEnum && enumValues.length === 0 && typeLower.startsWith('enum(') ?
			typeLower
				.replace('enum(', '')
				.replace(')', '')
				.replaceAll("'", '')
				.split(',')
		:	enumValues

	const isDateOnly = typeLower === 'date'
	const isDateTime =
		typeLower.includes('datetime') ||
		typeLower.includes('timestamp') ||
		typeLower.includes('time')

	const getFormattedDateForInput = (val: string) => {
		if (!val) return ''
		if (isDateTime && val.includes(' ')) {
			return val.slice(0, 16).replace(' ', 'T')
		}
		return val
	}

	// --- EFFECTS & HANDLERS ---
	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus()
			if (
				inputRef.current.setSelectionRange &&
				!isBoolean &&
				!isEnum &&
				!isDateOnly &&
				!isDateTime
			) {
				inputRef.current.setSelectionRange(
					inputRef.current.value.length,
					inputRef.current.value.length,
				)
			}
		}
	}, [isEditing, isBoolean, isEnum, isDateOnly, isDateTime])

	const handleSave = () => {
		setIsEditing(false)
		let finalValue: unknown = value.trim()
		if (finalValue === '') finalValue = null

		const initialStr = safeInitialValue === null ? '' : safeInitialValue

		if (String(finalValue) !== initialStr) {
			// Đưa format Datetime về lại chuẩn SQL
			if (
				finalValue &&
				typeof finalValue === 'string' &&
				finalValue.includes('T')
			) {
				finalValue = finalValue.replace('T', ' ') + ':00'
			}
			// Nếu là Boolean (true/false) thì parse về 1/0 cho SQL chạy đỡ lỗi (tùy adapter)
			if (isBoolean && finalValue !== null) {
				finalValue = finalValue === 'true' ? 1 : 0
			}

			onSave(colName, finalValue)
		} else {
			setValue(initialStr) // Hủy, nhả về nguyên trạng
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent<any>) => {
		if (e.key === 'Escape') {
			setIsEditing(false)
			setValue(safeInitialValue === null ? '' : safeInitialValue)
		}
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSave()
		}
	}

	// --- COMPONENT INPUT PHÙ HỢP ---
	const renderInput = () => {
		const floatingClasses =
			'absolute -inset-1 z-50 bg-white dark:bg-[#1e2333] text-primary outline-none ring-2 ring-primary border-none rounded shadow-xl px-3 py-2 font-mono text-sm'

		if (isBoolean || isEnum) {
			return (
				<select
					ref={inputRef}
					value={value}
					onChange={(e) => setValue(e.target.value)}
					onBlur={handleSave}
					onKeyDown={handleKeyDown}
					className={floatingClasses}>
					<option value=''>[NULL]</option>
					{isBoolean ?
						<>
							<option value='true'>true</option>
							<option value='false'>false</option>
						</>
					:	parsedEnums.map((eVal) => (
							<option
								key={eVal}
								value={eVal}>
								{eVal}
							</option>
						))
					}
				</select>
			)
		}

		// --- XỬ LÝ KIỂU YEAR ĐỘC LẬP ---
		if (isYear) {
			return (
				<input
					ref={inputRef}
					type='text'
					value={value}
					onChange={(e) => {
						const val = e.target.value
						// Regex: Chỉ cho phép nhập đúng 4 chữ số, cấm nhập chữ, cấm số thập phân
						if (val === '' || /^\d{0,4}$/.test(val)) setValue(val)
					}}
					onBlur={handleSave}
					onKeyDown={handleKeyDown}
					className={floatingClasses}
					placeholder='YYYY'
				/>
			)
		}

		if (isNumber) {
			return (
				<input
					ref={inputRef}
					type='text'
					value={value}
					onChange={(e) => {
						const val = e.target.value
						if (
							val === '' ||
							val === '-' ||
							/^-?\d*\.?\d*$/.test(val)
						)
							setValue(val)
					}}
					onBlur={handleSave}
					onKeyDown={handleKeyDown}
					className={floatingClasses}
					placeholder='Number only'
				/>
			)
		}

		if (isDateOnly || isDateTime) {
			return (
				<input
					ref={inputRef}
					type={isDateOnly ? 'date' : 'datetime-local'}
					value={getFormattedDateForInput(value)}
					onChange={(e) => setValue(e.target.value)}
					onBlur={handleSave}
					onKeyDown={handleKeyDown}
					className={floatingClasses}
				/>
			)
		}

		return (
			<textarea
				ref={inputRef}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onBlur={handleSave}
				onKeyDown={handleKeyDown}
				rows={1}
				className={`${floatingClasses} resize-none overflow-hidden`}
				style={{
					height: `${Math.max(40, value.split('\n').length * 20 + 16)}px`,
				}}
			/>
		)
	}

	return (
		<div
			className='relative w-full h-full min-h-[28px] group'
			onDoubleClick={() => setIsEditing(true)}>
			{/* Lớp hiển thị tĩnh */}
			<div className='px-2 py-1 cursor-text truncate max-w-sm'>
				{safeInitialValue === null ?
					<span className='italic text-neutral-400'>[NULL]</span>
				: isBoolean ?
					<span
						className={clsx(
							'py-1 px-2 rounded-full text-white font-medium',
							safeInitialValue === 'true' ?
								'bg-green-600 dark:bg-green-400'
							:	'bg-red-600 dark:bg-red-400',
						)}>
						{safeInitialValue}
					</span>
				:	safeInitialValue}
			</div>

			{/* Lớp Input nổi (Floating) */}
			{isEditing && renderInput()}
		</div>
	)
}

export default EditableCell
