'use client'

import clsx from 'clsx'
import Image from 'next/image'
import { useEffect } from 'react'
import { toast } from 'sonner'

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'

import { supportDataSources } from '@/constants/supportDataSources'
import { dataSourcesService } from '@/services'
import { useDataSourcesStore, useUserStore } from '@/stores'
import { notifyError } from '@/utils'
import CustomContextMenu from './CustomContextMenu'
import Databases from './Databases'

const DataSources = () => {
	const {
		datasources,
		setDatasources,
		setDataSourceId,
		connectionStatuses,
		updateDataSourceStatus,
		setBulkConnectionStatuses,
	} = useDataSourcesStore()

	const { user } = useUserStore()

	// 1. Fetch danh sách Data Sources và Bulk Status ban đầu
	useEffect(() => {
		;(async () => {
			try {
				if (!user) return

				// Fetch Data Sources
				const { data, error } =
					await dataSourcesService.getDataSourcesByUserId(user.id)

				if (error) {
					toast.error(error.message, { position: 'top-center' })
					return
				}

				if (data) {
					setDatasources(data)

					// Fetch Bulk Status
					const { data: statusData } =
						await dataSourcesService.getBulkStatus(
							data.map((ds) => ds.id),
						)

					if (statusData) {
						setBulkConnectionStatuses(statusData.data)
					}
				}
			} catch (error) {
				notifyError(error, 'Failed to fetch data sources.')
			}
		})()
	}, [user, setDatasources, setBulkConnectionStatuses])

	// 2. Lắng nghe Realtime qua SSE (Server-Sent Events)
	useEffect(() => {
		const sse = new EventSource(
			`http://localhost:8080/api/data_sources/stream-status`,
		)

		sse.onmessage = (event) => {
			const data = JSON.parse(event.data)

			updateDataSourceStatus(data.id, data.status)
		}

		// Cleanup an toàn khi người dùng rời khỏi trang
		return () => {
			sse.close()
		}
	}, [updateDataSourceStatus])

	return (
		<Accordion
			type='single'
			collapsible>
			{datasources.map((ds) => {
				const supportDataSource = supportDataSources.find(
					(s) => s.id === ds.type,
				)

				// Tra cứu trạng thái cực nhanh O(1) từ Hash Map
				const isConnected = connectionStatuses[ds.id]

				return (
					<CustomContextMenu
						key={ds.id}
						ds={ds}>
						<AccordionItem
							className='px-4 border-b-0'
							value={ds.id}>
							<AccordionTrigger
								onClick={() => setDataSourceId(ds.id)}
								className='hover:no-underline'>
								<div className='flex items-center gap-4'>
									{/* Khối chứa Icon và Status Badge */}
									<div className='relative shrink-0'>
										<Image
											src={
												supportDataSource?.photoURL ||
												'/default-datasource.png'
											}
											alt={`${supportDataSource?.name} Logo`}
											width={28}
											height={28}
											className={clsx(
												'transition-all duration-300',
												!isConnected &&
													'grayscale opacity-60',
											)}
										/>

										{/* Chấm trạng thái (Online/Offline) */}
										<span
											className={clsx(
												'absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full border-2 border-background transition-colors duration-300',
												isConnected ? 'bg-green-500' : (
													'bg-gray-400'
												),
											)}
											title={
												isConnected ? 'Connected' : (
													'Disconnected'
												)
											}
										/>
									</div>

									{/* Tên Database */}
									<span
										className={clsx(
											'text-lg font-mono font-medium truncate transition-colors duration-300',
											!isConnected && 'text-gray-500',
										)}>
										{ds.name || ds.type}
									</span>
								</div>
							</AccordionTrigger>

							<AccordionContent>
								<Databases dataSourceId={ds.id} />
							</AccordionContent>
						</AccordionItem>
					</CustomContextMenu>
				)
			})}
		</Accordion>
	)
}

export default DataSources
