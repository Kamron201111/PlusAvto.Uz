# 🚂 Railway.app ga deploy qilish — to'liq qo'llanma

Bu qo'llanmada Railway.app'ga **3 ta service** (Database + Backend + Frontend) ni deploy qilish ko'rsatilgan.

---

## 📋 Reja

1. ✅ Kodni **GitHub** ga yuklash
2. ✅ Railway'da **PostgreSQL** service
3. ✅ Railway'da **Backend** service (Node.js)
4. ✅ Railway'da **Frontend** service (React)
5. ✅ Environment variables sozlash
6. ✅ Saytni ochish

---

## 1️⃣ GitHub'ga yuklash

ZIP fayldan papkani oching, GitHub'da yangi repository yarating va uni yuklang:

### Variant A: GitHub Desktop (eng oson)

1. https://desktop.github.com/ dan dasturni oling va o'rnating
2. GitHub akkauntiga kiring
3. **File → Add Local Repository** → ZIP dan ochilgan papkani tanlang
4. **Publish repository** bosing → nomini bering (`plusavto`)
5. Bosing **Publish** — kodingiz GitHub'da

### Variant B: Buyruq qatori

```bash
cd PlusAvto
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SIZNING-USERNAME/plusavto.git
git push -u origin main
```

---

## 2️⃣ Railway.app — boshlash

1. https://railway.app ga kiring
2. **Login with GitHub** bosing
3. GitHub ga ruxsat bering
4. **New Project** tugmasini bosing

---

## 3️⃣ PostgreSQL database qo'shish

1. Railway dashboard'da **New Project** → **Empty Project** tanlang yoki avval yaratganingizga kiring
2. Yangi service uchun **+ Create** → **Database** → **Add PostgreSQL**
3. ⏳ 30 soniya kuting — Railway database yaratadi
4. ✅ PostgreSQL service tayyor

**Hech qanday sozlash kerak emas!** Database avtomatik ishlaydi.

---

## 4️⃣ Backend service deploy

1. Loyihada **+ Create** → **GitHub Repo** ni tanlang
2. `plusavto` repositoryni tanlang
3. ⚠️ MUHIM: **Settings** tab'ga o'ting:
   - **Root Directory** ni `/backend` qiling (slash bilan!) → **Save**
4. **Variables** tab'ga o'ting va quyidagi 2 ta o'zgaruvchini qo'shing:

   **5.1.** `DATABASE_URL`:
   - **Value** maydoniga bosing → **Reference** tugmasini bosing
   - PostgreSQL service'ni tanlang
   - `DATABASE_URL` ni tanlang
   - **Add** bosing
   
   **5.2.** `JWT_SECRET`:
   - **+ New Variable** bosing
   - Name: `JWT_SECRET`
   - Value: uzun va tasodifiy matn (masalan: `xK9mP2nQ5vR8tY1wZ4aB7cD0eF3gH6jL`)
   - **Add** bosing

   **5.3.** `NODE_ENV`:
   - **+ New Variable** bosing
   - Name: `NODE_ENV`
   - Value: `production`
   - **Add** bosing

5. **Deployments** tab'ga o'ting va **Redeploy** bosing (yoki kutib turing)
6. ⏳ 2-3 daqiqa build qiladi
7. ✅ Backend tayyor!

### Backend URL'ni topish

1. Backend service'ga kiring → **Settings** → **Networking**
2. **Generate Domain** bosing → Railway ga sizga URL beradi
3. URL ni nusxalang: masalan `https://plusavto-backend.up.railway.app`

### Tekshirish

Brauzerda oching: `https://SIZNING-BACKEND-URL/api/health`

Ko'rishingiz kerak:
```json
{"status":"ok","time":"2026-..."}
```

✅ Bu ishlamoqda demakdir!

---

## 5️⃣ Frontend service deploy

1. Loyihada **+ Create** → **GitHub Repo** → `plusavto` ni tanlang
2. **Settings** tab'ga o'ting:
   - **Root Directory** ni `/frontend` qiling → **Save**
3. **Variables** tab'da:

   **`VITE_API_URL`** o'zgaruvchisini qo'shing:
   - Name: `VITE_API_URL`
   - Value: 4-bosqichda olingan backend URL (masalan: `https://plusavto-backend.up.railway.app`) — ⚠️ oxirida `/` BO'LMASIN
   - **Add** bosing

