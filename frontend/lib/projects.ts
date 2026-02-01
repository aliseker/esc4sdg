import { Lightbulb, Heart, Globe } from 'lucide-react';

export interface Project {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const projects: Project[] = [
  {
    id: 1,
    title: 'Kırsal Bölgelerde Eğitim Erişimini Artırma Projesi',
    description: 'Türkiye\'nin kırsal bölgelerinde dijital eğitim altyapısını güçlendirerek eğitim fırsat eşitliğini sağlamayı hedefleyen kapsamlı bir proje.',
    location: 'Türkiye',
    date: '2024',
    category: 'Eğitim',
    icon: Lightbulb,
  },
  {
    id: 2,
    title: 'Sürdürülebilir Tarım Uygulamaları Programı',
    description: 'Çiftçilere sürdürülebilir tarım teknikleri konusunda eğitim vererek çevresel etkiyi azaltmayı ve verimliliği artırmayı amaçlayan proje.',
    location: 'Avrupa',
    date: '2023-2024',
    category: 'Çevre',
    icon: Heart,
  },
  {
    id: 3,
    title: 'Küresel İklim Farkındalık Ağı',
    description: 'Farklı ülkelerden öğrencileri bir araya getirerek iklim değişikliği konusunda farkındalık yaratmayı ve çözüm önerileri geliştirmeyi hedefleyen uluslararası proje.',
    location: 'Küresel',
    date: '2024',
    category: 'İklim',
    icon: Globe,
  },
  {
    id: 4,
    title: 'SDG Escape Room Eğitim Programı',
    description: 'Sürdürülebilir kalkınma hedeflerini escape room etkinlikleriyle öğreten, öğretmenlere yönelik eğitim programı.',
    location: 'Türkiye',
    date: '2024',
    category: 'Eğitim',
    icon: Lightbulb,
  },
  {
    id: 5,
    title: 'Dijital Okuryazarlık ve İklim Ağı',
    description: 'Öğrencilerin dijital becerilerini geliştirirken iklim farkındalığı oluşturan uluslararası iş birliği projesi.',
    location: 'Avrupa',
    date: '2023-2024',
    category: 'İklim',
    icon: Globe,
  },
];
