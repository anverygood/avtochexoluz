# Salon Usta — sayt (Node.js + Admin panel)

Bu loyiha avvalgi statik `index.html` saytining Node.js versiyasi. Dizayn
(rang, shrift, animatsiya) o'zgarmagan — faqat endi narxlar, avtomobillar,
izohlar, blog va sozlamalar **admin panel** orqali boshqariladi, kodni
qayta yozmasdan.

## Papkalar tuzilishi

```
server.js              — asosiy server fayli
routes/public.js        — bosh sahifa marshruti
routes/admin.js         — admin panel marshrutlari (login, CRUD)
middleware/auth.js      — admin panelni himoya qiluvchi tekshiruv
lib/db.js               — data/*.json fayllar bilan ishlovchi kichik "baza"
lib/upload.js           — rasm yuklash sozlamalari (multer)
data/                   — HAQIQIY KONTENT shu yerda saqlanadi (JSON fayllar)
  settings.json          — sayt nomi, telefon, telegram, manzil, chegirma va h.k.
  cars.json              — avtomobil modellari, rasmlari VA har birining o'z narxlar ro'yxati
  stories.json           — "kunlik ishlar" (tepadagi story tasmasi)
  beforeafter.json       — "Oldin/Keyin" juftliklari (ikkita rasm)
  media.json             — video va rasm galereyasi
  reviews.json           — mijoz izohlari
  blog.json              — blog maqolalari
views/index.ejs         — sayt HTML shabloni (statik dizayn + dinamik ma'lumot)
views/admin/             — admin panel sahifalari
public/css/style.css     — sayt dizayni (STATIK — bu yerga tegilmaydi, faqat siz
                            dizaynni o'zgartirmoqchi bo'lsangiz)
public/css/admin.css     — admin panel dizayni
public/js/site.js        — saytdagi interaktivlik (mashina tanlash, slider va h.k.)
public/uploads/          — admin paneldan yuklangan rasmlar shu yerga tushadi
```

## O'rnatish

1. Node.js (18+ versiya) o'rnatilgan bo'lishi kerak.
2. Loyiha papkasida:
   ```
   npm install
   ```
3. `.env.example` faylidan nusxa oling:
   ```
   cp .env.example .env
   ```
4. `.env` faylini oching va quyidagilarni o'zgartiring:
   - `SESSION_SECRET` — tasodifiy uzun matn bilan almashtiring
   - `ADMIN_USER` va `ADMIN_PASSWORD` — o'zingizning login/parolingiz

## Ishga tushirish

```
npm start
```

- Sayt: **http://localhost:3000**
- Admin panel: **http://localhost:3000/admin**

## Admin panelda nima o'zgartiriladi?

- **Sozlamalar** — ustaxona nomi, telefon, Telegram/Instagram havolalari,
  manzil, Google Maps qidiruv so'zi, chegirma banneri matni va tugash sanasi
- **Avtomobillar / Narxlar** — model qo'shish/o'chirish, rasm yuklash, va
  **har bir model uchun ALOHIDA xizmatlar/narxlar ro'yxati** ("Narxlarni
  boshqarish" tugmasi orqali) — masalan Damas va Cobalt bir-biriga bog'liq
  emas, har birining o'z narxi bor
- **Kunlik ishlar** — saytning yuqorisidagi "story" tasmasiga har kuni
  bitta rasm + qisqa yozuv qo'shish
- **Oldin / Keyin** — har bir ish uchun ikkita rasm (oldin + keyin)
  yuklash, saytda suradigan slayder ko'rinishida chiqadi
- **Video / Rasm** — ish jarayoni videolari va rasmlarini yuklash (fayl
  sifatida yoki YouTube kabi tashqi havola orqali)
- **Izohlar** — mijoz fikrlarini qo'lda qo'shish/o'chirish
- **Blog** — maqola sarlavhasi, matni va rasmini qo'shish/o'chirish

Bu o'zgarishlarning barchasi `data/` papkasidagi JSON fayllarga va
`public/uploads/` papkasidagi rasm/videolarga yoziladi — serverni qayta
ishga tushirish shart emas, o'zgarish saytda darhol ko'rinadi.

## Statik qolgan qismlar

Quyidagilar kod darajasida qoladi (admin paneldan o'zgartirilmaydi),
chunki bular dizayn/kod qismi:
- Umumiy dizayn va uslub (`public/css/style.css`)
- Sahifaning tuzilishi (`views/index.ejs`)
- Interaktiv xatti-harakat — slider, tab, modal (`public/js/site.js`)

## Xavfsizlik bo'yicha eslatma

- Ishlab chiqarish (production) muhitiga qo'yishdan oldin `.env` dagi
  `ADMIN_PASSWORD` va `SESSION_SECRET`ni albatta kuchli qiymatlarga
  almashtiring.
- Agar saytni haqiqiy serverga joylashtirsangiz, HTTPS orqali ishlatish
  tavsiya etiladi (masalan Nginx + Let's Encrypt orqali).
