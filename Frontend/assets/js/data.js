/**
 * OLSOP Camera - Data Layer
 * Mock database using localStorage
 */

const DB_KEY = 'olsop_products';
const ADMIN_KEY = 'olsop_admin_session';
const WISHLIST_KEY = 'olsop_wishlist';

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_PRODUCTS = [
  {
    id: 'prod-001',
    slug: 'sony-a7iii-body-only-jakarta-grade-a',
    title: 'Sony A7III Body Only',
    brand: 'Sony',
    category: 'Kamera',
    subCategory: 'Mirrorless',
    price: 18500000,
    grade: 'A',
    branch: 'Jakarta',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80'
    ],
    description: 'Sony A7III kondisi mulus grade A. Sudah termasuk charger original dan box. Shutter count rendah, fungsi semua normal. Cocok untuk fotografer profesional maupun enthusiast.',
    specs: 'Sensor: 24.2MP Full Frame BSI CMOS | ISO: 100-51200 | AF: 693 phase-detect | Video: 4K 30fps',
    whatsapp: '6281234567890',
    createdAt: '2024-01-15T08:00:00Z',
    soldAt: null,
    views: 245
  },
  {
    id: 'prod-002',
    slug: 'canon-eos-r6-mark-ii-kit-24-105-bandung-grade-a',
    title: 'Canon EOS R6 Mark II Kit 24-105mm',
    brand: 'Canon',
    category: 'Kamera',
    subCategory: 'Mirrorless',
    price: 32000000,
    grade: 'A',
    branch: 'Bandung',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=600&q=80',
      'https://images.unsplash.com/photo-1606986628253-f3e6e7a3c3b2?w=600&q=80'
    ],
    description: 'Canon EOS R6 Mark II dengan lensa kit 24-105mm f/4L IS USM. Kondisi sangat baik, jarang dipakai. Lengkap dengan box, charger, dan strap original.',
    specs: 'Sensor: 24.2MP Full Frame CMOS | ISO: 100-102400 | AF: Dual Pixel CMOS AF II | Video: 4K 60fps',
    whatsapp: '6281234567891',
    createdAt: '2024-01-20T09:00:00Z',
    soldAt: null,
    views: 189
  },
  {
    id: 'prod-003',
    slug: 'fujifilm-xt5-body-only-jakarta-grade-b',
    title: 'Fujifilm X-T5 Body Only',
    brand: 'Fujifilm',
    category: 'Kamera',
    subCategory: 'Mirrorless',
    price: 21000000,
    grade: 'B',
    branch: 'Jakarta',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&q=80',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80'
    ],
    description: 'Fujifilm X-T5 grade B, ada bekas pemakaian ringan di body tapi fungsi 100% normal. Sensor 40MP dengan film simulation terbaik. Cocok untuk street photography.',
    specs: 'Sensor: 40.2MP APS-C X-Trans CMOS 5 HR | ISO: 125-12800 | AF: Intelligent Hybrid AF | Video: 6.2K 30fps',
    whatsapp: '6281234567890',
    createdAt: '2024-02-01T10:00:00Z',
    soldAt: null,
    views: 312
  },
  {
    id: 'prod-004',
    slug: 'sony-a6400-kit-16-50-bekasi-grade-a',
    title: 'Sony A6400 Kit 16-50mm OSS',
    brand: 'Sony',
    category: 'Kamera',
    subCategory: 'Mirrorless',
    price: 8500000,
    grade: 'A',
    branch: 'Bekasi',
    status: 'sold',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80'
    ],
    description: 'Sony A6400 dengan lensa kit 16-50mm. Kondisi mulus, shutter count masih rendah. Cocok untuk pemula yang ingin kamera mirrorless APS-C.',
    specs: 'Sensor: 24.2MP APS-C Exmor CMOS | ISO: 100-32000 | AF: 425 phase-detect | Video: 4K 30fps',
    whatsapp: '6281234567892',
    createdAt: '2024-01-10T08:00:00Z',
    soldAt: '2024-02-05T14:30:00Z',
    views: 421
  },
  {
    id: 'prod-005',
    slug: 'nikon-z6ii-body-only-bandung-grade-a',
    title: 'Nikon Z6 II Body Only',
    brand: 'Nikon',
    category: 'Kamera',
    subCategory: 'Mirrorless',
    price: 19500000,
    grade: 'A',
    branch: 'Bandung',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80'
    ],
    description: 'Nikon Z6 II kondisi prima, mulus tanpa cacat. Dual card slot, dual processor. Sangat baik untuk video dan foto low light.',
    specs: 'Sensor: 24.5MP Full Frame BSI CMOS | ISO: 100-51200 | AF: 273 phase-detect | Video: 4K 60fps',
    whatsapp: '6281234567891',
    createdAt: '2024-02-10T11:00:00Z',
    soldAt: null,
    views: 156
  },
  {
    id: 'prod-006',
    slug: 'canon-eos-90d-kit-18-135-jakarta-grade-a',
    title: 'Canon EOS 90D Kit 18-135mm',
    brand: 'Canon',
    category: 'Kamera',
    subCategory: 'DSLR',
    price: 14500000,
    grade: 'A',
    branch: 'Jakarta',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=600&q=80'
    ],
    description: 'Canon EOS 90D dengan lensa 18-135mm IS USM. DSLR terbaik di kelasnya dengan 32.5MP dan video 4K. Kondisi sangat baik.',
    specs: 'Sensor: 32.5MP APS-C CMOS | ISO: 100-25600 | AF: 45-point all cross-type | Video: 4K 30fps',
    whatsapp: '6281234567890',
    createdAt: '2024-02-12T09:00:00Z',
    soldAt: null,
    views: 203
  },
  {
    id: 'prod-007',
    slug: 'sony-rx100-vii-bekasi-grade-a',
    title: 'Sony RX100 VII',
    brand: 'Sony',
    category: 'Kamera',
    subCategory: 'Compact',
    price: 11000000,
    grade: 'A',
    branch: 'Bekasi',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80'
    ],
    description: 'Sony RX100 VII kondisi mulus. Kamera compact terbaik dengan AF real-time tracking. Cocok untuk travel dan vlog.',
    specs: 'Sensor: 20.1MP 1-inch Exmor RS | ISO: 125-12800 | AF: 357 phase-detect | Video: 4K 30fps',
    whatsapp: '6281234567892',
    createdAt: '2024-02-14T10:00:00Z',
    soldAt: null,
    views: 178
  },
  {
    id: 'prod-008',
    slug: 'fujifilm-xpro3-body-only-bandung-grade-b',
    title: 'Fujifilm X-Pro3 Body Only',
    brand: 'Fujifilm',
    category: 'Kamera',
    subCategory: 'Mirrorless',
    price: 16500000,
    grade: 'B',
    branch: 'Bandung',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&q=80'
    ],
    description: 'Fujifilm X-Pro3 dengan hidden LCD. Grade B, ada sedikit bekas di sudut body. Fungsi 100% normal. Kamera rangefinder terbaik untuk street photography.',
    specs: 'Sensor: 26.1MP APS-C X-Trans CMOS 4 | ISO: 160-12800 | AF: Intelligent Hybrid AF | Video: 4K 30fps',
    whatsapp: '6281234567891',
    createdAt: '2024-02-16T08:00:00Z',
    soldAt: null,
    views: 134
  },
  {
    id: 'prod-009',
    slug: 'canon-eos-r50-body-only-jakarta-grade-a',
    title: 'Canon EOS R50 Body Only',
    brand: 'Canon',
    category: 'Kamera',
    subCategory: 'Mirrorless',
    price: 8900000,
    grade: 'A',
    branch: 'Jakarta',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=600&q=80'
    ],
    description: 'Canon EOS R50 kondisi mulus. Kamera mirrorless entry-level terbaik Canon. Ringan, compact, dengan AF canggih. Cocok untuk pemula.',
    specs: 'Sensor: 24.2MP APS-C CMOS | ISO: 100-32000 | AF: Dual Pixel CMOS AF II | Video: 4K 30fps',
    whatsapp: '6281234567890',
    createdAt: '2024-02-17T09:00:00Z',
    soldAt: null,
    views: 267
  },
  {
    id: 'prod-010',
    slug: 'nikon-d7500-kit-18-140-bekasi-grade-a',
    title: 'Nikon D7500 Kit 18-140mm',
    brand: 'Nikon',
    category: 'Kamera',
    subCategory: 'DSLR',
    price: 12000000,
    grade: 'A',
    branch: 'Bekasi',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80'
    ],
    description: 'Nikon D7500 dengan lensa 18-140mm VR. DSLR mid-range terbaik Nikon. Kondisi sangat baik, lengkap dengan box dan aksesoris.',
    specs: 'Sensor: 20.9MP APS-C BSI CMOS | ISO: 100-51200 | AF: Multi-CAM 3500DX II | Video: 4K 30fps',
    whatsapp: '6281234567892',
    createdAt: '2024-02-17T10:00:00Z',
    soldAt: null,
    views: 145
  },
  {
    id: 'prod-011',
    slug: 'sony-a7rv-body-only-jakarta-grade-a',
    title: 'Sony A7R V Body Only',
    brand: 'Sony',
    category: 'Kamera',
    subCategory: 'Mirrorless',
    price: 42000000,
    grade: 'A',
    branch: 'Jakarta',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80'
    ],
    description: 'Sony A7R V kondisi prima. Kamera resolusi tinggi 61MP dengan AI-based AF. Untuk fotografer profesional yang butuh detail maksimal.',
    specs: 'Sensor: 61MP Full Frame BSI CMOS | ISO: 100-32000 | AF: AI-based Real-time Tracking | Video: 8K 25fps',
    whatsapp: '6281234567890',
    createdAt: '2024-02-18T08:00:00Z',
    soldAt: null,
    views: 89
  },
  {
    id: 'prod-012',
    slug: 'fujifilm-instax-mini-evo-bandung-grade-a',
    title: 'Fujifilm Instax Mini Evo',
    brand: 'Fujifilm',
    category: 'Kamera',
    subCategory: 'Instant',
    price: 1800000,
    grade: 'A',
    branch: 'Bandung',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&q=80'
    ],
    description: 'Fujifilm Instax Mini Evo kondisi mulus. Kamera hybrid instant dengan 10 film effects dan 10 lens effects. Lengkap dengan box dan charger.',
    specs: 'Film: Instax Mini | Lens: 28mm f/12.7 | Shutter: 1/2-1/250s | Bluetooth: Yes',
    whatsapp: '6281234567891',
    createdAt: '2024-02-18T09:00:00Z',
    soldAt: null,
    views: 198
  },
  {
    id: 'prod-013',
    slug: 'canon-eos-5d-mark-iv-body-only-jakarta-grade-b',
    title: 'Canon EOS 5D Mark IV Body Only',
    brand: 'Canon',
    category: 'Kamera',
    subCategory: 'DSLR',
    price: 22000000,
    grade: 'B',
    branch: 'Jakarta',
    status: 'sold',
    images: [
      'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=600&q=80'
    ],
    description: 'Canon EOS 5D Mark IV grade B. Ada bekas pemakaian di grip tapi fungsi 100% normal. Shutter count sekitar 80.000. Kamera profesional pilihan fotografer wedding.',
    specs: 'Sensor: 30.4MP Full Frame CMOS | ISO: 100-32000 | AF: 61-point | Video: 4K 30fps',
    whatsapp: '6281234567890',
    createdAt: '2024-01-05T08:00:00Z',
    soldAt: '2024-02-10T11:00:00Z',
    views: 534
  },
  {
    id: 'prod-014',
    slug: 'sony-zv-e10-kit-16-50-bekasi-grade-a',
    title: 'Sony ZV-E10 Kit 16-50mm',
    brand: 'Sony',
    category: 'Kamera',
    subCategory: 'Mirrorless',
    price: 5500000,
    grade: 'A',
    branch: 'Bekasi',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80'
    ],
    description: 'Sony ZV-E10 kondisi mulus. Kamera vlog terbaik untuk konten kreator. Layar flip, mic yang baik, dan AF yang cepat.',
    specs: 'Sensor: 24.2MP APS-C Exmor CMOS | ISO: 100-32000 | AF: 425 phase-detect | Video: 4K 30fps',
    whatsapp: '6281234567892',
    createdAt: '2024-02-18T10:00:00Z',
    soldAt: null,
    views: 312
  },
  {
    id: 'prod-015',
    slug: 'nikon-z50-kit-16-50-bandung-grade-a',
    title: 'Nikon Z50 Kit 16-50mm',
    brand: 'Nikon',
    category: 'Kamera',
    subCategory: 'Mirrorless',
    price: 9500000,
    grade: 'A',
    branch: 'Bandung',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80'
    ],
    description: 'Nikon Z50 dengan lensa kit 16-50mm. Mirrorless APS-C entry-level Nikon yang ringan dan compact. Kondisi sangat baik.',
    specs: 'Sensor: 20.9MP APS-C BSI CMOS | ISO: 100-51200 | AF: Hybrid AF | Video: 4K 30fps',
    whatsapp: '6281234567891',
    createdAt: '2024-02-18T11:00:00Z',
    soldAt: null,
    views: 167
  }
];

