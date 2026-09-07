/* ==========================================================================
   THE SCENT INDEX — MASTER APPLICATION ENGINE & VISUAL CURATOR CMS
   Self-managed architecture with localStorage, JSON export/import,
   deep-linking, perfume add/edit/delete, and dynamic journal/about editor.
   ========================================================================== */

// GÜVENLİK: Basit şifre koruması
const ADMIN_PASSWORD_HASH = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"; // "test" için hash
const ADMIN_SESSION_KEY = "scent_index_admin_session";

function hashPassword(password) {
  // Basit SHA-256 implementasyonu (client-side)
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  return crypto.subtle.digest('SHA-256', data).then(hash => {
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  });
}

function isAdminSessionValid() {
  const session = sessionStorage.getItem(ADMIN_SESSION_KEY);
  return session === ADMIN_PASSWORD_HASH;
}

function setAdminSession() {
  sessionStorage.setItem(ADMIN_SESSION_KEY, ADMIN_PASSWORD_HASH);
}

function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

async function verifyAdminPassword(password) {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === ADMIN_PASSWORD_HASH;
}

async function promptAdminPassword() {
  const password = prompt("Küratör paneline erişmek için şifre girin:");
  if (!password) return false;
  
  const isValid = await verifyAdminPassword(password);
  if (isValid) {
    setAdminSession();
    showToast("Küratör paneline erişim sağlandı.");
    return true;
  } else {
    showToast("Hatalı şifre! Erişim reddedildi.");
    return false;
  }
}

