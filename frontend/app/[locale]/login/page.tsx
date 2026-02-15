import { LoginClient } from './LoginClient';

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ returnUrl?: string | string[] }>;
}) {
  const resolved = searchParams ? await searchParams : {};
  const raw = resolved?.returnUrl;
  const returnUrl = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined;
  return <LoginClient returnUrl={returnUrl} />;
}
