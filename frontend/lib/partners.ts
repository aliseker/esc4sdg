export type Locale = 'tr' | 'en';

export interface Partner {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  type: string;
  website?: string;
  description: Record<Locale, string>;
  role?: string;
}

export const partners: Partner[] = [
  {
    id: 1,
    name: 'Consultoría de Innovación Social',
    website: 'https://www.cis-es.org',
    country: 'İspanya',
    countryCode: 'ES',
    type: 'NGO',
    description: {
      tr: 'Sosyal inovasyon ve sürdürülebilir kalkınma alanında uzmanlaşmış danışmanlık kuruluşu. Eğitim projelerinde paydaş katılımı, yaygınlaştırma stratejileri ve toplumsal etki değerlendirmesi konularında projeye katkı sağlamaktadır.',
      en: 'Consultancy specializing in social innovation and sustainable development. Contributes to the project in stakeholder engagement, dissemination strategies and social impact assessment.',
    },
  },
  {
    id: 2,
    name: 'GoINNO Inštitut',
    website: 'https://www.vseuk.si',
    country: 'Slovenya',
    countryCode: 'SI',
    type: 'Araştırma',
    description: {
      tr: 'Bilim iletişimi ve STEM eğitimi odaklı sivil toplum kuruluşu. Anaokulundan liseye öğretmen ve öğrenciler için STEM programları geliştiriyor. Uzaktan eğitim materyalleri ve multimedya içerikleri üretiyor.',
      en: 'NGO dedicated to science outreach and STEM education. Develops programs for teachers and children from kindergarten to secondary school. Creates STEM distance learning materials and multimedia content.',
    },
  },
  {
    id: 3,
    name: 'Challedu',
    website: 'https://challedu.com',
    country: 'Yunanistan',
    countryCode: 'EL',
    type: 'Edutainment',
    description: {
      tr: 'Oyun tabanlı öğrenme modelleri ve kapsayıcı eğitim deneyimleriyle öncü bir kuruluş. Öğretmenler, eğitimciler ve oyun tasarımcılarından oluşan ekip, sosyal ve çevresel etki yaratan oyunlar, atölyeler ve aktiviteler tasarlıyor.',
      en: 'Organization pioneering game-based learning models and inclusive educational experiences. A team of educators, teachers and game designers creates games, workshops and activities with social and environmental impact.',
    },
  },
  {
    id: 4,
    name: 'Istituto Santorre di Santarosa',
    website: 'https://www.iissantorre.gov.it',
    country: 'İtalya',
    countryCode: 'IT',
    type: 'Okul',
    description: {
      tr: 'İtalya\'nın önde gelen liselerinden biri. STEAM eğitimi ve edutainment metodolojisinin pilot uygulamasını gerçekleştiriyor. Öğretmen eğitimleri ve sınıf içi etkinliklerle projeye saha katkısı sunuyor.',
      en: 'One of Italy\'s leading high schools. Carries out pilot implementation of STEAM education and edutainment methodology. Contributes to the project with teacher training and classroom activities.',
    },
  },
  {
    id: 5,
    name: 'Vefa Lisesi',
    website: 'https://vefalisesi.meb.k12.tr',
    country: 'Türkiye',
    countryCode: 'TR',
    type: 'Okul',
    description: {
      tr: 'İstanbul\'un köklü eğitim kurumlarından biri. Edu-escape room etkinliklerinin pilot testini yürütüyor. Öğrenci ve öğretmen geri bildirimleriyle metodolojinin geliştirilmesine katkıda bulunuyor.',
      en: 'One of Istanbul\'s historic educational institutions. Conducts pilot testing of edu-escape room activities. Contributes to methodology development through student and teacher feedback.',
    },
  },
  {
    id: 6,
    name: 'İstanbul Üniversitesi - Cerrahpaşa',
    website: 'https://iuc.edu.tr',
    country: 'Türkiye',
    countryCode: 'TR',
    type: 'Üniversite',
    description: {
      tr: 'Akademik araştırma ve müfredat geliştirme konularında projeye destek veriyor. Öğretmen eğitimi programlarının bilimsel temellerini oluşturuyor ve STEAM pedagojisi alanında uzmanlık sağlıyor.',
      en: 'Supports the project in academic research and curriculum development. Establishes scientific foundations for teacher training programs and provides expertise in STEAM pedagogy.',
    },
  },
  {
    id: 7,
    name: 'Escape4Change',
    website: 'https://escape4change.com',
    country: 'İtalya',
    countryCode: 'IT',
    type: 'Edutainment',
    role: 'Koordinatör',
    description: {
      tr: 'Proje koordinatörü. Oyun tabanlı öğrenme ve eğitimsel escape room tasarımında uzman. STEAM odaklı edutainment metodolojisinin geliştirilmesinde liderlik yapıyor.',
      en: 'Project coordinator. Expert in game-based learning and educational escape room design. Leads the development of STEAM-oriented edutainment methodology.',
    },
  },
];