// 1. TEMEL VARSAYILAN KOLEKSİYON (İLK AÇILIŞ İÇİN 27 PARFÜM)
const defaultFragranceCollection = [
  {
    id: "01",
    brand: "Bvlgari",
    name: "Tygar",
    concentration: "Eau de Parfum",
    family: "fresh",
    families: ["fresh", "citrus", "woody"],
    perfumer: "Jacques Cavallier",
    year: 2016,
    size: "100 ml",
    rating: 9.5,
    mood: "Işıltılı, Canlı, Manyetik",
    notes: {
      top: ["Greyfurt", "Işıltılı Bergamot"],
      heart: ["Zencefil Kökü", "Misk Otu Tohumu (Ambrette)"],
      base: ["Ambroksan", "Odunsu Notalar"]
    },
    seasons: ["İlkbahar", "Yaz"],
    review: "Aşırı canlı, neredeyse ışıltılı bir greyfurt patlaması ve dipte derinleşen pürüzsüz ambroksan omurgası. Sıcak havalarda temiz ama son derece lüks bir imza.",
    image: "https://media.parfumo.com/perfumes/c0/c0a0a0-le-gemme-tygar-bvlgari_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "02",
    brand: "Maison Francis Kurkdjian",
    name: "Oud Satin Mood",
    concentration: "Extrait de Parfum",
    family: "sweet",
    families: ["sweet", "oriental", "floral"],
    perfumer: "Francis Kurkdjian",
    year: 2017,
    size: "70 ml",
    rating: 9.8,
    mood: "Duygusal, Yoğun, Kuşatıcı",
    notes: {
      top: ["Menekşe Akoru", "Sardunya"],
      heart: ["Şam Gülü", "Mayıs Gülü (Centifolia)"],
      base: ["Laos Udu", "Kehribar", "Burbon Vanilya"]
    },
    seasons: ["Sonbahar", "Kış"],
    review: "Pudramsı menekşe ve Türk gülünün tatlı vanilya ile sarıldığı ipeksi bir doku. Soğuk akşamlarda havayı anında değiştiren devasa bir yayılım.",
    image: "https://media.parfumo.com/perfumes/61/61d75c-oud-satin-mood-extrait-de-parfum-maison-francis-kurkdjian_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "03",
    brand: "Parfums de Marly",
    name: "Althaïr",
    concentration: "Eau de Parfum",
    family: "sweet",
    families: ["sweet", "gourmand", "spicy"],
    perfumer: "Hamid Merati-Kashani & Ilias Ermenidis",
    year: 2023,
    size: "125 ml",
    rating: 9.2,
    mood: "Sıcak, Gurme, Sofistike",
    notes: {
      top: ["Kakule", "Tarçın", "Bergamot", "Portakal Çiçeği"],
      heart: ["Burbon Vanilya", "Elemi Reçinesi"],
      base: ["Guaiac Ağacı", "Ambroks", "Pralin", "Misk"]
    },
    seasons: ["Sonbahar", "Kış"],
    review: "Klasik tatlı vanilyalardan ayrışan, kakule ve tarçının baharatlı dengesiyle açılan modern bir kış şaheseri. Gurme ama asil.",
    image: "https://media.parfumo.com/perfumes/3c/3cf8c5-althair-parfums-de-marly_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "04",
    brand: "Maison Crivelli",
    name: "Hibiscus Mahajád",
    concentration: "Extrait de Parfum",
    family: "floral",
    families: ["floral", "leather", "fruity"],
    perfumer: "Quentin Bisch",
    year: 2021,
    size: "50 ml",
    rating: 9.6,
    mood: "Canlı, Gösterişli, Çiçeksi",
    notes: {
      top: ["Hibiskus", "Frenk Üzümü Tomurcuğu", "Nane"],
      heart: ["Şam Gülü", "Tarçın"],
      base: ["Deri", "Vanilya", "Misk Otu Tohumu", "Sedir Ağacı"]
    },
    seasons: ["İlkbahar", "Sonbahar", "Kış"],
    review: "Mayhoş hibiskus ve zengin kırmızı gülün karanlık bir deri tabanıyla çarpıcı birleşimi. Tendeki ömrü 24 saati aşan cüretkâr bir sanat eseri.",
    image: "https://media.parfumo.com/perfumes/21/21acc6-hibiscus-mahajad-maison-crivelli_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "05",
    brand: "Nishane",
    name: "Ani",
    concentration: "Extrait de Parfum",
    family: "woody",
    families: ["woody", "sweet", "spicy"],
    perfumer: "Cécile Zarokian",
    year: 2019,
    size: "100 ml",
    rating: 9.4,
    mood: "Huzurlu, Baharatlı, Işıltılı",
    notes: {
      top: ["Zencefil", "Bergamot", "Pembe Biber", "Yeşil Notalar"],
      heart: ["Kakule", "Siyah Frenk Üzümü", "Türk Gülü"],
      base: ["Vanilya", "Asilbent (Benzoin)", "Sedir Ağacı", "Sandal Ağacı"]
    },
    seasons: ["Sonbahar", "Kış", "İlkbahar"],
    review: "Zencefil ve bergamotun parlak enerjisiyle başlayan, zamanla kremsi vanilya ve odunsu bir sıcaklığa evrilen zamansız bir başyapıt.",
    image: "https://media.parfumo.com/perfumes/90/9029ff-ani-extrait-de-parfum-nishane_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "06",
    brand: "Roja Dove",
    name: "Elysium Pour Homme Parfum",
    concentration: "Parfum",
    family: "fresh",
    families: ["fresh", "citrus", "aromatic"],
    perfumer: "Roja Dove",
    year: 2017,
    size: "50 ml",
    rating: 9.3,
    mood: "Ferahlatıcı, Seçkin, Canlandırıcı",
    notes: {
      top: ["Greyfurt", "Limon", "Bergamot", "Misket Limonu", "Kekik"],
      heart: ["Güve Otu (Vetiver)", "Ardıç Meyvesi", "Siyah Frenk Üzümü", "Sedir Ağacı"],
      base: ["Gri Amber (Ambergris)", "Deri", "Asilbent", "Vanilya"]
    },
    seasons: ["İlkbahar", "Yaz"],
    review: "Zengin narenciyeler ve yeşil fujer dokunun kristalize ambergris ile buluştuğu, her saniyesi yüksek prestij hissettiren zengin bir koku profili.",
    image: "https://media.parfumo.com/perfumes/0f/0f7c86_elysium-pour-homme-parfum-roja-parfums_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "07",
    brand: "Ormonde Jayne",
    name: "Montabaco Intensivo",
    concentration: "Parfum",
    family: "woody",
    families: ["woody", "leather", "aromatic"],
    perfumer: "Geza Schoen",
    year: 2013,
    size: "88 ml",
    rating: 9.7,
    mood: "Havadar, Karmaşık, Karizmatik",
    notes: {
      top: ["Dağ Havası Akoru", "Bergamot", "Ardıç", "Kakule"],
      heart: ["Manolya", "Hedione", "Gül", "Çay"],
      base: ["Tütün Yaprağı", "Iso E Super", "Süet", "Sandal Ağacı"]
    },
    seasons: ["İlkbahar", "Sonbahar", "Kış"],
    review: "Dağ havası ferahlığında tütün ve süet. Ağırlaşmayan, tene yapışan ve çevresinde inanılmaz sofistike bir rüzgar bırakan eşsiz bir kompozisyon.",
    image: "https://media.parfumo.com/perfumes/91/912ac0_4-montabaco-intensivo-ormonde-jayne_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "08",
    brand: "Xerjoff",
    name: "Kobe",
    concentration: "Parfum",
    family: "fresh",
    families: ["fresh", "citrus", "woody"],
    perfumer: "Christian Carbonnel & Laura Santander",
    year: 2009,
    size: "50 ml",
    rating: 9.1,
    mood: "Güneşli, Asil, Reçineli",
    notes: {
      top: ["Calabria Bergamotu", "Florida Portakalı", "Turunç Yaprağı (Petitgrain)"],
      heart: ["Portakal Çiçeği Esansı (Neroli)", "Portakal Çiçeği", "Gül Ağacı"],
      base: ["Ud Ağacı", "Asilbent", "Gri Amber", "Tonka Fasulyesi"]
    },
    seasons: ["İlkbahar", "Yaz"],
    review: "Akdeniz turunçgilleri ile reçineli oud tabanının büyüleyici kontrastı. Alışıldık taze narenciyelerden çok daha derin ve karakterli.",
    image: "https://media.parfumo.com/perfumes/1d/1dc7ce-kobe-xerjoff_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "09",
    brand: "Parfums de Marly",
    name: "Pegasus",
    concentration: "Eau de Parfum",
    family: "sweet",
    families: ["sweet", "fougere", "woody"],
    perfumer: "Hamid Merati-Kashani",
    year: 2011,
    size: "125 ml",
    rating: 9.0,
    mood: "Metalik, Pudramsı, Asil",
    notes: {
      top: ["Acı Badem", "Bergamot", "Heliotrope (Vanilya Çiçeği)"],
      heart: ["Yasemin", "Lavanta"],
      base: ["Vanilya", "Kehribar", "Sandal Ağacı"]
    },
    seasons: ["Sonbahar", "Kış", "İlkbahar"],
    review: "Acı badem ve vanilyanın metalik bir lavanta parıltısıyla harmanlandığı, hem mesafeli hem de karşı konulamaz derecede çekici bir fujer yorumu.",
    image: "https://media.parfumo.com/perfumes/fe/fe90b4-pegasus-parfums-de-marly_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "10",
    brand: "By Kilian",
    name: "Apple Brandy on the Rocks",
    concentration: "Eau de Parfum",
    family: "sweet",
    families: ["sweet", "gourmand", "fruity"],
    perfumer: "Sidonie Lancesseur",
    year: 2021,
    size: "50 ml",
    rating: 9.3,
    mood: "Gevrek, Likörlü, Geceye Uygun",
    notes: {
      top: ["Bergamot", "Kakule", "Gevrek Yeşil Elma"],
      heart: ["Elma Likörü Akoru", "Rom", "Meşe Yosunu"],
      base: ["Sedir Ağacı", "Ambroksan"]
    },
    seasons: ["Sonbahar", "Kış"],
    review: "Buzlu elma likörü ve meşe fıçılardan gelen odunsu sıcaklık. New York gece hayatının melankolisini ve lüksünü yansıtan rafine bir gurme.",
    image: "https://media.parfumo.com/perfumes/e3/e39bad-apple-brandy-on-the-rocks-kilian_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "11",
    brand: "Maison Francis Kurkdjian",
    name: "Aqua Universalis Forte",
    concentration: "Eau de Parfum",
    family: "fresh",
    families: ["fresh", "floral", "musky"],
    perfumer: "Francis Kurkdjian",
    year: 2011,
    size: "70 ml",
    rating: 9.2,
    mood: "Işıltılı, Saf, Kristalize",
    notes: {
      top: ["Bergamot", "Amalfi Limonu"],
      heart: ["Beyaz Çiçekler", "Filbahri (Yalancı Portakal)", "Gül"],
      base: ["Misk", "Odunsu Notalar"]
    },
    seasons: ["İlkbahar", "Yaz"],
    review: "Güneşte kurutulmuş beyaz keten gömleklerin berraklığı. Narenciye ve beyaz çiçeklerin misk ile birleştiği mutlak bir temizlik aurası.",
    image: "https://media.parfumo.com/perfumes/b8/b87dc1-aqua-universalis-forte-maison-francis-kurkdjian_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "12",
    brand: "Louis Vuitton",
    name: "Stellar Times",
    concentration: "Extrait de Parfum",
    family: "floral",
    families: ["floral", "oriental", "amber"],
    perfumer: "Jacques Cavallier",
    year: 2021,
    size: "100 ml",
    rating: 9.4,
    mood: "Altın Sarısı, Amberimsi, Göksel",
    notes: {
      top: ["Portakal Çiçeği", "Beyaz Kehribar"],
      heart: ["Güneş Notaları", "Çiçek Yaprakları"],
      base: ["Gri Amber", "Odunsu Akorlar", "Vanilya"]
    },
    seasons: ["İlkbahar", "Sonbahar"],
    review: "Jacques Cavallier imzalı, zamanın ve mekânın ötesinde altın sarısı bir amber bulutu. Çiçeksi nefeslerle sarmalanmış hipnotik bir lüks.",
    image: "https://media.parfumo.com/perfumes/9b/9b2621-stellar-times-louis-vuitton_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "13",
    brand: "Sospiro",
    name: "Vibrato",
    concentration: "Eau de Parfum",
    family: "fresh",
    families: ["fresh", "citrus", "powdery"],
    perfumer: "Christian Provenzano",
    year: 2020,
    size: "100 ml",
    rating: 9.6,
    mood: "Köpüren, Işıltılı, Kadifemsi",
    notes: {
      top: ["Bergamot", "Greyfurt", "Manolya"],
      heart: ["Zencefil", "Pudramsı Notalar", "Otsu Notalar"],
      base: ["Sedir Ağacı", "Kehribar", "Misk", "Susam Kökü (Orris)"]
    },
    seasons: ["İlkbahar", "Yaz", "Sonbahar"],
    review: "Köpüren zencefilli narenciyelerin kadife pürüzsüzlüğünde sedir ve orris ile harmanlandığı, silajı olağanüstü yüksek bir narenciye senfonisi.",
    image: "https://media.parfumo.com/perfumes/f1/f17fed-vibrato-sospiro_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "14",
    brand: "Bond No 9",
    name: "New York Amber",
    concentration: "Eau de Parfum",
    family: "leather/oriental",
    families: ["leather/oriental", "amber", "spicy"],
    perfumer: "Laurent Le Guernec",
    year: 2011,
    size: "100 ml",
    rating: 9.1,
    mood: "Zengin, İhtişamlı, Reçineli",
    notes: {
      top: ["Muskat", "Safran", "Beyaz Biber"],
      heart: ["Gül", "Yasemin", "Osmanthus"],
      base: ["Kehribar", "Sandal Ağacı", "Mür Reçinesi", "Ud Ağacı"]
    },
    seasons: ["Sonbahar", "Kış"],
    review: "Baharatlar ve koyu gülle zenginleştirilmiş yoğun, reçineli bir oryantal amber. New York'un mimari gücünü ve ihtişamını hissettirir.",
    image: "https://media.parfumo.com/perfumes/1a/1a27a1-new-york-amber-extrait-de-parfum-bond-no-9_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "15",
    brand: "Rabanne",
    name: "1 Million Lucky",
    concentration: "Eau de Toilette",
    family: "sweet",
    families: ["sweet", "gourmand", "woody"],
    perfumer: "Nathalie Gracia-Cetto",
    year: 2018,
    size: "100 ml",
    rating: 8.9,
    mood: "Neşeli, Fındıksı, Bağımlılık Yaratıcı",
    notes: {
      top: ["Mürdüm Eriği", "Ozonik Notalar", "Greyfurt"],
      heart: ["Kavrulmuş Fındık", "Bal", "Sedir Ağacı"],
      base: ["Amber Ağacı", "Paçuli", "Meşe Yosunu"]
    },
    seasons: ["Sonbahar", "Kış", "İlkbahar"],
    review: "Fındık, bal ve sulu eriğin modern dengesi. Tatlı gurme kategorisinde hafifliği ve bağımlılık yaratan pürüzsüz ahşap dokusuyla ayrışır.",
    image: "https://media.parfumo.com/perfumes/a2/a2caea-1-million-lucky-rabanne_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "16",
    brand: "Rabanne",
    name: "Invictus Victory Elixir",
    concentration: "Parfum Intense",
    family: "sweet",
    families: ["sweet", "amber", "spicy"],
    perfumer: "Anne Flipo, Nicolas Beaulieu, Domitille Michalon Bertier",
    year: 2023,
    size: "100 ml",
    rating: 9.0,
    mood: "Karanlık, Tütsülü, Güçlü",
    notes: {
      top: ["Lavantin", "Kakule", "Siyah Tane Biber"],
      heart: ["Tütsü", "Paçuli"],
      base: ["Vanilya Çubuğu", "Tonka Fasulyesi"]
    },
    seasons: ["Sonbahar", "Kış"],
    review: "Tütsü ve baharatların koyu tonka ile karıştığı, orijinal çizgisinden çok daha karanlık ve karizmatik bir gece kompozisyonu.",
    image: "https://media.parfumo.com/perfumes/b3/b382ae-invictus-victory-elixir-rabanne_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "17",
    brand: "Rabanne",
    name: "Phantom Parfum",
    concentration: "Parfum",
    family: "sweet",
    families: ["sweet", "aromatic", "woody"],
    perfumer: "Juliette Karagueuzoglou, Anne Flipo, Dominique Ropion",
    year: 2023,
    size: "100 ml",
    rating: 8.8,
    mood: "Fütüristik, Kadifemsi, Aromatik",
    notes: {
      top: ["Bergamot", "Limon", "Işkın (Rhubarb)", "Kakule"],
      heart: ["Lavanta", "Sardunya", "Sedir Ağacı"],
      base: ["Vanilya Çubuğu", "Tolu Balsamı", "Güve Otu (Vetiver)"]
    },
    seasons: ["Sonbahar", "Kış", "İlkbahar"],
    review: "Daha yoğun lavanta ve zengin reçineli vanilya ile yeniden yorumlanan fütüristik, karanlık ve çekici bir aromatik gurme.",
    image: "https://media.parfumo.com/perfumes/4e/4e8445-phantom-parfum-rabanne_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "18",
    brand: "Mugler",
    name: "A*Men Ultra Zest",
    concentration: "Eau de Toilette",
    family: "fresh",
    families: ["fresh", "citrus", "gourmand"],
    perfumer: "Jacques Huclier & Quentin Bisch",
    year: 2015,
    size: "100 ml",
    rating: 9.5,
    mood: "Narenciyeli, Gurme, Nadir",
    notes: {
      top: ["Kırmızı Portakal", "Mandalina", "Zencefil", "Nane"],
      heart: ["Kavrulmuş Kahve", "Tarçın", "Siyah Biber"],
      base: ["Paçuli", "Vanilya", "Tonka Fasulyesi"]
    },
    seasons: ["İlkbahar", "Yaz", "Sonbahar"],
    review: "Kırmızı portakalın parlak asiditesinin Mugler'ın efsanevi kahve ve paçuli DNA'sıyla buluştuğu eşine az rastlanır bir kült koleksiyon parçası.",
    image: "https://fimgs.net/mdimg/perfume-thumbs/375x500.29586.jpg"
  },
  {
    id: "19",
    brand: "Giorgio Armani",
    name: "Acqua di Giò Profondo",
    concentration: "Eau de Parfum",
    family: "fresh",
    families: ["fresh", "aquatic", "aromatic"],
    perfumer: "Alberto Morillas",
    year: 2020,
    size: "125 ml",
    rating: 9.1,
    mood: "Akuatik, Mineral, Derin Deniz",
    notes: {
      top: ["Deniz Notaları", "Akuazon", "Yeşil Mandalina"],
      heart: ["Biberiye", "Lavanta", "Servi Ağacı"],
      base: ["Mineral Kehribar", "Paçuli", "Misk"]
    },
    seasons: ["İlkbahar", "Yaz"],
    review: "Okyanusun en derin sularına dalış hissi. Mineral tuzluluğu ve aromatik reçinelerle modern akuatik tanımını baştan yazan bir koku.",
    image: "https://media.parfumo.com/perfumes/ee/eec52d-acqua-di-gio-profondo-2020-eau-de-parfum-giorgio-armani_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "20",
    brand: "Lattafa",
    name: "Art of Arabia I",
    concentration: "Eau de Parfum",
    family: "woody",
    families: ["woody", "spicy", "oriental"],
    perfumer: "Lattafa Master Perfumer",
    year: 2023,
    size: "100 ml",
    rating: 8.9,
    mood: "Egzotik, Dumanlı, Görkemli",
    notes: {
      top: ["Bergamot", "Nane"],
      heart: ["Siyah Çay", "Zencefil", "Lavanta"],
      base: ["Ambroksan", "Günlük Reçinesi (Buhur)", "Sedir Ağacı"]
    },
    seasons: ["Sonbahar", "Kış", "İlkbahar"],
    review: "Siyah çay, taze nane ve tütsünün sıcak odunsu dokunuşlarla dansı. Doğu'nun mistik havasını batılı bir modernlikle sunar.",
    image: "https://media.parfumo.com/perfumes/d0/d00198_art-of-arabia-i-lattafa-pride_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "21",
    brand: "Hugo Boss",
    name: "Boss Bottled Beyond",
    concentration: "Eau de Parfum",
    family: "woody",
    families: ["woody", "leather", "spicy"],
    perfumer: "Suzy Le Helley & Annick Menardo",
    year: 2024,
    size: "100 ml",
    rating: 8.7,
    mood: "Modern, Cilalı, Çekici",
    notes: {
      top: ["Taze Zencefil", "Acı Portakal"],
      heart: ["Deri Akoru", "Aromatik Baharatlar"],
      base: ["Sedir Ağacı", "Paçuli"]
    },
    seasons: ["Sonbahar", "Kış", "İlkbahar"],
    review: "Taze zencefil ve cilalı deri akorunun asil sedirle dengelendiği, modern şehir erkeğine hitap eden tok bir odunsu imza.",
    image: "https://media.parfumo.com/perfumes/5e/5e109f-boss-bottled-parfum-hugo-boss_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "22",
    brand: "Davidoff",
    name: "Cool Water",
    concentration: "Eau de Toilette",
    family: "fresh",
    families: ["fresh", "aquatic", "fougere"],
    perfumer: "Pierre Bourdon",
    year: 1988,
    size: "125 ml",
    rating: 8.8,
    mood: "İkonik, Okyanussu, Ferah",
    notes: {
      top: ["Deniz Suyu", "Nane", "Yeşil Notalar", "Lavanta"],
      heart: ["Sandal Ağacı", "Yasemin", "Portakal Çiçeği (Neroli)", "Sardunya"],
      base: ["Misk", "Meşe Yosunu", "Sedir Ağacı", "Kehribar"]
    },
    seasons: ["İlkbahar", "Yaz"],
    review: "Modern akuatik fujer türünün doğuş noktası. Deniz meltemi, nane ve yeşilliklerin tarih boyunca en çok yankı uyandırmış arketipi.",
    image: "https://media.parfumo.com/perfumes/a5/a56584-cool-water-eau-de-toilette-davidoff_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "23",
    brand: "Dior",
    name: "Dior Homme 2020",
    concentration: "Eau de Toilette",
    family: "woody",
    families: ["woody", "musky", "clean"],
    perfumer: "François Demachy",
    year: 2020,
    size: "100 ml",
    rating: 9.2,
    mood: "Temiz, Keskin Hatlı, Modern",
    notes: {
      top: ["Bergamot", "Pembe Biber", "Elemi Reçinesi"],
      heart: ["Atlas Sediri", "Paçuli Özü", "Kaşmir Ağacı"],
      base: ["Beyaz Misk", "Haiti Güve Otu", "Iso E Super"]
    },
    seasons: ["İlkbahar", "Yaz", "Sonbahar", "Kış"],
    review: "Minimalist sedir, temiz kaşmir ağacı ve iso e super omurgası. Kusursuz kesimli beyaz bir gömlek gibi her ortama uyum sağlayan saf bir stil bildirisi.",
    image: "https://media.parfumo.com/perfumes/ce/ce012e-dior-homme-2020-eau-de-toilette-dior_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "24",
    brand: "Gucci",
    name: "Guilty Elixir de Parfum pour Homme",
    concentration: "Elixir de Parfum",
    family: "leather/oriental",
    families: ["leather/oriental", "leather", "floral"],
    perfumer: "Quentin Bisch & Nathalie Cetto",
    year: 2023,
    size: "60 ml",
    rating: 9.4,
    mood: "Yoğun, Çiçeksi-Deri, Hipnotik",
    notes: {
      top: ["Portakal Çiçeği", "Yenibahar Tohumu", "Muskat"],
      heart: ["İris Yağı (Orris Butter)", "Osmanthus"],
      base: ["Ambrofix", "Laos Asilbendi", "Vanilin", "Paçuli"]
    },
    seasons: ["Sonbahar", "Kış"],
    review: "Yoğun portakal çiçeği ve kremsi iris yağının derin deri ve vanilya tonlarıyla düğümlendiği, hipnotize edici yoğunlukta avangart bir iksir.",
    image: "https://media.parfumo.com/perfumes/a6/a685fd-guilty-elixir-de-parfum-pour-homme-gucci_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "25",
    brand: "Burberry",
    name: "Hero Parfum Intense",
    concentration: "Parfum",
    family: "woody",
    families: ["woody", "amber", "resinous"],
    perfumer: "Aurélien Guichard",
    year: 2024,
    size: "100 ml",
    rating: 9.0,
    mood: "Sağlam, Sedirli, Cesur",
    notes: {
      top: ["Amyris Yağı", "Siyah Biber"],
      heart: ["Üçlü Sedir Ağacı (Atlas, Virjinya, Himalaya)"],
      base: ["Kıbrıs Otu (Cypriol)", "Kehribar"]
    },
    seasons: ["Sonbahar", "Kış"],
    review: "Üç farklı sedir ağacı çeşidinin dumanlı çam reçinesi ve karabiberle mühürlendiği, vahşi doğanın gücünü tene aktaran maskülen bir sütun.",
    image: "https://media.parfumo.com/perfumes/30/300d2a-hero-parfum-burberry_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "26",
    brand: "Dolce & Gabbana",
    name: "K by Dolce & Gabbana",
    concentration: "Eau de Parfum",
    family: "woody",
    families: ["woody", "citrus", "spicy"],
    perfumer: "Daphné Bugey & Nathalie Lorson",
    year: 2020,
    size: "100 ml",
    rating: 8.8,
    mood: "Baharatlı, Akdenizli, Hükümran",
    notes: {
      top: ["Kırmızı Portakal", "Sicilya Limonu", "Ardıç Meyvesi"],
      heart: ["Kırmızı Biber (Pimento)", "Sardunya", "Misk Adaçayı", "İncir Sütü"],
      base: ["Sedir Ağacı", "Paçuli", "Güve Otu (Vetiver)"]
    },
    seasons: ["İlkbahar", "Yaz", "Sonbahar"],
    review: "Akdeniz narenciyelerinin incir sütü ve kırmızı acı biberle sıra dışı kontrastı. Canlı, baharatlı ve sıcak iklim asaletini yansıtan bir aura.",
    image: "https://media.parfumo.com/perfumes/fa/fad329-k-eau-de-parfum-dolce-gabbana_1200.jpg?width=720&aspect_ratio=1:1"
  },
  {
    id: "27",
    brand: "Jean Paul Gaultier",
    name: "Ultra Male",
    concentration: "Eau de Toilette Intense",
    family: "sweet",
    families: ["sweet", "fruity", "gourmand"],
    perfumer: "Francis Kurkdjian",
    year: 2015,
    size: "125 ml",
    rating: 9.3,
    mood: "Baştan Çıkarıcı, Taşkın, Elektrikli",
    notes: {
      top: ["Sulu Armut", "Lavanta", "Nane", "Bergamot"],
      heart: ["Tarçın", "Misk Adaçayı", "Kimyon"],
      base: ["Siyah Vanilya Çubuğu", "Kehribar", "Sedir Ağacı", "Paçuli"]
    },
    seasons: ["Sonbahar", "Kış"],
    review: "Sulu armut ve lavantanın baharatlı siyah vanilyayla patladığı, gece kulüplerinin ve soğuk akşamların ikonik baştan çıkarıcısı.",
    image: "https://media.parfumo.com/perfumes/0d/0d267c-ultra-male-jean-paul-gaultier_1200.jpg?width=720&aspect_ratio=1:1"
  }
];

