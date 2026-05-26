# 🚗 PlusAvto.Uz - Fullstack

O'zbekistonda haydovchilik guvohnomasi olish uchun online test platformasi.

## 🏗 Arxitektura

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Frontend       │◄────►│  Backend        │◄────►│  PostgreSQL     │
│  React + Vite   │      │  Node + Express │      │  Database       │
│  (Railway)      │      │  (Railway)      │      │  (Railway)      │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## 📁 Loyiha tuzilmasi

```
PlusAvto/
├── backend/         # Node.js + Express + PostgreSQL
│   ├── src/
│   │   ├── server.js      # Asosiy server
│   │   ├── db.js          # Database connection
│   │   ├── init.js        # Schema va default ma'lumotlar
│   │   └── auth.js        # JWT auth
│   ├── package.json
│   └── railway.json
│
└── frontend/        # React + TypeScript + Vite
    ├── components/
    ├── pages/
    ├── services/
    ├── public/
    ├── App.tsx
    ├── package.json
    └── railway.json
```

## 🚀 Railway ga deploy

To'liq qo'llanma: **[DEPLOY.md](DEPLOY.md)**

Qisqacha:
1. GitHub'ga push qiling
2. Railway.app da yangi loyiha yarating
3. PostgreSQL service qo'shing
4. Backend service'ni `/backend` papkadan deploy qiling
5. Frontend service'ni `/frontend` papkadan deploy qiling
6. Environment variables sozlang

## 🔑 Birinchi marta kirish

- **Admin:** `+998916850336` / `916850336`

⚠️ Kirgach **darhol** Profilga kirib parolni o'zgartiring!

## 💻 Mahalliy ishga tushirish

**Backend:**
```bash
cd backend
npm install
# .env yarating - DATABASE_URL kerak (lokal PostgreSQL)
npm start
```

**Frontend:**
```bash
cd frontend
npm install --legacy-peer-deps
# .env yarating: VITE_API_URL=http://localhost:3001
npm run dev
```

## ✨ Imkoniyatlar

### Foydalanuvchi
- Mavzu trenirovkasi (Bepul: 1-mavzu)
- Biletlar (Premium)
- Imtihon (Premium)
- Random test
- **Vazifalar** — admin yaratadi (mavzular yoki qo'lda)
- Sevimli savollar, xato savollar
- Video kurslar (Premium)
- Profil + parol o'zgartirish
- Habarlar
- Obuna sotib olish (chek rasmi)
- Parolni unutdi: telefon + yangi parol (admin tasdiqlamasdan)

### Admin
- Dashboard
- Mavzular, Biletlar (auto/qo'lda), Oraliq, **Vazifalar**, Savollar
- Video kurslar
- Obuna so'rovlari (chekni ko'rish, tasdiqlash)
- Habarlar
- Foydalanuvchilar (premium berish)
- Sozlamalar

### Texnik
- ✅ Server'da PostgreSQL database — yangi user qo'shilsa hammaga ko'rinadi
- ✅ JWT auth — foydalanuvchi telefonida saqlanib qoladi
- ✅ +998 majburiy phone input
- ✅ Uzbek ↔ Kirill avtomatik transliteratsiya
- ✅ Telefon va PC ga moslashtirilgan
- ✅ Light / Dark / System tema
