import { AdminCourseEditClient } from './AdminCourseEditClient';

export default async function AdminCourseEditPage({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const { id } = await params;
  const idNum = typeof id === 'string' ? parseInt(id, 10) : NaN;
  return <AdminCourseEditClient id={Number.isFinite(idNum) ? idNum : 0} />;
}
