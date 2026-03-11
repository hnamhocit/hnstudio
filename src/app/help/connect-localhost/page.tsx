import type { Metadata } from 'next'
import {
	ArrowLeftIcon,
	ExternalLinkIcon,
	InfoIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

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
	title: 'Connect Localhost with ngrok',
	description:
		'Guide for connecting local databases to HNDB using ngrok tunnel.',
	alternates: {
		canonical: '/help/connect-localhost',
	},
	openGraph: {
		title: 'Connect Localhost with ngrok | HNDB',
		description:
			'Step-by-step guide for exposing localhost database and connecting it to HNDB.',
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
	const sourcePort = sourcePortConfig?.port

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
						How to connect localhost using ngrok
					</h1>
				</div>

				<div className='rounded-xl border p-5 md:p-6 space-y-4'>
					<div className='text-base font-semibold'>
						1. Open ngrok website and login/register
					</div>
					<p className='text-sm text-muted-foreground'>
						Go to{' '}
						<a
							href='https://ngrok.com/'
							target='_blank'
							rel='noreferrer'
							className='inline-flex items-center gap-1 text-primary hover:underline'>
							https://ngrok.com/
							<ExternalLinkIcon size={12} />
						</a>{' '}
						, then sign in or create a new account.
					</p>

					<div className='text-base font-semibold'>
						2. In dashboard, open install section
					</div>
					<div className='rounded-lg border overflow-hidden'>
						<Image
							src='/ngrok-install.png'
							alt='ngrok install dashboard'
							width={1400}
							height={760}
							className='w-full h-auto object-cover'
						/>
					</div>
					<p className='text-sm text-muted-foreground'>
						Choose your operating system (macOS, Linux, Windows),
						then copy the install command shown by ngrok dashboard.
					</p>

					<div className='text-base font-semibold'>
						3. Follow install/connect instructions
					</div>
					<div className='rounded-lg border overflow-hidden'>
						<Image
							src='/ngrok-connect.png'
							alt='ngrok connect instructions'
							width={1400}
							height={760}
							className='w-full h-auto object-cover'
						/>
					</div>
					<p className='text-sm text-muted-foreground'>
						Run the provided commands in terminal to install ngrok,
						add your auth token, then start tunnel for your DB port.
					</p>

					<div className='text-base font-semibold'>
						4. Open tunnel for your local DB
					</div>
					<div className='rounded-lg border bg-black text-slate-100 p-4 text-sm font-mono overflow-auto'>
						<div>$ ngrok http 3306</div>
					</div>
					<p className='text-sm text-muted-foreground'>
						If you are not using MySQL/MariaDB, replace `3306` with
						your actual local database port.
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
							ngrok creates a secure public tunnel, then forwards
							traffic back to your local DB port.
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