// 2. LOCALSTORAGE ANAHTARLARI & HAFIZA YÖNETİMİ
const STORAGE_KEY_COLLECTION = "scent_index_collection_v3";
const STORAGE_KEY_TEXTS = "scent_index_texts_v3";

const FALLBACK_IMAGE_SRC =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="900" viewBox="0 0 720 900" role="img" aria-label="Görsel yok">
  <rect width="720" height="900" fill="#F4EFE6"/>
  <rect x="90" y="130" width="540" height="640" rx="10" fill="none" stroke="#4A0E17" stroke-opacity="0.16" stroke-width="1.5"/>
  <ellipse cx="360" cy="430" rx="72" ry="148" fill="none" stroke="#4A0E17" stroke-opacity="0.32" stroke-width="2"/>
  <rect x="332" y="252" width="56" height="48" rx="7" fill="none" stroke="#4A0E17" stroke-opacity="0.32" stroke-width="2"/>
  <text x="360" y="668" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#4A0E17" fill-opacity="0.55">THE SCENT INDEX</text>
  <text x="360" y="698" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" letter-spacing="3.2" fill="#871928" fill-opacity="0.75">GÖRSEL YOK</text>
</svg>`);

function getDefaultEditorialTexts() {
  return {
    journalTitle: "Kokunun Ontolojisi ve Hafıza Mimarisi",
    journalLead: "Koku, insan bilincinin zamana karşı kurduğu en dolaysız ve korunaklı sığınağıdır. Bir narenciye kabuğunun havaya saçılan uçucu yağı, ten üzerinde yavaşça ısınan kadim bir reçine ya da nemli bir sedir ağacı lifi; unutulduğu sanılan bir sokak köşesini, bir akşamüstü ışığını ve kişisel tarihin kırılma anlarını anında şimdiye taşır.",
    journalBody: "The Scent Index, kokuyu geçici bir tüketim nesnesi değil; mekânların, duyuların ve içsel seyahatlerin mimari birer bileşeni olarak belgeler. Bu editoryal arşiv, modern parfümörlüğün kimyasal kesinliği ile şiirsel hafızanın kesiştiği alanda konumlanır.",
    aboutTitle: "Kürasyon Felsefesi ve Seçki Kriterleri",
    aboutLead: "Arşivdeki parfümler; tasarım dengesi, piramit yapısının kusursuzluğu, malzeme kalitesi ve tendeki karakter derinliği temel alınarak seçilmiştir. Niş parfüm evlerinin cüretkâr extrait formülasyonlarından, modern tasarımcı klasiklerinin rafine akorlarına uzanan bu seçki belirli ilkelerle derlenmiştir."
  };
}

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn("localStorage okunamadı", e);
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn("localStorage yazılamadı", e);
    showToast("Kayıt başarısız: tarayıcı deposu dolu veya erişilemez.");
    return false;
  }
}

function safeStorageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn("localStorage silinemedi", e);
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isUsableImageSrc(src) {
  if (!src || typeof src !== "string") return false;
  const value = src.trim();
  if (!value || value === "undefined" || value === "null") return false;
  if (value.startsWith("data:image/")) return true;
  if (value.startsWith("blob:")) return true;
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("/") || value.startsWith("./") || value.startsWith("../")) return true;
  return /\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i.test(value);
}

function resolveImageSrc(src) {
  const value = typeof src === "string" ? src.trim() : "";
  return isUsableImageSrc(value) ? value : FALLBACK_IMAGE_SRC;
}

function bindImageFallback(img, originalSrc) {
  if (!img) return;
  const resolved = resolveImageSrc(originalSrc);
  img.referrerPolicy = "no-referrer";
  img.decoding = "async";

  const applyFallback = () => {
    if (img.dataset.fallbackApplied === "1") return;
    img.dataset.fallbackApplied = "1";
    img.classList.add("is-fallback");
    img.src = FALLBACK_IMAGE_SRC;
  };

  img.addEventListener("error", applyFallback);
  img.src = resolved;
  if (resolved === FALLBACK_IMAGE_SRC) {
    img.dataset.fallbackApplied = "1";
    img.classList.add("is-fallback");
  }
}

function setFieldValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value ?? "";
}

function nextPerfumeId() {
  const nums = fragranceCollection
    .map((item) => parseInt(item.id, 10))
    .filter((n) => Number.isFinite(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return String(next).padStart(2, "0");
}

let fragranceCollection = loadCollectionFromStorage();
let editorialTexts = loadTextsFromStorage();

function loadCollectionFromStorage() {
  const saved = safeStorageGet(STORAGE_KEY_COLLECTION);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.warn("Storage parse error, using defaults", e);
    }
  }
  safeStorageSet(STORAGE_KEY_COLLECTION, JSON.stringify(defaultFragranceCollection));
  return [...defaultFragranceCollection];
}

function saveCollectionToStorage() {
  return safeStorageSet(STORAGE_KEY_COLLECTION, JSON.stringify(fragranceCollection));
}

function loadTextsFromStorage() {
  const defaultTexts = getDefaultEditorialTexts();
  const saved = safeStorageGet(STORAGE_KEY_TEXTS);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") {
        return { ...defaultTexts, ...parsed };
      }
    } catch (e) {
      console.warn("Texts storage error", e);
    }
  }
  safeStorageSet(STORAGE_KEY_TEXTS, JSON.stringify(defaultTexts));
  return defaultTexts;
}

function saveTextsToStorage() {
  return safeStorageSet(STORAGE_KEY_TEXTS, JSON.stringify(editorialTexts));
}

// 3. BİLDİRİM TOAST YARDIMCISI
function showToast(message) {
  const toast = document.getElementById("scentToast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// 4. UYGULAMA FİLTRE DURUMU
const currentFilters = {
  family: "all",
  search: "",
  sort: "default"
};

let previousActiveElement = null;
let currentActivePerfume = null;

// 5. GÜVENLİ DİNLENİCİ
function safeAddListener(idOrEl, event, handler) {
  const el = typeof idOrEl === "string" ? document.getElementById(idOrEl) : idOrEl;
  if (el && typeof el.addEventListener === "function") {
    el.addEventListener(event, handler);
  }
}

// 6. KARTLARI RENDER ETME
function renderCollection(items) {
  const gridElement = document.getElementById("collectionGrid");
  if (!gridElement) return;

  gridElement.innerHTML = "";
  updateCounters(items.length);

  if (items.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.innerHTML = `
      <div style="font-size: 2rem; color: var(--cherry-deep); margin-bottom: 12px;">✧</div>
      <h3 style="font-family: var(--font-serif); font-size: 1.8rem; color: var(--cherry-deep); margin-bottom: 8px;">Arşivde bu kritere uygun koku bulunamadı.</h3>
      <p style="color: var(--text-muted); margin-bottom: 20px;">Farklı bir arama terimi deneyebilir veya filtreleri sıfırlayabilirsiniz.</p>
      <button id="resetFiltersBtn" class="btn-clear-filters">Tüm Filtreleri Temizle</button>
    `;
    gridElement.appendChild(emptyState);
    safeAddListener("resetFiltersBtn", "click", resetAllFilters);
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "fragrance-card";
    card.setAttribute("data-id", item.id);
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `${item.brand}${item.name} detaylarını görüntüle`);

    card.innerHTML = `
      <div class="card-image-wrap">
        <img alt="${escapeHtml(`${item.brand} — ${item.name}`)}" loading="lazy" />
      </div>
      <span class="card-brand">${escapeHtml(item.brand)}</span>
      <h3 class="card-name">${escapeHtml(item.name)}</h3>
      <span class="card-meta-line">${escapeHtml(item.concentration)} • ${escapeHtml(item.year)}</span>
      <span class="card-perfumer-sub">${escapeHtml(item.perfumer || "")}</span>
    `;
    bindImageFallback(card.querySelector(".card-image-wrap img"), item.image);

    card.addEventListener("click", () => openDetailModal(item));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openDetailModal(item);
      }
    });

    gridElement.appendChild(card);
  });
}

// 7. FİLTRELEME & SIRALAMA
function applyFiltersAndRender() {
  let results = [...fragranceCollection];

  if (currentFilters.family !== "all") {
    const fKey = currentFilters.family.toLowerCase();
    results = results.filter((item) => {
      const fams = (item.families || [item.family]).map((f) => f.toLowerCase());
      if (fKey === "fresh" || fKey === "ferah") return fams.includes("fresh") || fams.includes("citrus");
      if (fKey === "woody" || fKey === "odunsu") return fams.includes("woody");
      if (fKey === "floral" || fKey === "çiçeksi") return fams.includes("floral");
      if (fKey === "sweet" || fKey === "tatlı") return fams.includes("sweet") || fams.includes("gourmand");
      if (fKey.includes("leather") || fKey.includes("deri") || fKey.includes("oriental") || fKey.includes("oryantal")) {
        return fams.includes("leather") || fams.includes("leather/oriental") || fams.includes("oriental");
      }
      return fams.includes(fKey) || (item.family && item.family.toLowerCase() === fKey);
    });
  }

  if (currentFilters.search.trim() !== "") {
    const q = currentFilters.search.toLowerCase().trim();
    results = results.filter((item) => {
      const allNotes = [
        ...(item.notes?.top || []),
        ...(item.notes?.heart || []),
        ...(item.notes?.base || [])
      ].join(" ").toLowerCase();

      const allSeasons = (item.seasons || []).join(" ").toLowerCase();

      return (
        (item.name || "").toLowerCase().includes(q) ||
        (item.brand || "").toLowerCase().includes(q) ||
        (item.perfumer && item.perfumer.toLowerCase().includes(q)) ||
        (item.mood && item.mood.toLowerCase().includes(q)) ||
        (item.review && item.review.toLowerCase().includes(q)) ||
        String(item.year ?? "").includes(q) ||
        allNotes.includes(q) ||
        allSeasons.includes(q)
      );
    });
  }

  switch (currentFilters.sort) {
    case "az":
      results.sort((a, b) => a.name.localeCompare(b.name, "tr"));
      break;
    case "za":
      results.sort((a, b) => b.name.localeCompare(a.name, "tr"));
      break;
    case "rating-desc":
      results.sort((a, b) => b.rating - a.rating);
      break;
    case "year-desc":
      results.sort((a, b) => b.year - a.year);
      break;
    case "year-asc":
      results.sort((a, b) => a.year - b.year);
      break;
    case "default":
    default:
      results.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));
      break;
  }

  renderCollection(results);
}

// 8. SAYAÇ GÜNCELLEME
function updateCounters(count) {
  const formatted = count < 10 ? `0${count}` : `${count}`;
  const heroCount = document.getElementById("heroCount");
  if (heroCount) heroCount.innerHTML = `${formatted}<br><span>PARFÜM</span>`;

  const sortCount = document.getElementById("sortCount");
  if (sortCount) sortCount.textContent = `${formatted} PARFÜM`;
}

// 9. DETAY MODALI
function openDetailModal(item, updateHash = true) {
  currentActivePerfume = item;
  previousActiveElement = document.activeElement;

  if (updateHash) {
    history.replaceState(null, null, `#parfum-${item.id}`);
  }

  const modalBrand = document.getElementById("modalBrand");
  if (modalBrand) modalBrand.textContent = item.brand;

  const modalName = document.getElementById("modalName");
  if (modalName) modalName.textContent = item.name;

  const modalMeta = document.getElementById("modalMeta");
  if (modalMeta) modalMeta.textContent = `${item.concentration} • ${item.size} •${item.year}`;

  const modalPerfumer = document.getElementById("modalPerfumer");
  if (modalPerfumer) modalPerfumer.textContent = item.perfumer ? `Burun (Parfümör): ${item.perfumer}` : "";

  const modalMood = document.getElementById("modalMood");
  if (modalMood) modalMood.textContent = item.mood || "";

  const modalRating = document.getElementById("modalRating");
  if (modalRating) modalRating.textContent = `★ ${Number(item.rating).toFixed(1)} / 10`;

  const modalReview = document.getElementById("modalReview");
  if (modalReview) modalReview.textContent = item.review ? `“${item.review}”` : "";

  const modalImage = document.getElementById("modalImage");
  if (modalImage) {
    modalImage.innerHTML = "";
    const img = document.createElement("img");
    img.alt = `${item.brand} ${item.name}`;
    bindImageFallback(img, item.image);
    modalImage.appendChild(img);
  }

  const renderNotePills = (el, notes) => {
    if (!el) return;
    el.innerHTML = (notes || []).map((n) => `<span class="note-pill">${escapeHtml(n)}</span>`).join("");
  };

  renderNotePills(document.getElementById("modalTopNotes"), item.notes?.top);
  renderNotePills(document.getElementById("modalHeartNotes"), item.notes?.heart);
  renderNotePills(document.getElementById("modalBaseNotes"), item.notes?.base);

  const seasonsEl = document.getElementById("modalSeasons");
  if (seasonsEl) {
    const allSeasons = ["İlkbahar", "Yaz", "Sonbahar", "Kış"];
    const activeSeasons = item.seasons || [];
    seasonsEl.innerHTML = allSeasons.map((s) => `
      <span class="season-badge ${activeSeasons.includes(s) ? "active" : ""}">${escapeHtml(s.toUpperCase())}</span>
    `).join("");
  }

  const detailModal = document.getElementById("detailModal");
  if (detailModal) {
    detailModal.classList.add("active");
    detailModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  const modalInner = document.querySelector(".modal-inner");
  if (modalInner) modalInner.focus();
}

