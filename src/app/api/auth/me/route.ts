import { NextResponse } from 'next/server'
import { getTokensFromCookies } from '@/modules/auth/server/cookies'
import { verifyAccessToken } from '@/modules/auth/server/jwt'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
    try {
        const { accessToken } = await getTokensFromCookies()  // ← await

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = await verifyAccessToken(accessToken)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId, deletedAt: null },
            select: { id: true, email: true, name: true, image: true },
        })

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        return NextResponse.json({ user })
    } catch (error) {
        console.error('Me error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}