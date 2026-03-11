import clsx from 'clsx'
import { PlusIcon } from 'lucide-react'

import DataSourceDialog from '@/components/DataSourceDialog'
import DataSources from './DataSources'

interface SidebarProps {
	isMobileOpen?: boolean
	onCloseMobile?: () => void
}

const Sidebar = ({
	isMobileOpen = false,
	onCloseMobile,
}: SidebarProps) => {
	return (
		<>
			<div
				className={clsx(
					'fixed inset-0 z-30 bg-black/45 backdrop-blur-[1px] transition-opacity md:hidden',
					isMobileOpen ?
						'opacity-100 pointer-events-auto'
					:	'opacity-0 pointer-events-none',
				)}
				onClick={onCloseMobile}
			/>

			<div
				className={clsx(
					'border-r bg-background md:bg-transparent overflow-y-auto',
					'fixed top-12 bottom-0 left-0 z-40 w-[86vw] max-w-92 transition-transform duration-200 md:static md:top-auto md:bottom-auto md:left-auto md:z-auto md:w-92 md:shrink-0',
					isMobileOpen ? 'translate-x-0' : '-translate-x-full',
					'md:translate-x-0',
				)}>
				<DataSourceDialog>
					<div className='flex items-center justify-center gap-4 px-4 h-12 border-b cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors duration-300'>
						<PlusIcon size={16} />

						<span className='font-mono font-medium text-[15px]'>
							Add Connection
						</span>
					</div>
				</DataSourceDialog>

				<DataSources />
			</div>
		</>
	)
}

export default Sidebar
