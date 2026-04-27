import { Suspense } from 'react'
import { ResetPasswordForm } from '@/modules/auth/components/ResetPasswordForm'

export default function ResetPasswordPage() {
    // useSearchParams требует Suspense
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Загрузка...</div>}>
            <ResetPasswordForm />
        </Suspense>
    )
}

