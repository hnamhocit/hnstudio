import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

import UserProfileClient from './UserProfileClient'

interface UserProfilePageProps {
	params: Promise<{
		user_id: string
	}>
}

export async function generateMetadata({
	params,
}: UserProfilePageProps): Promise<Metadata> {
	const { user_id } = await params
	const safeUserId = user_id || 'unknown'

	let profileTitle = `User ${safeUserId.slice(0, 8)}`
	let profileDescription = `HNDB public profile page for user ${safeUserId.slice(0, 8)}.`

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

	if (supabaseUrl && supabaseAnonKey && user_id) {
		const supabase = createClient(supabaseUrl, supabaseAnonKey)
		const { data } = await supabase
			.from('users')
			.select('name, email')
			.eq('id', user_id)
			.maybeSingle()

		if (data) {
			const displayName = data.name?.trim() || `User ${safeUserId.slice(0, 8)}`
			const displayEmail = data.email?.trim()

			profileTitle =
				displayEmail ? `${displayName} (${displayEmail})` : displayName
			profileDescription = `${displayName} profile on HNDB community.`
		}
	}

	return {
		title: profileTitle,
		description: profileDescription,
		alternates: {
			canonical: `/users/${safeUserId}`,
		},
		openGraph: {
			title: `${profileTitle} | HNDB`,
			description: profileDescription,
			url: `/users/${safeUserId}`,
			type: 'profile',
		},
	}
}

export default async function UserProfilePage({
	params,
}: UserProfilePageProps) {
	const { user_id } = await params

	return <UserProfileClient userId={user_id} />
}
