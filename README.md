# PHANTOM — Network Guardian

> Real-time network monitoring, intrusion detection, and parental controls for your home and business.

[![Live Demo](https://img.shields.io/badge/Landing-Live-red?style=flat-square)](https://phantom-phantom-admin-desktop-58gfz3jp3.vercel.app)
[![API Status](https://img.shields.io/badge/API-HuggingFace-yellow?style=flat-square)](https://darkness592-phantom-api.hf.space)
[![Release](https://img.shields.io/github/v/release/Darkness0258/PHANTOM?style=flat-square)](https://github.com/Darkness0258/PHANTOM/releases)
[![License](https://img.shields.io/badge/license-ISC-blue?style=flat-square)](LICENSE)

---

## Downloads

| Platform | Download |
|----------|----------|
| Windows 10/11 | [PHANTOM-Admin-Setup-1.0.0.exe](https://github.com/Darkness0258/PHANTOM/releases/download/v1.0.0/PHANTOM-Admin-Setup-1.0.0.exe) |
| Android 8+ | [PHANTOM-Mobile.apk](https://github.com/Darkness0258/PHANTOM/releases/download/v1.0.0/PHANTOM-Mobile.apk) |

---

## Features

- **Network Map** — Real-time visual map of all devices on your network
- **Threat Detection** — Port scan, ARP spoof, and unknown device detection
- **Desktop Agent** — Native Electron app with system tray support
- **Mobile App** — Android companion for remote monitoring
- **Parental Controls** — Per-device blocking and screen time management
- **Phantom AI** — Groq-powered AI assistant for network analysis

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop | Electron + React + Vite |
| Mobile | React Native + Expo |
| Backend | Python FastAPI |
| Database | Supabase (PostgreSQL) |
| AI | Groq API (llama3-8b-8192) |
| Backend Hosting | Hugging Face Spaces (Docker) |
| Landing Page | Vercel |
| System Services | Rust (phantom-core, phantom-agent) |

---

## Project Structure

```
PHANTOM/
├── apps/
│   ├── phantom-admin-desktop/   # Electron desktop app
│   └── phantom-mobile/          # React Native Android app
├── services/
│   ├── phantom-api/             # FastAPI backend
│   ├── phantom-core/            # Rust core service
│   └── phantom-agent/           # Rust agent service
├── landing/                     # Vercel landing page
├── installer/                   # Inno Setup installer
└── scripts/                     # DDNS + firewall scripts
```

---

## Backend API

Live at: `https://darkness592-phantom-api.hf.space`

| Endpoint | Description |
|----------|-------------|
| `GET /` | Health check |
| `POST /auth/login` | User authentication |
| `GET /devices` | List network devices |
| `GET /alerts` | Security alerts |
| `POST /ai/chat` | Phantom AI chat |

API Docs: `https://darkness592-phantom-api.hf.space/docs`

---

## Local Development

### Backend
```bash
cd services/phantom-api
pip install -r requirements.txt
cp .env.example .env  # Add your keys
uvicorn main:app --reload
```

### Desktop
```bash
cd apps/phantom-admin-desktop
npm install
npm run start  # Dev mode with hot reload
```

### Mobile
```bash
cd apps/phantom-mobile
npm install
npx expo start
```

---

## Environment Variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
GROQ_API_KEY=your-groq-key
```

---

## Author

**Darkness X** — [GitHub](https://github.com/Darkness0258)

---

*Built with FastAPI, Electron, React Native, and Rust.*