// ─── Store Info ───────────────────────────────────────────────────────────────
const STORE_INFO = {
  name: 'OLSOP Camera',
  tagline: 'Kamera Second Terpercaya',
  description: 'Toko kamera second terpercaya dengan koleksi terlengkap dari berbagai brand ternama. Semua produk bergaransi toko dan sudah melalui quality check.',
  branches: {
    jakarta: {
      name: 'Jakarta',
      address: 'Jl. Raya Kebayoran Lama No. 12, Jakarta Selatan',
      phone: '021-7234567',
      whatsapp: '6281234567890',
      hours: 'Senin - Sabtu: 09.00 - 18.00 WIB',
      maps: 'https://maps.google.com/?q=-6.2297,106.7981',
      mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.7981!3d-6.2297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTMnNDYuOSJTIDEwNsKwNDcnNTMuMiJF!5e0!3m2!1sen!2sid!4v1234567890',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
      description: 'Cabang Jakarta kami berlokasi strategis di Kebayoran Lama, mudah diakses dari seluruh penjuru Jakarta. Kami menyediakan ratusan unit kamera second pilihan dengan kondisi terjamin.'
    },
    bandung: {
      name: 'Bandung',
      address: 'Jl. Dago No. 45, Bandung',
      phone: '022-2345678',
      whatsapp: '6281234567891',
      hours: 'Senin - Sabtu: 09.00 - 18.00 WIB',
      maps: 'https://maps.google.com/?q=-6.8915,107.6107',
      mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.7!2d107.6107!3d-6.8915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTMnMjkuNCJTIDEwN8KwMzYnMzguNSJF!5e0!3m2!1sen!2sid!4v1234567890',
      image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80',
      description: 'Cabang Bandung kami hadir di kawasan Dago yang terkenal. Melayani pelanggan dari Bandung dan sekitarnya dengan koleksi kamera second berkualitas.'
    },
    bekasi: {
      name: 'Bekasi',
      address: 'Jl. Ahmad Yani No. 88, Bekasi Timur',
      phone: '021-8901234',
      whatsapp: '6281234567892',
      hours: 'Senin - Sabtu: 09.00 - 18.00 WIB',
      maps: 'https://maps.google.com/?q=-6.2349,107.0004',
      mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.2!2d107.0004!3d-6.2349!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTQnMDUuNiJTIDEwN8KwMDAnMDEuNCJF!5e0!3m2!1sen!2sid!4v1234567890',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80',
      description: 'Cabang Bekasi kami siap melayani pelanggan di wilayah Bekasi dan sekitarnya. Lokasi mudah dijangkau dengan koleksi lengkap kamera second pilihan.'
    }
  },
  brands: {
    sony: {
      name: 'Sony',
      logo: '/assets/images/brands/sony.png',
      seoTitle: 'Kamera Second Sony Terpercaya - OLSOP Camera',
      description: 'Sony adalah salah satu produsen kamera terkemuka di dunia, dikenal dengan teknologi sensor BSI CMOS terdepan dan sistem autofokus Real-time Tracking yang revolusioner. Lini kamera Alpha Sony, mulai dari seri A7 full-frame hingga A6000 APS-C, menjadi pilihan favorit fotografer profesional dan enthusiast di seluruh dunia. Di OLSOP Camera, kami menyediakan koleksi kamera second Sony pilihan yang telah melalui quality check ketat, dengan kondisi terjamin dan harga terbaik.'
    },
    canon: {
      name: 'Canon',
      logo: '/assets/images/brands/canon.png',
      seoTitle: 'Kamera Second Canon Terpercaya - OLSOP Camera',
      description: 'Canon adalah brand kamera legendaris yang telah dipercaya oleh jutaan fotografer selama puluhan tahun. Dengan teknologi Dual Pixel CMOS AF yang revolusioner dan ekosistem lensa RF yang terus berkembang, Canon EOS R series menjadi pilihan utama fotografer wedding, portrait, dan wildlife. Di OLSOP Camera, temukan kamera second Canon pilihan dengan kondisi terbaik dan harga yang kompetitif.'
    },
    fujifilm: {
      name: 'Fujifilm',
      logo: '/assets/images/brands/fujifilm.png',
      seoTitle: 'Kamera Second Fujifilm Terpercaya - OLSOP Camera',
      description: 'Fujifilm dikenal dengan film simulation yang ikonik dan desain retro yang memukau. Kamera X-Series Fujifilm menghadirkan pengalaman fotografi yang unik dengan color science terbaik di kelasnya. Dari X-T series yang powerful hingga X100 series yang compact, Fujifilm selalu menjadi pilihan fotografer yang menghargai estetika dan kualitas gambar. Temukan kamera second Fujifilm terbaik di OLSOP Camera.'
    },
    nikon: {
      name: 'Nikon',
      logo: '/assets/images/brands/nikon.png',
      seoTitle: 'Kamera Second Nikon Terpercaya - OLSOP Camera',
      description: 'Nikon adalah salah satu brand kamera tertua dan paling terpercaya di dunia. Dengan sistem Z-mount yang modern dan sensor BSI CMOS berkualitas tinggi, kamera Nikon Z series menawarkan performa luar biasa untuk berbagai genre fotografi. Di OLSOP Camera, kami menyediakan kamera second Nikon pilihan yang telah diverifikasi kondisinya.'
    },
    panasonic: {
      name: 'Panasonic',
      logo: '/assets/images/brands/panasonic.png',
      seoTitle: 'Kamera Second Panasonic Terpercaya - OLSOP Camera',
      description: 'Panasonic Lumix dikenal sebagai pilihan utama para videografer profesional. Dengan teknologi Dual Native ISO dan sistem stabilisasi 5-axis yang canggih, kamera Lumix S series menghadirkan kualitas video sinematik yang luar biasa. Temukan kamera second Panasonic pilihan di OLSOP Camera dengan kondisi terjamin.'
    },
    olympus: {
      name: 'Olympus',
      logo: '/assets/images/brands/olympus.png',
      seoTitle: 'Kamera Second Olympus Terpercaya - OLSOP Camera',
      description: 'Olympus (kini OM System) terkenal dengan kamera Micro Four Thirds yang compact namun bertenaga. Dengan sistem stabilisasi in-body terbaik di kelasnya dan desain yang tahan cuaca, kamera Olympus OM-D series menjadi pilihan favorit fotografer petualang. Temukan kamera second Olympus berkualitas di OLSOP Camera.'
    },
    leica: {
      name: 'Leica',
      logo: '/assets/images/brands/leica.png',
      seoTitle: 'Kamera Second Leica Terpercaya - OLSOP Camera',
      description: 'Leica adalah simbol kemewahan dan presisi dalam dunia fotografi. Dibuat dengan craftsmanship Jerman yang tak tertandingi, kamera Leica M series menjadi impian setiap fotografer sejati. Di OLSOP Camera, temukan kamera second Leica pilihan yang telah diverifikasi keaslian dan kondisinya.'
    }
  }
};

