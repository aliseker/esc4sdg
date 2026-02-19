import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ForgotPasswordClient } from './ForgotPasswordClient';

export default async function ForgotPasswordPage() {
    const messages = await getMessages();
    return (
        <NextIntlClientProvider messages={messages}>
            <ForgotPasswordClient />
        </NextIntlClientProvider>
    );
}
