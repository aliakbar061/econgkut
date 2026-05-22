# ECOngkut - Frontend

<div align="center">
  <h3>Platform Pemesanan Truk Sampah yang Mudah, Cepat, dan Ramah Lingkungan</h3>
  <p>Pengangkutan sampah organik dan non-organik yang dapat didaur ulang</p>
</div>

## 🌍 Latar Belakang

Proyek ECOngkut lahir dari kepedulian kami terhadap kondisi pemulung sampah di kota-kota besar yang seringkali tidak memiliki pekerjaan lain dan tinggal di tempat yang tidak memadai. Kami melihat bahwa ada kesenjangan antara kebutuhan masyarakat untuk mengelola sampah dengan baik dan peluang ekonomi bagi pemulung.

Dengan didukung oleh teknologi AI dan dikembangkan dengan ide-ide inovatif dari tim kami, ECOngkut hadir sebagai solusi yang menghubungkan masyarakat dengan jasa pengangkutan sampah yang profesional, sekaligus memberdayakan para pemulung untuk mendapatkan penghasilan yang lebih layak.

## 🎥 Demo Video

Tonton demo aplikasi ECOngkut di bawah ini:

1. **Demo 1** - [Lihat Video](https://drive.google.com/file/d/1myoaayN1deTTL-xxXEq9mZUBdbypondY/view?usp=drive_link)
2. **Demo 2** - [Lihat Video](https://drive.google.com/file/d/14Pb2xsGVmeFus3AezJdkfgcOPoQmP_Bq/view?usp=drive_link)
3. **Demo 3** - [Lihat Video](https://drive.google.com/file/d/1xnXjO0Q-ThhfWymzZ8Bu-ZpUvmiii5Ng/view?usp=drive_link)

## 🔗 Links

- **Demo Frontend**: [https://econgkut.vercel.app/](https://econgkut.vercel.app/)
- **Repository Frontend**: [https://github.com/aliakbar061/econgkut](https://github.com/aliakbar061/econgkut)
- **Repository Backend**: [https://github.com/aliakbar061/backend-econgkut](https://github.com/aliakbar061/backend-econgkut)

## ✨ Fitur Utama

- 🚛 Pemesanan truk sampah online yang mudah dan cepat
- ♻️ Pemisahan sampah organik dan non-organik
- 🔐 Autentikasi dengan Google OAuth
- 📱 Responsive design untuk semua perangkat
- 🗺️ Pelacakan lokasi dan status pengangkutan
- 💰 Sistem pembayaran yang transparan

## 🛠️ Teknologi yang Digunakan

- React.js
- Tailwind CSS untuk styling
- Shadcn/UI untuk komponen UI
- CRACO (Create React App Configuration Override)
- Google OAuth 2.0
- Axios untuk HTTP requests
- React Router untuk navigasi
- Custom hooks untuk logika reusable
- PostCSS untuk processing CSS

## 📋 Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:

- [Node.js](https://nodejs.org/) (versi 14 atau lebih baru)
- [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)
- Git

## 🚀 Instalasi dan Menjalankan Proyek

### 1. Clone Repository

```bash
git clone https://github.com/aliakbar061/econgkut.git
cd econgkut
```

### 2. Install Dependencies

```bash
npm install
```

atau jika menggunakan yarn:

```bash
yarn install
```

**Dependencies utama yang akan terinstall:**
- React dan React DOM
- Tailwind CSS
- Shadcn/UI components
- Axios
- React Router
- CRACO

### 3. Konfigurasi Environment Variables

Buat file `.env` di root directory proyek dan isi dengan konfigurasi berikut:

```env
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
REACT_APP_BACKEND_URL=http://localhost:5000
WDS_SOCKET_PORT=443
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
```

**Penjelasan Environment Variables:**

- `REACT_APP_GOOGLE_CLIENT_ID`: Client ID dari Google Cloud Console untuk OAuth
- `REACT_APP_BACKEND_URL`: URL backend API (gunakan URL backend lokal atau production)
- `WDS_SOCKET_PORT`: Port untuk WebSocket Development Server
- `REACT_APP_ENABLE_VISUAL_EDITS`: Enable/disable visual editing mode
- `ENABLE_HEALTH_CHECK`: Enable/disable health check endpoint

**Cara Mendapatkan Google Client ID:**

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Aktifkan Google+ API
4. Buka "Credentials" dan buat OAuth 2.0 Client ID
5. Pilih "Web application" sebagai application type
6. Tambahkan authorized redirect URIs:
   - `http://localhost:3000` (untuk development)
   - `https://econgkut.vercel.app` (untuk production)
7. Copy Client ID yang dihasilkan

### 4. Menjalankan Aplikasi dalam Mode Development

```bash
npm start
```

atau dengan yarn:

```bash
yarn start
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

Browser akan otomatis terbuka dan aplikasi akan reload otomatis ketika Anda melakukan perubahan pada kode.

### 5. Build untuk Production

```bash
npm run build
```

atau dengan yarn:

```bash
yarn build
```

Perintah ini akan membuat folder `build` yang berisi aplikasi yang sudah dioptimasi untuk production.

### 6. Menjalankan Tests

```bash
npm test
```

Perintah ini akan menjalankan test runner dalam mode interactive watch.

## 📁 Struktur Proyek

```
econgkut/
├── node_modules/           # Dependencies
├── plugins/                # Custom plugins
├── public/                 # Static files
│   └── index.html         # HTML template
├── src/
│   ├── components/        # Reusable React components
│   ├── hooks/             # Custom React hooks
│   │   └── use-toast.js  # Toast notification hook
│   ├── lib/               # Utility libraries
│   │   └── utils.js      # Helper functions
│   ├── pages/             # Page components
│   ├── App.css            # App styles
│   ├── App.js             # Main App component
│   ├── index.css          # Global styles
│   └── index.js           # Entry point
├── .env                    # Environment variables
├── .gitignore             # Git ignore rules
├── components.json        # Shadcn/UI components config
├── craco.config.js        # CRACO configuration
├── jsconfig.json          # JavaScript config
├── package-lock.json      # Locked dependencies
├── package.json           # Project dependencies
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md              # Documentation
```

## 🔧 Scripts yang Tersedia

### `npm start`
Menjalankan aplikasi dalam mode development di [http://localhost:3000](http://localhost:3000)

### `npm test`
Menjalankan test runner dalam mode interactive watch

### `npm run build`
Build aplikasi untuk production ke folder `build`

### `npm run eject`
**Catatan: Ini adalah operasi satu arah. Setelah `eject`, Anda tidak bisa kembali!**

Jika Anda tidak puas dengan build tool dan konfigurasi, Anda dapat `eject` kapan saja.

## 🌐 Deployment

Aplikasi ini sudah di-deploy di Vercel. Untuk deployment Anda sendiri:

### Deploy ke Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login ke Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Set environment variables di Vercel Dashboard

### Deploy ke Platform Lain

Untuk informasi deployment ke platform lain, lihat [dokumentasi Create React App](https://facebook.github.io/create-react-app/docs/deployment)

## 🤝 Kontribusi

Kami menerima kontribusi dari siapa saja! Jika Anda ingin berkontribusi:

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan Anda (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 Catatan Penting

- Pastikan backend sudah berjalan sebelum menjalankan frontend
- Gunakan environment variables yang sesuai untuk development dan production
- Jangan commit file `.env` ke repository
- Proyek ini menggunakan Tailwind CSS dan Shadcn/UI untuk styling
- CRACO digunakan untuk override konfigurasi Create React App tanpa eject
- Custom hooks tersedia di folder `src/hooks/` untuk logika reusable

## 🐛 Troubleshooting

### Port 3000 sudah digunakan
Jika port 3000 sudah digunakan, Anda akan ditanya apakah ingin menggunakan port lain. Pilih 'Y' untuk menggunakan port yang tersedia.

### Build gagal
Jika build gagal, coba hapus folder `node_modules` dan `package-lock.json`, lalu install ulang:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Tailwind CSS tidak berfungsi
Pastikan `tailwind.config.js` dan `postcss.config.js` sudah dikonfigurasi dengan benar. Restart development server:
```bash
# Stop server (Ctrl+C)
npm start
```

### CRACO error
Jika terjadi error terkait CRACO, pastikan `craco.config.js` sudah ada dan dikonfigurasi dengan benar. Cek juga versi CRACO compatible dengan versi React yang digunakan.

## 📞 Kontak

Jika Anda memiliki pertanyaan atau saran, silakan hubungi kami melalui:

- GitHub Issues: [https://github.com/aliakbar061/econgkut/issues](https://github.com/aliakbar061/econgkut/issues)

## 📄 Lisensi

Proyek ini dilisensikan di bawah MIT License.

---

<div align="center">
  <p>Dibuat dengan ❤️ oleh Tim Viro3</p>
  <p>Untuk Lingkungan yang Lebih Bersih dan Pemulung yang Lebih Sejahtera</p>
</div>
