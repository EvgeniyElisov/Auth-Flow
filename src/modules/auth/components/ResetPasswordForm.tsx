'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { resetPasswordSchema } from '@/modules/auth/shared/schemas'
import { useResetPasswordMutation } from '@/modules/auth/hooks/useResetPasswordMutation'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const formSchema = resetPasswordSchema
    .extend({
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Пароли не совпадают',
        path: ['confirmPassword'],
    })

type ResetValues = z.infer<typeof formSchema>

export function ResetPasswordForm() {
    const params = useSearchParams()
    const mutation = useResetPasswordMutation()

    const token = useMemo(() => params.get('token') || '', [params])

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            token,
            password: '',
            confirmPassword: '',
        },
    })

    const onSubmit = async (data: ResetValues) => {
        await mutation.mutateAsync({ token: data.token, password: data.password })
    }

    const tokenMissing = !token

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Новый пароль</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {tokenMissing ? (
                    <div className="space-y-2 text-sm text-gray-700">
                        <p>Токен сброса пароля не найден. Откройте ссылку из письма заново.</p>
                        <a href="/forgot-password" className="text-blue-600 hover:underline">
                            Запросить новую ссылку
                        </a>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <input type="hidden" value={token} {...register('token')} />

                        <div className="space-y-2">
                            <Label htmlFor="password">Пароль</Label>
                            <Input id="password" type="password" {...register('password')} />
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                            <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Сохранить'}
                        </Button>

                        <div className="text-center text-sm">
                            <a href="/login" className="text-gray-500 hover:underline">
                                Назад ко входу
                            </a>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    )
}

