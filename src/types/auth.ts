export interface RegisterData {
    email: string
    password: string
    name?: string
}

export interface LoginData {
    email: string
    password: string
}

export interface User {
    id: string
    email: string
    name: string | null
}

export interface AuthResponse {
    message: string
    userId?: string
    error?: string
}