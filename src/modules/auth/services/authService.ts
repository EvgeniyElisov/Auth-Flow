import { apiClient } from '@/modules/core/api/api-client'
import type { RegisterData, AuthResponse, User } from '../types'

export const authService = {
    async login(email: string, password: string): Promise<{ success: true; user: User }> {
        return await apiClient<{ success: true; user: User }, { email: string; password: string }>('/auth/login', {
            method: 'POST',
            body: { email, password },
            // логин не должен пытаться делать refresh+retry
            skipAuthRefresh: true,
        })
    },

    async register(data: RegisterData): Promise<AuthResponse> {
        return await apiClient<AuthResponse, RegisterData>('/auth/register', {
            method: 'POST',
            body: data,
        })
    },

    async getCurrentUser(): Promise<{ user: User }> {
        return await apiClient<{ user: User }>('/auth/me')
    },

    async requestPasswordReset(email: string): Promise<{ success: true }> {
        return await apiClient<{ success: true }, { email: string }>('/auth/forgot-password', {
            method: 'POST',
            body: { email },
        })
    },

    async resetPassword(token: string, password: string): Promise<{ success: true }> {
        return await apiClient<{ success: true }, { token: string; password: string }>('/auth/reset-password', {
            method: 'POST',
            body: { token, password },
        })
    },

    async sendVerificationEmail(): Promise<{ success: true }> {
        return await apiClient<{ success: true }>('/auth/send-verification', { method: 'POST' })
    },

    async logout(): Promise<{ success: true }> {
        return await apiClient<{ success: true }>('/auth/logout', { method: 'POST', skipAuthRefresh: true })
    },
}