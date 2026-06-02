# Verification Profile — Laravel 12 + Tailwind CSS

Halaman **Verification Profile** untuk sistem verifikasi lawyer, dibangun menggunakan Laravel 12 Blade dan Tailwind CSS. Tampilan dibuat akurat mengikuti desain referensi UI yang diberikan.

---

## 📋 Prompt yang Digunakan

> *"Buatkan tampilan preview seperti referensi yang sudah saya bagikan. Design harus mirip dan akurat 100%. Pakai Laravel 12 dan Tailwind CSS."*

Referensi desain: screenshot halaman **Verification Profile** dengan Application ID `#LAW-2948-VER`, menampilkan:
- Professional Identity (avatar, nama, info grid, biografi)
- Biometric Identity Verification dengan AI Confidence Match (98%)
- Document Authenticity (5 dokumen: Identity Card, State Bar License, Legal Oath, Educational Degree, Expertise Certification)
- Bottom action bar: Internal Notes + tombol Reject / Request Revision / Approve Lawyer

---

## 📁 Struktur File

```
verification-profile/
├── README.md
├── verification-profile-preview.html          ← Preview standalone (buka langsung di browser)
└── resources/
    └── views/
        ├── layouts/
        │   └── app.blade.php                  ← Layout utama Laravel
        └── lawyer/
            └── verification.blade.php         ← Halaman Verification Profile
```

---

## 🚀 Cara Integrasi ke Laravel 12

### 1. Tambahkan Route

```php
// routes/web.php
use Illuminate\Support\Facades\Route;

Route::get('/lawyer/verification', function () {
    return view('lawyer.verification');
})->name('lawyer.verification');
```

### 2. Salin File View

Salin kedua file Blade ke dalam folder `resources/views/` proyek Laravel Anda:

```
resources/views/layouts/app.blade.php
resources/views/lawyer/verification.blade.php
```

### 3. Jalankan Aplikasi

```bash
php artisan serve
```

Buka browser: `http://localhost:8000/lawyer/verification`

---

## 🎨 Design System

| Elemen | Nilai |
|---|---|
| Primary Navy | `#1b3358` |
| Background | `#f0f2f5` |
| Card Background | `#ffffff` |
| Card Border | `#e4e9f0` |
| Text Primary | `#1e293b` |
| Text Muted | `#64748b` |
| Valid Green | `#16a34a` |
| Reject Red | `#ef4444` |
| Font Heading | Georgia, Cambria, serif |
| Font Body | system-ui, -apple-system, sans-serif |

---

## 📄 File 1: `resources/views/layouts/app.blade.php`

