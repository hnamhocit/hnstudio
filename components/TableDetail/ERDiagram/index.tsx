import {
	Background,
	Controls,
	Edge,
	Node,
	ReactFlow,
	useEdgesState,
	useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useEffect, useState } from 'react' // Đã bỏ useRef

import { api } from '@/config'
import { IRelationship } from '@/interfaces'
import { useDataSourcesStore, useTabsStore } from '@/stores'
import { getDbPath, getLayoutedElements, notifyError } from '@/utils'
import TableNode from './TableNode'

const nodeTypes = { tableNode: TableNode }

const ERDiagram = () => {
	const { cachedSchema, cachedRelationships, setCachedRelationships } =
		useDataSourcesStore()
	const { activeTab } = useTabsStore()
	const [nodes, setNodes, onNodesChange] = useNodesState([])
	const [edges, setEdges, onEdgesChange] = useEdgesState([])
	const [isLoading, setIsLoading] = useState(false)

	const schemaCacheKey = `${activeTab!.dataSourceId}-${activeTab!.database}`
	const schema = cachedSchema[schemaCacheKey] || {}

	const relationshipsCacheKey = `${schemaCacheKey}-${activeTab!.table}`
	const cachedRels = cachedRelationships[relationshipsCacheKey]

	// 2. Fetch Relationships API (Đã bỏ fetchLock)
	useEffect(() => {
		// Nếu đã có cache cho bảng này thì quay xe
		if (cachedRels !== undefined) return

		const fetchRels = async () => {
			setIsLoading(true)

			try {
				const { data } = await api.get(getDbPath('relationships'))
				// Lưu vào Store với Key chứa tên bảng
				setCachedRelationships(relationshipsCacheKey, data.data || [])
			} catch (error) {
				notifyError(error, 'Failed to fetch relationships.')
			} finally {
				setIsLoading(false)
			}
		}

		fetchRels()
	}, [activeTab, cachedRels, relationshipsCacheKey, setCachedRelationships])

	// 3. Map dữ liệu sang Nodes và Edges
	useEffect(() => {
		if (
			!schema ||
			Object.keys(schema).length === 0 ||
			!activeTab?.table ||
			!cachedRels
		)
			return

		const currentTable = activeTab.table
		const relevantTables = new Set<string>()

		relevantTables.add(currentTable)

		// Dùng cachedRels thay vì state relationships cũ
		const relevantRelationships = cachedRels.filter(
			(rel: IRelationship) =>
				rel.source_table === currentTable ||
				rel.target_table === currentTable,
		)

		relevantRelationships.forEach((rel: IRelationship) => {
			relevantTables.add(rel.source_table)
			relevantTables.add(rel.target_table)
		})

		const dynamicNodes: Node[] = Object.entries(schema)
			.filter(([tableName]) => relevantTables.has(tableName))
			.map(([tableName, columns]) => ({
				id: tableName,
				type: 'tableNode',
				position: { x: 0, y: 0 },
				data: {
					name: tableName,
					columns: columns,
				},
			}))

		const dynamicEdges: Edge[] = relevantRelationships.map(
			(rel: IRelationship) => ({
				id: `e-${rel.source_table}.${rel.source_column}-${rel.target_table}.${rel.target_column}`,
				source: rel.source_table,
				sourceHandle: rel.source_column,
				target: rel.target_table,
				targetHandle: rel.target_column,
				animated: true,
				type: 'smoothstep',
				style: { stroke: '#3b82f6', strokeWidth: 1.5 },
			}),
		)

		const { nodes: layoutedNodes, edges: layoutedEdges } =
			getLayoutedElements(dynamicNodes, dynamicEdges, 'LR')

		setNodes(layoutedNodes as never[])
		setEdges(layoutedEdges as never[])
	}, [schema, cachedRels, activeTab?.table, setNodes, setEdges])

	if (isLoading && !cachedRels)
		return (
			<div className='w-full h-full min-h-[calc(100vh-100px)] flex items-center justify-center text-neutral-500'>
				Calculating schema...
			</div>
		)

	return (
		<div className='w-full h-full min-h-[calc(100vh-100px)] bg-slate-50 dark:bg-[#090b10] transition-colors duration-300'>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				nodeTypes={nodeTypes}
				fitView
				minZoom={0.2}>
				<Background
					color='#9ca3af'
					gap={24}
					size={2}
				/>
				<Controls className='bg-white dark:bg-slate-800 fill-slate-600 dark:fill-slate-300 border-slate-200 dark:border-slate-700 shadow-md' />
			</ReactFlow>
		</div>
	)
}

export default ERDiagram
