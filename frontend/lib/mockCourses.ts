export type Locale = 'tr' | 'en';

export type QuizOption = { id: string; text: Record<Locale, string> };
export type QuizQuestion = {
  id: string;
  prompt: Record<Locale, string>;
  options: QuizOption[];
  correctOptionId: string;
};

export type ToolItem = { title: Record<Locale, string>; url?: string };

export type Lesson = {
  slug: string;
  title: Record<Locale, string>;
  videoEmbedUrl?: string;
  preQuiz?: QuizQuestion[];
  content?: Record<Locale, string>;
  /** Optional list of tools/resources shown in "List of Tools" section */
  tools?: ToolItem[];
  /** Optional conclusion text */
  conclusion?: Record<Locale, string>;
  quiz: QuizQuestion[];
  passScore: number; // 0-100
};

export type Module = {
  slug: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  lessons: Lesson[];
};

export type Course = {
  slug: string;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  language: Locale[];
  duration: string;
  instructor: string;
  modules: Module[];
};

export const courses: Course[] = [
  {
    slug: 'steam-and-edutainment-foundations',
    title: {
      tr: 'STEAM ve Edutainment: Temeller',
      en: 'STEAM & Edutainment: Foundations'
    },
    summary: {
      tr: 'STEAM yaklaşımını ve eğlenceli öğrenme tasarımını temel kavramlarla keşfedin.',
      en: 'Explore core concepts of STEAM and edutainment-driven learning design.'
    },
    category: 'Education',
    level: 'Beginner',
    language: ['tr', 'en'],
    duration: '4 weeks',
    instructor: 'ESC4SDG Academy',
    modules: [
      {
        slug: 'module-1-introduction',
        title: {
          tr: 'Modül 1: Giriş',
          en: 'Module 1: Introduction'
        },
        description: {
          tr: 'STEAM nedir, edutainment neyi çözer? Örneklerle hızlı bir giriş.',
          en: 'What is STEAM and why edutainment? A quick introduction with examples.'
        },
        lessons: [
          {
            slug: 'lesson-1-steam-basics',
            title: { tr: 'Ders 1: STEAM Temelleri', en: 'Lesson 1: STEAM Basics' },
            videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/ysz5S6PUM-U',
            passScore: 70,
            preQuiz: [
              {
                id: 'pq1',
                prompt: { tr: 'STEAM hakkında önceden bilgin var mı?', en: 'Do you have prior knowledge about STEAM?' },
                options: [
                  { id: 'a', text: { tr: 'Evet, biliyorum', en: 'Yes, I know it' } },
                  { id: 'b', text: { tr: 'Biraz duydum', en: 'I\'ve heard a bit' } },
                  { id: 'c', text: { tr: 'Hayır, yeni öğreniyorum', en: 'No, I\'m new to it' } }
                ],
                correctOptionId: 'c'
              }
            ],
            content: {
              tr: 'STEAM (Bilim, Teknoloji, Mühendislik, Sanat, Matematik) disiplinlerarası bir yaklaşımdır. Edutainment ise eğitim ve eğlenceyi birleştirerek öğrenmeyi daha etkili ve keyifli hale getirir. Bu modülde temel kavramları keşfedeceksiniz.',
              en: 'STEAM (Science, Technology, Engineering, Arts, Mathematics) is an interdisciplinary approach. Edutainment combines education and entertainment to make learning more effective and enjoyable. In this module you will explore the core concepts.'
            },
            tools: [
              { title: { tr: 'STEAM eğitim rehberi', en: 'STEAM education guide' } },
              { title: { tr: 'Edutainment örnekleri', en: 'Edutainment examples' } },
              { title: { tr: 'Disiplinlerarası proje şablonları', en: 'Interdisciplinary project templates' } },
              { title: { tr: 'Değerlendirme rubrikleri', en: 'Assessment rubrics' } },
              { title: { tr: 'Video kaynakları', en: 'Video resources' } },
              { title: { tr: 'Sınıf etkinlikleri listesi', en: 'Classroom activities list' } },
              { title: { tr: 'SDG bağlantılı etkinlikler', en: 'SDG-linked activities' } },
              { title: { tr: 'Öz değerlendirme formu', en: 'Self-assessment form' } },
              { title: { tr: 'Ek okuma listesi', en: 'Further reading list' } },
            ],
            conclusion: {
              tr: 'Bu modülde STEAM ve edutainment temellerini keşfettiniz. Sonraki modülde öğrenme hedefleri ve tasarımına geçeceğiz.',
              en: 'You have explored the fundamentals of STEAM and edutainment in this module. Next we will move on to learning outcomes and design.'
            },
            quiz: [
              {
                id: 'q1',
                prompt: {
                  tr: 'STEAM açılımında hangi disiplinler vardır?',
                  en: 'Which disciplines are included in STEAM?'
                },
                options: [
                  {
                    id: 'a',
                    text: {
                      tr: 'Bilim, Teknoloji, Mühendislik, Sanat, Matematik',
                      en: 'Science, Technology, Engineering, Arts, Mathematics'
                    }
                  },
                  {
                    id: 'b',
                    text: {
                      tr: 'Spor, Turizm, Ekonomi, Astronomi, Medya',
                      en: 'Sports, Tourism, Economics, Astronomy, Media'
                    }
                  },
                  { id: 'c', text: { tr: 'Sadece Bilim ve Matematik', en: 'Only Science and Math' } }
                ],
                correctOptionId: 'a'
              },
              {
                id: 'q2',
                prompt: {
                  tr: 'Edutainment yaklaşımının temel amacı nedir?',
                  en: 'What is the core goal of edutainment?'
                },
                options: [
                  {
                    id: 'a',
                    text: { tr: 'Öğrenmeyi eğlenceli ve etkileşimli hale getirmek', en: 'Make learning fun and interactive' }
                  },
                  { id: 'b', text: { tr: 'Sadece sınav sayısını artırmak', en: 'Only increase the number of exams' } },
                  { id: 'c', text: { tr: 'Video süresini uzatmak', en: 'Make videos longer' } }
                ],
                correctOptionId: 'a'
              }
            ]
          }
        ]
      },
      {
        slug: 'module-2-learning-design',
        title: { tr: 'Modül 2: Öğrenme Tasarımı', en: 'Module 2: Learning Design' },
        description: {
          tr: 'Hedefler, etkinlikler ve ölçme-değerlendirmeyi modüler olarak kurgulayın.',
          en: 'Design modular learning outcomes, activities, and assessments.'
        },
        lessons: [
          {
            slug: 'lesson-1-outcomes',
            title: { tr: 'Ders 1: Öğrenme Hedefleri', en: 'Lesson 1: Learning Outcomes' },
            videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/jNQXAC9IVRw',
            passScore: 70,
            preQuiz: [
              {
                id: 'pq1',
                prompt: { tr: 'Öğrenme hedefleri ve ölçme-değerlendirme hakkında deneyimin var mı?', en: 'Do you have experience with learning outcomes and assessment?' },
                options: [
                  { id: 'a', text: { tr: 'Evet, müfredat tasarladım', en: 'Yes, I have designed curriculum' } },
                  { id: 'b', text: { tr: 'Biraz biliyorum', en: 'I know a bit' } },
                  { id: 'c', text: { tr: 'Hayır, yeni öğreniyorum', en: 'No, I\'m new to it' } }
                ],
                correctOptionId: 'c'
              }
            ],
            quiz: [
              {
                id: 'q1',
                prompt: { tr: 'İyi bir öğrenme hedefi ne içerir?', en: 'A good learning outcome includes…' },
                options: [
                  { id: 'a', text: { tr: 'Ölçülebilir davranış + koşul + başarı ölçütü', en: 'Measurable behavior + condition + criterion' } },
                  { id: 'b', text: { tr: 'Sadece konu başlığı', en: 'Only a topic title' } },
                  { id: 'c', text: { tr: 'Sadece süre', en: 'Only duration' } }
                ],
                correctOptionId: 'a'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    slug: 'game-based-learning-escape-rooms',
    title: {
      tr: 'Oyun Tabanlı Öğrenme: Escape Room Odaklı',
      en: 'Implementing Game-Based Learning: Focus on Escape Rooms'
    },
    summary: {
      tr: 'Eğitimde oyun tabanlı öğrenmeyi, özellikle eğitimsel escape room kullanımını entegre etme stratejileri.',
      en: 'Strategies for integrating game-based learning, specifically using educational escape rooms in STEAM education.'
    },
    category: 'Education',
    level: 'Beginner',
    language: ['tr', 'en'],
    duration: '3 weeks',
    instructor: 'ESC4SDG Academy',
    modules: [
      {
        slug: 'module-1-escape-rooms',
        title: { tr: 'Modül 1: Escape Room Temelleri', en: 'Module 1: Escape Room Basics' },
        description: { tr: 'Eğitimsel escape room tasarımı ve uygulama.', en: 'Design and implementation of educational escape rooms.' },
        lessons: [
          {
            slug: 'lesson-1',
            title: { tr: 'Ders 1: Tasarım İlkeleri', en: 'Lesson 1: Design Principles' },
            videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/ysz5S6PUM-U',
            passScore: 70,
            preQuiz: [
              {
                id: 'pq1',
                prompt: { tr: 'Daha önce eğitimsel bir escape room deneyimledin mi?', en: 'Have you ever experienced an educational escape room?' },
                options: [
                  { id: 'a', text: { tr: 'Evet, katıldım veya tasarladım', en: 'Yes, I participated or designed one' } },
                  { id: 'b', text: { tr: 'Duydum ama denemedim', en: 'I\'ve heard of it but haven\'t tried' } },
                  { id: 'c', text: { tr: 'Hayır, tamamen yeni', en: 'No, completely new' } }
                ],
                correctOptionId: 'c'
              }
            ],
            quiz: [
              { id: 'q1', prompt: { tr: 'Escape room nedir?', en: 'What is an escape room?' }, options: [{ id: 'a', text: { tr: 'Oyun tabanlı öğrenme etkinliği', en: 'Game-based learning activity' } }, { id: 'b', text: { tr: 'Sınav', en: 'Exam' } }, { id: 'c', text: { tr: 'Video', en: 'Video' } }], correctOptionId: 'a' }
            ]
          }
        ]
      }
    ]
  },
  {
    slug: 'engaging-all-students-steam',
    title: {
      tr: 'Tüm Öğrencileri STEAM\'de Etkilemek',
      en: 'Engaging All Students in STEAM'
    },
    summary: {
      tr: 'Kapsayıcı öğretim, uygulamalı öğrenme, dijital araçlar ve oyunlaştırma ile tüm öğrencileri dahil etme.',
      en: 'Inclusive teaching strategies, hands-on learning, digital tools, and gamification to engage all students.'
    },
    category: 'Education',
    level: 'Beginner',
    language: ['tr', 'en'],
    duration: '3 weeks',
    instructor: 'ESC4SDG Academy',
    modules: [
      {
        slug: 'module-1-inclusive',
        title: { tr: 'Modül 1: Kapsayıcı Pedagoji', en: 'Module 1: Inclusive Pedagogy' },
        description: { tr: 'Herkesi kapsayan STEAM etkinlikleri.', en: 'STEAM activities that include everyone.' },
        lessons: [
          {
            slug: 'lesson-1',
            title: { tr: 'Ders 1: Etkileşimli Öğrenme', en: 'Lesson 1: Interactive Learning' },
            videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/ysz5S6PUM-U',
            passScore: 70,
            preQuiz: [
              {
                id: 'pq1',
                prompt: { tr: 'Sınıfta kapsayıcılık ve tüm öğrencileri dahil etme konusunda ne kadar deneyimlisin?', en: 'How experienced are you with inclusion and engaging all students in class?' },
                options: [
                  { id: 'a', text: { tr: 'Çok deneyimliyim', en: 'Very experienced' } },
                  { id: 'b', text: { tr: 'Biraz uyguladım', en: 'I\'ve tried a bit' } },
                  { id: 'c', text: { tr: 'Öğrenmek istiyorum', en: 'I want to learn' } }
                ],
                correctOptionId: 'c'
              }
            ],
            quiz: [
              { id: 'q1', prompt: { tr: 'Kapsayıcı öğretim neyi hedefler?', en: 'What does inclusive teaching aim for?' }, options: [{ id: 'a', text: { tr: 'Tüm öğrencilerin katılımı', en: 'Participation of all students' } }, { id: 'b', text: { tr: 'Sadece en iyiler', en: 'Only top performers' } }, { id: 'c', text: { tr: 'Sadece sınav', en: 'Exams only' } }], correctOptionId: 'a' }
            ]
          }
        ]
      }
    ]
  },
  {
    slug: 'designing-steam-curriculum',
    title: {
      tr: 'STEAM Müfredat ve Ders Planları Tasarlama',
      en: 'Designing STEAM Curriculum and Lesson Plans'
    },
    summary: {
      tr: 'Edutainment odaklı STEAM müfredatı ve ders planları oluşturma; değerlendirme stratejileri.',
      en: 'Creating STEAM curricula and lesson plans with edutainment approaches, including assessment strategies.'
    },
    category: 'Education',
    level: 'Intermediate',
    language: ['tr', 'en'],
    duration: '4 weeks',
    instructor: 'ESC4SDG Academy',
    modules: [
      {
        slug: 'module-1-curriculum',
        title: { tr: 'Modül 1: Müfredat Tasarımı', en: 'Module 1: Curriculum Design' },
        description: { tr: 'Hedefler, içerik ve ölçme ile müfredat kurgulama.', en: 'Structuring curriculum with outcomes, content, and assessment.' },
        lessons: [
          {
            slug: 'lesson-1',
            title: { tr: 'Ders 1: Öğrenme Çıktıları', en: 'Lesson 1: Learning Outcomes' },
            videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/ysz5S6PUM-U',
            passScore: 70,
            preQuiz: [
              {
                id: 'pq1',
                prompt: { tr: 'STEAM müfredatı veya ders planı hazırlama deneyimin var mı?', en: 'Do you have experience designing STEAM curriculum or lesson plans?' },
                options: [
                  { id: 'a', text: { tr: 'Evet, hazırladım', en: 'Yes, I have designed some' } },
                  { id: 'b', text: { tr: 'Temel bilgim var', en: 'I have basic knowledge' } },
                  { id: 'c', text: { tr: 'Hayır, bu modülde öğreneceğim', en: 'No, I\'ll learn in this module' } }
                ],
                correctOptionId: 'c'
              }
            ],
            quiz: [
              { id: 'q1', prompt: { tr: 'İyi bir ders planı ne içerir?', en: 'A good lesson plan includes?' }, options: [{ id: 'a', text: { tr: 'Hedefler, etkinlikler, değerlendirme', en: 'Objectives, activities, assessment' } }, { id: 'b', text: { tr: 'Sadece konu', en: 'Topic only' } }, { id: 'c', text: { tr: 'Sadece süre', en: 'Duration only' } }], correctOptionId: 'a' }
            ]
          }
        ]
      }
    ]
  },
  {
    slug: 'educational-technology-digital-tools',
    title: {
      tr: 'Eğitim Teknolojisi ve Dijital Araçlar',
      en: 'Implementing Educational Technology and Digital Tools in STEAM'
    },
    summary: {
      tr: 'STEAM öğretiminde çeşitli dijital araç ve teknolojilerin pratik kullanımı.',
      en: 'Practical use of various digital tools and technologies in STEAM teaching.'
    },
    category: 'Education',
    level: 'Beginner',
    language: ['tr', 'en'],
    duration: '4 weeks',
    instructor: 'ESC4SDG Academy',
    modules: [
      {
        slug: 'module-1-edtech',
        title: { tr: 'Modül 1: Dijital Araçlar', en: 'Module 1: Digital Tools' },
        description: { tr: 'STEAM sınıfında kullanılabilecek araçlar.', en: 'Tools you can use in the STEAM classroom.' },
        lessons: [
          {
            slug: 'lesson-1',
            title: { tr: 'Ders 1: Araç Seçimi', en: 'Lesson 1: Tool Selection' },
            videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/ysz5S6PUM-U',
            passScore: 70,
            preQuiz: [
              {
                id: 'pq1',
                prompt: { tr: 'STEAM derslerinde dijital araç kullanımı konusunda kendini nasıl değerlendirirsin?', en: 'How would you rate your use of digital tools in STEAM lessons?' },
                options: [
                  { id: 'a', text: { tr: 'Düzenli kullanıyorum', en: 'I use them regularly' } },
                  { id: 'b', text: { tr: 'Ara sıra kullanıyorum', en: 'I use them sometimes' } },
                  { id: 'c', text: { tr: 'Daha fazla öğrenmek istiyorum', en: 'I want to learn more' } }
                ],
                correctOptionId: 'c'
              }
            ],
            quiz: [
              { id: 'q1', prompt: { tr: 'Dijital araç seçiminde ne önemlidir?', en: 'What matters when selecting digital tools?' }, options: [{ id: 'a', text: { tr: 'Hedeflere uygunluk ve erişilebilirlik', en: 'Fit for goals and accessibility' } }, { id: 'b', text: { tr: 'Sadece popülerlik', en: 'Popularity only' } }, { id: 'c', text: { tr: 'Sadece maliyet', en: 'Cost only' } }], correctOptionId: 'a' }
            ]
          }
        ]
      }
    ]
  },
  {
    slug: 'schools-experience-steam',
    title: {
      tr: 'Okullarda STEAM Deneyimi',
      en: 'Schools Experience on STEAM'
    },
    summary: {
      tr: 'Okulda deneysel STEM/STEAM etkinlikleri ve uygulama örnekleri.',
      en: 'Experimental STEM activities in school and practical examples.'
    },
    category: 'Education',
    level: 'Beginner',
    language: ['tr', 'en'],
    duration: '2 weeks',
    instructor: 'ESC4SDG Academy',
    modules: [
      {
        slug: 'module-1-schools',
        title: { tr: 'Modül 1: Okul Uygulamaları', en: 'Module 1: School Practices' },
        description: { tr: 'Gerçek sınıf örnekleri ve etkinlikler.', en: 'Real classroom examples and activities.' },
        lessons: [
          {
            slug: 'lesson-1',
            title: { tr: 'Ders 1: Örnek Projeler', en: 'Lesson 1: Example Projects' },
            videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/ysz5S6PUM-U',
            passScore: 70,
            preQuiz: [
              {
                id: 'pq1',
                prompt: { tr: 'Okulda STEAM/STEM etkinliği düzenleme veya katılma deneyimin var mı?', en: 'Do you have experience organizing or participating in STEAM/STEM activities at school?' },
                options: [
                  { id: 'a', text: { tr: 'Evet, birkaç kez', en: 'Yes, several times' } },
                  { id: 'b', text: { tr: 'Bir kez denedim', en: 'I tried once' } },
                  { id: 'c', text: { tr: 'Hayır, örnekleri görmek istiyorum', en: 'No, I want to see examples' } }
                ],
                correctOptionId: 'c'
              }
            ],
            quiz: [
              { id: 'q1', prompt: { tr: 'Okulda STEAM etkinliği neden değerlidir?', en: 'Why are STEAM activities valuable in school?' }, options: [{ id: 'a', text: { tr: 'Uygulamalı deneyim ve merak', en: 'Hands-on experience and curiosity' } }, { id: 'b', text: { tr: 'Sadece not', en: 'Grades only' } }, { id: 'c', text: { tr: 'Sadece sınav', en: 'Exams only' } }], correctOptionId: 'a' }
            ]
          }
        ]
      }
    ]
  }
];

export function getCourseBySlug(slug: string) {
  return courses.find((c) => c.slug === slug);
}

export function getModuleBySlug(courseSlug: string, moduleSlug: string) {
  const course = getCourseBySlug(courseSlug);
  const courseModule = course?.modules.find((m) => m.slug === moduleSlug);
  return { course, module: courseModule };
}

