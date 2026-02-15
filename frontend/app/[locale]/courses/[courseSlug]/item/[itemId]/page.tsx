import { CourseItemClient } from './CourseItemClient';

export default async function CourseItemPage({
  params,
}: {
  params: Promise<{ courseSlug?: string; itemId?: string }>;
}) {
  const { courseSlug, itemId } = await params;
  return (
    <CourseItemClient
      courseSlug={typeof courseSlug === 'string' ? courseSlug : ''}
      itemId={typeof itemId === 'string' ? itemId : ''}
    />
  );
}