// ─── ProductDB Class ──────────────────────────────────────────────────────────
class ProductDB {
  constructor() {
    this._init();
  }

  _init() {
    if (!localStorage.getItem(DB_KEY)) {
      localStorage.setItem(DB_KEY, JSON.stringify(SEED_PRODUCTS));
    }
  }

  _getAll() {
    return JSON.parse(localStorage.getItem(DB_KEY) || '[]');
  }

  _save(products) {
    localStorage.setItem(DB_KEY, JSON.stringify(products));
  }

  getAll(includeArchived = false) {
    const products = this._getAll();
    if (includeArchived) return products;
    return products.filter(p => p.status !== 'archived');
  }

  getById(id) {
    return this._getAll().find(p => p.id === id) || null;
  }

  getBySlug(slug) {
    return this._getAll().find(p => p.slug === slug) || null;
  }

  getByBrand(brand, includeArchived = false) {
    return this.getAll(includeArchived).filter(
      p => p.brand.toLowerCase() === brand.toLowerCase()
    );
  }

  getByCity(city, includeArchived = false) {
    return this.getAll(includeArchived).filter(
      p => p.branch.toLowerCase() === city.toLowerCase()
    );
  }

  filter({ brand, category, subCategory, minPrice, maxPrice, grade, branch, status, search } = {}) {
    let products = this.getAll();

    if (status && status !== 'all') {
      products = products.filter(p => p.status === status);
    }
    if (brand) products = products.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    if (category) products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    if (subCategory) products = products.filter(p => p.subCategory && p.subCategory.toLowerCase() === subCategory.toLowerCase());
    if (branch) products = products.filter(p => p.branch.toLowerCase() === branch.toLowerCase());
    if (minPrice) products = products.filter(p => p.price >= Number(minPrice));
    if (maxPrice) products = products.filter(p => p.price <= Number(maxPrice));
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    return products;
  }