Layout utama Laravel dengan Tailwind CSS CDN dan semua custom CSS class yang digunakan di seluruh halaman.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Verification Profile')</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'navy': {
                            DEFAULT: '#1e3a5f',
                            light: '#2a4f7c',
                            dark: '#152b47',
                        },
                        'slate-bg': '#f0f2f5',
                        'card-bg': '#f8f9fb',
                    },
                    fontFamily: {
                        'serif': ['Georgia', 'Cambria', 'serif'],
                        'sans': ['system-ui', '-apple-system', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    <style>
        body {
            background-color: #f0f2f5;
            font-family: system-ui, -apple-system, sans-serif;
        }
        .card {
            background: #ffffff;
            border-radius: 12px;
            border: 1px solid #e8ecf0;
        }
        .section-title {
            font-family: Georgia, Cambria, serif;
            color: #1e3a5f;
            font-weight: 700;
        }
        .badge-valid {
            color: #1e8c4a;
            background: transparent;
        }
        .badge-optional {
            color: #888;
        }
        .badge-verified {
            background: #dbeafe;
            color: #1e3a5f;
            border: 1px solid #93c5fd;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            padding: 3px 10px 3px 8px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
        .status-pill {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 20px;
            padding: 5px 14px;
            font-size: 13px;
            color: #475569;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .status-dot {
            width: 8px;
            height: 8px;
            background: #94a3b8;
            border-radius: 50%;
            display: inline-block;
        }
        .info-cell {
            background: #f8f9fb;
            border-radius: 8px;
            padding: 12px 14px;
        }
        .info-label {
            font-size: 10px;
            letter-spacing: 0.08em;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            margin-bottom: 4px;
        }
        .info-value {
            font-size: 14px;
            font-weight: 500;
            color: #1e293b;
        }
        .doc-card {
            background: #f8f9fb;
            border: 1px solid #e8ecf0;
            border-radius: 10px;
            padding: 16px;
        }
        .view-scan-btn {
            background: #ffffff;
            border: 1px solid #dde3ea;
            border-radius: 6px;
            color: #374151;
            font-size: 13px;
            font-weight: 500;
            padding: 7px 14px;
            cursor: pointer;
            transition: background 0.15s;
        }
        .view-scan-btn:hover {
            background: #f1f5f9;
        }
        .download-btn {
            background: #ffffff;
            border: 1px solid #dde3ea;
            border-radius: 6px;
            padding: 7px 10px;
            cursor: pointer;
            color: #374151;
        }
        .upload-btn {
            background: #ffffff;
            border: 1px solid #dde3ea;
            border-radius: 6px;
            color: #374151;
            font-size: 13px;
            font-weight: 500;
            padding: 7px 14px;
            cursor: pointer;
        }
        .confidence-ring {
            width: 58px;
            height: 58px;
            border: 3px solid transparent;
            border-top-color: #1e3a5f;
            border-right-color: #1e3a5f;
            border-bottom-color: #1e3a5f;
            border-left-color: #cbd5e1;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        .face-photo {
            width: 100px;
            height: 110px;
            object-fit: cover;
            border-radius: 6px;
            background: #d1d5db;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .avatar-placeholder {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: #cbd5e1;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        .bio-box {
            background: #f8f9fb;
            border: 1px solid #e8ecf0;
            border-radius: 8px;
            padding: 16px;
            font-size: 13.5px;
            color: #374151;
            line-height: 1.65;
            max-height: 140px;
            overflow: hidden;
            position: relative;
        }
        .bio-box::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 36px;
            background: linear-gradient(transparent, #f8f9fb);
        }
        .btn-reject {
            border: 1.5px solid #ef4444;
            color: #ef4444;
            background: transparent;
            border-radius: 8px;
            padding: 10px 22px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.15s;
        }
        .btn-reject:hover {
            background: #fef2f2;
        }
        .btn-revision {
            border: 1.5px solid #d1d5db;
            color: #374151;
            background: transparent;
            border-radius: 8px;
            padding: 10px 22px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.15s;
        }
        .btn-revision:hover {
            background: #f9fafb;
        }
        .btn-approve {
            background: #1e3a5f;
            color: #ffffff;
            border: none;
            border-radius: 8px;
            padding: 10px 22px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: background 0.15s;
        }
        .btn-approve:hover {
            background: #152b47;
        }
        .doc-icon {
            width: 36px;
            height: 36px;
            background: #e8ecf0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .back-link {
            color: #475569;
            font-size: 14px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            text-decoration: none;
            margin-bottom: 20px;
        }
        .back-link:hover {
            color: #1e3a5f;
        }
        .internal-notes input {
            background: #ffffff;
            border: 1px solid #dde3ea;
            border-radius: 8px;
            padding: 10px 16px;
            font-size: 13.5px;
            color: #374151;
            width: 100%;
            outline: none;
        }
        .internal-notes input::placeholder {
            color: #9ca3af;
        }
        .section-label {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.1em;
            color: #94a3b8;
            text-transform: uppercase;
            margin-bottom: 12px;
        }
    </style>
    @stack('styles')
</head>
<body class="min-h-screen">
    @yield('content')
    @stack('scripts')
</body>
</html>
```

---

## 📄 File 2: `resources/views/lawyer/verification.blade.php`

Halaman utama Verification Profile yang meng-extend layout app dan berisi seluruh konten UI.

```blade
@extends('layouts.app')

@section('title', 'Verification Profile - #LAW-2948-VER')

@section('content')
<div class="min-h-screen" style="background:#f0f2f5; padding: 32px 40px 60px;">

    {{-- Back Link --}}
    <a href="#" class="back-link">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Lawyer Applications
    </a>

    {{-- Page Header --}}
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="section-title" style="font-size: 32px; margin-bottom: 4px;">Verification Profile</h1>
            <p style="color: #64748b; font-size: 14px;">Application ID: #LAW-2948-VER</p>
        </div>
        <div class="status-pill">
            <span class="status-dot"></span>
            Under Review
        </div>
    </div>

    {{-- Main Grid --}}
    <div style="display: grid; grid-template-columns: 380px 1fr; gap: 20px; margin-bottom: 20px;">

        {{-- LEFT COLUMN --}}
        <div class="card" style="padding: 28px;">

            {{-- Professional Identity --}}
            <h2 class="section-title" style="font-size: 18px; margin-bottom: 20px;">Professional Identity</h2>

            {{-- Avatar + Name --}}
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
                <div class="avatar-placeholder">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="#94a3b8">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                    </svg>
                </div>
                <div>
                    <div style="font-size: 20px; font-weight: 700; color: #1e293b; font-family: Georgia, serif; line-height: 1.2;">
                        Jonathan Sterling, J.D.
                    </div>
                    <div style="color: #64748b; font-size: 13.5px; margin-top: 3px;">Sterling &amp; Vance LLP</div>
                </div>
            </div>

            {{-- Info Grid --}}
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 28px;">
                <div class="info-cell">
                    <div class="info-label">Specialization</div>
                    <div class="info-value">Corporate Litigation</div>
                </div>
                <div class="info-cell">
                    <div class="info-label">Experience</div>
                    <div class="info-value">14 Years</div>
                </div>
                <div class="info-cell">
                    <div class="info-label">Jurisdiction</div>
                    <div class="info-value">New York State</div>
                </div>
                <div class="info-cell">
                    <div class="info-label">Bar Number</div>
                    <div class="info-value">NY - 489210</div>
                </div>
            </div>

            {{-- Professional Biography --}}
            <h2 class="section-title" style="font-size: 18px; margin-bottom: 14px;">Professional Biography</h2>
            <div class="bio-box">
                Jonathan Sterling is a senior partner at Sterling &amp; Vance LLP, specializing in complex corporate
                litigation and regulatory compliance. With over a decade of experience representing Fortune 500
                companies in high-stakes legal battles, he has established a reputation for meticulous preparation
                and strategic foresight. Prior to joining Sterling &amp; Vance, Jonathan served as lead counsel for
                several multinational corporations navigating cross-border disputes.
            </div>

        </div>

        {{-- RIGHT COLUMN --}}
        <div style="display: flex; flex-direction: column; gap: 20px;">

            {{-- Biometric Identity Verification --}}
            <div class="card" style="padding: 28px;">
                <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 20px;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <h2 class="section-title" style="font-size: 18px;">Biometric Identity Verification</h2>
                            <span class="badge-verified">
                                <svg width="13" height="13" fill="none" stroke="#1e3a5f" stroke-width="2.5" viewBox="0 0 24 24">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
                                Biometric Verified
                            </span>
                        </div>
                        <p style="color: #64748b; font-size: 13.5px; line-height: 1.6; margin-bottom: 18px;">
                            Automated comparison between live capture and submitted identification documents.
                        </p>

                        {{-- Confidence Match Card --}}
                        <div style="background: #f8f9fb; border: 1px solid #e8ecf0; border-radius: 10px; padding: 14px 18px; display: inline-flex; align-items: center; gap: 14px;">
                            <div style="position: relative; width: 58px; height: 58px; flex-shrink: 0;">
                                <svg width="58" height="58" viewBox="0 0 58 58" style="transform: rotate(-90deg);">
                                    <circle cx="29" cy="29" r="24" fill="none" stroke="#e2e8f0" stroke-width="4"/>
                                    <circle cx="29" cy="29" r="24" fill="none" stroke="#1e3a5f" stroke-width="4"
                                        stroke-dasharray="{{ round(2 * pi() * 24 * 0.98) }} {{ round(2 * pi() * 24) }}"
                                        stroke-linecap="round"/>
                                </svg>
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 13px; font-weight: 800; color: #1e293b;">
                                    98%
                                </div>
                            </div>
                            <div>
                                <div style="font-weight: 700; color: #1e293b; font-size: 14px;">AI Confidence Match</div>
                                <div style="color: #64748b; font-size: 12.5px; margin-top: 2px;">Facial geometry confirmed</div>
                            </div>
                        </div>
                    </div>

                    {{-- Face Photos --}}
                    <div style="display: flex; gap: 10px; flex-shrink: 0;">
                        <div style="text-align: center;">
                            <div style="width: 105px; height: 115px; border-radius: 8px; overflow: hidden; background: #e2e8f0; display: flex; align-items: center; justify-content: center; border: 1px solid #dde3ea;">
                                <svg width="50" height="60" viewBox="0 0 24 30" fill="#94a3b8">
                                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                                </svg>
                            </div>
                            <div style="font-size: 11px; color: #94a3b8; margin-top: 5px; font-weight: 500;">Live Capture</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="width: 105px; height: 115px; border-radius: 8px; overflow: hidden; background: #e9ebee; display: flex; align-items: center; justify-content: center; border: 1px solid #dde3ea;">
                                <svg width="50" height="60" viewBox="0 0 24 30" fill="#b0b8c4">
                                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                                </svg>
                            </div>
                            <div style="font-size: 11px; color: #94a3b8; margin-top: 5px; font-weight: 500;">ID Document</div>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Document Authenticity --}}
            <div class="card" style="padding: 28px;">
                <h2 class="section-title" style="font-size: 18px; margin-bottom: 20px;">Document Authenticity</h2>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">

                    {{-- Identity Card --}}
                    <div class="doc-card">
                        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div class="doc-icon">
                                    <svg width="18" height="18" fill="none" stroke="#64748b" stroke-width="1.8" viewBox="0 0 24 24">
                                        <rect x="3" y="5" width="18" height="14" rx="2"/>
                                        <circle cx="8.5" cy="11" r="2"/>
                                        <path d="M13 9h4M13 13h4M7 15h2"/>
                                    </svg>
                                </div>
                                <div>
                                    <div style="font-weight: 600; color: #1e293b; font-size: 14px;">Identity Card</div>
                                    <div style="color: #94a3b8; font-size: 11.5px; margin-top: 1px;">KTP / Passport / Driver's License</div>
                                </div>
                            </div>
                            <span style="color: #16a34a; font-size: 12.5px; font-weight: 600; display: flex; align-items: center; gap: 3px;">
                                <svg width="13" height="13" fill="none" stroke="#16a34a" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                                Valid
                            </span>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="view-scan-btn" style="flex: 1;">View Scan</button>
                            <button class="download-btn">
                                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {{-- State Bar License --}}
                    <div class="doc-card">
                        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div class="doc-icon">
                                    <svg width="18" height="18" fill="none" stroke="#64748b" stroke-width="1.8" viewBox="0 0 24 24">
                                        <path d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5"/>
                                    </svg>
                                </div>
                                <div>
                                    <div style="font-weight: 600; color: #1e293b; font-size: 14px;">State Bar License</div>
                                    <div style="color: #94a3b8; font-size: 11.5px; margin-top: 1px;">KAI / State Bar Association</div>
                                </div>
                            </div>
                            <span style="color: #16a34a; font-size: 12.5px; font-weight: 600; display: flex; align-items: center; gap: 3px;">
                                <svg width="13" height="13" fill="none" stroke="#16a34a" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                                Valid
                            </span>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="view-scan-btn" style="flex: 1;">View Scan</button>
                            <button class="download-btn">
                                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {{-- Legal Oath --}}
                    <div class="doc-card">
                        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div class="doc-icon">
                                    <svg width="18" height="18" fill="none" stroke="#64748b" stroke-width="1.8" viewBox="0 0 24 24">
                                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4"/>
                                    </svg>
                                </div>
                                <div>
                                    <div style="font-weight: 600; color: #1e293b; font-size: 14px;">Legal Oath</div>
                                    <div style="color: #94a3b8; font-size: 11.5px; margin-top: 1px;">Signed Declaration</div>
                                </div>
                            </div>
                            <span style="color: #16a34a; font-size: 12.5px; font-weight: 600; display: flex; align-items: center; gap: 3px;">
                                <svg width="13" height="13" fill="none" stroke="#16a34a" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                                Valid
                            </span>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="view-scan-btn" style="flex: 1;">View Scan</button>
                            <button class="download-btn">
                                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {{-- Educational Degree --}}
                    <div class="doc-card">
                        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div class="doc-icon">
                                    <svg width="18" height="18" fill="none" stroke="#64748b" stroke-width="1.8" viewBox="0 0 24 24">
                                        <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/>
                                        <path d="M6 12v5c3.33 1.67 6.67 1.67 10 0v-5"/>
                                    </svg>
                                </div>
                                <div>
                                    <div style="font-weight: 600; color: #1e293b; font-size: 14px;">Educational Degree</div>
                                    <div style="color: #94a3b8; font-size: 11.5px; margin-top: 1px;">Juris Doctor Certificate</div>
                                </div>
                            </div>
                            <span style="color: #16a34a; font-size: 12.5px; font-weight: 600; display: flex; align-items: center; gap: 3px;">
                                <svg width="13" height="13" fill="none" stroke="#16a34a" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                                Valid
                            </span>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="view-scan-btn" style="flex: 1;">View Scan</button>
                            <button class="download-btn">
                                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {{-- Expertise Certification (Optional) --}}
                    <div class="doc-card">
                        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div class="doc-icon">
                                    <svg width="18" height="18" fill="none" stroke="#64748b" stroke-width="1.8" viewBox="0 0 24 24">
                                        <circle cx="12" cy="8" r="4"/>
                                        <path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
                                        <path d="M15 4.354A4 4 0 0119 8M9 4.354A4 4 0 005 8"/>
                                    </svg>
                                </div>
                                <div>
                                    <div style="font-weight: 600; color: #1e293b; font-size: 14px;">Expertise Certification</div>
                                    <div style="color: #94a3b8; font-size: 11.5px; margin-top: 1px;">Optional Specialization Proof</div>
                                </div>
                            </div>
                            <span style="color: #94a3b8; font-size: 12.5px; font-weight: 500; display: flex; align-items: center; gap: 3px;">
                                <svg width="14" height="14" fill="none" stroke="#94a3b8" stroke-width="2" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M12 8v4M12 16h.01"/>
                                </svg>
                                Optional
                            </span>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="upload-btn" style="flex: 1; display: flex; align-items: center; gap: 6px; justify-content: center;">
                                Upload / View
                            </button>
                            <button class="download-btn" style="display: flex; align-items: center; justify-content: center;">
                                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M12 8v8M8 12h8"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    </div>

    {{-- Bottom Bar: Internal Notes + Action Buttons --}}
    <div style="margin-top: 8px;">
        <div class="section-label">Internal Notes (Optional)</div>
        <div style="display: flex; align-items: center; gap: 12px;">
            <div class="internal-notes" style="flex: 1;">
                <input type="text" placeholder="Add compliance notes here..." />
            </div>
            <button class="btn-reject">Reject Application</button>
            <button class="btn-revision">Request Revision</button>
            <button class="btn-approve">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
                Approve Lawyer
            </button>
        </div>
    </div>

</div>
@endsection
```

---

## 📄 File 3: `verification-profile-preview.html`

File HTML standalone yang bisa dibuka langsung di browser tanpa memerlukan Laravel. Berguna untuk presentasi, review desain, atau demo cepat.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Profile - #LAW-2948-VER</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; min-height: 100vh; }

        .card { background: #fff; border-radius: 14px; border: 1px solid #e4e9f0; }
        .section-title { font-family: Georgia, Cambria, 'Times New Roman', serif; color: #1b3358; font-weight: 700; }

        .status-pill {
            background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 20px;
            padding: 6px 16px; font-size: 13px; color: #475569;
            display: inline-flex; align-items: center; gap: 7px;
        }
        .status-dot { width: 8px; height: 8px; background: #94a3b8; border-radius: 50%; display: inline-block; }

        .info-cell { background: #f7f9fb; border-radius: 8px; padding: 12px 14px; }
        .info-label { font-size: 10px; letter-spacing: .09em; font-weight: 700; color: #9daec0; text-transform: uppercase; margin-bottom: 4px; }
        .info-value { font-size: 14px; font-weight: 600; color: #1e293b; }

        .badge-verified {
            background: #dbeafe; color: #1b3358; border: 1px solid #93c5fd;
            border-radius: 20px; font-size: 11px; font-weight: 700;
            padding: 4px 11px 4px 8px; display: inline-flex; align-items: center; gap: 5px;
        }

        .doc-card { background: #f7f9fb; border: 1px solid #e4e9f0; border-radius: 10px; padding: 16px; }
        .doc-icon {
            width: 37px; height: 37px; background: #e8edf3; border-radius: 8px;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        .btn-base { border-radius: 7px; padding: 9px 0; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; white-space: nowrap; }
        .view-scan-btn { background: #fff; border: 1px solid #dde3ea; color: #374151; flex: 1; }
        .view-scan-btn:hover { background: #f1f5f9; }
        .icon-btn { background: #fff; border: 1px solid #dde3ea; border-radius: 7px; width: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #374151; flex-shrink: 0; }
        .upload-btn { background: #fff; border: 1px solid #dde3ea; color: #374151; flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; }

        .btn-reject { border: 1.5px solid #ef4444; color: #ef4444; background: transparent; border-radius: 8px; padding: 10px 22px; font-weight: 600; font-size: 14px; cursor: pointer; white-space: nowrap; }
        .btn-reject:hover { background: #fef2f2; }
        .btn-revision { border: 1.5px solid #d1d5db; color: #374151; background: transparent; border-radius: 8px; padding: 10px 22px; font-weight: 600; font-size: 14px; cursor: pointer; white-space: nowrap; }
        .btn-revision:hover { background: #f9fafb; }
        .btn-approve { background: #1b3358; color: #fff; border: none; border-radius: 8px; padding: 10px 22px; font-weight: 600; font-size: 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; }
        .btn-approve:hover { background: #122540; }

        .bio-box {
            background: #f7f9fb; border: 1px solid #e4e9f0; border-radius: 8px;
            padding: 16px; font-size: 13.5px; color: #374151; line-height: 1.7;
            max-height: 145px; overflow: hidden; position: relative;
        }
        .bio-box::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 40px; background: linear-gradient(transparent, #f7f9fb); }

        .notes-input { width: 100%; background: #fff; border: 1px solid #dde3ea; border-radius: 8px; padding: 11px 16px; font-size: 13.5px; color: #374151; outline: none; font-family: inherit; }
        .notes-input::placeholder { color: #9ca3af; }

        .valid-badge { color: #16a34a; font-size: 12.5px; font-weight: 600; display: flex; align-items: center; gap: 3px; flex-shrink: 0; }
        .optional-badge { color: #9ca3af; font-size: 12.5px; font-weight: 500; display: flex; align-items: center; gap: 3px; flex-shrink: 0; }

        .back-link { color: #475569; font-size: 14px; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; }
        .back-link:hover { color: #1b3358; }

        .face-img { width: 106px; height: 118px; border-radius: 8px; background: #dde3ea; border: 1px solid #d0d7e2; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; }
        .section-note { font-size: 10px; font-weight: 700; letter-spacing: .1em; color: #9daec0; text-transform: uppercase; margin-bottom: 10px; }
    </style>
</head>
<body>
<div style="padding: 32px 44px 56px; max-width: 1200px; margin: 0 auto;">

    <!-- Back Link -->
    <a href="#" class="back-link" style="margin-bottom: 22px; display: inline-flex;">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Lawyer Applications
    </a>

    <!-- Header -->
    <div style="display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 28px;">
        <div>
            <h1 class="section-title" style="font-size: 33px; margin-bottom: 5px;">Verification Profile</h1>
            <p style="color: #64748b; font-size: 14px;">Application ID: <span style="color: #334155;">#LAW-2948-VER</span></p>
        </div>
        <div class="status-pill">
            <span class="status-dot"></span>
            Under Review
        </div>
    </div>

    <!-- Main Grid -->
    <div style="display: grid; grid-template-columns: 375px 1fr; gap: 20px; margin-bottom: 18px;">

        <!-- LEFT: Professional Identity -->
        <div class="card" style="padding: 28px 26px;">
            <h2 class="section-title" style="font-size: 18px; margin-bottom: 20px;">Professional Identity</h2>
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
                <div style="width: 64px; height: 64px; border-radius: 50%; background: #cfd6df; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden;">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="#8595a8">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                    </svg>
                </div>
                <div>
                    <div style="font-size: 20px; font-weight: 700; color: #1e293b; font-family: Georgia, serif; line-height: 1.25;">Jonathan Sterling, J.D.</div>
                    <div style="color: #64748b; font-size: 13.5px; margin-top: 4px;">Sterling &amp; Vance LLP</div>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 26px;">
                <div class="info-cell"><div class="info-label">Specialization</div><div class="info-value">Corporate Litigation</div></div>
                <div class="info-cell"><div class="info-label">Experience</div><div class="info-value">14 Years</div></div>
                <div class="info-cell"><div class="info-label">Jurisdiction</div><div class="info-value">New York State</div></div>
                <div class="info-cell"><div class="info-label">Bar Number</div><div class="info-value">NY - 489210</div></div>
            </div>
            <h2 class="section-title" style="font-size: 18px; margin-bottom: 14px;">Professional Biography</h2>
            <div class="bio-box">
                Jonathan Sterling is a senior partner at Sterling &amp; Vance LLP, specializing in complex corporate litigation and regulatory compliance. With over a decade of experience representing Fortune 500 companies in high-stakes legal battles, he has established a reputation for meticulous preparation and strategic foresight. Prior to joining Sterling &amp; Vance, Jonathan served as lead counsel for several multinational corporations navigating complex cross-border disputes.
            </div>
        </div>

        <!-- RIGHT COLUMN -->
        <div style="display: flex; flex-direction: column; gap: 20px;">

            <!-- Biometric Card -->
            <div class="card" style="padding: 28px 26px;">
                <div style="display: flex; align-items: flex-start; gap: 24px;">
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;">
                            <h2 class="section-title" style="font-size: 18px;">Biometric Identity Verification</h2>
                            <span class="badge-verified">
                                <svg width="12" height="12" fill="none" stroke="#1b3358" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                                Biometric Verified
                            </span>
                        </div>
                        <p style="color: #64748b; font-size: 13.5px; line-height: 1.65; margin-bottom: 18px;">
                            Automated comparison between live capture and submitted identification documents.
                        </p>
                        <div style="background: #f7f9fb; border: 1px solid #e4e9f0; border-radius: 10px; padding: 14px 18px; display: inline-flex; align-items: center; gap: 14px;">
                            <div style="position: relative; width: 60px; height: 60px; flex-shrink: 0;">
                                <svg width="60" height="60" viewBox="0 0 60 60">
                                    <circle cx="30" cy="30" r="24" fill="none" stroke="#e2e8f0" stroke-width="4.5"/>
                                    <circle cx="30" cy="30" r="24" fill="none" stroke="#1b3358" stroke-width="4.5"
                                        stroke-dasharray="148 151" stroke-dashoffset="38"
                                        stroke-linecap="round" transform="rotate(-90 30 30)"/>
                                </svg>
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 12px; font-weight: 800; color: #1e293b;">98%</div>
                            </div>
                            <div>
                                <div style="font-weight: 700; color: #1e293b; font-size: 14px;">AI Confidence Match</div>
                                <div style="color: #64748b; font-size: 12.5px; margin-top: 3px;">Facial geometry confirmed</div>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; flex-shrink: 0;">
                        <div style="text-align: center;">
                            <div class="face-img">
                                <svg width="44" height="52" viewBox="0 0 24 30" fill="#9daec0"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                            </div>
                            <div style="font-size: 11px; color: #94a3b8; margin-top: 6px; font-weight: 500;">Live Capture</div>
                        </div>
                        <div style="text-align: center;">
                            <div class="face-img" style="background: #e5e9ee;">
                                <svg width="44" height="52" viewBox="0 0 24 30" fill="#b0b9c4"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                            </div>
                            <div style="font-size: 11px; color: #94a3b8; margin-top: 6px; font-weight: 500;">ID Document</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Document Authenticity -->
            <div class="card" style="padding: 28px 26px;">
                <h2 class="section-title" style="font-size: 18px; margin-bottom: 20px;">Document Authenticity</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">

                    <!-- Identity Card -->
                    <div class="doc-card">
                        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 13px;">
                            <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                                <div class="doc-icon"><svg width="18" height="18" fill="none" stroke="#64748b" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="11" r="2"/><path d="M13 9h4M13 13h4"/></svg></div>
                                <div><div style="font-weight: 700; color: #1e293b; font-size: 13.5px;">Identity Card</div><div style="color: #9daec0; font-size: 11.5px; margin-top: 2px;">KTP / Passport / Driver's License</div></div>
                            </div>
                            <span class="valid-badge"><svg width="13" height="13" fill="none" stroke="#16a34a" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>Valid</span>
                        </div>
                        <div style="display: flex; gap: 8px;"><button class="btn-base view-scan-btn" style="padding: 8px 0;">View Scan</button><button class="icon-btn" style="height: 36px;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg></button></div>
                    </div>

                    <!-- State Bar License -->
                    <div class="doc-card">
                        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 13px;">
                            <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                                <div class="doc-icon"><svg width="18" height="18" fill="none" stroke="#64748b" stroke-width="1.8" viewBox="0 0 24 24"><path d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5"/></svg></div>
                                <div><div style="font-weight: 700; color: #1e293b; font-size: 13.5px;">State Bar License</div><div style="color: #9daec0; font-size: 11.5px; margin-top: 2px;">KAI / State Bar Association</div></div>
                            </div>
                            <span class="valid-badge"><svg width="13" height="13" fill="none" stroke="#16a34a" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>Valid</span>
                        </div>
                        <div style="display: flex; gap: 8px;"><button class="btn-base view-scan-btn" style="padding: 8px 0;">View Scan</button><button class="icon-btn" style="height: 36px;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg></button></div>
                    </div>

                    <!-- Legal Oath -->
                    <div class="doc-card">
                        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 13px;">
                            <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                                <div class="doc-icon"><svg width="18" height="18" fill="none" stroke="#64748b" stroke-width="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4"/></svg></div>
                                <div><div style="font-weight: 700; color: #1e293b; font-size: 13.5px;">Legal Oath</div><div style="color: #9daec0; font-size: 11.5px; margin-top: 2px;">Signed Declaration</div></div>
                            </div>
                            <span class="valid-badge"><svg width="13" height="13" fill="none" stroke="#16a34a" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>Valid</span>
                        </div>
                        <div style="display: flex; gap: 8px;"><button class="btn-base view-scan-btn" style="padding: 8px 0;">View Scan</button><button class="icon-btn" style="height: 36px;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg></button></div>
                    </div>

                    <!-- Educational Degree -->
                    <div class="doc-card">
                        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 13px;">
                            <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                                <div class="doc-icon"><svg width="18" height="18" fill="none" stroke="#64748b" stroke-width="1.8" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/><path d="M6 12v5c3.33 1.67 6.67 1.67 10 0v-5"/></svg></div>
                                <div><div style="font-weight: 700; color: #1e293b; font-size: 13.5px;">Educational Degree</div><div style="color: #9daec0; font-size: 11.5px; margin-top: 2px;">Juris Doctor Certificate</div></div>
                            </div>
                            <span class="valid-badge"><svg width="13" height="13" fill="none" stroke="#16a34a" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>Valid</span>
                        </div>
                        <div style="display: flex; gap: 8px;"><button class="btn-base view-scan-btn" style="padding: 8px 0;">View Scan</button><button class="icon-btn" style="height: 36px;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg></button></div>
                    </div>

                    <!-- Expertise Certification -->
                    <div class="doc-card">
                        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 13px;">
                            <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                                <div class="doc-icon"><svg width="18" height="18" fill="none" stroke="#64748b" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg></div>
                                <div><div style="font-weight: 700; color: #1e293b; font-size: 13.5px;">Expertise Certification</div><div style="color: #9daec0; font-size: 11.5px; margin-top: 2px;">Optional Specialization Proof</div></div>
                            </div>
                            <span class="optional-badge"><svg width="14" height="14" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>Optional</span>
                        </div>
                        <div style="display: flex; gap: 8px;"><button class="btn-base upload-btn" style="padding: 8px 0;">Upload / View</button><button class="icon-btn" style="height: 36px;"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg></button></div>
                    </div>

                </div>
            </div>
        </div>
    </div>

    <!-- Bottom Bar -->
    <div style="margin-top: 8px;">
        <div class="section-note">Internal Notes (Optional)</div>
        <div style="display: flex; align-items: center; gap: 12px;">
            <input class="notes-input" type="text" placeholder="Add compliance notes here..." style="flex: 1; min-width: 0;" />
            <button class="btn-reject">Reject Application</button>
            <button class="btn-revision">Request Revision</button>
            <button class="btn-approve">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
                Approve Lawyer
            </button>
        </div>
    </div>

</div>
</body>
</html>
```

---

## ✅ Komponen UI yang Diimplementasikan

- **Back navigation** — link kembali ke daftar aplikasi
- **Page header** — judul + Application ID + status pill "Under Review"
- **Professional Identity card** — avatar placeholder, nama dengan serif font, info grid 2 kolom (Specialization, Experience, Jurisdiction, Bar Number), Professional Biography dengan fade gradient
- **Biometric Identity Verification card** — badge "Biometric Verified", SVG circular progress ring 98%, label AI Confidence Match, dua foto placeholder (Live Capture & ID Document)
- **Document Authenticity card** — 5 doc cards dalam grid 2 kolom: Identity Card ✓, State Bar License ✓, Legal Oath ✓, Educational Degree ✓, Expertise Certification (Optional)
- **Bottom action bar** — input Internal Notes + tombol Reject Application (merah), Request Revision (abu), Approve Lawyer (navy)

---

*Generated with Laravel 12 + Tailwind CSS CDN*
