# 🎮 TicTacToe — vs AI Bot

Web app เกม Tic-Tac-Toe แบบ Player vs Bot (ระดับ Easy / Medium / Hard) มุ่งเน้นไปที่ประสบการณ์การเล่นที่ลื่นไหล, การออกแบบที่สวยงาม (Glassmorphism & animations), และระบบแข่งขันทำคะแนนผ่าน Leaderboard.

โปรเจกต์นี้พัฒนาระบบ Backend และ Frontend แยกจากกันอย่างชัดเจน พร้อมระบบ Authentication ด้วย **Google OAuth 2.0**.

---

## 🌟 ฟีเจอร์หลัก (Key Features)

- **Authenticaion:** ล็อกอินด้วย Google OAuth 2.0 (ใช้ JWT เก็บใน HTTP-only cookie).
- **Per-Difficulty Scoring:** แยกคะแนน, จำนวนที่ชนะ/แพ้/เสมอ, และ Streak ออกจากกันตามความยาก (Easy, Medium, Hard).
- **Win Streak Bonus:** ชนะติดกัน 3 รอบในความยากเดียวกัน รับคะแนนโบนัส +1 ทันที!
- **Global Leaderboard:** จัดอันดับผู้เล่นทั้งแบบ **สรุปรวม (All)** และแยกตามระดับความยาก (Easy, Medium, Hard).
- **Bot AI (3 ระดับ):**
  - 🌱 **Easy:** สุ่มช่องว่างแบบ 100% (ง่ายมาก)
  - 🔥 **Medium:** บล็อกเมื่อผู้เล่นกำลังจะชนะ และจบเกมเมื่อตัวเองมีโอกาสชนะ (ท้าทาย)
  - 💀 **Hard:** ใช้ **Minimax Algorithm** คำนวณขยับที่ดีที่สุดล่วงหน้า (ไม่มีวันแพ้ ทำได้ดีสุดคือเสมอ)

---

## 🛠 Tech Stack

| Component | Technology |
|---|---|
| **Frontend** | React, Vite, React Router, Context API (State Management) |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite (`better-sqlite3`) |
| **Authentication** | Passport.js (Google OAuth 2.0), JSON Web Tokens (JWT) |
| **Styling** | Vanilla CSS (CSS Variables, Flexbox, Animations) |

---

## 📂 โครงสร้าง Project

```text
tictactoe/
├── frontend/             # ส่วนแสดงผล (React + Vite)
│   ├── src/
│   │   ├── components/   # UI Reusable (Board, Cell, ScoreBar, Header, ...)
│   │   ├── lib/          # Logic เกม (gameLogic.js, bot.js)
│   │   ├── pages/        # หน้าหลัก (LoginPage, MenuPage, GamePage)
│   │   ├── store/        # State (gameStore.jsx - React Context)
│   │   ├── App.jsx       # Routing (React Router)
│   │   └── index.css     # CSS หลัก (Styling ทั้งระบบ)
│   └── .env              # เก็บ URL ของ API Backend
│
└── backend/              # ส่วนเซิร์ฟเวอร์ (Node.js + Express)
    ├── src/
    │   ├── lib/          # เชื่อมต่อ Database (db.js)
    │   ├── middleware/   # ดักจับและตรวจ JWT Token (authenticate.js)
    │   ├── routes/       # API Paths (auth.js, game.js, scores.js)
    │   └── server.js     # Entry point ของ Express App
    └── .env              # Google Credentials, JWT Secret, Port
```

---

## 🚀 วิธีติดตั้งและรันโปรเจกต์ (Development)

ระบบแบ่งเป็น 2 ส่วน คุณต้องเปิด Terminal แยก 2 หน้าต่างเพื่อรัน Frontend และ Backend พร้อมกัน

### 1. ตั้งค่า Environment Variables (ถ้ายังไม่มี)
- ในโฟลเดอร์ `backend/` ให้สร้างไฟล์ `.env` รันพอร์ต 4000:
  ```env
  GOOGLE_CLIENT_ID=your_google_client_id
  GOOGLE_CLIENT_SECRET=your_google_client_secret
  JWT_SECRET=your_random_secret_key
  CLIENT_URL=http://localhost:5173
  PORT=4000
  ```
- ในโฟลเดอร์ `frontend/` ให้สร้างไฟล์ `.env`:
  ```env
  VITE_API_URL=http://localhost:4000
  ```

### 2. รัน Backend
```bash
cd backend
npm install
npm run dev
# เซิร์ฟเวอร์จะรันที่: http://localhost:4000
```

### 3. รัน Frontend
```bash
cd frontend
npm install
npm run dev
# หน้าเว็บจะรันที่: http://localhost:5173
```

