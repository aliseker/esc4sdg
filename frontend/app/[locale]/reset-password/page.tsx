import { Suspense } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ResetPasswordClient } from './ResetPasswordClient';

export default async function ResetPasswordPage() {
    const messages = await getMessages();
    return (
        <NextIntlClientProvider messages={messages}>
            <Suspense fallback={<div>Loading...</div>}>
                <ResetPasswordClient />
            </Suspense>
        </NextIntlClientProvider>
    );
}
