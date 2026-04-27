import { NextResponse } from 'next/server'
import { verifyEmail } from '@/modules/auth/server/emailVerification'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const rawToken = searchParams.get('token')

        if (!rawToken) {
            return NextResponse.json({ error: 'Token required' }, { status: 400 })
        }

        const ok = await verifyEmail(rawToken)
        if (!ok) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
        }

        return NextResponse.redirect(new URL('/dashboard?verified=true', process.env.NEXTAUTH_URL))
    } catch (error) {
        console.error('Verify email error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}