function closeDetailModal() {
  const detailModal = document.getElementById("detailModal");
  if (!detailModal || !detailModal.classList.contains("active")) return;
  
  detailModal.classList.remove("active");
  detailModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (window.location.hash.startsWith("#parfum-")) {
    history.replaceState(null, null, window.location.pathname);
  }

  if (previousActiveElement) {
    previousActiveElement.focus();
  }
}

// 10. GÜNCE & HAKKINDA ÇEKMECESİ
function syncEditorialTextsToDOM() {
  const jTitle = document.getElementById("drawerJournalTitle");
  const jLead = document.getElementById("drawerJournalLead");
  const jBody = document.getElementById("drawerJournalBody");
  const aTitle = document.getElementById("drawerAboutTitle");
  const aLead = document.getElementById("drawerAboutLead");

  if (jTitle) jTitle.textContent = editorialTexts.journalTitle;
  if (jLead) jLead.textContent = editorialTexts.journalLead;
  if (jBody) jBody.textContent = editorialTexts.journalBody;
  if (aTitle) aTitle.textContent = editorialTexts.aboutTitle;
  if (aLead) aLead.textContent = editorialTexts.aboutLead;
}

function openDrawer(targetSectionId = null) {
  previousActiveElement = document.activeElement;
  const drawer = document.getElementById("editorialDrawer");
  if (!drawer) return;

  drawer.classList.add("active");
  drawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  const drawerPanel = drawer.querySelector(".drawer-panel");
  if (drawerPanel) drawerPanel.focus();

  if (targetSectionId) {
    const section = document.getElementById(targetSectionId);
    if (section) {
      setTimeout(() => section.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }
}

function closeDrawer() {
  const drawer = document.getElementById("editorialDrawer");
  if (!drawer || !drawer.classList.contains("active")) return;

  drawer.classList.remove("active");
  drawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.id === "navCollection");
  });

  if (previousActiveElement) {
    previousActiveElement.focus();
  }
}

