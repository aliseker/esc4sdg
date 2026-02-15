import { AdminProjectEditClient } from './AdminProjectEditClient';

export default async function AdminProjectEditPage({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const { id } = await params;
  const idNum = typeof id === 'string' ? parseInt(id, 10) : NaN;
  return <AdminProjectEditClient id={Number.isFinite(idNum) ? idNum : 0} />;
}
