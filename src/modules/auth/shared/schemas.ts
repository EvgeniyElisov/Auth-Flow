import { z } from 'zod'

export const registerSchema = z
    .object({
        name: z.string().optional(),
        email: z.email('Неверный формат email'),
        password: z.string().min(6, 'Пароль должен быть минимум 6 символов'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Пароли не совпадают',
        path: ['confirmPassword'],
    })

export const loginSchema = z.object({
    email: z.email('Неверный формат email'),
    password: z.string().min(1, 'Введите пароль'),
})

export const forgotPasswordSchema = z.object({
    email: z.string().email('Неверный формат email'),
})

export const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(6, 'Пароль должен быть минимум 6 символов'),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
export type LoginFormValues = z.infer<typeof loginSchema>
