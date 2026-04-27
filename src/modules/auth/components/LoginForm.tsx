'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormValues } from '@/modules/auth/shared/schemas'
import { useLoginMutation } from '../hooks/useLoginMutation'
import { useOAuthLoginMutation } from '../hooks/useOAuthLoginMutation'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function LoginForm() {
    const loginMutation = useLoginMutation()
    const googleMutation = useOAuthLoginMutation('google')
    const githubMutation = useOAuthLoginMutation('github')

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit = (data: LoginFormValues) => {
        loginMutation.mutate({ email: data.email, password: data.password })
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Вход</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => googleMutation.mutate()}
                        disabled={googleMutation.isPending || loginMutation.isPending}
                    >
                        {googleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continue with Google'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => githubMutation.mutate()}
                        disabled={githubMutation.isPending || loginMutation.isPending}
                    >
                        {githubMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continue with GitHub'}
                    </Button>
                </div>

                <div className="my-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs text-gray-500">or</span>
                    <div className="h-px flex-1 bg-gray-200" />
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="ivan@example.com" {...register('email')} />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Пароль</Label>
                        <Input id="password" type="password" {...register('password')} />
                        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    </div>

                    {loginMutation.error && (
                        <p className="text-sm text-red-500 text-center">
                            {loginMutation.error instanceof Error ? loginMutation.error.message : 'Ошибка входа'}
                        </p>
                    )}

                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Войти'}
                    </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                    <a href="/forgot-password" className="text-gray-500 hover:underline">
                        Забыли пароль?
                    </a>
                </div>
                <div className="mt-2 text-center text-sm">
                    Нет аккаунта?{' '}
                    <a href="/register" className="text-blue-600 hover:underline">
                        Зарегистрироваться
                    </a>
                </div>
            </CardContent>
        </Card>
    )
}