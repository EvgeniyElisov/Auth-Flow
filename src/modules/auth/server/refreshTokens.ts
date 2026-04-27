import { randomUUID } from 'crypto'
import { prisma } from '@/lib/db/prisma'
import { generateTokens, type Tokens } from './jwt'

export async function saveRefreshToken(token: string, userId: string, familyId?: string) {
    await prisma.refreshToken.create({
        data: {
            token,
            userId,
            familyId: familyId || randomUUID(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    })
}

export async function revokeToken(token: string, replacedBy?: string) {
    await prisma.refreshToken.update({
        where: { token },
        data: { revoked: true, replacedBy },
    })
}

export async function revokeAllUserTokens(userId: string) {
    await prisma.refreshToken.updateMany({
        where: { userId, revoked: false },
        data: { revoked: true },
    })
}

export async function rotateRefreshToken(oldToken: string): Promise<Tokens | null> {
    const storedToken = await prisma.refreshToken.findFirst({
        where: { token: oldToken, revoked: false, expiresAt: { gt: new Date() } },
        include: { user: true },
    })

    if (!storedToken || storedToken.user.deletedAt) return null

    // Family tokens: отзываем ВСЕ токены этой семьи
    await prisma.refreshToken.updateMany({
        where: { familyId: storedToken.familyId, revoked: false },
        data: { revoked: true },
    })

    const newTokens = await generateTokens(storedToken.userId)

    await prisma.refreshToken.create({
        data: {
            token: newTokens.refreshToken,
            userId: storedToken.userId,
            familyId: storedToken.familyId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    })

    return newTokens
}
