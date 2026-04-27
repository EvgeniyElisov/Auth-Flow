import { getServerSession } from 'next-auth'
import { cookies } from 'next/headers'
import { authOptions } from './nextAuthOptions'
import { verifyAccessToken } from './jwt'

export async function getUserId(): Promise<string | null> {
    // 1. Проверяем NextAuth (OAuth)
    const session = await getServerSession(authOptions)
    if (session?.user?.id) return session.user.id

    // 2. Проверяем свои JWT (email/пароль)
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('access_token')?.value
    if (accessToken) {
        const userId = await verifyAccessToken(accessToken)
        if (userId) return userId
    }

    return null
}
