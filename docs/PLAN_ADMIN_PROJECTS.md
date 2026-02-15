# Admin Panel – Projeler Sayfası Planı

Bu belge, admin panele dinamik “Projeler” yönetimi eklemek için teknik ve iş akışı planını içerir. Projeler: başlık, alt başlık, zengin metin (Word/WordPress tarzı), kapak fotoğrafı ve foto galeri ile yönetilecek; hem sitede hem dashboard’da dinamik listelenecek.

---

## 1. Mevcut Durum Özeti

| Bileşen | Durum |
|--------|--------|
| **Backend** | Proje entity’si yok. Sadece Course, Partner, SocialLink vb. var. |
| **Frontend projeler** | `frontend/lib/projects.ts` içinde statik liste (id, title, description, location, date, category, icon). |
| **Public sayfalar** | `/proje` listesi ve `/proje/[id]` detay sayfası bu statik veriyi kullanıyor. |
| **Admin** | Kurslar, Ortaklar, Sosyal Medya, Diller var; **Projeler** yok. |
| **Upload** | Backend’de `wwwroot/uploads/` altında kurs kapak ve ortak logo için endpoint’ler var (ör. `AdminPartnersController.UploadLogo`). |

---

## 2. İstenen Özellikler (Özet)

- **Proje alanları:** Başlık, alt başlık, metin (zengin metin), kapak fotoğrafı, foto galeri.
- **Zengin metin:** WordPress / Word tarzı: link, punto (font size), kalın/italik, liste, metin arasına foto ekleme ve boyut ayarı.
- **Tasarım:** Form ve liste güzel, tutarlı (mevcut admin/courses, partners stiline uyumlu).
- **Dinamiklik:** Eklenen projeler hem sitede (`/proje`, `/proje/[id]`, ana sayfa “Öne çıkan projeler”) hem admin dashboard’da ve admin projeler listesinde görünsün.

---

## 3. Veri Modeli (Backend)

### 3.1 Entity: `Project`

- **Id** (int, PK)
- **Slug** (string, unique) – URL için (örn. `kirsal-egitim-projesi`)
- **CoverImageUrl** (string, nullable) – Kapak fotoğrafı (örn. `/uploads/projects/xxx.jpg`)
- **SortOrder** (int) – Listeleme sırası (opsiyonel, varsayılan 0)
- **CreatedAt**, **UpdatedAt** (DateTime)
- **IsPublished** (bool, opsiyonel) – Taslak / yayında ayrımı istersen

### 3.2 Entity: `ProjectTranslation`

Çok dilli başlık/alt başlık/metin için (mevcut Course/Partner yapısına benzer).

- **ProjectId** (int, FK)
- **LanguageId** (int, FK)
- **Title** (string)
- **Subtitle** (string, nullable)
- **BodyHtml** (string, nullable) – Zengin metin HTML çıktısı (editörden gelen HTML saklanacak)

Composite PK: `(ProjectId, LanguageId)`.

### 3.3 Entity: `ProjectGalleryImage`

Galeri fotoğrafları (sıralı).

- **Id** (int, PK)
- **ProjectId** (int, FK)
- **ImageUrl** (string) – Örn. `/uploads/projects/gallery/xxx.jpg`
- **SortOrder** (int)
- **Caption** (string, nullable) – Opsiyonel açıklama

---

## 4. Zengin Metin (Body) – Editör Seçimi

Metin alanı için WordPress/Word benzeri deneyim:

- **Link** ekleme
- **Punto / font boyutu** (ve temel formatlar: kalın, italik, altı çizili)
- **Liste** (madde işaretli / numaralı)
- **Metin arasına foto** ekleme ve **boyut ayarı** (küçük / orta / büyük veya yüzde/genişlik)

Önerilen kütüphane: **Tiptap** (React için headless, özelleştirilebilir, resim + boyut eklemek kolay).

