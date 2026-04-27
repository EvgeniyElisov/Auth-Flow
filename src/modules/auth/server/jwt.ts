import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export type Tokens = {
    accessToken: string
    refreshToken: string
}

export async function generateTokens(userId: string): Promise<Tokens> {
    const accessToken = await new SignJWT({ userId, type: 'access' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('15m')
        .sign(JWT_SECRET)

    const refreshToken = await new SignJWT({ userId, type: 'refresh' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET)

    return { accessToken, refreshToken }
}

export async function verifyAccessToken(token: string): Promise<string | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        if (payload.type !== 'access') return null
        return payload.userId as string
    } catch {
        return null
    }
}
