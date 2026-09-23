# 📚 My Book Space

> A full-stack social reading platform — track your books, join book clubs, chat in real time, and hit your yearly reading goals.

![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo_SDK-54-000020?logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?logo=socket.io&logoColor=white)

---

## ✨ Features

- 🔍 **Book discovery**: search powered by the Google Books API, plus bestseller lists from the New York Times Books API
- 📷 **Barcode & cover scanning**: add a book by scanning its ISBN with the device camera
- 📖 **Custom reading lists**: create, rename and share lists, add collaborators, and track each book's reading status
- 👥 **Book clubs**: create public or private clubs, invite members, manage roles, and pick the club's current book
- 💬 **Real-time club chat**: live messaging with Socket.io, with JWT-authenticated socket connections
- ⭐ **Reviews & ratings**: write reviews and see what the community thinks
- 🎯 **Reading challenges & stats**: set yearly goals and see your reading history in charts
- 🔔 **Notification center**: follow requests, club invites and social activity
- 🤝 **Social graph**: follow users, private profiles and follow requests
- 🌍 **Internationalization**: full English and Spanish support with i18next
- 🔐 **Complete auth flow**: register, login, refresh tokens, password reset by email, and deep links back into the app

---

## 🏗️ Architecture

```
my-book-space/
├── mobile/                 # React Native + Expo (TypeScript)
│   ├── app/                # File-based routing (Expo Router)
│   │   ├── (auth)/         # Login, register, password recovery
│   │   └── (app)/          # Tabs, book, club, list, notifications, settings
│   ├── components/         # Reusable UI by domain (book, club, profile, search…)
│   ├── context/            # Auth & Socket providers
│   ├── hooks/              # Custom hooks
│   ├── schemas/            # Zod validation schemas
│   └── i18n/               # EN / ES translations
│
└── server/                 # Node.js REST API + WebSocket server
    └── src/
        ├── routes/         # auth, user, book, book-list, review, book-club, challenges…
        ├── controllers/    # Business logic
        ├── models/         # Mongoose schemas
        ├── middleware/     # JWT protection, validation, uploads, error handling
        ├── validators/     # Joi request validation
        └── utils/          # Logger (Winston), mailer (Nodemailer + Gmail OAuth2)
```

---

## 🛠️ Tech Stack

### Mobile
| Area | Technology |
|---|---|
| Framework | React Native 0.81, Expo SDK 54, Expo Router 6 |
| Language | TypeScript (strict) |
| Forms & validation | React Hook Form + Zod |
| Networking | Axios (with auth interceptors), Socket.io client |
| Native features | Expo Camera (barcode scanning), Image Picker, Haptics |
| Animations | Reanimated 4, Gesture Handler |
| i18n | i18next + expo-localization |

### Backend
| Area | Technology |
|---|---|
| Runtime | Node.js (ES Modules), Express 5 |
| Database | MongoDB Atlas + Mongoose 9 |
| Real-time | Socket.io |
| Auth | JWT (access + refresh tokens), bcrypt |
| Validation | Joi |
| File uploads | Multer (avatars, club covers) |
| Email | Nodemailer with Gmail OAuth2 (googleapis) |
| Logging | Winston + Morgan |
| External APIs | Google Books API, NYT Books API |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- A MongoDB Atlas cluster
- Expo CLI / Android Studio or Xcode

### Backend
```bash
cd server
npm install
cp .env.example .env   # fill in your credentials
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```

---

## 🗺️ Roadmap

- [ ] Automated tests (Jest + Supertest)
- [ ] CI pipeline with GitHub Actions
- [ ] Push notifications
- [ ] Production deployment (HTTPS + cloud storage for uploads)

---

## 👤 Author

**Marco Moreno**: [GitHub](https://github.com/moreno025/) · [LinkedIn](https://www.linkedin.com/in/marco-moreno-pedrejon-5a5b8b3b2/)
