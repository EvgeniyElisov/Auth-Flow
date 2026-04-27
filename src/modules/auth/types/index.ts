export type User = {
    id: string
    email: string
    name: string | null
    image?: string | null
}

export type RegisterData = {
    email: string
    password: string
    name?: string
}

export type LoginData = {
    email: string
    password: string
}

export type AuthResponse = {
    message: string
    userId?: string
}