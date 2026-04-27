import { prisma } from '@/lib/db/prisma'

export async function cleanupExpiredPasswordResets(): Promise<number> {
    const result = await prisma.passwordReset.deleteMany({
        where: {
            expiresAt: { lt: new Date() },
        },
    })
    console.log(`🧹 Cleaned up ${result.count} expired password reset tokens`)
    return result.count
}

