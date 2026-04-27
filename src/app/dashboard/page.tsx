import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 p-8">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">Личный кабинет</h1>
            <p className="max-w-md text-center text-gray-600 dark:text-zinc-400">
                После подтверждения email вы попадаете сюда. Для защищённых страниц добавьте проверку сессии
                (cookies / middleware) по необходимости.
            </p>
            <div className="flex gap-4">
                <Link href="/">
                    <Button variant="outline">На главную</Button>
                </Link>
            </div>
        </div>
    )
}
