import { CourseDetailClient } from './CourseDetailClient';

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseSlug?: string }>;
}) {
  const { courseSlug } = await params;
  return <CourseDetailClient courseSlug={typeof courseSlug === 'string' ? courseSlug : ''} />;
}
