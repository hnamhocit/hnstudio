import type { Metadata } from 'next'
import {
	ArrowLeftIcon,
	ExternalLinkIcon,
	InfoIcon,
} from 'lucide-react'
import Link from 'next/link'
import PinggyCommandSelector from './PinggyCommandSelector'

interface ConnectLocalhostPageProps {
	searchParams: Promise<{
		source?: string
		name?: string
	}>
}

const SOURCE_PORT_CONFIG: Record<
	string,
	{ port: number | null; label: string }
> = {
	postgresql: { port: 5432, label: 'PostgreSQL' },
	mysql: { port: 3306, label: 'MySQL' },
	'maria-db': { port: 3306, label: 'MariaDB' },
	'sql-server': { port: 1433, label: 'SQL Server' },
	mongodb: { port: 27017, label: 'MongoDB' },
	redis: { port: 6379, label: 'Redis' },
	sqlite: { port: null, label: 'SQLite' },
}

export const metadata: Metadata = {
	title: 'Connect Localhost with Pinggy',
	description:
		'Guide for connecting local databases to HNDB using Pinggy TCP tunnel.',
	alternates: {
		canonical: '/help/connect-localhost',
	},
	openGraph: {
		title: 'Connect Localhost with Pinggy | HNDB',
		description:
			'Step-by-step guide for exposing localhost database with Pinggy and connecting it to HNDB.',
		url: '/help/connect-localhost',
		type: 'article',
	},
}

export default async function ConnectLocalhostPage({
	searchParams,
}: ConnectLocalhostPageProps) {
	const params = await searchParams
	const sourceKey = (params.source || '').toLowerCase()
	const sourcePortConfig = SOURCE_PORT_CONFIG[sourceKey]
	const sourceName = sourcePortConfig?.label || params.name || 'your database'
	const sourcePort = sourcePortConfig?.port
	const tunnelPort = 8000

	return (
		<div className='h-full overflow-auto p-4 md:p-6 lg:p-8'>
			<div className='mx-auto max-w-4xl space-y-4'>
				<Link
					href='/'
					className='inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors'>
					<ArrowLeftIcon size={14} />
					Back
				</Link>

				<div className='rounded-xl border bg-card p-5 md:p-6'>
					<p className='text-xs uppercase tracking-widest text-primary font-semibold'>
						Localhost Guide
					</p>
					<h1 className='mt-2 text-2xl md:text-3xl font-bold tracking-tight'>
						How to connect localhost using Pinggy
					</h1>
					<p className='mt-2 text-sm text-muted-foreground'>
						Quick setup for {sourceName} from your local machine to
						HNDB.
					</p>
				</div>

				<div className='rounded-xl border p-5 md:p-6 space-y-4'>
					<div className='text-base font-semibold'>
						1. Make sure SSH is available on your machine
					</div>
					<p className='text-sm text-muted-foreground'>
						Use Terminal (macOS/Linux) or PowerShell/Git Bash
						(Windows). Keep your database service running locally.
					</p>

					<div className='text-base font-semibold'>
						2. Run Pinggy command
					</div>
					<PinggyCommandSelector />
					<p className='text-sm text-muted-foreground'>
						This command exposes local port `{tunnelPort}`.
						{sourcePort ?
							` ${sourceName} usually uses port ${sourcePort}, so replace 8000 with ${sourcePort} if needed.`
						:	' Replace 8000 with your actual local database port if needed.'}
					</p>

					<div className='text-base font-semibold'>
						3. Copy host and port from Pinggy output
					</div>
					<div className='rounded-lg border bg-black text-slate-100 p-4 text-sm font-mono overflow-auto'>
						<div>
							Forwarding TCP:
							tcp://abcde-12345.tcp.free.pinggy.link:17692
						</div>
					</div>
					<p className='text-sm text-muted-foreground'>
						From this output, use host
						`abcde-12345.tcp.free.pinggy.link` and port `17692`.
						Keep this terminal open while using HNDB.
					</p>

					<div className='text-base font-semibold'>
						4. Configure your data source in HNDB
					</div>
					<ul className='space-y-2 text-sm text-muted-foreground list-disc pl-5'>
						<li>Open Add Data Source and choose your database.</li>
						<li>Set host to your Pinggy TCP hostname.</li>
						<li>Set port to the TCP port from Pinggy output.</li>
						<li>Use your existing local DB username/password.</li>
					</ul>
					<p className='text-xs text-muted-foreground'>
						If connection fails, confirm DB is listening on local
						port used in your command, then rerun the Pinggy command.
					</p>
				</div>

				<div className='rounded-xl border p-5 md:p-6 space-y-3'>
					<div className='inline-flex items-center gap-2 text-base font-semibold'>
						<InfoIcon size={16} />
						Why direct localhost connection fails
					</div>
					<p className='text-sm text-muted-foreground'>
						If HNDB/API is running on a VPS, then{' '}
						<code>localhost</code>
						means the VPS itself, not your laptop. So when you enter
						`localhost:{sourcePort ?? '<port>'}`, the VPS tries to
						find that DB on its own machine and fails.
					</p>
					<ul className='space-y-2 text-sm text-muted-foreground list-disc pl-5'>
						<li>
							Your local DB is usually bound to `127.0.0.1` on
							your computer only.
						</li>
						<li>
							Home/office networks are behind NAT and firewall, so
							VPS cannot dial in directly.
						</li>
						<li>
							Pinggy creates a public TCP endpoint, then forwards
							traffic back to your local machine.
						</li>
					</ul>
				</div>

				<div className='rounded-xl border p-4 text-sm flex flex-wrap items-center justify-between gap-3'>
					<div>
						Want to support this project? Add your donation info on
						the dedicated page.
					</div>
					<Link
						href='/donate'
						className='inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-medium hover:bg-accent transition-colors'>
						Open donate page
						<ExternalLinkIcon size={14} />
					</Link>
				</div>
			</div>
		</div>
	)
}
