import { Html, Button, Text, Container } from '@react-email/components'

export function ResetPasswordEmail({ url, name }: { url: string; name?: string }) {
    return (
        <Html>
            <Container style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                <Text>Привет, {name || 'пользователь'}!</Text>
                <Text>Вы запросили сброс пароля в Offerwhelmed.</Text>
                <Button
                    href={url}
                    style={{
                        backgroundColor: '#3b82f6',
                        color: '#fff',
                        padding: '12px 24px',
                        borderRadius: '8px',
                    }}
                >
                    Сбросить пароль
                </Button>
                <Text>Ссылка действительна в течение 1 часа.</Text>
                <Text>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</Text>
            </Container>
        </Html>
    )
}

