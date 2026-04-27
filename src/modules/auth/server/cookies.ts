import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Tokens } from './jwt'

export function setTokenCookies(response: NextResponse, tokens: Tokens) {
    response.cookies.set('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60,
        path: '/',
    })

    response.cookies.set('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
    })
}

export function clearTokenCookies(response: NextResponse) {
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')
}

export async function getTokensFromCookies(): Promise<{ accessToken?: string; refreshToken?: string }> {
    const cookieStore = await cookies()
    return {
        accessToken: cookieStore.get('access_token')?.value,
        refreshToken: cookieStore.get('refresh_token')?.value,
    }
}