- Paketler: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-text-style`, `@tiptap/extension-font-size` (veya custom attribute ile boyut).
- Editör çıktısı **HTML** olarak saklanır (`BodyHtml`). Sitede göstermek için `dangerouslySetInnerHTML` veya bir “prose” container (Tailwind Typography vb.) kullanılır; XSS için backend’de ve mümkünse frontend’de sanitize (ör. HTML sanitizer) yapılmalı.

Alternatif: **React Quill** – daha “tek kutu” çözüm, daha az özelleştirme; yine HTML çıktı + galeri için ayrı alan mantığı aynı kalır.

---

## 5. Dosya Yükleme (Upload)

- **Kapak:** Tek dosya, örn. `POST /api/admin/projects/upload-cover` → `IFormFile` → `wwwroot/uploads/projects/cover-{guid}.jpg` → response’da URL döner (mevcut course cover / partner logo gibi).
- **Galeri:** `POST /api/admin/projects/upload-gallery` → yine `wwwroot/uploads/projects/gallery/` benzeri bir dizin. Yükleme sonrası URL frontend’de galeri listesine eklenir; kayıt sırasında bu URL’ler `ProjectGalleryImage` olarak backend’e gönderilir.
- **Zengin metin içi resimler:** İki seçenek:
  - **A)** Editör “resim ekle” ile upload endpoint’i çağırır → URL döner → img src olarak HTML’e eklenir (Tiptap image extension ile).
  - **B)** Base64 gömülü kullanılmaz; her zaman upload → URL → HTML’de URL. Tercih: **A**.

Önerilen endpoint’ler:

- `POST /api/admin/projects/upload-cover`
- `POST /api/admin/projects/upload-gallery`
- `POST /api/admin/projects/upload-inline-image` (zengin metin içi; aynı dizin veya `uploads/projects/inline/` altında)

Tümü admin auth ile korunmalı; dosya tipi (image/jpeg, image/png, image/webp) ve boyut limiti backend’de kontrol edilmeli.

---

## 6. API Taslağı (Backend)

- **GET** `/api/admin/projects` – Tüm projeler (listeleme; çeviriler dahil veya isteğe göre `?lang=tr`).
- **GET** `/api/admin/projects/{id}` – Tek proje (düzenleme formu için).
- **POST** `/api/admin/projects` – Yeni proje (Title, Subtitle, BodyHtml, CoverImageUrl, Slug, GalleryImageUrls + SortOrder/Caption).
- **PUT** `/api/admin/projects/{id}` – Güncelleme.
- **DELETE** `/api/admin/projects/{id}` – Silme (galeri kayıtları ve isteğe bağlı dosya silme politikasına göre).
- **GET** `/api/projects` (public) – Yayındaki projeler, dil parametresi ile (site listesi ve ana sayfa için).
- **GET** `/api/projects/by-slug/{slug}` veya **GET** `/api/projects/{id}` (public) – Tek proje detayı (sitede `/proje/[id]` veya slug’lı URL için).

Slug’ı unique tutmak ve otomatik üretmek (başlıktan) opsiyonel; admin’de elle de girilebilir.

---

## 7. Frontend – Admin Panel

### 7.1 Menü

- `admin/layout.tsx` içinde `navItems`’a **Projeler** eklenir (örn. icon: `FolderOpen` veya `Lightbulb`), link: `/admin/projects`.

### 7.2 Sayfalar

- **`/admin/projects`** (liste)
  - Tablo veya kart grid: her proje için kapak önizleme (varsa), başlık, dil, tarih, “Düzenle” / “Sil”.
  - “Yeni Proje” butonu → `/admin/projects/new` veya modal.

- **`/admin/projects/new`** ve **`/admin/projects/[id]`** (ekleme / düzenleme)
  - Form alanları:
    - **Slug** (text input; opsiyonel auto-generate from title)
    - **Kapak fotoğrafı:** Upload alanı (sürükle-bırak veya seç); önizleme; mevcut partners/courses upload UX’ine benzer.
    - **Dil seçimi** veya **çok dilli sekme:** Her dil için:
      - Title, Subtitle
      - **Body:** Tiptap (veya seçilen editör) – link, punto, metin arası resim + boyut.
    - **Galeri:** Çoklu dosya yükleme veya “Ekle” ile tek tek; sıra sürükle-bırak; opsiyonel caption. Kayıtta URL listesi (ve caption’lar) backend’e gönderilir.
  - Validasyon: Başlık zorunlu; slug unique; kapak/galeri için sadece resim tipleri.

### 7.3 Dashboard

- Admin ana sayfa (`/admin`) içinde “Son projeler” veya “Proje sayısı” + listeye kısayol (mevcut dashboard kartlarına benzer şekilde).

---

## 8. Frontend – Public Site

- **`/proje`** – Proje listesi artık **API’den** çekilir: `GET /api/projects?lang=tr` (veya locale’e göre). Statik `lib/projects.ts` sadece fallback veya kaldırılır.
- **`/proje/[id]`** veya **`/proje/[slug]`** – Detay sayfası API’den tek proje alır; **BodyHtml** güvenli şekilde (sanitize edilerek) render edilir; kapak ve galeri aynı entity’den gelir.
- **Ana sayfa “Öne çıkan projeler”** – `FeaturedProjects` bileşeni API’den ilk N projeyi (veya “featured” işaretli olanları) alır; tasarım mevcut kart yapısına uyumlu kalır.

Icon/category gibi alanlar şu an statik projede var; dinamik modelde isteğe bağlı **Category** (string veya ayrı tablo) ve **Featured** (bool) eklenebilir. İlk aşamada sadece başlık/alt başlık/body/kapak/galeri ile başlanıp sonra genişletilebilir.

---

## 9. Güvenlik ve Sanitization

- **Zengin metin HTML:** Backend’de kaydetmeden önce HTML sanitize (allow list: p, strong, em, a, ul, ol, li, img, span; img için src, width, height, class vb. kontrollü) yapılmalı. .NET için örn. **HtmlSanitizer** (NuGet) kullanılabilir.
- **Upload:** Sadece yetkili admin; dosya uzantısı ve content-type kontrolü; dosya boyutu limiti; mümkünse dosya adında guid kullanımı (override riskini azaltır).

---

## 10. Uygulama Sırası Önerisi

1. **Backend:** Entity’ler (Project, ProjectTranslation, ProjectGalleryImage) + migration; DbContext.
2. **Backend:** Admin CRUD + upload endpoint’leri (cover, gallery, inline image); public GET list + GET by id/slug.
3. **Backend:** BodyHtml için HTML sanitizer entegrasyonu.
4. **Frontend:** `lib/adminApi.ts` ve public API için proje çağrıları; tipler.
5. **Frontend:** Tiptap (veya seçilen editör) kurulumu; tek dil için basit form (title, subtitle, body, cover, gallery).
6. **Frontend:** Admin projeler listesi sayfası + yeni/düzenle sayfası; menü ve dashboard linki.
7. **Frontend:** Public `/proje` ve `/proje/[id]` (veya slug) API’ye geçiş; FeaturedProjects API’ye bağlama.
8. **Çok dilli:** ProjectTranslation form (dil sekmeleri) ve API’de lang parametresi.
9. **İyileştirmeler:** Slug otomatik üretim, taslak/yayın, sıra sürükle-bırak galeri, inline resim boyut dropdown’ı.

Bu plan ile projeler sayfası, WordPress/Word benzeri zengin metin, kapak ve galeri ile dinamik hale getirilebilir; tasarım mevcut admin ve site stiline uyumlu tutulabilir.
