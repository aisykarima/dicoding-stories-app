# Dicoding Stories App

Aplikasi berbasis web yang memungkinkan pengguna membuat, melihat, dan menyimpan cerita dari komunitas Dicoding. Dibangun dengan modular JavaScript menggunakan Webpack, mendukung offline mode, push notification, dan fitur kamera maupun lokasi.

## Table of Contents

* [Getting Started](#getting-started)
* [Scripts](#scripts)
* [Project Structure](#project-structure)
* [Features](#features)

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (disarankan versi 12 atau lebih tinggi)
* [npm](https://www.npmjs.com/) (Node package manager)

### Installation

1. Clone repositori ini 
2. Lakukan unzip file jika perlu.
3. Pasang seluruh dependencies dengan perintah berikut:

   ```bash
   npm install
   ```

## Scripts

* Build for Production:

  ```bash
  npm run build
  ```

  Menghasilkan file produksi di folder `dist/`.

* Start Development Server:

  ```bash
  npm run start-dev
  ```

  Menjalankan server lokal dengan live reload di mode development.

* Serve:

  ```bash
  npm run serve
  ```

  Menjalankan server statis untuk menyajikan hasil build dari folder `dist/`.

## Project Structure

```
src/
├── public/
│   ├── images/
│   ├── favicon.png
│   └── manifest.json
├── scripts/
│   ├── data/
│   │   └── api.js
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   ├── login-page.js
│   │   │   │   └── login-presenter.js
│   │   │   └── register/
│   │   │       ├── register-page.js
│   │   │       └── register-presenter.js
│   │   ├── home/
│   │   │   ├── home-page.js
│   │   │   └── home-presenter.js
│   │   ├── new/
│   │   │   ├── new-page.js
│   │   │   └── new-presenter.js
│   │   ├── story-detail/
│   │   ├── app.js
│   │   └── bookmark-page.js
│   ├── routes/
│   └── utils/
│       ├── auth.js
│       ├── camera.js
│       ├── idb.js
│       ├── index.js
│       ├── notification.js
│       ├── config.js
│       ├── sw.js
│       └── templates.js
├── styles/
│   ├── responsive.css
│   └── styles.css
├── index.html
├── STUDENT.txt
├── README.md
├── webpack.common.js
├── webpack.dev.js
└── webpack.prod.js
```

## Features

✅ **Autentikasi**: Login dan register menggunakan API Dicoding.
✅ **Pembuatan Cerita Baru**: Lengkap dengan deskripsi, gambar (upload atau kamera), dan lokasi.
✅ **Push Notification**: Notifikasi akan dikirim setelah cerita berhasil dibuat.
✅ **Offline Support**: Bookmark tersimpan menggunakan IndexedDB dan dapat diakses tanpa koneksi.
✅ **Map Interaktif**: Lokasi dapat dipilih menggunakan Leaflet map dengan drag marker.
✅ **Halaman Detail Cerita**: Menampilkan info lengkap, gambar, lokasi, dan waktu pembuatan.
✅ **Responsive Design**: Tampilan mobile-friendly dan nyaman digunakan di berbagai perangkat.
✅ **Deployable Publicly**: Aplikasi ini dapat di-deploy ke platform seperti Netlify, Firebase Hosting, atau GitHub Pages.

---