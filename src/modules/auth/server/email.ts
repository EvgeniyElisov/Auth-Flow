import { Resend } from 'resend'

let resendClient: Resend | null = null

function getResend(): Resend {
    const key = process.env.RESEND_API_KEY
    if (!key) {
        throw new Error('RESEND_API_KEY is not set')
    }
    resendClient ??= new Resend(key)
    return resendClient
}

export async function sendVerificationEmail(to: string, url: string, name?: string) {
    const { VerifyEmail } = await import('../emails/VerifyEmail')

    return getResend().emails.send({
        from: process.env.EMAIL_FROM!,
        to,
        subject: 'Подтверждение email - Offerwhelmed',
        react: VerifyEmail({ url, name }),
    })
}

export async function sendResetPasswordEmail(to: string, url: string, name?: string) {
    const { ResetPasswordEmail } = await import('../emails/ResetPasswordEmail')

    return getResend().emails.send({
        from: process.env.EMAIL_FROM!,
        to,
        subject: 'Сброс пароля - Offerwhelmed',
        react: ResetPasswordEmail({ url, name }),
    })
}
