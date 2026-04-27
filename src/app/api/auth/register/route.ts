import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { registerSchema } from '@/modules/auth/shared/schemas'
import { sendVerificationEmail } from '@/modules/auth/server/email'
import { hashToken } from '@/shared/utils/crypto'
import { ZodError } from 'zod'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password, name } = registerSchema.parse(body)

        // Проверка существующего пользователя
        const existingUser = await prisma.user.findFirst({
            where: { email, deletedAt: null },
        })
        if (existingUser) {
            return NextResponse.json({ error: 'Пользователь уже существует' }, { status: 400 })
        }

        // Восстановление удалённого пользователя
        const deletedUser = await prisma.user.findFirst({
            where: { email, deletedAt: { not: null } },
        })

        let user
        const hashedPassword = await bcrypt.hash(password, 10)

        if (deletedUser) {
            user = await prisma.user.update({
                where: { id: deletedUser.id },
                data: {
                    password: hashedPassword,
                    name,
                    deletedAt: null,
                    emailVerified: null,
                    verificationTokenHash: null,
                },
            })
        } else {
            user = await prisma.user.create({
                data: { email, password: hashedPassword, name },
            })
        }

        // Генерация верификационного токена
        const rawToken = randomBytes(32).toString('hex')
        const tokenHash = hashToken(rawToken)

        await prisma.user.update({
            where: { id: user.id },
            data: { verificationTokenHash: tokenHash },
        })

        const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${rawToken}`
        await sendVerificationEmail(email, verificationUrl, name)

        return NextResponse.json(
            { message: 'Пользователь создан. Проверьте почту.', userId: user.id },
            { status: 201 }
        )
    } catch (error) {
        console.error('Registration error:', error)

        if (error instanceof ZodError) {
            const firstError = error.issues[0]?.message || 'Ошибка валидации данных'
            return NextResponse.json({ error: firstError }, { status: 400 })
        }

        if (error instanceof Error && error.message.includes('Unique constraint')) {
            return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 400 })
        }

        return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
    }
}