// 11. KÜRATÖR YÖNETİM ÇEKMECESİ (CMS PANELİ)
function setCuratorOpenState(isOpen) {
  const drawer = document.getElementById("curatorDrawer");
  const toggle = document.getElementById("curatorToggleBtn");
  if (drawer) {
    drawer.classList.toggle("active", isOpen);
    drawer.setAttribute("aria-hidden", String(!isOpen));
  }
  if (toggle) {
    toggle.setAttribute("aria-expanded", String(isOpen));
  }
  document.body.style.overflow = isOpen ? "hidden" : "";
}

async function openCuratorDrawer(initialTab = "tabPerfume", populateItem = null) {
  // Güvenlik kontrolü
  if (!isAdminSessionValid()) {
    const authenticated = await promptAdminPassword();
    if (!authenticated) return;
  }

  previousActiveElement = document.activeElement;
  const drawer = document.getElementById("curatorDrawer");
  if (!drawer) {
    showToast("Küratör paneli bulunamadı.");
    return;
  }

  setCuratorOpenState(true);

  try {
    switchCuratorTab(initialTab || "tabPerfume");
    if (populateItem) {
      populateFormWithPerfume(populateItem);
    } else {
      resetPerfumeForm();
    }
  } catch (err) {
    console.error("Küratör paneli hazırlanamadı", err);
  }

  const panel = drawer.querySelector(".curator-panel");
  if (panel) panel.focus();
}

