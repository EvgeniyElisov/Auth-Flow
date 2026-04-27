import { Html, Button, Text, Container, Section } from '@react-email/components'

export function VerifyEmail({ url, name }: { url: string; name?: string }) {
    return (
        <Html>
            <Container style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>
                    Добро пожаловать в Offerwhelmed!
                </Text>
                <Text>Привет, {name || 'пользователь'}!</Text>
                <Text>Подтвердите свой email, чтобы начать тренировку с AI интервьюером.</Text>
                <Section style={{ textAlign: 'center', margin: '30px 0' }}>
                    <Button
                        href={url}
                        style={{
                            backgroundColor: '#3b82f6',
                            color: '#fff',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                        }}
                    >
                        Подтвердить email
                    </Button>
                </Section>
                <Text style={{ fontSize: '12px', color: '#666' }}>
                    Или перейдите по ссылке: {url}
                </Text>
            </Container>
        </Html>
    )
}

