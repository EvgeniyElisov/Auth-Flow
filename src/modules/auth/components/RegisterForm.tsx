'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { registerSchema, type RegisterFormValues } from '@/modules/auth/shared/schemas'
import { useRegisterMutation } from '../hooks/useRegisterMutation'

import { Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function RegisterForm() {
    const router = useRouter()
    const registerMutation = useRegisterMutation()
    const [isSuccess, setIsSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        getValues,
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    })

    const onSubmit = async (data: RegisterFormValues) => {
        await registerMutation.mutateAsync({ email: data.email, password: data.password, name: data.name })
        setIsSuccess(true)
        setTimeout(() => router.push('/login?registered=true'), 2000)
    }

    if (isSuccess) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardContent className="pt-6 flex flex-col items-center space-y-4">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                    <p className="text-center text-lg font-medium">Проверьте ваш email</p>
                    <p className="text-center text-sm text-gray-600">
                        Мы отправили ссылку для подтверждения на {getValues('email')}
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Регистрация</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Имя (опционально)</Label>
                        <Input id="name" placeholder="Иван Иванов" {...register('name')} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" placeholder="ivan@example.com" {...register('email')} />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Пароль *</Label>
                        <Input id="password" type="password" {...register('password')} />
                        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Подтвердите пароль *</Label>
                        <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
                        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting || registerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Зарегистрироваться'}
                    </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                    Уже есть аккаунт?{' '}
                    <a href="/login" className="text-blue-600 hover:underline">
                        Войти
                    </a>
                </div>
            </CardContent>
        </Card>
    )
}