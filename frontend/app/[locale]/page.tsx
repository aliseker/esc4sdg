import Hero from '@/components/Sections/Hero';
import FeaturedCourses from '@/components/Sections/FeaturedCourses';
import FeaturedProjects from '@/components/Sections/FeaturedProjects';
import CertificateSection from '@/components/Sections/CertificateSection';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedCourses />
      <FeaturedProjects />
      <CertificateSection />
    </div>
  );
}
