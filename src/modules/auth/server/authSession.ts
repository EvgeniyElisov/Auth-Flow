import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { generateTokens } from './jwt'
import { saveRefreshToken } from './refreshTokens'

export type LoginResult =
    | { ok: true; user: { id: string; email: string; name: string | null }; tokens: Awaited<ReturnType<typeof generateTokens>> }
    | { ok: false; status: 401; error: string }

export async function loginWithPassword(email: string, password: string): Promise<LoginResult> {
    const user = await prisma.user.findFirst({
        where: { email, deletedAt: null },
        select: { id: true, email: true, name: true, password: true, emailVerified: true },
    })

    if (!user || !user.password) {
        return { ok: false, status: 401, error: 'Неверные учётные данные' }
    }

    if (!user.emailVerified) {
        return { ok: false, status: 401, error: 'Подтвердите email перед входом' }
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
        return { ok: false, status: 401, error: 'Неверные учётные данные' }
    }

    const tokens = await generateTokens(user.id)
    await saveRefreshToken(tokens.refreshToken, user.id)

    return { ok: true, user: { id: user.id, email: user.email, name: user.name }, tokens }
}

