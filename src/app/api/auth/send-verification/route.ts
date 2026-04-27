import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getUserId } from '@/modules/auth/server/getUserId'
import { checkRateLimit } from '@/lib/utils/rateLimit'
import { issueEmailVerification } from '@/modules/auth/server/emailVerification'

export async function POST() {
    try {
        // Rate limiting
        const headersList = await headers()
        const rateLimitResult = await checkRateLimit(headersList)
        if (!rateLimitResult.success) {
            return NextResponse.json({ error: rateLimitResult.error }, { status: 429 })
        }

        const userId = await getUserId()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const status = await issueEmailVerification(userId)
        if (status === 'not_found') {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }
        if (status === 'already_verified') {
            return NextResponse.json({ error: 'Email already verified' }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Send verification error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}