import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { generateToken, hashToken } from '@/shared/utils/crypto'
import { sendResetPasswordEmail } from './email'
import { revokeAllUserTokens } from './refreshTokens'

export async function requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findFirst({
        where: { email, deletedAt: null },
    })

    // Не раскрываем существование email
    if (!user) return

    const rawToken = generateToken()
    const tokenHash = hashToken(rawToken)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 час

    await prisma.passwordReset.create({
        data: { email, tokenHash, expiresAt },
    })

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${rawToken}`
    await sendResetPasswordEmail(email, resetUrl, user.name || undefined)
}

export async function resetPassword(rawToken: string, newPassword: string): Promise<boolean> {
    const tokenHash = hashToken(rawToken)

    const resetRequest = await prisma.passwordReset.findFirst({
        where: {
            tokenHash,
            used: false,
            expiresAt: { gt: new Date() },
        },
    })

    if (!resetRequest) return false

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    const user = await prisma.user.findFirst({
        where: { email: resetRequest.email, deletedAt: null },
        select: { id: true },
    })

    // Если пользователя нет (удалён/не существует) — просто помечаем токен использованным
    if (!user) {
        await prisma.passwordReset.update({
            where: { id: resetRequest.id },
            data: { used: true },
        })
        return false
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
    })

    await prisma.passwordReset.update({
        where: { id: resetRequest.id },
        data: { used: true },
    })

    // Ревокаем все refresh токены пользователя
    await revokeAllUserTokens(user.id)

    return true
}

