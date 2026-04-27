import { NextResponse } from 'next/server'
import { clearTokenCookies, getTokensFromCookies, setTokenCookies } from '@/modules/auth/server/cookies'
import { rotateRefreshToken } from '@/modules/auth/server/refreshTokens'

export async function POST() {
    try {
        const { refreshToken } = await getTokensFromCookies()  // ← await

        if (!refreshToken) {
            return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
        }

        const newTokens = await rotateRefreshToken(refreshToken)

        if (!newTokens) {
            const response = NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
            clearTokenCookies(response)
            return response
        }

        const response = NextResponse.json({ success: true })
        setTokenCookies(response, newTokens)

        return response
    } catch (error) {
        console.error('Refresh error:', error)
        return NextResponse.json({ error: 'Refresh failed' }, { status: 500 })
    }
}