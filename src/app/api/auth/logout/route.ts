import { NextResponse } from 'next/server'
import { clearTokenCookies, getTokensFromCookies } from '@/modules/auth/server/cookies'
import { revokeToken } from '@/modules/auth/server/refreshTokens'

export async function POST() {
    try {
        const { refreshToken } = await getTokensFromCookies()  // ← await

        if (refreshToken) {
            await revokeToken(refreshToken)
        }

        const response = NextResponse.json({ success: true })
        clearTokenCookies(response)

        return response
    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
    }
}