> **Note:** การล็อกอินด้วย Google จำเป็นต้องตั้งค่า OAuth Consent Screen และกำหนด Authorized redirect URIs ให้เป็น `http://localhost:4000/auth/google/callback` ใน Google Cloud Console

---

## 📡 API Endpoints (JSON Format)

API ของระบบนี้ใช้ JSON รูปแบบ Nested Objects เพื่อง่ายต่อการนำไปแสดงผลแยกตามระดับความยาก

### ตัวอย่าง Response จาก `GET /scores` และ `GET /auth/me`
```json
{
  "id": "uuid-...",
  "name": "Player Name",
  "avatar": "https://lh3.googleusercontent.com/...",
  "easy":   { "score": 3, "wins": 3, "losses": 0, "draws": 0, "streak": 0 },
  "medium": { "score": 2, "wins": 2, "losses": 0, "draws": 1, "streak": 1 },
  "hard":   { "score": 1, "wins": 1, "losses": 0, "draws": 0, "streak": 1 },
  "total":  { "score": 6, "wins": 6, "losses": 0, "draws": 1 }
}
```

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/auth/google` | - | ยิงไปเพื่อเปิดหน้าล็อกอิน Google |
| `GET` | `/auth/me` | JWT | ดึงข้อมูล Profile และสถิติส่วนตัวทั้งหมดของคนที่ล็อกอินอยู่ |
| `POST` | `/auth/logout` | JWT | ลบทิ้ง Cookie สั่งให้ออกจากระบบ |
| `POST` | `/game/result` | JWT | บันทึกผลหลังจบ 1 กระดาน (win, loss, draw พร้อมส่ง difficulty) |
| `GET` | `/scores` | JWT | ดึง Leaderboard แบบรวมทั้งหมด (`total`) |
| `GET` | `/scores?difficulty=hard` | JWT | ดึง Leaderboard นับเฉพาะคนที่เคยเล่นระดับนั้น และเรียงลำดับ |

---

## 🚀 Dual Backend Strategy

โปรเจกต์นี้รองรับการทำงานแบบ 2 ระบบในโค้ดเดียว (**Adapter Pattern**) เพื่อความสะดวกในการ Deploy และโชว์เคส:

1.  **Node.js + SQLite Mode:** เหมาะสำหรับรันในเครื่อง (Local) เพื่อโชว์ทักษะการเขียน Server-side, Database schema และการจัดการ Security ด้วย JWT (สลับใช้ได้โดยตั้ง `VITE_BACKEND_MODE=node` ใน `.env`)
2.  **Firebase Cloud Mode:** เหมาะสำหรับการ Deploy ขึ้น Production (Vercel) เพื่อให้คนทั่วไปเล่นได้ทันที โดยไม่ต้องเปิดเซิร์ฟเวอร์ทิ้งไว้ (สลับใช้ได้โดยตั้ง `VITE_BACKEND_MODE=firebase` ใน `.env`)

---

## 🛫 วิธีการ Deploy บน Vercel

คุณสามารถเอาหน้าบ้านขึ้นออนไลน์ได้ใน 2 นาที:

1.  **เตรียม Firebase:** เข้าไปที่ Firebase Console เปิดใช้ **Google Auth** และ **Cloud Firestore**
2.  **Push to GitHub:** นำโค้ดทั้งหมดขึ้น GitHub ของคุณ
3.  **Import to Vercel:** เลือกโปรเจกต์จาก GitHub โดยตั้งหน้าบ้าน (**Root Directory**) ไปที่โฟลเดอร์ `frontend`
4.  **ตั้งค่า Environment Variables:สร้างไฟล์ .env** ในหน้าเว็บ Vercel ให้เพิ่มค่าเหล่านี้:
    *   `VITE_BACKEND_MODE` = `firebase`
    *   `VITE_FIREBASE_API_KEY` = *(ค่าจาก Firebase)*
    *   `VITE_FIREBASE_AUTH_DOMAIN` = *(ค่าจาก Firebase)*
    *   `VITE_FIREBASE_PROJECT_ID` = *(ค่าจาก Firebase)*
    *   `VITE_FIREBASE_STORAGE_BUCKET` = *(ค่าจาก Firebase)*
    *   `VITE_FIREBASE_MESSAGING_SENDER_ID` = *(ค่าจาก Firebase)*
    *   `VITE_FIREBASE_APP_ID` = *(ค่าจาก Firebase)*
5.  **Done!** คลิกเดียว ตัวเว็บจะออนไลน์และเชื่อมต่อกับ Google Search/Firestore ทันทีครับ

