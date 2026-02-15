import { CertificateClient } from './CertificateClient';

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ courseSlug?: string }>;
}) {
  const { courseSlug } = await params;
  return <CertificateClient courseSlug={typeof courseSlug === 'string' ? courseSlug : ''} />;
}
