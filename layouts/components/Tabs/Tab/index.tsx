import { clsx } from 'clsx'
import { XIcon } from 'lucide-react'
import { FC } from 'react'

import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { ITab } from '@/interfaces'
import { useTabsStore } from '@/stores'
import { menuItems } from './menuItems'

interface TabProps {
	tab: ITab
	index: number
}

const Tab: FC<TabProps> = (props) => {
	const { tab, index } = props
	const { id, title } = tab
	const { tabs, setTabs, activeTab, setActiveTab, removeTab } = useTabsStore()

	const handleContextMenuAction = (actionId: string) => {
		switch (actionId) {
			case 'close':
				removeTab(id)
				break
			case 'close-others':
				setTabs([tab])
				setActiveTab(tab)
				break
			case 'close-right':
				setTabs(tabs.slice(0, index + 1))
				setActiveTab(tab)
				break
			case 'close-left':
				setTabs(tabs.slice(index))
				setActiveTab(tab)
				break
			case 'close-all':
				setActiveTab(null)
				setTabs([])
				break
			default:
				break
		}
	}

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				<div
					className={clsx(
						'h-full cursor-pointer relative shrink-0 min-w-1/10 hover:text-primary transition-colors duration-300 hover:border-primary flex items-center justify-between border-r px-4 gap-4 select-none',
						id === activeTab?.id ?
							'text-primary border-primary'
						:	'text-gray-400',
					)}
					onClick={() => setActiveTab(tab)}>
					<div className='font-mono font-medium'>{title}</div>

					<button
						title='Close'
						className='block cursor-pointer'
						onClick={(e) => {
							e.stopPropagation()
							removeTab(id)
						}}>
						<XIcon size={20} />
					</button>
				</div>
			</ContextMenuTrigger>

			<ContextMenuContent>
				{menuItems.map((item) => (
					<ContextMenuItem
						key={item.id}
						onClick={() => handleContextMenuAction(item.id)}>
						{item.title}
					</ContextMenuItem>
				))}
			</ContextMenuContent>
		</ContextMenu>
	)
}

export default Tab
