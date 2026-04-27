import { prisma } from '@/lib/db/prisma'
import { generateToken, hashToken } from '@/shared/utils/crypto'
import { sendVerificationEmail } from './email'

export async function issueEmailVerification(userId: string): Promise<'not_found' | 'already_verified' | 'sent'> {
    const user = await prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
        select: { id: true, email: true, name: true, emailVerified: true },
    })

    if (!user) return 'not_found'
    if (user.emailVerified) return 'already_verified'

    const rawToken = generateToken()
    const tokenHash = hashToken(rawToken)

    await prisma.user.update({
        where: { id: userId },
        data: { verificationTokenHash: tokenHash },
    })

    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${rawToken}`
    await sendVerificationEmail(user.email, verificationUrl, user.name || undefined)

    return 'sent'
}

export async function verifyEmail(rawToken: string): Promise<boolean> {
    const tokenHash = hashToken(rawToken)

    const user = await prisma.user.findFirst({
        where: { verificationTokenHash: tokenHash, deletedAt: null },
        select: { id: true },
    })

    if (!user) return false

    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: new Date(),
            verificationTokenHash: null,
        },
    })

    return true
}

