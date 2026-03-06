import { PlusIcon } from 'lucide-react'

import DataSourceDialog from '@/components/DataSourceDialog'
import DataSources from './DataSources'

const Sidebar = () => {
	return (
		<div className='shrink-0 w-92 border-r overflow-y-scroll'>
			<DataSourceDialog>
				<div className='flex items-center justify-center gap-4 p-4 border-b cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors duration-300'>
					{/* Vòng tròn bọc Icon */}
					<PlusIcon size={16} />

					<span className='font-mono font-medium text-[15px]'>
						Add Connection
					</span>
				</div>
			</DataSourceDialog>

			<DataSources />
		</div>
	)
}

export default Sidebar
