const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'JWT_SECRET',
    'RESEND_API_KEY',
    'EMAIL_FROM',
]

const optionalEnvVars = [
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
]

export function validateEnv() {
    const missing: string[] = []

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            missing.push(envVar)
        }
    }

    if (missing.length > 0) {
        throw new Error(`❌ Missing required environment variables: ${missing.join(', ')}`)
    }

    // Проверка URL
    try {
        new URL(process.env.NEXTAUTH_URL!)
    } catch {
        throw new Error('❌ NEXTAUTH_URL is not a valid URL')
    }

    // Проверка длины секретов
    if (process.env.NEXTAUTH_SECRET!.length < 32) {
        throw new Error('❌ NEXTAUTH_SECRET must be at least 32 characters')
    }
    if (process.env.JWT_SECRET!.length < 32) {
        throw new Error('❌ JWT_SECRET must be at least 32 characters')
    }

    if (optionalEnvVars.length > 0) {
        // no-op: just kept for documentation/visibility
    }

    console.log('✅ Environment validation passed')
}

