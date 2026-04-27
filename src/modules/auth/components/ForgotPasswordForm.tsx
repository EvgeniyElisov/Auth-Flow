'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema } from '@/modules/auth/shared/schemas'
import { useForgotPasswordMutation } from '@/modules/auth/hooks/useForgotPasswordMutation'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import type { z } from 'zod'

type ForgotValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
    const mutation = useForgotPasswordMutation()
    const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
    })

    const onSubmit = async (data: ForgotValues) => {
        await mutation.mutateAsync(data.email)
        setSubmittedEmail(data.email)
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Восстановление пароля</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {submittedEmail ? (
                    <div className="space-y-2 text-sm text-gray-700">
                        <p>
                            Если email <span className="font-medium">{submittedEmail}</span> существует, мы отправили письмо со
                            ссылкой для сброса пароля.
                        </p>
                        <a href="/login" className="text-blue-600 hover:underline">
                            Вернуться ко входу
                        </a>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="ivan@example.com" {...register('email')} />
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>

                        <Button type="submit" className="w-full" disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Отправить письмо'}
                        </Button>

                        <div className="text-center text-sm">
                            <a href="/login" className="text-gray-500 hover:underline">
                                Назад
                            </a>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    )
}

