'use client'

import { ReactNode } from 'react'
import { useState } from 'react'

import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Tabs from '../components/Tabs'

const DefaultLayout = ({ children }: { children: ReactNode }) => {
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

	return (
		<div className='h-screen overflow-hidden'>
			<Header onToggleSidebar={() => setIsMobileSidebarOpen((v) => !v)} />

			<div className='flex h-[calc(100vh-3rem)]'>
				<Sidebar
					isMobileOpen={isMobileSidebarOpen}
					onCloseMobile={() => setIsMobileSidebarOpen(false)}
				/>

				<div className='flex-1 min-w-0 min-h-0 flex flex-col'>
					<Tabs />

					<div className='flex-1 min-h-0 relative'>
						{children}
					</div>
				</div>
			</div>
		</div>
	)
}

export default DefaultLayout