function closeCuratorDrawer() {
  const drawer = document.getElementById("curatorDrawer");
  if (!drawer || !drawer.classList.contains("active")) return;

  setCuratorOpenState(false);

  if (previousActiveElement && typeof previousActiveElement.focus === "function") {
    previousActiveElement.focus();
  }
}

function switchCuratorTab(tabId) {
  document.querySelectorAll(".curator-tab").forEach((t) => {
    t.classList.toggle("active", t.getAttribute("data-tab") === tabId);
  });
  document.querySelectorAll(".curator-tab-content").forEach((c) => {
    c.classList.toggle("active", c.id === tabId);
  });

  if (tabId === "tabTexts") {
    setFieldValue("editJournalTitle", editorialTexts.journalTitle);
    setFieldValue("editJournalLead", editorialTexts.journalLead);
    setFieldValue("editJournalBody", editorialTexts.journalBody);
    setFieldValue("editAboutTitle", editorialTexts.aboutTitle);
    setFieldValue("editAboutLead", editorialTexts.aboutLead);
  }
}

function populateFormWithPerfume(item) {
  if (!item) return;
  setFieldValue("formPerfumeId", item.id);
  setFieldValue("formBrand", item.brand);
  setFieldValue("formName", item.name);
  setFieldValue("formPerfumer", item.perfumer || "");
  setFieldValue("formConcentration", item.concentration);
  setFieldValue("formFamily", item.family);
  setFieldValue("formYear", item.year);
  setFieldValue("formSize", item.size);
  setFieldValue("formRating", item.rating);
  const ratingVal = document.getElementById("formRatingVal");
  if (ratingVal) ratingVal.textContent = Number(item.rating).toFixed(1);
  setFieldValue("formMood", item.mood || "");
  setFieldValue("formTopNotes", (item.notes?.top || []).join(", "));
  setFieldValue("formHeartNotes", (item.notes?.heart || []).join(", "));
  setFieldValue("formBaseNotes", (item.notes?.base || []).join(", "));
  setFieldValue("formReview", item.review || "");
  setFieldValue("formImage", item.image || "");

  document.querySelectorAll('input[name="formSeasons"]').forEach((chk) => {
    chk.checked = (item.seasons || []).includes(chk.value);
  });

  const saveBtn = document.getElementById("btnSavePerfume");
  if (saveBtn) saveBtn.textContent = "Parfümü Güncelle";
}

