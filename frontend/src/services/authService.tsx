export type LoginCredentials = {
    identifier: string
    password: string
    remember: boolean
}

export const authService = {
    login: async (credentials: LoginCredentials): Promise<void> => {
        void credentials
        await new Promise((resolve) => window.setTimeout(resolve, 650))
    },
}