4. **Settings** → **Networking** → **Generate Domain** bosing
5. Frontend URL'ni nusxalang: `https://plusavto-frontend.up.railway.app`
6. ⏳ Deploy avtomatik qayta boshlanadi
7. ⏳ 3-5 daqiqa build qiladi
8. ✅ Tayyor!

---

## 6️⃣ Saytni ochish

Frontend URL'ni brauzerda oching: `https://plusavto-frontend.up.railway.app`

**Admin login:**
- Telefon: `+998916850336`
- Parol: `916850336`

🎉 **TABRIKLAYMAN! Sayt ishlamoqda!**

---

## ⚙️ Environment variables — qisqa jadval

### PostgreSQL service
Hech narsa kerak emas (Railway avtomatik beradi)

### Backend service
| Variable | Value | Tushuntirish |
|----------|-------|--------------|
| `DATABASE_URL` | Reference → Postgres → DATABASE_URL | Database ulanish |
| `JWT_SECRET` | tasodifiy uzun matn | Token uchun maxfiy kalit |
| `NODE_ENV` | `production` | Rejim |

### Frontend service
| Variable | Value | Tushuntirish |
|----------|-------|--------------|
| `VITE_API_URL` | Backend URL (`https://...up.railway.app`) | Backend manzili |

---

## 🔧 Muammolar va yechimlar

### ❌ Frontend "Server xato" deydi

**Sabab:** `VITE_API_URL` noto'g'ri yoki backend ishlamayapti.

**Yechim:**
1. Backend URL/api/health ga kirib tekshiring
2. Frontend `VITE_API_URL` to'g'ri yozilganini ko'ring (oxirida `/` bo'lmasin)
3. Frontend ni **Redeploy** qiling

### ❌ Backend "Database connection failed"

**Sabab:** `DATABASE_URL` Reference qilingmagan yoki noto'g'ri.

**Yechim:**
1. Backend → Variables → `DATABASE_URL` ni o'chiring
2. Qaytadan **Reference** orqali PostgreSQL service'dan tanlang

### ❌ Build xato beradi

**Sabab:** Root directory noto'g'ri.

**Yechim:** Backend uchun `/backend`, Frontend uchun `/frontend` ekanligini tekshiring.

### ❌ CORS xato

Backend `cors()` middleware ishlatadi, hammaga ruxsat beradi. Agar muammo bo'lsa, backend logs'ni ko'ring.

---

## 💰 Narx

- **Hobby plan ($5/oy)** — sizga yetib ortadi
- Real ishlatish: $2-4/oy (siz 3 ta service ishlatasiz, lekin har biri kichik)
- Pul qolsa keyingi oyga o'tadi

---

## 🔄 Kodni yangilash

GitHub'ga **yangi push** qilsangiz, Railway **avtomatik deploy qiladi**!

```bash
git add .
git commit -m "Update"
git push
```

⏳ 2-3 daqiqada yangi versiya tayyor.

---

## 🌐 Custom domen ulash

Domen sotib olganingizdan keyin (masalan `plusavto.uz`):

1. Frontend service → **Settings** → **Networking** → **Custom Domain**
2. Domen kiriting: `plusavto.uz`
3. Railway CNAME yoki A yozuv ko'rsatadi — uni domen sozlamalarida qo'shing
4. ⏳ 10 daqiqa - 24 soat DNS yangilanadi
5. ✅ HTTPS avtomatik qo'shiladi!

---

## ✅ Yakuniy tekshirish ro'yxati

- [ ] GitHub'ga yuklandi
- [ ] PostgreSQL service yaratildi
- [ ] Backend service'ga Root Directory `/backend` qo'yildi
- [ ] Backend'ga `DATABASE_URL` (reference), `JWT_SECRET`, `NODE_ENV` qo'shildi
- [ ] Backend Generate Domain qilindi, `/api/health` ishlaydi
- [ ] Frontend service'ga Root Directory `/frontend` qo'yildi
- [ ] Frontend'ga `VITE_API_URL` qo'shildi (backend URL bilan)
- [ ] Frontend Generate Domain qilindi
- [ ] Sayt ochildi, admin login ishlaydi

🎉 **TAYYOR! Sayt ishlamoqda!**

---

## 📞 Yordam kerakmi?

Muammo bo'lsa:
1. Railway dashboard'da har bir service uchun **Deployments** → **View Logs** ni oching
2. Xatoni nusxalang
3. Menga yuboring — tuzatamiz