function resetPerfumeForm() {
  const form = document.getElementById("perfumeForm");
  if (form) form.reset();
  setFieldValue("formPerfumeId", "");
  setFieldValue("formRating", "9.5");
  const ratingVal = document.getElementById("formRatingVal");
  if (ratingVal) ratingVal.textContent = "9.5";
  const saveBtn = document.getElementById("btnSavePerfume");
  if (saveBtn) saveBtn.textContent = "Koleksiyona Kaydet";
}

// 12. CRUD İŞLEMLERİ (PARFÜM EKLE/DÜZENLE/SİL)
function handlePerfumeFormSubmit(e) {
  e.preventDefault();

  const readValue = (id) => document.getElementById(id)?.value ?? "";
  const idInput = readValue("formPerfumeId").trim();
  const brand = readValue("formBrand").trim();
  const name = readValue("formName").trim();
  const perfumer = readValue("formPerfumer").trim() || "Bilinmiyor";
  const concentration = readValue("formConcentration") || "Eau de Parfum";
  const family = readValue("formFamily") || "fresh";
  const year = parseInt(readValue("formYear"), 10) || new Date().getFullYear();
  const size = readValue("formSize").trim() || "100 ml";
  const rating = parseFloat(readValue("formRating")) || 9.0;
  const mood = readValue("formMood").trim();

  if (!brand || !name) {
    showToast("Marka ve parfüm adı zorunludur.");
    return;
  }

  const parseNotes = (val) => val.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
  const topNotes = parseNotes(readValue("formTopNotes"));
  const heartNotes = parseNotes(readValue("formHeartNotes"));
  const baseNotes = parseNotes(readValue("formBaseNotes"));

  const seasons = Array.from(document.querySelectorAll('input[name="formSeasons"]:checked')).map((c) => c.value);
  const review = readValue("formReview").trim();
  const imageInput = readValue("formImage").trim();
  const image = isUsableImageSrc(imageInput) ? imageInput : "";

  const perfumePayload = {
    brand,
    name,
    perfumer,
    concentration,
    family,
    families: [family],
    year,
    size,
    rating,
    mood,
    notes: { top: topNotes, heart: heartNotes, base: baseNotes },
    seasons,
    review,
    image
  };

  if (idInput) {
    const index = fragranceCollection.findIndex((f) => String(f.id) === String(idInput));
    if (index !== -1) {
      fragranceCollection[index] = {
        ...fragranceCollection[index],
        ...perfumePayload,
        id: fragranceCollection[index].id
      };
    } else {
      fragranceCollection.unshift({ id: idInput, ...perfumePayload });
    }
  } else {
    fragranceCollection.unshift({ id: nextPerfumeId(), ...perfumePayload });
  }

  if (!saveCollectionToStorage()) return;
  applyFiltersAndRender();
  resetPerfumeForm();
  closeCuratorDrawer();
  showToast(`“${brand} — ${name}” koleksiyona kaydedildi.`);
}

function handleTextsFormSubmit(e) {
  e.preventDefault();
  editorialTexts = {
    ...editorialTexts,
    journalTitle: document.getElementById("editJournalTitle")?.value.trim() || editorialTexts.journalTitle,
    journalLead: document.getElementById("editJournalLead")?.value.trim() || editorialTexts.journalLead,
    journalBody: document.getElementById("editJournalBody")?.value.trim() || editorialTexts.journalBody,
    aboutTitle: document.getElementById("editAboutTitle")?.value.trim() || editorialTexts.aboutTitle,
    aboutLead: document.getElementById("editAboutLead")?.value.trim() || editorialTexts.aboutLead
  };

  if (!saveTextsToStorage()) return;
  syncEditorialTextsToDOM();
  showToast("Günce ve Hakkında metinleri güncellendi.");
  closeCuratorDrawer();
}

function deleteCurrentPerfume() {
  if (!currentActivePerfume) return;
  const confirmDelete = confirm(`“${currentActivePerfume.brand} -${currentActivePerfume.name}” parfümünü koleksiyonunuzdan silmek istediğinize emin misiniz?`);
  if (!confirmDelete) return;

  fragranceCollection = fragranceCollection.filter((f) => f.id !== currentActivePerfume.id);
  if (!saveCollectionToStorage()) return;
  applyFiltersAndRender();
  closeDetailModal();
  showToast("Parfüm koleksiyondan çıkarıldı.");
}

