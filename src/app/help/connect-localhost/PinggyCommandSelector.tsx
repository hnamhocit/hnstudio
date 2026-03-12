'use client'

import { CheckIcon, CopyIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

type PlatformKey =
	| 'linux'
	| 'macos-zsh'
	| 'windows-cmd'
	| 'windows-powershell'

const PLATFORM_OPTIONS: Array<{ key: PlatformKey; label: string }> = [
	{ key: 'linux', label: 'Linux' },
	{ key: 'macos-zsh', label: 'macOS (zsh)' },
	{ key: 'windows-cmd', label: 'Windows CMD' },
	{ key: 'windows-powershell', label: 'Windows PowerShell' },
]

const COMMANDS: Record<PlatformKey, string> = {
	linux:
		'ssh -p 443 -R0:localhost:8000 -o StrictHostKeyChecking=no -o ServerAliveInterval=30 8siEffSwqNN+tcp@ap.free.pinggy.io',
	'macos-zsh':
		'ssh -p 443 -R0:localhost:8000 -o StrictHostKeyChecking=no -o ServerAliveInterval=30 8siEffSwqNN+tcp@ap.free.pinggy.io',
	'windows-cmd':
		'ssh -p 443 -R0:127.0.0.1:8000 -o StrictHostKeyChecking=no -o ServerAliveInterval=30 8siEffSwqNN+tcp@ap.free.pinggy.io',
	'windows-powershell':
		'ssh -p 443 -R0:127.0.0.1:8000 -o StrictHostKeyChecking=no -o ServerAliveInterval=30 8siEffSwqNN+tcp@ap.free.pinggy.io',
}

const PinggyCommandSelector = () => {
	const [platform, setPlatform] = useState<PlatformKey>('linux')
	const [copied, setCopied] = useState(false)

	const command = useMemo(() => COMMANDS[platform], [platform])

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(command)
			setCopied(true)
			toast.success('Command copied', { position: 'top-center' })

			window.setTimeout(() => {
				setCopied(false)
			}, 1500)
		} catch {
			toast.error('Failed to copy command', { position: 'top-center' })
		}
	}

	return (
		<div className='space-y-3'>
			<div className='max-w-[280px]'>
				<Select
					value={platform}
					onValueChange={(value) => setPlatform(value as PlatformKey)}>
					<SelectTrigger>
						<SelectValue placeholder='Select OS' />
					</SelectTrigger>
					<SelectContent>
						{PLATFORM_OPTIONS.map((option) => (
							<SelectItem
								key={option.key}
								value={option.key}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className='rounded-lg border bg-black text-slate-100 p-4 text-sm font-mono overflow-auto'>
				<div>$ {command}</div>
			</div>

			<div className='flex flex-wrap items-center gap-3'>
				<Button
					type='button'
					size='sm'
					variant='outline'
					onClick={handleCopy}>
					{copied ?
						<>
							<CheckIcon size={14} />
							Copied
						</>
					:	<>
							<CopyIcon size={14} />
							Copy command
						</>}
				</Button>
				<div className='text-xs text-muted-foreground'>
					Linux and macOS share the same command. Windows CMD and
					PowerShell also share the same command.
				</div>
			</div>
		</div>
	)
}

export default PinggyCommandSelector
