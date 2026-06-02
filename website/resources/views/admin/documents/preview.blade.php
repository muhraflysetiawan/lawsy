<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Verification Profile - #LAW-2948-VER</title>
    
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'navy-custom': '#1B3358',
                        'slate-custom': '#64748B',
                        'border-custom': '#E4E9F0',
                        'bg-soft': '#F8FAFC',
                    },
                    fontFamily: {
                        serif: ['Poppins', 'serif'],
                        sans: ['Poppins', 'sans-serif'],
                    }
                }
            }
        }
    </script>

    <style>
        body { background: #f0f2f5; }
        .card { background: #fff; border-radius: 14px; border: 1px solid #e4e9f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .section-title { font-family: 'Playfair Display', serif; color: #1B3358; font-weight: 700; }
        .status-pill {
            background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 20px;
            padding: 6px 16px; font-size: 13px; color: #475569;
            display: inline-flex; align-items: center; gap: 7px;
        }
        .status-dot { width: 8px; height: 8px; background: #94a3b8; border-radius: 50%; display: inline-block; }
        .info-cell { background: #f7f9fb; border-radius: 8px; padding: 12px 14px; border: 1px solid #f1f5f9; }
        .info-label { font-size: 10px; letter-spacing: .09em; font-weight: 700; color: #9daec0; text-transform: uppercase; margin-bottom: 4px; }
        .info-value { font-size: 14px; font-weight: 600; color: #1e293b; }
        .badge-verified {
            background: #dbeafe; color: #1b3358; border: 1px solid #93c5fd;
            border-radius: 20px; font-size: 11px; font-weight: 700;
            padding: 4px 11px 4px 8px; display: inline-flex; align-items: center; gap: 5px;
        }
        .doc-card { background: #f7f9fb; border: 1px solid #e4e9f0; border-radius: 10px; padding: 16px; transition: all 0.2s; }
        .doc-card:hover { border-color: #cbd5e1; background: #fff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .doc-icon {
            width: 37px; height: 37px; background: #e8edf3; border-radius: 8px;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .btn-base {
            border-radius: 7px; padding: 9px 0; font-size: 13px; font-weight: 600;
            cursor: pointer; transition: all .15s; white-space: nowrap;
        }
        .view-scan-btn { background: #fff; border: 1px solid #dde3ea; color: #374151; flex: 1; }
        .view-scan-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }
        .icon-btn {
            background: #fff; border: 1px solid #dde3ea; border-radius: 7px;
            width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
            cursor: pointer; color: #374151; flex-shrink: 0; transition: all 0.15s;
        }
        .icon-btn:hover { border-color: #cbd5e1; background: #f1f5f9; color: #1B3358; }
        .upload-btn { background: #fff; border: 1px solid #dde3ea; color: #374151; flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .btn-reject { border: 1.5px solid #ef4444; color: #ef4444; background: transparent; border-radius: 8px; padding: 10px 22px; font-weight: 600; font-size: 14px; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
        .btn-reject:hover { background: #fef2f2; }
        .btn-revision { border: 1.5px solid #d1d5db; color: #374151; background: transparent; border-radius: 8px; padding: 10px 22px; font-weight: 600; font-size: 14px; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
        .btn-revision:hover { background: #f9fafb; }
        .btn-approve { background: #1B3358; color: #fff; border: none; border-radius: 8px; padding: 10px 22px; font-weight: 600; font-size: 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; transition: all 0.15s; }
        .btn-approve:hover { background: #122540; transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .bio-box {
            background: #f7f9fb; border: 1px solid #e4e9f0; border-radius: 8px;
            padding: 16px; font-size: 13.5px; color: #374151; line-height: 1.7;
            max-height: 145px; overflow: hidden; position: relative;
        }
        .bio-box::after {
            content: ''; position: absolute; bottom: 0; left: 0; right: 0;
            height: 40px; background: linear-gradient(transparent, #f7f9fb);
        }
        .notes-input {
            width: 100%; background: #fff; border: 1px solid #dde3ea;
            border-radius: 8px; padding: 11px 16px; font-size: 13.5px;
            color: #374151; outline: none; font-family: inherit; transition: all 0.2s;
        }
        .notes-input:focus { border-color: #1B3358; box-shadow: 0 0 0 3px rgba(27, 51, 88, 0.05); }
        .valid-badge { color: #16a34a; font-size: 12.5px; font-weight: 600; display: flex; align-items: center; gap: 3px; flex-shrink: 0; }
        .optional-badge { color: #9ca3af; font-size: 12.5px; font-weight: 500; display: flex; align-items: center; gap: 3px; flex-shrink: 0; }
        .back-link { color: #475569; font-size: 14px; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; transition: color 0.2s; }
        .back-link:hover { color: #1B3358; }
        .face-img {
            width: 106px; height: 118px; border-radius: 8px; background: #dde3ea;
            border: 1px solid #d0d7e2; display: flex; flex-direction: column;
            align-items: center; justify-content: center; overflow: hidden; position: relative;
        }
        .face-img img { width: 100%; height: 100%; object-fit: cover; }
        .section-note { font-size: 10px; font-weight: 700; letter-spacing: .1em; color: #9daec0; text-transform: uppercase; margin-bottom: 10px; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
    </style>
</head>
<body class="flex h-screen bg-[#F0F2F5] overflow-hidden text-[#1A1A1A]">

    {{-- @include('admin.components.sidebar') --}}

    <!-- Main Content -->
    <div class="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        <!-- Header -->
        <header class="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between shrink-0">
            <!-- Left: Back & Title -->
            <div class="flex items-center gap-4">
                <a href="javascript:history.back()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F8FAFC] transition-all text-[#475569]">
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </a>
                <h1 class="text-xl font-bold text-[#1A1A1A]">Verification Profile</h1>
            </div>

            <!-- Profile -->
            <div class="flex items-center gap-6">
                <!-- User Profile -->
                <div class="flex items-center gap-3">
                    <div class="text-right">
                        <p class="text-[10px] font-bold text-[#8B95A5] uppercase tracking-wider">Admin Panel</p>
                        <p class="text-sm font-bold text-[#1A1A1A]">{{ Auth::user()->name }}</p>
                    </div>
                    @if(Auth::user()->avatar)
                        <img src="{{ asset('storage/' . Auth::user()->avatar) }}" class="w-10 h-10 rounded-full border border-[#D1E2F2] object-cover shadow-sm">
                    @else
                        <div class="w-10 h-10 bg-[#EBF3FA] rounded-full flex items-center justify-center text-[#1D5083] font-bold border border-[#D1E2F2]">
                            {{ strtoupper(substr(Auth::user()->name, 0, 1)) }}
                        </div>
                    @endif
                </div>
            </div>
        </header>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto custom-scrollbar" style="padding: 32px 44px 100px;">
            <div class="max-w-[1200px] mx-auto">
                
                <!-- Header Info -->
                <div class="flex items-center justify-between mb-8">
                    <div>
                        <p class="text-slate-500 text-sm font-medium">Application ID: <span class="text-[#1D5083] font-bold">#LAW-2948-VER</span></p>
                    </div>
                    <div class="status-pill">
                        <span class="status-dot"></span>
                        Under Review
                    </div>
                </div>

                <!-- Main Grid -->
                <div class="grid grid-cols-1 xl:grid-cols-[375px_1fr] gap-5 mb-5">

                    <!-- LEFT: Professional Identity -->
                    <div class="card p-7">
                        <h2 class="section-title text-lg mb-5">Professional Identity</h2>

                        <!-- Avatar Row -->
                        <div class="flex items-center gap-4 mb-6">
                            <div class="w-16 h-16 rounded-full bg-[#CFD6DF] flex items-center justify-center shrink-0 overflow-hidden border-2 border-white shadow-sm">
                                <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&h=120&fit=crop" alt="Jonathan Sterling" class="w-full h-full object-cover">
                            </div>
                            <div>
                                <div class="text-[20px] font-bold text-[#1E293B] font-serif leading-tight">Jonathan Sterling, J.D.</div>
                                <div class="text-slate-500 text-[13.5px] mt-1">Sterling & Vance LLP</div>
                            </div>
                        </div>

                        <!-- Info Grid -->
                        <div class="grid grid-cols-2 gap-2.5 mb-7">
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

                        <!-- Bio -->
                        <h2 class="section-title text-lg mb-3.5">Professional Biography</h2>
                        <div class="bio-box">
                            Jonathan Sterling is a senior partner at Sterling & Vance LLP, specializing in complex corporate litigation and regulatory compliance. With over a decade of experience representing Fortune 500 companies in high-stakes legal battles, he has established a reputation for meticulous preparation and strategic foresight. Prior to joining Sterling & Vance, Jonathan served as lead counsel for several multinational corporations navigating complex cross-border disputes.
                        </div>
                    </div>

                    <!-- RIGHT COLUMN -->
                    <div class="flex flex-col gap-5">

                        <!-- Biometric Card -->
                        <div class="card p-7">
                            <div class="flex flex-col md:flex-row items-start gap-6">
                                <div class="flex-1 min-width-0">
                                    <div class="flex items-center gap-3 mb-2.5 flex-wrap">
                                        <h2 class="section-title text-lg">Biometric Identity Verification</h2>
                                        <span class="badge-verified">
                                            <svg width="12" height="12" fill="none" stroke="#1B3358" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                                            Biometric Verified
                                        </span>
                                    </div>
                                    <p class="text-slate-500 text-[13.5px] leading-relaxed mb-5">
                                        Automated comparison between live capture and submitted identification documents.
                                    </p>

                                    <!-- AI Confidence -->
                                    <div class="bg-[#F7F9FB] border border-[#E4E9F0] rounded-xl p-4 flex items-center gap-4 inline-flex shadow-sm">
                                        <!-- SVG Ring -->
                                        <div class="relative w-[60px] h-[60px] shrink-0">
                                            <svg width="60" height="60" viewBox="0 0 60 60">
                                                <circle cx="30" cy="30" r="24" fill="none" stroke="#E2E8F0" stroke-width="4.5"/>
                                                <circle cx="30" cy="30" r="24" fill="none" stroke="#1B3358" stroke-width="4.5"
                                                    stroke-dasharray="148 151" stroke-dashoffset="38"
                                                    stroke-linecap="round" transform="rotate(-90 30 30)"/>
                                            </svg>
                                            <div class="absolute inset-0 flex items-center justify-center text-[12px] font-extrabold text-[#1E293B]">98%</div>
                                        </div>
                                        <div>
                                            <div class="font-bold text-[#1E293B] text-[14px]">AI Confidence Match</div>
                                            <div class="text-slate-500 text-[12.5px] mt-0.5">Facial geometry confirmed</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Face Photos -->
                                <div class="flex gap-2.5 shrink-0">
                                    <div class="text-center">
                                        <div class="face-img shadow-sm border-[#CBD5E1]">
                                            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=110&h=120&fit=crop" alt="Live Capture">
                                        </div>
                                        <div class="text-[11px] text-slate-400 mt-1.5 font-medium">Live Capture</div>
                                    </div>
                                    <div class="text-center">
                                        <div class="face-img shadow-sm bg-[#E5E9EE]">
                                            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=110&h=120&fit=crop&sat=-100" alt="ID Document" class="grayscale contrast-125">
                                        </div>
                                        <div class="text-[11px] text-slate-400 mt-1.5 font-medium">ID Document</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Document Authenticity -->
                        <div class="card p-7">
                            <h2 class="section-title text-lg mb-5">Document Authenticity</h2>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <!-- Identity Card -->
                                <div class="doc-card">
                                    <div class="flex items-start justify-between gap-2 mb-3">
                                        <div class="flex items-center gap-2.5 min-w-0">
                                            <div class="doc-icon">
                                                <svg width="18" height="18" fill="none" stroke="#64748B" stroke-width="1.8" viewBox="0 0 24 24">
                                                    <rect x="3" y="5" width="18" height="14" rx="2"/>
                                                    <circle cx="8.5" cy="11" r="2"/>
                                                    <path d="M13 9h4M13 13h4"/>
                                                </svg>
                                            </div>
                                            <div class="truncate">
                                                <div class="font-bold text-[#1E293B] text-[13.5px]">Identity Card</div>
                                                <div class="text-[#9DAEC0] text-[11.5px] mt-0.5 truncate">KTP / Passport / Driver's License</div>
                                            </div>
                                        </div>
                                        <span class="valid-badge">
                                            <svg width="13" height="13" fill="none" stroke="#16A34A" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                                            Valid
                                        </span>
                                    </div>
                                    <div class="flex gap-2">
                                        <button class="btn-base view-scan-btn py-2">View Scan</button>
                                        <button class="icon-btn">
                                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                                        </button>
                                    </div>
                                </div>

                                <!-- State Bar License -->
                                <div class="doc-card">
                                    <div class="flex items-start justify-between gap-2 mb-3">
                                        <div class="flex items-center gap-2.5 min-w-0">
                                            <div class="doc-icon">
                                                <svg width="18" height="18" fill="none" stroke="#64748B" stroke-width="1.8" viewBox="0 0 24 24">
                                                    <path d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5"/>
                                                </svg>
                                            </div>
                                            <div class="truncate">
                                                <div class="font-bold text-[#1E293B] text-[13.5px]">State Bar License</div>
                                                <div class="text-[#9DAEC0] text-[11.5px] mt-0.5 truncate">KAI / State Bar Association</div>
                                            </div>
                                        </div>
                                        <span class="valid-badge">
                                            <svg width="13" height="13" fill="none" stroke="#16A34A" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                                            Valid
                                        </span>
                                    </div>
                                    <div class="flex gap-2">
                                        <button class="btn-base view-scan-btn py-2">View Scan</button>
                                        <button class="icon-btn">
                                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                                        </button>
                                    </div>
                                </div>

                                <!-- Legal Oath -->
                                <div class="doc-card">
                                    <div class="flex items-start justify-between gap-2 mb-3">
                                        <div class="flex items-center gap-2.5 min-w-0">
                                            <div class="doc-icon">
                                                <svg width="18" height="18" fill="none" stroke="#64748B" stroke-width="1.8" viewBox="0 0 24 24">
                                                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4"/>
                                                </svg>
                                            </div>
                                            <div class="truncate">
                                                <div class="font-bold text-[#1E293B] text-[13.5px]">Legal Oath</div>
                                                <div class="text-[#9DAEC0] text-[11.5px] mt-0.5 truncate">Signed Declaration</div>
                                            </div>
                                        </div>
                                        <span class="valid-badge">
                                            <svg width="13" height="13" fill="none" stroke="#16A34A" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                                            Valid
                                        </span>
                                    </div>
                                    <div class="flex gap-2">
                                        <button class="btn-base view-scan-btn py-2">View Scan</button>
                                        <button class="icon-btn">
                                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                                        </button>
                                    </div>
                                </div>

                                <!-- Educational Degree -->
                                <div class="doc-card">
                                    <div class="flex items-start justify-between gap-2 mb-3">
                                        <div class="flex items-center gap-2.5 min-w-0">
                                            <div class="doc-icon">
                                                <svg width="18" height="18" fill="none" stroke="#64748B" stroke-width="1.8" viewBox="0 0 24 24">
                                                    <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/>
                                                    <path d="M6 12v5c3.33 1.67 6.67 1.67 10 0v-5"/>
                                                </svg>
                                            </div>
                                            <div class="truncate">
                                                <div class="font-bold text-[#1E293B] text-[13.5px]">Educational Degree</div>
                                                <div class="text-[#9DAEC0] text-[11.5px] mt-0.5 truncate">Juris Doctor Certificate</div>
                                            </div>
                                        </div>
                                        <span class="valid-badge">
                                            <svg width="13" height="13" fill="none" stroke="#16A34A" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                                            Valid
                                        </span>
                                    </div>
                                    <div class="flex gap-2">
                                        <button class="btn-base view-scan-btn py-2">View Scan</button>
                                        <button class="icon-btn">
                                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                                        </button>
                                    </div>
                                </div>

                                <!-- Expertise Certification -->
                                <div class="doc-card">
                                    <div class="flex items-start justify-between gap-2 mb-3">
                                        <div class="flex items-center gap-2.5 min-w-0">
                                            <div class="doc-icon">
                                                <svg width="18" height="18" fill="none" stroke="#64748B" stroke-width="1.8" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="8" r="4"/>
                                                    <path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
                                                </svg>
                                            </div>
                                            <div class="truncate">
                                                <div class="font-bold text-[#1E293B] text-[13.5px]">Expertise Certification</div>
                                                <div class="text-[#9DAEC0] text-[11.5px] mt-0.5 truncate">Optional Specialization Proof</div>
                                            </div>
                                        </div>
                                        <span class="optional-badge">
                                            <svg width="14" height="14" fill="none" stroke="#9CA3AF" stroke-width="2" viewBox="0 0 24 24">
                                                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                                            </svg>
                                            Optional
                                        </span>
                                    </div>
                                    <div class="flex gap-2">
                                        <button class="btn-base upload-btn py-2">
                                            Upload / View
                                        </button>
                                        <button class="icon-btn">
                                            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                                <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bottom Bar (Action Bar) -->
                <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] px-10 py-5 z-[50] flex flex-col shadow-[0_-4px_12px_rgba(0,0,0,0.03)]" style="left: 280px;">
                    <div class="max-w-[1200px] mx-auto w-full">
                        <div class="section-note mb-2.5">Internal Notes (Optional)</div>
                        <div class="flex items-center gap-3">
                            <input class="notes-input" type="text" placeholder="Add compliance notes here..." />
                            <div class="flex gap-3">
                                <button class="btn-reject px-8">Reject Application</button>
                                <button class="btn-revision px-8">Request Revision</button>
                                <button class="btn-approve px-8">
                                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                                    </svg>
                                    Approve Lawyer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

</body>
</html>
