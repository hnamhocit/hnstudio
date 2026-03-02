import Papa from 'papaparse'

// Hàm escape chuỗi để chống lỗi SQL Injection và lỗi nháy đơn (Vd: O'brien -> O''brien)
const escapeSqlValue = (val: unknown) => {
	if (val === null || val === undefined || val === '') return 'NULL'

	// 1. Đã là số thì giữ nguyên (không nháy)
	if (typeof val === 'number') return val

	// 2. Xử lý boolean chuẩn
	if (typeof val === 'boolean') return val ? 1 : 0

	const strVal = String(val).trim()

	// 3. XỬ LÝ CỨU CÁNH CHO CỘT BIT(1) & BOOLEAN
	// Nếu chuỗi là '1' hoặc '0', ta trả về luôn dạng số (không có nháy đơn)
	if (strVal === '1' || strVal === '0') return strVal
	if (strVal.toLowerCase() === 'true') return 1
	if (strVal.toLowerCase() === 'false') return 0

	// 4. Các loại chuỗi khác thì bọc nháy đơn và escape ký tự nháy
	return `'${strVal.replace(/'/g, "''")}'`
}

export const generateInsertSqlFromCsv = (
	file: File,
	tableName: string,
	onSuccess: (sql: string) => void,
) => {
	Papa.parse(file, {
		header: true, // Lấy dòng đầu tiên làm tên cột
		skipEmptyLines: true, // Bỏ qua dòng trống
		complete: (results) => {
			const data = results.data as Record<string, unknown>[]

			if (data.length === 0) {
				alert('File CSV trống!')
				return
			}

			// 1. Lấy danh sách tên cột từ CSV (Giả sử tên cột CSV khớp với DB)
			const columns = Object.keys(data[0])
			const columnsString = columns.map((col) => `\`${col}\``).join(', ')

			// 2. Map dữ liệu thành các cụm (val1, val2)
			const valuesArray = data.map((row) => {
				const rowValues = columns.map((col) => escapeSqlValue(row[col]))
				return `(${rowValues.join(', ')})`
			})

			// LƯU Ý PRO: Nếu file CSV có 50,000 dòng, bạn không nên gộp thành 1 câu SQL khổng lồ
			// vì sẽ vượt quá giới hạn 'max_allowed_packet' của MySQL.
			// Ta nên chia nhỏ (Chunk) ra, ví dụ mỗi câu INSERT chứa 1000 rows.

			const CHUNK_SIZE = 1000
			let finalSql = ''

			for (let i = 0; i < valuesArray.length; i += CHUNK_SIZE) {
				const chunk = valuesArray.slice(i, i + CHUNK_SIZE)
				finalSql += `INSERT INTO \`${tableName}\` (${columnsString}) VALUES\n`
				finalSql += chunk.join(',\n')
				finalSql += ';\n\n'
			}

			onSuccess(finalSql)
		},
		error: (err) => {
			console.error('Parse CSV failed:', err)
		},
	})
}
