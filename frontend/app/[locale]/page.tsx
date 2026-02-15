import Hero from '@/components/Sections/Hero';
import FeaturedCourses from '@/components/Sections/FeaturedCourses';
import FeaturedProjects from '@/components/Sections/FeaturedProjects';
import CertificateSection from '@/components/Sections/CertificateSection';
import { getLanguages } from '@/lib/publicApi';

export default async function Home() {
  const languages = await getLanguages().catch(() => []);
  return (
    <div className="min-h-screen">
      <Hero languages={languages} />
      <FeaturedCourses />
      <FeaturedProjects />
      <CertificateSection />
    </div>
  );
}
