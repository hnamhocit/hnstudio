'use client'

import {
	BellIcon,
	LogOutIcon,
	MoonIcon,
	SettingsIcon,
	SunIcon,
	UserIcon,
} from 'lucide-react'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { authService } from '@/services'
import {
	useDataEditorStore,
	useDataSourcesStore,
	useTabsStore,
	useUserStore,
} from '@/stores'
import DataSourceSearch from './DataSourceSearch'

const previewUnreadNotifications = 3

const Header = () => {
	const { user, setUser } = useUserStore()
	const [isDarkMode, setIsDarkMode] = useState(false)
	const [isLoggingOut, setIsLoggingOut] = useState(false)

	const toggleIsDarkMode = () => setIsDarkMode((prev) => !prev)

	useEffect(() => {
		const persistedTheme = localStorage.getItem('theme')
		if (persistedTheme === 'dark') {
			setIsDarkMode(true)
		}
	}, [])

	useEffect(() => {
		if (isDarkMode) {
			document.documentElement.classList.add('dark')
			localStorage.setItem('theme', 'dark')
		} else {
			document.documentElement.classList.remove('dark')
			localStorage.setItem('theme', 'light')
		}
	}, [isDarkMode])

	const handleLogout = async () => {
		setIsLoggingOut(true)
		try {
			await authService.logout()
			setUser(null)

			useTabsStore.setState({
				tabs: [],
				activeTabId: null,
				contentById: {},
			})
			useTabsStore.persist.clearStorage()

			useDataSourcesStore.setState({
				datasources: [],
				connectionStatuses: {},
				dataSourceId: null,
				cachedDatabases: {},
				cachedSchema: {},
				database: null,
				table: null,
				cachedRelationships: {},
			})

			useDataEditorStore.setState({ tablesState: {} })
			toast.success('Logged out successfully')
		} catch (error) {
			console.error('Logout failed:', error)
			toast.error('Failed to logout')
		} finally {
			setIsLoggingOut(false)
		}
	}

	return (
		<motion.header
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, ease: 'easeOut' }}
			className='h-12 border-b flex items-center justify-between px-4'>
			<motion.div
				initial={{ opacity: 0, x: -10 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.35, delay: 0.05 }}
				className='flex items-center gap-4'>
				<motion.div whileHover={{ rotate: -8, scale: 1.04 }}>
					<Link href='/'>
						<Image
							src='/logo.png'
							alt='Logo'
							width={32}
							height={32}
							className='object-fit rounded-full'
						/>
					</Link>
				</motion.div>

				<div className='text-xl font-bold'>HN Studio</div>

				<div className='hidden md:flex items-center gap-1 ml-2'>
					<motion.div whileHover={{ y: -1 }}>
						<Link
							href='/blog'
							className='px-2.5 py-1 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors'>
							Blog
						</Link>
					</motion.div>
					<motion.div whileHover={{ y: -1 }}>
						<Link
							href='/problems'
							className='px-2.5 py-1 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors'>
							Problems
						</Link>
					</motion.div>
				</div>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, x: 10 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.35, delay: 0.08 }}
				className='flex items-center gap-3'>
				<DataSourceSearch />

				<motion.div whileTap={{ scale: 0.95 }}>
					<Button
						asChild
						size='icon'
						variant='outline'
						className='relative'>
						<Link href='/notifications'>
							<BellIcon />
							<span className='absolute -right-1 -top-1 inline-flex size-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold text-white'>
								{previewUnreadNotifications}
							</span>
						</Link>
					</Button>
				</motion.div>

				<motion.div whileTap={{ scale: 0.95 }}>
					<Button
						size='icon'
						variant='outline'
						onClick={toggleIsDarkMode}>
						{isDarkMode ?
							<MoonIcon />
						:	<SunIcon />}
					</Button>
				</motion.div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<motion.div whileHover={{ scale: 1.04 }}>
							<Avatar>
								<AvatarImage
									src={user?.photo_url || '/default-user.jpg'}
								/>
								<AvatarFallback>
									{user?.name
										?.substring(0, 2)
										.toUpperCase() || 'U'}
								</AvatarFallback>
							</Avatar>
						</motion.div>
					</DropdownMenuTrigger>

					<DropdownMenuContent align='end'>
						<DropdownMenuLabel className='max-w-60 truncate'>
							{user?.name || 'User'}
						</DropdownMenuLabel>
						<DropdownMenuSeparator />

						<DropdownMenuItem asChild>
							<Link href={`/users/${user?.id || 'me'}`}>
								<UserIcon />
								Profile
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href='/me/settings'>
								<SettingsIcon />
								Settings
							</Link>
						</DropdownMenuItem>

						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant='destructive'
							disabled={isLoggingOut}
							onSelect={handleLogout}>
							<LogOutIcon />
							{isLoggingOut ? 'Logging out...' : 'Logout'}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</motion.div>
		</motion.header>
	)
}

export default Header
