import clsx from 'clsx'
import { DatabaseIcon, DatabaseZapIcon } from 'lucide-react'

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import { useDatabases } from '@/hooks'
import { useDataSourcesStore } from '@/stores'
import Tables from './Tables'

interface DatabasesProps {
	dataSourceId: string
}

const Databases = ({ dataSourceId }: DatabasesProps) => {
	const { databases, isLoading } = useDatabases(dataSourceId)
	const { database, setDatabase } = useDataSourcesStore()

	if (isLoading) {
		return (
			<div className='text-center text-gray-500 py-4'>
				Loading databases...
			</div>
		)
	}

	if (databases?.length === 0) {
		return (
			<div className='text-center text-gray-500 py-4'>
				No databases found.
			</div>
		)
	}

	return (
		<Accordion
			type='single'
			collapsible>
			{databases?.map((db) => (
				<AccordionItem
					value={db}
					key={db}>
					<AccordionTrigger onClick={() => setDatabase(db)}>
						<div
							className={clsx(
								'flex items-center gap-4 font-mono text-lg font-medium',
								database === db ? 'text-primary' : (
									'text-gray-700 dark:text-gray-500'
								),
							)}>
							{database === db ?
								<DatabaseZapIcon size={18} />
							:	<DatabaseIcon size={18} />}
							{db}
						</div>
					</AccordionTrigger>

					<AccordionContent>
						<Tables
							database={db}
							dataSourceId={dataSourceId}
						/>
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	)
}

export default Databases