  add(product) {
    const products = this._getAll();
    const newProduct = {
      id: 'prod-' + Date.now(),
      slug: product.slug || this._generateSlug(product.title, product.branch),
      status: 'available',
      createdAt: new Date().toISOString(),
      soldAt: null,
      views: 0,
      ...product
    };
    products.push(newProduct);
    this._save(products);
    return newProduct;
  }

  update(id, updates) {
    const products = this._getAll();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...updates };
    this._save(products);
    return products[idx];
  }

  setStatus(id, status) {
    const updates = { status };
    if (status === 'sold') updates.soldAt = new Date().toISOString();
    return this.update(id, updates);
  }

  delete(id) {
    const products = this._getAll().filter(p => p.id !== id);
    this._save(products);
  }

  incrementViews(slug) {
    const products = this._getAll();
    const idx = products.findIndex(p => p.slug === slug);
    if (idx !== -1) {
      products[idx].views = (products[idx].views || 0) + 1;
      this._save(products);
    }
  }

  _generateSlug(title, branch) {
    const base = title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    const b = branch ? '-' + branch.toLowerCase() : '';
    return base + b;
  }

  getStats() {
    const all = this._getAll();
    return {
      total: all.length,
      available: all.filter(p => p.status === 'available').length,
      sold: all.filter(p => p.status === 'sold').length,
      archived: all.filter(p => p.status === 'archived').length
    };
  }

  getBrands() {
    const all = this.getAll();
    return [...new Set(all.map(p => p.brand))].sort();
  }

  getCategories() {
    const all = this.getAll();
    return [...new Set(all.map(p => p.category))].sort();
  }

  getSubCategories(category) {
    const all = this.getAll();
    let filtered = all;
    if (category) filtered = all.filter(p => p.category.toLowerCase() === category.toLowerCase());
    return [...new Set(filtered.map(p => p.subCategory).filter(Boolean))].sort();
  }

  getBranches() {
    const all = this.getAll();
    return [...new Set(all.map(p => p.branch))].sort();
  }
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
class WishlistDB {
  getAll() {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
  }

  toggle(productId) {
    const list = this.getAll();
    const idx = list.indexOf(productId);
    if (idx === -1) {
      list.push(productId);
    } else {
      list.splice(idx, 1);
    }
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    return idx === -1;
  }

  has(productId) {
    return this.getAll().includes(productId);
  }

  count() {
    return this.getAll().length;
  }
}


// ─── Exports ──────────────────────────────────────────────────────────────────
const db = new ProductDB();
const wishlistDBOld = new WishlistDB();
const storeInfo = STORE_INFO;
