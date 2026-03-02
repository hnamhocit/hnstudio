'use client'

import Image from 'next/image'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { supportDataSources } from '@/constants/supportDataSources'
import { dataSourcesService } from '@/services'
import { useDataSourcesStore, useUserStore } from '@/stores'
import { notifyError } from '@/utils'
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
} from '../../../../components/ui/accordion'
import Databases from './Databases'

const DataSources = () => {
	const { datasources, setDatasources, setDataSourceId } =
		useDataSourcesStore()
	const { user } = useUserStore()

	useEffect(() => {
		;(async () => {
			try {
				if (!user) return

				const { data, error } =
					await dataSourcesService.getDataSourcesByUserId(user.id)

				if (error) {
					toast.error(error.message, { position: 'top-center' })
					return
				}

				if (data) {
					setDatasources(data)
				}
			} catch (error) {
				notifyError(error, 'Failed to fetch data sources.')
			}
		})()
	}, [user])

	return (
		<Accordion
			type='single'
			collapsible>
			{datasources.map((ds) => {
				const supportDataSource = supportDataSources.find(
					(s) => s.id === ds.type,
				)

				return (
					<AccordionItem
						className='px-4'
						value={ds.id}
						key={ds.id}>
						<AccordionTrigger
							onClick={() => setDataSourceId(ds.id)}>
							<div className='flex items-center gap-4'>
								<Image
									src={
										supportDataSource?.photoURL ||
										'/default-datasource.png'
									}
									alt={`${supportDataSource?.name} Logo`}
									width={28}
									height={28}
								/>

								<span className='text-lg font-mono font-medium'>
									{supportDataSource?.name || ds.type}
								</span>
							</div>
						</AccordionTrigger>

						<Databases />
					</AccordionItem>
				)
			})}
		</Accordion>
	)
}

export default DataSources
