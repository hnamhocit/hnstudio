'use client'

import Image from 'next/image'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { notifyError, supabaseClient } from '@/utils'
import { toast } from 'sonner'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

export default function Enter() {
	const [disabled, setDisabled] = useState(false)

	const signInWithProvider = async (provider: 'google' | 'github') => {
		setDisabled(true)

		try {
			const { error } = await supabaseClient.auth.signInWithOAuth({
				provider: provider,
			})

			if (error) {
				toast.error(error.message, { position: 'top-center' })
			}
		} catch (error) {
			notifyError(error, `${provider} login failed`)
		} finally {
			setDisabled(false)
		}
	}

	return (
		<div className='flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950'>
			<Card className='w-full max-w-md shadow-lg'>
				<CardHeader className='space-y-1 text-center'>
					<CardTitle className='text-2xl font-bold'>
						Welcome Back
					</CardTitle>

					<CardDescription>
						Login or create a new account to continue
					</CardDescription>
				</CardHeader>

				<CardContent>
					<Tabs
						defaultValue='login'
						className='w-full'>
						<TabsList className='grid w-full grid-cols-2 mb-6'>
							<TabsTrigger value='login'>Login</TabsTrigger>
							<TabsTrigger value='register'>Register</TabsTrigger>
						</TabsList>

						<TabsContent value='login'>
							<LoginForm />
						</TabsContent>

						<TabsContent value='register'>
							<RegisterForm />
						</TabsContent>
					</Tabs>

					{/* DẢI PHÂN CÁCH & SOCIAL LOGIN */}
					<div className='relative my-6'>
						<div className='absolute inset-0 flex items-center'>
							<span className='w-full border-t' />
						</div>
						<div className='relative flex justify-center text-xs uppercase'>
							<span className='bg-background px-2 text-muted-foreground'>
								Or continue with
							</span>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<Button
							disabled={disabled}
							variant='outline'
							onClick={() => signInWithProvider('google')}>
							<Image
								src='/google.svg'
								width={16}
								height={16}
								alt='Google Logo'
							/>
							Google
						</Button>

						<Button
							disabled={disabled}
							variant='outline'
							onClick={() => signInWithProvider('github')}>
							<Image
								src='/github.png'
								width={16}
								height={16}
								alt='GitHub Logo'
							/>
							GitHub
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