// 13. YEDEKLEME VE DIŞA AKTAR (JSON)
function exportArchiveAsJson() {
  const dataToExport = {
    exportDate: new Date().toISOString(),
    collection: fragranceCollection,
    editorialTexts: editorialTexts
  };

  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `scent-index-archive-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Arşiv JSON dosyası olarak indirildi.");
}

function importArchiveFromJson(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (Array.isArray(data.collection) && data.collection.length > 0) {
        fragranceCollection = data.collection;
        if (!saveCollectionToStorage()) return;
      }
      if (data.editorialTexts && typeof data.editorialTexts === "object") {
        editorialTexts = { ...getDefaultEditorialTexts(), ...data.editorialTexts };
        if (!saveTextsToStorage()) return;
        syncEditorialTextsToDOM();
      }
      applyFiltersAndRender();
      showToast("Yedek başarıyla geri yüklendi!");
      closeCuratorDrawer();
    } catch (err) {
      alert("Hata: Geçersiz JSON dosyası!");
    }
  };
  reader.readAsText(file);
}

function resetToDefaultCollection() {
  const confirmReset = confirm("DİKKAT: Yapmış olduğunuz tüm parfüm ekleme ve düzenlemeler silinecek, orijinal 27 parfüme dönülecektir. Onaylıyor musunuz?");
  if (!confirmReset) return;

  safeStorageRemove(STORAGE_KEY_COLLECTION);
  safeStorageRemove(STORAGE_KEY_TEXTS);
  fragranceCollection = [...defaultFragranceCollection];
  editorialTexts = loadTextsFromStorage();

  if (!saveCollectionToStorage()) return;
  syncEditorialTextsToDOM();
  applyFiltersAndRender();
  showToast("Arşiv orijinal 27 parfüme sıfırlandı.");
  closeCuratorDrawer();
}

// 14. FİLTRELERİ SIFIRLAMA
function resetAllFilters() {
  currentFilters.family = "all";
  currentFilters.search = "";
  currentFilters.sort = "default";

  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = "";

  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) sortSelect.value = "default";

  document.querySelectorAll(".filter").forEach((btn) => {
    const isAll = btn.getAttribute("data-filter") === "all";
    btn.classList.toggle("active", isAll);
    btn.setAttribute("aria-pressed", String(isAll));
  });

  applyFiltersAndRender();
}

// 15. TÜM ETKİLEŞİMLER VE DİNLENİCİLER
function setupEventListeners() {
  // Filtre Butonları
  document.querySelectorAll(".filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      currentFilters.family = btn.getAttribute("data-filter") || "all";
      applyFiltersAndRender();
    });
  });

  // Sıralama Menüsü
  safeAddListener("sortSelect", "change", (e) => {
    currentFilters.sort = e.target.value;
    applyFiltersAndRender();
  });

  // Arama Çekmecesi Aç/Kapat
  safeAddListener("searchToggleBtn", "click", () => {
    const drawer = document.getElementById("searchDrawer");
    if (!drawer) return;
    const isActive = drawer.classList.toggle("active");
    drawer.setAttribute("aria-hidden", String(!isActive));
    
    const toggle = document.getElementById("searchToggleBtn");
    if (toggle) toggle.setAttribute("aria-expanded", String(isActive));
    
    const input = document.getElementById("searchInput");
    if (isActive && input) {
      input.focus();
    }
  });

  safeAddListener("searchInput", "input", (e) => {
    currentFilters.search = e.target.value;
    applyFiltersAndRender();
  });

  safeAddListener("searchClearBtn", "click", () => {
    const input = document.getElementById("searchInput");
    if (input) input.value = "";
    currentFilters.search = "";
    applyFiltersAndRender();
  });

  // Küratör Paneli Butonu & Kapatma
  safeAddListener("curatorToggleBtn", "click", () => openCuratorDrawer());
  safeAddListener("curatorClose", "click", closeCuratorDrawer);
  safeAddListener("curatorBackdrop", "click", closeCuratorDrawer);
  safeAddListener("btnAdminLogout", "click", () => {
    clearAdminSession();
    closeCuratorDrawer();
    showToast("Admin oturumu kapatıldı.");
  });

  // Küratör Sekme Değişimi
  document.querySelectorAll(".curator-tab").forEach((tab) => {
    tab.addEventListener("click", () => switchCuratorTab(tab.getAttribute("data-tab")));
  });

  // Puan Slider Değer Göstergesi
  safeAddListener("formRating", "input", (e) => {
    const val = document.getElementById("formRatingVal");
    if (val) val.textContent = Number(e.target.value).toFixed(1);
  });

  // Form Submitleri
  safeAddListener("perfumeForm", "submit", handlePerfumeFormSubmit);
  safeAddListener("btnResetForm", "click", resetPerfumeForm);
  safeAddListener("textsForm", "submit", handleTextsFormSubmit);

  // Modal İçi Düzenle & Sil Butonları
  safeAddListener("btnModalEdit", "click", async () => {
    if (!currentActivePerfume) return;
    
    // Güvenlik kontrolü
    if (!isAdminSessionValid()) {
      const authenticated = await promptAdminPassword();
      if (!authenticated) return;
    }
    
    const itemToEdit = currentActivePerfume;
    closeDetailModal();
    openCuratorDrawer("tabPerfume", itemToEdit);
  });
  safeAddListener("btnModalDelete", "click", async () => {
    // Güvenlik kontrolü
    if (!isAdminSessionValid()) {
      const authenticated = await promptAdminPassword();
      if (!authenticated) return;
    }
    deleteCurrentPerfume();
  });

  // Yedekleme Butonları
  safeAddListener("btnExportJson", "click", exportArchiveAsJson);
  safeAddListener("btnTriggerImport", "click", () => document.getElementById("inputFileImport")?.click());
  safeAddListener("inputFileImport", "change", importArchiveFromJson);
  safeAddListener("btnResetDefaults", "click", resetToDefaultCollection);

  // Genel Modal & Çekmece Kapatma
  safeAddListener("modalClose", "click", closeDetailModal);
  safeAddListener("modalBackdrop", "click", closeDetailModal);
  safeAddListener("drawerClose", "click", closeDrawer);
  safeAddListener("drawerBackdrop", "click", closeDrawer);

  // Menü Bağlantıları
  safeAddListener("navCollection", "click", (e) => {
    document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
    document.getElementById("navCollection")?.classList.add("active");
  });

  safeAddListener("navJournal", "click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
    document.getElementById("navJournal")?.classList.add("active");
    openDrawer("drawerJournal");
  });

  safeAddListener("navAbout", "click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
    document.getElementById("navAbout")?.classList.add("active");
    openDrawer("drawerAbout");
  });

  // Klavye Kısayolları (Escape, /, Alt + E)
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDetailModal();
      closeDrawer();
      closeCuratorDrawer();
      return;
    }

    // Alt + E ile Küratör Panelini Aç/Kapat (Türkçe klavyede e.key € olabilir)
    const isCuratorShortcut =
      e.altKey &&
      !e.ctrlKey &&
      !e.metaKey &&
      (e.code === "KeyE" || e.key === "e" || e.key === "E" || e.key === "€");
    if (isCuratorShortcut) {
      e.preventDefault();
      const curatorDrawer = document.getElementById("curatorDrawer");
      if (curatorDrawer && curatorDrawer.classList.contains("active")) {
        closeCuratorDrawer();
      } else {
        // Async function olduğu için async wrapper kullanıyoruz
        (async () => {
          if (!isAdminSessionValid()) {
            const authenticated = await promptAdminPassword();
            if (!authenticated) return;
          }
          openCuratorDrawer();
        })();
      }
      return;
    }

    // / veya Cmd/Ctrl + K ile Arama
    const isSearchShortcut = (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") ||
                             ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k");
    if (isSearchShortcut) {
      e.preventDefault();
      const drawer = document.getElementById("searchDrawer");
      const toggle = document.getElementById("searchToggleBtn");
      if (drawer && !drawer.classList.contains("active")) {
        toggle?.click();
      }
      document.getElementById("searchInput")?.focus();
    }
  });

  window.addEventListener("load", checkUrlHashForModal);
  window.addEventListener("hashchange", checkUrlHashForModal);
}

function checkUrlHashForModal() {
  const hash = window.location.hash;
  if (hash && hash.startsWith("#parfum-")) {
    const id = hash.replace("#parfum-", "");
    const item = fragranceCollection.find((f) => f.id === id);
    if (item) {
      openDetailModal(item, false);
    }
  }
}

// 16. UYGULAMA BAŞLATICI
function initApp() {
  syncEditorialTextsToDOM();
  applyFiltersAndRender();
  setupEventListeners();
  checkUrlHashForModal();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}