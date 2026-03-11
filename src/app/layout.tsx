import './globals.css'

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ReactNode } from 'react'
import { Toaster } from 'sonner'

import BetaAnnouncementModal from '@/components/BetaAnnouncementModal'
import Providers from '@/components/Providers'
import { TooltipProvider } from '@/components/ui/tooltip'
import DefaultLayout from '@/layouts/DefaultLayout'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: 'HNDB',
		template: '%s | HNDB',
	},
	description:
		'A knowledge graph database management system built on top of PostgreSQL, designed to help you manage and query your data with ease.',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode
}>) {
	return (
		<html lang='en'>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-[#13161f] transition-colors duration-300`}>
				<Providers>
					<TooltipProvider>
						<DefaultLayout>{children}</DefaultLayout>
						<BetaAnnouncementModal />
					</TooltipProvider>
				</Providers>
				<Toaster />
			</body>
		</html>
	)
}
