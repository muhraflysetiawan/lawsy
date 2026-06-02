<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Lawyer Verification - Lawsy</title>
    
    <!-- Scripts / Styles -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    
    <style>
        body { font-family: 'Poppins', sans-serif; background-color: #F8FAFC; }
        .font-serif { font-family: 'Poppins', sans-serif; }
    </style>
</head>
<body class="flex h-screen bg-[#F8FAFC] overflow-hidden text-[#1A1A1A]">

    @include('admin.components.sidebar')

    <!-- Main Content -->
    <div class="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        <!-- Header -->
        <header class="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between shrink-0">
            <!-- Left: Title -->
            <div class="flex items-center gap-4">
                <h1 class="text-xl font-bold text-[#1A1A1A]">Lawyer Verification</h1>
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

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto p-8 flex flex-col gap-8 bg-[#F8FAFC]">
            
            <div class="max-w-6xl w-full mx-auto">
                <!-- Page Header -->
                <div class="flex justify-between items-start mb-8">
                    <div>
                        <p class="text-sm text-[#6B7280]">{{ $stats['pending'] ?? 0 }} Total Applicants pending review.</p>
                    </div>
                    <button onclick="exportData(this)" class="bg-white border border-[#E2E8F0] text-[#1D5083] px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#F8FAFC] transition-all flex items-center gap-2 shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Export Data
                    </button>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-4 gap-6 mb-8">
                    <!-- Card 1 -->
                    <div class="bg-white p-6 rounded-2xl border border-[#E2E8F0] flex flex-col justify-between shadow-sm">
                        <div class="flex justify-between items-start mb-4">
                            <div class="w-10 h-10 bg-[#F0F5FF] rounded-xl flex items-center justify-center text-[#1D5083]">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            </div>
                            <span class="bg-[#E5EFFF] text-[#1D5083] text-[11px] font-bold px-2.5 py-1 rounded-full">+12%</span>
                        </div>
                        <div>
                            <p class="text-[13px] text-[#6B7280] mb-1 font-medium">Total Lawyers</p>
                            <p class="font-serif text-3xl font-bold text-[#1A1A1A]">{{ $stats['total'] ?? 0 }}</p>
                        </div>
                    </div>
                    <!-- Card 2 -->
                    <div class="bg-white p-6 rounded-2xl border border-[#E2E8F0] flex flex-col justify-between shadow-sm">
                        <div class="flex justify-between items-start mb-4">
                            <div class="w-10 h-10 bg-[#FFF8EB] rounded-xl flex items-center justify-center text-[#B45309]">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                            </div>
                        </div>
                        <div>
                            <p class="text-[13px] text-[#6B7280] mb-1 font-medium">Pending Verification</p>
                            <p class="font-serif text-3xl font-bold text-[#1A1A1A]">{{ $stats['pending'] ?? 0 }}</p>
                        </div>
                    </div>
                    <!-- Card 3 -->
                    <div class="bg-white p-6 rounded-2xl border border-[#E2E8F0] flex flex-col justify-between shadow-sm">
                        <div class="flex justify-between items-start mb-4">
                            <div class="w-10 h-10 bg-[#F0F5FF] rounded-xl flex items-center justify-center text-[#1D5083]">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                            </div>
                            <span class="bg-[#E5EFFF] text-[#1D5083] text-[11px] font-bold px-2.5 py-1 rounded-full">+3</span>
                        </div>
                        <div>
                            <p class="text-[13px] text-[#6B7280] mb-1 font-medium">Approved Today</p>
                            <p class="font-serif text-3xl font-bold text-[#1A1A1A]">{{ $stats['approved_today'] ?? 0 }}</p>
                        </div>
                    </div>
                    <!-- Card 4 -->
                    <div class="bg-white p-6 rounded-2xl border border-[#E2E8F0] flex flex-col justify-between shadow-sm">
                        <div class="flex justify-between items-start mb-4">
                            <div class="w-10 h-10 bg-[#FCE8E8] rounded-xl flex items-center justify-center text-[#EF4444]">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                            </div>
                        </div>
                        <div>
                            <p class="text-[13px] text-[#6B7280] mb-1 font-medium">Rejected (30d)</p>
                            <p class="font-serif text-3xl font-bold text-[#1A1A1A]">{{ $stats['rejected_30d'] ?? 0 }}</p>
                        </div>
                    </div>
                </div>

                <!-- Table Container -->
                <div class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                    <!-- Top Controls -->
                    <div class="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
                        <div class="relative flex gap-2" id="tab-buttons">
                            <!-- Animated Pill Background -->
                            <div id="tab-pill" class="absolute top-0 left-0 h-full bg-[#0E3A68] rounded-lg shadow-sm transition-all duration-300 ease-out z-0 opacity-0"></div>
                            
                            <button onclick="switchTab('all', this)" id="btn-all" class="text-[#6B7280] text-[15px] font-medium hover:text-[#1D5083] transition-colors relative z-10 px-5 py-2 rounded-lg">All Applicants</button>
                            <button onclick="switchTab('pending', this)" id="btn-pending" class="text-[#6B7280] text-[15px] font-medium hover:text-[#1D5083] transition-colors relative z-10 px-5 py-2 rounded-lg">Pending</button>
                            <button onclick="switchTab('approved', this)" id="btn-approved" class="text-white text-[15px] font-medium transition-colors relative z-10 px-5 py-2 rounded-lg">Approved</button>
                        </div>
                        <button class="text-[#6B7280] hover:text-[#1D5083] transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M7 12h10M10 18h4"></path></svg>
                        </button>
                    </div>

                    <!-- Table -->
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-[#E2E8F0]">
                                <th class="py-5 px-8 text-xs font-bold text-[#6B7280] uppercase tracking-widest">Profile</th>
                                <th class="py-5 px-8 text-xs font-bold text-[#6B7280] uppercase tracking-widest">Firm / Specialization</th>
                                <th class="py-5 px-8 text-xs font-bold text-[#6B7280] uppercase tracking-widest">Experience</th>
                                <th class="py-5 px-8 text-xs font-bold text-[#6B7280] uppercase tracking-widest">Status</th>
                                <th class="py-5 px-8 text-xs font-bold text-[#6B7280] uppercase tracking-widest">Joined Date</th>
                                <th class="py-5 px-8 text-xs font-bold text-[#6B7280] uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-all" class="divide-y divide-[#F3F4F6] transition-opacity duration-300" style="display: table-row-group; opacity: 1;">
                            @foreach($allApplicants as $lawyer)
                            <tr class="hover:bg-[#F8FAFC] transition-colors group">
                                <td class="py-6 px-8">
                                    <div class="flex items-center gap-4">
                                        @if($lawyer['avatar'])
                                        <div class="w-11 h-11 rounded-full overflow-hidden shrink-0 bg-[#E2E8F0]">
                                            <img src="{{ $lawyer['avatar'] }}" alt="{{ $lawyer['name'] }}" class="w-full h-full object-cover">
                                        </div>
                                        @else
                                        <div class="w-11 h-11 rounded-full shrink-0 bg-[#A6C8FF] text-[#0E3A68] flex items-center justify-center font-medium text-sm">
                                            {{ $lawyer['initials'] }}
                                        </div>
                                        @endif
                                        <div>
                                            <p class="text-[15px] font-medium text-[#1A1A1A]">{{ $lawyer['name'] }}</p>
                                            <p class="text-[13px] text-[#6B7280]">{{ $lawyer['education'] }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="py-6 px-8">
                                    <p class="text-[15px] font-normal text-[#1A1A1A]">{{ $lawyer['firm'] }}</p>
                                    <p class="text-[13px] text-[#6B7280]">{{ $lawyer['specialization'] }}</p>
                                </td>
                                <td class="py-6 px-8 text-[15px] font-normal text-[#6B7280]">{{ $lawyer['experience'] }}</td>
                                <td class="py-6 px-8">
                                    @if($lawyer['status'] == 'Pending')
                                    <span class="inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-medium bg-[#F5EFE6] text-[#8C6D46]">
                                        Pending
                                    </span>
                                    @else
                                    <span class="inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-medium bg-[#F0F5FF] text-[#5A7184]">
                                        Approved
                                    </span>
                                    @endif
                                </td>
                                <td class="py-6 px-8">
                                    <p class="text-[15px] font-normal text-[#6B7280]">{{ explode(',', $lawyer['date'])[0] }},</p>
                                    <p class="text-[15px] font-normal text-[#6B7280]">{{ explode(',', $lawyer['date'])[1] ?? '' }}</p>
                                </td>
                                <td class="py-6 px-8">
                                    <div class="flex items-center justify-end gap-4">
                                        @if($lawyer['status'] == 'Pending')
                                        <button onclick="updateLawyerStatus({{ $lawyer['id'] }}, 'Approved', '{{ addslashes($lawyer['name']) }}')" class="text-[#059669] hover:opacity-80 transition-opacity" title="Approve">
                                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        </button>
                                        <button onclick="updateLawyerStatus({{ $lawyer['id'] }}, 'Rejected', '{{ addslashes($lawyer['name']) }}')" class="text-[#C92A2A] hover:opacity-80 transition-opacity" title="Reject">
                                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        </button>
                                        @endif
                                        <button onclick="openPreview(
                                            '{{ addslashes($lawyer['name']) }}',
                                            '{{ addslashes($lawyer['firm']) }}',
                                            '{{ addslashes($lawyer['specialization']) }}',
                                            '{{ addslashes($lawyer['experience']) }}',
                                            '{{ addslashes($lawyer['education']) }}',
                                            '{{ $lawyer['date'] }}',
                                            '{{ $lawyer['initials'] }}',
                                            '{{ $lawyer['status'] }}',
                                            '{{ $lawyer['id_card_path'] ? asset($lawyer['id_card_path']) : '' }}',
                                            '{{ $lawyer['lawyer_license_path'] ? asset($lawyer['lawyer_license_path']) : '' }}',
                                            '{{ $lawyer['oath_doc_path'] ? asset($lawyer['oath_doc_path']) : '' }}',
                                            '{{ $lawyer['degree_path'] ? asset($lawyer['degree_path']) : '' }}',
                                            '{{ $lawyer['skill_cert_path'] ? asset($lawyer['skill_cert_path']) : '' }}',
                                            '{{ $lawyer['face_scan_path'] ? asset($lawyer['face_scan_path']) : '' }}',
                                            {{ $lawyer['id'] }}
                                        )" class="text-[#8B95A5] hover:text-[#1D5083] transition-colors ml-1" title="Preview Details">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                        <tbody id="tbody-pending" class="divide-y divide-[#F3F4F6] transition-opacity duration-300" style="display: none; opacity: 0;">
                            @foreach($pendingApplicants as $lawyer)
                            <tr class="hover:bg-[#F8FAFC] transition-colors group">
                                <td class="py-6 px-8">
                                    <div class="flex items-center gap-4">
                                        @if($lawyer['avatar'])
                                        <div class="w-11 h-11 rounded-full overflow-hidden shrink-0 bg-[#E2E8F0]">
                                            <img src="{{ $lawyer['avatar'] }}" alt="{{ $lawyer['name'] }}" class="w-full h-full object-cover">
                                        </div>
                                        @else
                                        <div class="w-11 h-11 rounded-full shrink-0 bg-[#A6C8FF] text-[#0E3A68] flex items-center justify-center font-medium text-sm">
                                            {{ $lawyer['initials'] }}
                                        </div>
                                        @endif
                                        <div>
                                            <p class="text-[15px] font-medium text-[#1A1A1A]">{{ $lawyer['name'] }}</p>
                                            <p class="text-[13px] text-[#6B7280]">{{ $lawyer['education'] }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="py-6 px-8">
                                    <p class="text-[15px] font-normal text-[#1A1A1A]">{{ $lawyer['firm'] }}</p>
                                    <p class="text-[13px] text-[#6B7280]">{{ $lawyer['specialization'] }}</p>
                                </td>
                                <td class="py-6 px-8 text-[15px] font-normal text-[#6B7280]">{{ $lawyer['experience'] }}</td>
                                <td class="py-6 px-8">
                                    @if($lawyer['status'] == 'Pending')
                                    <span class="inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-medium bg-[#F5EFE6] text-[#8C6D46]">
                                        Pending
                                    </span>
                                    @else
                                    <span class="inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-medium bg-[#F0F5FF] text-[#5A7184]">
                                        Approved
                                    </span>
                                    @endif
                                </td>
                                <td class="py-6 px-8">
                                    <p class="text-[15px] font-normal text-[#6B7280]">{{ explode(',', $lawyer['date'])[0] }},</p>
                                    <p class="text-[15px] font-normal text-[#6B7280]">{{ explode(',', $lawyer['date'])[1] ?? '' }}</p>
                                </td>
                                <td class="py-6 px-8">
                                    <div class="flex items-center justify-end gap-4">
                                        @if($lawyer['status'] == 'Pending')
                                        <button onclick="updateLawyerStatus({{ $lawyer['id'] }}, 'Approved', '{{ addslashes($lawyer['name']) }}')" class="text-[#059669] hover:opacity-80 transition-opacity" title="Approve">
                                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        </button>
                                        <button onclick="updateLawyerStatus({{ $lawyer['id'] }}, 'Rejected', '{{ addslashes($lawyer['name']) }}')" class="text-[#C92A2A] hover:opacity-80 transition-opacity" title="Reject">
                                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        </button>
                                        @endif
                                        <button onclick="openPreview(
                                            '{{ addslashes($lawyer['name']) }}',
                                            '{{ addslashes($lawyer['firm']) }}',
                                            '{{ addslashes($lawyer['specialization']) }}',
                                            '{{ addslashes($lawyer['experience']) }}',
                                            '{{ addslashes($lawyer['education']) }}',
                                            '{{ $lawyer['date'] }}',
                                            '{{ $lawyer['initials'] }}',
                                            '{{ $lawyer['status'] }}',
                                            '{{ $lawyer['id_card_path'] ? asset($lawyer['id_card_path']) : '' }}',
                                            '{{ $lawyer['lawyer_license_path'] ? asset($lawyer['lawyer_license_path']) : '' }}',
                                            '{{ $lawyer['oath_doc_path'] ? asset($lawyer['oath_doc_path']) : '' }}',
                                            '{{ $lawyer['degree_path'] ? asset($lawyer['degree_path']) : '' }}',
                                            '{{ $lawyer['skill_cert_path'] ? asset($lawyer['skill_cert_path']) : '' }}',
                                            '{{ $lawyer['face_scan_path'] ? asset($lawyer['face_scan_path']) : '' }}',
                                            {{ $lawyer['id'] }}
                                        )" class="text-[#8B95A5] hover:text-[#1D5083] transition-colors ml-1" title="Preview Details">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                        <tbody id="tbody-approved" class="divide-y divide-[#F3F4F6] transition-opacity duration-300" style="display: none; opacity: 0;">
                            @foreach($approvedApplicants as $lawyer)
                            <tr class="hover:bg-[#F8FAFC] transition-colors group">
                                <td class="py-6 px-8">
                                    <div class="flex items-center gap-4">
                                        @if($lawyer['avatar'])
                                        <div class="w-11 h-11 rounded-full overflow-hidden shrink-0 bg-[#E2E8F0]">
                                            <img src="{{ $lawyer['avatar'] }}" alt="{{ $lawyer['name'] }}" class="w-full h-full object-cover">
                                        </div>
                                        @else
                                        <div class="w-11 h-11 rounded-full shrink-0 bg-[#A6C8FF] text-[#0E3A68] flex items-center justify-center font-medium text-sm">
                                            {{ $lawyer['initials'] }}
                                        </div>
                                        @endif
                                        <div>
                                            <p class="text-[15px] font-medium text-[#1A1A1A]">{{ $lawyer['name'] }}</p>
                                            <p class="text-[13px] text-[#6B7280]">{{ $lawyer['education'] }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="py-6 px-8">
                                    <p class="text-[15px] font-normal text-[#1A1A1A]">{{ $lawyer['firm'] }}</p>
                                    <p class="text-[13px] text-[#6B7280]">{{ $lawyer['specialization'] }}</p>
                                </td>
                                <td class="py-6 px-8 text-[15px] font-normal text-[#6B7280]">{{ $lawyer['experience'] }}</td>
                                <td class="py-6 px-8">
                                    @if($lawyer['status'] == 'Pending')
                                    <span class="inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-medium bg-[#F5EFE6] text-[#8C6D46]">
                                        Pending
                                    </span>
                                    @else
                                    <span class="inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-medium bg-[#F0F5FF] text-[#5A7184]">
                                        Approved
                                    </span>
                                    @endif
                                </td>
                                <td class="py-6 px-8">
                                    <p class="text-[15px] font-normal text-[#6B7280]">{{ explode(',', $lawyer['date'])[0] }},</p>
                                    <p class="text-[15px] font-normal text-[#6B7280]">{{ explode(',', $lawyer['date'])[1] ?? '' }}</p>
                                </td>
                                <td class="py-6 px-8">
                                    <div class="flex items-center justify-end gap-4">
                                        @if($lawyer['status'] == 'Pending')
                                        <button onclick="updateLawyerStatus({{ $lawyer['id'] }}, 'Approved', '{{ addslashes($lawyer['name']) }}')" class="text-[#059669] hover:opacity-80 transition-opacity" title="Approve">
                                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        </button>
                                        <button onclick="updateLawyerStatus({{ $lawyer['id'] }}, 'Rejected', '{{ addslashes($lawyer['name']) }}')" class="text-[#C92A2A] hover:opacity-80 transition-opacity" title="Reject">
                                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        </button>
                                        @endif
                                        <button onclick="openPreview(
                                            '{{ addslashes($lawyer['name']) }}',
                                            '{{ addslashes($lawyer['firm']) }}',
                                            '{{ addslashes($lawyer['specialization']) }}',
                                            '{{ addslashes($lawyer['experience']) }}',
                                            '{{ addslashes($lawyer['education']) }}',
                                            '{{ $lawyer['date'] }}',
                                            '{{ $lawyer['initials'] }}',
                                            '{{ $lawyer['status'] }}',
                                            '{{ $lawyer['id_card_path'] ? asset($lawyer['id_card_path']) : '' }}',
                                            '{{ $lawyer['lawyer_license_path'] ? asset($lawyer['lawyer_license_path']) : '' }}',
                                            '{{ $lawyer['oath_doc_path'] ? asset($lawyer['oath_doc_path']) : '' }}',
                                            '{{ $lawyer['degree_path'] ? asset($lawyer['degree_path']) : '' }}',
                                            '{{ $lawyer['skill_cert_path'] ? asset($lawyer['skill_cert_path']) : '' }}',
                                            '{{ $lawyer['face_scan_path'] ? asset($lawyer['face_scan_path']) : '' }}',
                                            {{ $lawyer['id'] }}
                                        )" class="text-[#8B95A5] hover:text-[#1D5083] transition-colors ml-1" title="Preview Details">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>

                    <!-- Pagination -->
                    <div class="px-8 py-5 flex items-center justify-between border-t border-[#E2E8F0] bg-white">
                        <p class="text-[15px] text-[#6B7280]">Showing <span class="font-medium text-[#1A1A1A]">{{ $paginator->firstItem() }}-{{ $paginator->lastItem() }}</span> of <span class="font-medium text-[#1A1A1A]">{{ $paginator->total() }}</span></p>
                        <div class="flex items-center gap-2">
                            @if ($paginator->onFirstPage())
                                <button class="px-2 py-1.5 text-[15px] text-[#8B95A5] cursor-not-allowed mr-2 font-medium" disabled>Previous</button>
                            @else
                                <a href="{{ $paginator->previousPageUrl() }}" class="px-2 py-1.5 text-[15px] text-[#6B7280] hover:text-[#1D5083] transition-colors mr-2 font-medium">Previous</a>
                            @endif

                            @foreach ($paginator->links()->elements[0] ?? [] as $page => $url)
                                @if ($page == $paginator->currentPage())
                                    <button class="w-8 h-8 flex items-center justify-center rounded bg-[#1D5083] text-white text-[15px] font-medium">{{ $page }}</button>
                                @else
                                    <a href="{{ $url }}" class="w-8 h-8 flex items-center justify-center rounded text-[#6B7280] hover:bg-[#F8FAFC] text-[15px] font-medium transition-colors">{{ $page }}</a>
                                @endif
                            @endforeach
                            
                            @if($paginator->lastPage() > 5)
                                <span class="w-8 h-8 flex items-center justify-center text-[#8B95A5] text-[15px]">...</span>
                                <a href="{{ $paginator->url($paginator->lastPage()) }}" class="w-8 h-8 flex items-center justify-center rounded text-[#6B7280] hover:bg-[#F8FAFC] text-[15px] font-medium transition-colors">{{ $paginator->lastPage() }}</a>
                            @endif

                            @if ($paginator->hasMorePages())
                                <a href="{{ $paginator->nextPageUrl() }}" class="px-2 py-1.5 text-[15px] text-[#6B7280] hover:text-[#1A1A1A] transition-colors ml-2 font-medium">Next</a>
                            @else
                                <button class="px-2 py-1.5 text-[15px] text-[#8B95A5] cursor-not-allowed ml-2 font-medium" disabled>Next</button>
                            @endif
                        </div>
                    </div>
                </div>

            </div>
        </main>
    </div>

    <!-- LAWYER PREVIEW MODAL -->
    <div id="lawyer-modal" class="hidden fixed inset-0 z-[200] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onclick="closeModal()"></div>
        <div class="relative bg-white rounded-3xl w-[95vw] max-w-6xl max-h-[90vh] shadow-2xl border border-[#E2E8F0] z-10 flex flex-col overflow-hidden" style="animation:modalIn .3s ease-out">
            <!-- Modal Header -->
            <div class="flex items-center justify-between px-8 py-5 border-b border-[#E2E8F0] shrink-0 bg-[#F8FAFC]">
                <div class="flex items-center gap-4">
                    <h2 class="font-serif text-xl font-bold text-[#1A1A1A]">Lawyer Verification</h2>
                    <span id="modal-status" class="px-3 py-1 rounded-full text-[11px] font-bold bg-[#F5EFE6] text-[#8C6D46]">Pending</span>
                </div>
                <button onclick="closeModal()" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#E2E8F0] text-[#8B95A5] hover:text-[#1A1A1A] transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <!-- Modal Body -->
            <div class="flex-1 overflow-y-auto flex">
                <!-- Left: Profile Info -->
                <div class="w-[360px] shrink-0 border-r border-[#E2E8F0] p-8 flex flex-col gap-6 bg-white">
                    <div class="flex items-center gap-4">
                        <div id="modal-avatar" class="w-16 h-16 rounded-2xl bg-[#A6C8FF] text-[#0E3A68] flex items-center justify-center font-bold text-xl shrink-0">MT</div>
                        <div>
                            <h3 id="modal-name" class="text-lg font-bold text-[#1A1A1A]">Marcus Thorne</h3>
                            <p id="modal-firm" class="text-[13px] text-[#6B7280]">Thorne & Associates</p>
                        </div>
                    </div>
                    <div class="flex flex-col gap-4">
                        <div><span class="text-[10px] font-bold text-[#8B95A5] uppercase tracking-wider block mb-1">Specialization</span><span id="modal-spec" class="text-[14px] font-medium text-[#1A1A1A]">Corporate Litigation</span></div>
                        <div><span class="text-[10px] font-bold text-[#8B95A5] uppercase tracking-wider block mb-1">Experience</span><span id="modal-exp" class="text-[14px] font-medium text-[#1A1A1A]">12 Years</span></div>
                        <div><span class="text-[10px] font-bold text-[#8B95A5] uppercase tracking-wider block mb-1">Education</span><span id="modal-edu" class="text-[14px] font-medium text-[#1A1A1A]">JD, Harvard Law</span></div>
                        <div><span class="text-[10px] font-bold text-[#8B95A5] uppercase tracking-wider block mb-1">Applied</span><span id="modal-date" class="text-[14px] font-medium text-[#1A1A1A]">May 12, 2026</span></div>
                    </div>
                    <div class="border-t border-[#E2E8F0] pt-4">
                        <span class="text-[10px] font-bold text-[#8B95A5] uppercase tracking-wider block mb-2">Biography</span>
                        <p id="modal-bio" class="text-[13px] text-[#6B7280] leading-relaxed">Experienced corporate litigator specializing in cross-border mergers, regulatory compliance, and securities law with over a decade of practice.</p>
                    </div>
                    <!-- Verification History -->
                    <div class="border-t border-[#E2E8F0] pt-4">
                        <span class="text-[10px] font-bold text-[#8B95A5] uppercase tracking-wider block mb-3">Verification History</span>
                        <div id="modal-history" class="flex flex-col gap-3 text-[12px]">
                            <div class="flex gap-2"><span class="w-1.5 h-1.5 rounded-full bg-[#1D5083] mt-1.5 shrink-0"></span><div><span class="font-bold text-[#1A1A1A]">Application submitted</span><br><span class="text-[#8B95A5]">May 12, 10:00 AM</span></div></div>
                        </div>
                    </div>
                </div>
                <!-- Right: Document Viewer -->
                <div class="flex-1 p-8 flex flex-col gap-6 bg-[#F8FAFC]">
                    <h3 class="font-serif text-lg font-bold text-[#1A1A1A]">Submitted Documents</h3>
                    <div id="doc-grid" class="grid grid-cols-2 gap-4">
                        <!-- Documents will be populated by JS -->
                    </div>
                </div>
            </div>
            <!-- Modal Footer -->
            <div class="flex items-center justify-between px-8 py-5 border-t border-[#E2E8F0] shrink-0 bg-white">
                <button onclick="closeModal()" class="px-5 py-2.5 bg-white border border-[#E2E8F0] text-[#6B7280] text-sm font-semibold rounded-xl hover:bg-[#F8FAFC] transition-colors">Close</button>
                <div class="flex gap-3" id="modal-actions">
                    <button onclick="openRevisionModal()" class="px-5 py-2.5 bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-sm font-bold rounded-xl hover:bg-[#FDE68A] transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Request Revision
                    </button>
                    <button onclick="rejectLawyer()" class="px-5 py-2.5 bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-sm font-bold rounded-xl hover:bg-[#FECACA] transition-colors">Reject</button>
                    <button onclick="approveLawyer()" class="px-5 py-2.5 bg-[#059669] text-white text-sm font-bold rounded-xl hover:bg-[#047857] transition-colors shadow-sm flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4"></path></svg>
                        Approve Lawyer
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- REVISION REQUEST MODAL -->
    <div id="revision-modal" class="hidden fixed inset-0 z-[300] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" onclick="closeRevisionModal()"></div>
        <div class="relative bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl z-10" style="animation:modalIn .3s ease-out">
            <h3 class="font-serif text-xl font-bold text-[#1A1A1A] mb-2">Request Revision</h3>
            <p class="text-[13px] text-[#6B7280] mb-6">Select documents that need resubmission and provide feedback.</p>
            <div class="flex flex-col gap-3 mb-6" id="revision-docs"></div>
            <div class="flex flex-col gap-2 mb-6">
                <label class="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Revision Message</label>
                <textarea id="revision-msg" rows="3" placeholder="Please re-upload a clearer document..." class="w-full px-4 py-3 bg-[#F8FAFC] border-none rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1D5083]/20 resize-none"></textarea>
            </div>
            <div class="flex gap-3 justify-end">
                <button onclick="closeRevisionModal()" class="px-5 py-2.5 bg-white border border-[#E2E8F0] text-[#6B7280] text-sm font-semibold rounded-xl">Cancel</button>
                <button onclick="submitRevision()" class="px-5 py-2.5 bg-[#D97706] text-white text-sm font-bold rounded-xl hover:bg-[#B45309] transition-colors">Send Revision Request</button>
            </div>
        </div>
    </div>

    <!-- LIGHTBOX -->
    <div id="lightbox" class="hidden fixed inset-0 z-[400] flex items-center justify-center bg-black/80" onclick="this.classList.add('hidden')">
        <img id="lightbox-img" src="" class="max-w-[85vw] max-h-[85vh] rounded-2xl shadow-2xl object-contain" onclick="event.stopPropagation()">
        <button class="absolute top-6 right-6 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors" onclick="document.getElementById('lightbox').classList.add('hidden')">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
    </div>

    <!-- TOAST -->
    <div id="toast-container" class="fixed bottom-6 right-6 z-[500] flex flex-col gap-3"></div>

    <style>
        @keyframes modalIn { from { opacity:0; transform:scale(.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes toastIn { from { opacity:0; transform:translateX(100px); } to { opacity:1; transform:translateX(0); } }
        @keyframes confetti { 0% { transform:translateY(0) rotate(0); opacity:1; } 100% { transform:translateY(-200px) rotate(720deg); opacity:0; } }
    </style>

    <script>
        // --- Tab System ---
        function switchTab(tabId, btnElement) {
            const buttons = document.querySelectorAll('#tab-buttons button');
            buttons.forEach(btn => { btn.classList.remove('text-white'); btn.classList.add('text-[#6B7280]', 'hover:text-[#1D5083]'); });
            btnElement.classList.remove('text-[#6B7280]', 'hover:text-[#1D5083]'); btnElement.classList.add('text-white');
            const pill = document.getElementById('tab-pill'); pill.style.opacity='1'; pill.style.width=btnElement.offsetWidth+'px'; pill.style.transform=`translateX(${btnElement.offsetLeft}px)`;
            ['all','pending','approved'].forEach(id => { const el=document.getElementById('tbody-'+id); if(el){if(id===tabId){el.style.display='table-row-group';setTimeout(()=>el.style.opacity='1',50);}else{el.style.display='none';el.style.opacity='0';}} });
        }

        // --- Document Data ---
        let docTemplates = [];

        let currentLawyer = null;
        let docStatuses = {};

        // --- Open Preview Modal ---
        function openPreview(name, firm, spec, exp, edu, date, initials, status, idCard, license, oath, degree, cert, faceScan, id) {
            currentLawyer = {name,firm,spec,exp,edu,date,initials,status,id};
            document.getElementById('modal-name').textContent = name;
            document.getElementById('modal-firm').textContent = firm;
            document.getElementById('modal-spec').textContent = spec;
            document.getElementById('modal-exp').textContent = exp;
            document.getElementById('modal-edu').textContent = edu;
            document.getElementById('modal-date').textContent = date;
            document.getElementById('modal-avatar').textContent = initials;
            const sBadge = document.getElementById('modal-status');
            if(status==='Approved'){sBadge.className='px-3 py-1 rounded-full text-[11px] font-bold bg-[#D1FAE5] text-[#059669]';sBadge.textContent='Approved';}
            else{sBadge.className='px-3 py-1 rounded-full text-[11px] font-bold bg-[#F5EFE6] text-[#8C6D46]';sBadge.textContent='Pending';}
            
            const fallbackImg = 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop';
            docTemplates = [
                {name:'Identity Card (KTP)',img: idCard || fallbackImg,status:'valid'},
                {name:'Lawyer License (KAI)',img: license || fallbackImg,status:'valid'},
                {name:'Legal Oath Document',img: oath || fallbackImg,status:'valid'},
                {name:'Educational Degree',img: degree || fallbackImg,status:'valid'},
                {name:'Expertise Certification',img: cert || fallbackImg,status:'valid'},
                {name:'Face Scan',img: faceScan || fallbackImg,status:'valid'},
            ];

            // Reset doc statuses
            docStatuses = {}; docTemplates.forEach((d,i)=>docStatuses[i]='valid');
            renderDocs();
            // Show/hide actions
            document.getElementById('modal-actions').style.display = status==='Approved' ? 'none' : 'flex';
            document.getElementById('lawyer-modal').classList.remove('hidden');
            document.body.style.overflow='hidden';
        }

        function renderDocs() {
            const grid = document.getElementById('doc-grid');
            grid.innerHTML = docTemplates.map((d,i) => {
                const s = docStatuses[i]||'valid';
                const statusHTML = s==='valid'?'<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D1FAE5] text-[#059669]">✓ Valid</span>'
                    :s==='revision'?'<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#D97706]">⚠ Needs Revision</span>'
                    :'<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#DC2626]">✗ Rejected</span>';
                
                const isPdf = d.img.toLowerCase().endsWith('.pdf');
                
                const mediaHTML = isPdf 
                    ? `<div class="w-full h-full bg-[#FEF2F2] flex flex-col items-center justify-center gap-2 group-hover:scale-105 transition-transform duration-500">
                           <svg class="w-12 h-12 text-[#EF4444]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path></svg>
                           <span class="text-[11px] font-bold text-[#EF4444] uppercase tracking-wider">PDF Document</span>
                       </div>`
                    : `<img src="${d.img}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="${d.name}">`;

                const clickAction = isPdf ? `window.open('${d.img}', '_blank')` : `openLightbox('${d.img}')`;
                const zoomIcon = isPdf
                    ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>`
                    : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>`;
                const zoomTitle = isPdf ? 'Open PDF in new tab' : 'Zoom Image';

                return `<div class="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                    <div class="relative h-36 overflow-hidden cursor-pointer" onclick="${clickAction}">
                        ${mediaHTML}
                        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            ${isPdf 
                                ? `<svg class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>`
                                : `<svg class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>`
                            }
                        </div>
                    </div>
                    <div class="p-4 flex items-center justify-between">
                        <div class="min-w-0 flex-1 pr-2">
                            <p class="text-[13px] font-bold text-[#1A1A1A] truncate" title="${d.name}">${d.name}</p>
                            <div class="mt-1">${statusHTML}</div>
                        </div>
                        <button onclick="${clickAction}" class="p-2 hover:bg-[#F1F5F9] rounded-lg text-[#8B95A5] hover:text-[#1D5083] transition-colors shrink-0" title="${zoomTitle}">
                            ${zoomIcon}
                        </button>
                    </div>
                </div>`;
            }).join('');
        }

        function closeModal() { document.getElementById('lawyer-modal').classList.add('hidden'); document.body.style.overflow=''; }
        function openLightbox(src) { document.getElementById('lightbox-img').src=src; document.getElementById('lightbox').classList.remove('hidden'); }

        // --- Revision Workflow ---
        function openRevisionModal() {
            const cont = document.getElementById('revision-docs');
            cont.innerHTML = docTemplates.map((d,i) => `<label class="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl hover:bg-[#F1F5F9] transition-colors cursor-pointer">
                <input type="checkbox" value="${i}" class="rev-check w-4 h-4 rounded border-[#E2E8F0] text-[#1D5083] focus:ring-[#1D5083]">
                <span class="text-[13px] font-medium text-[#1A1A1A]">${d.name}</span>
            </label>`).join('');
            document.getElementById('revision-msg').value='';
            document.getElementById('revision-modal').classList.remove('hidden');
        }
        function closeRevisionModal() { document.getElementById('revision-modal').classList.add('hidden'); }

        function submitRevision() {
            const checked = document.querySelectorAll('.rev-check:checked');
            const msg = document.getElementById('revision-msg').value;
            if(checked.length===0){showToast('Please select at least one document','warning');return;}
            if(!msg.trim()){showToast('Please provide a revision message','warning');return;}
            checked.forEach(c => { docStatuses[c.value]='revision'; });
            renderDocs();
            // Update status badge
            const sBadge=document.getElementById('modal-status');
            sBadge.className='px-3 py-1 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#D97706]';sBadge.textContent='Pending Revision';
            // Add to history
            const hist=document.getElementById('modal-history');
            hist.innerHTML+=`<div class="flex gap-2"><span class="w-1.5 h-1.5 rounded-full bg-[#D97706] mt-1.5 shrink-0"></span><div><span class="font-bold text-[#1A1A1A]">Revision requested (${checked.length} docs)</span><br><span class="text-[#8B95A5]">Just now</span></div></div>`;
            closeRevisionModal();
            showToast('Revision request sent successfully','success');
        }

        // --- AJAX status updater ---
        function updateLawyerStatus(id, status, name, notes = '') {
            fetch(`/lawyers-verification/${id}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ status: status, notes: notes, lawyer_name: name })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showToast(`🎉 Lawyer ${name} successfully ${status.toLowerCase()}!`, 'success');
                    setTimeout(() => location.reload(), 1500);
                } else {
                    showToast(data.message || 'Failed to update lawyer status', 'error');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Network error updating lawyer status', 'error');
            });
        }

        // --- Approve ---
        function approveLawyer() {
            if(!currentLawyer || !currentLawyer.id) return;
            if(!confirm('Are you sure you want to approve this lawyer?')) return;
            
            updateLawyerStatus(currentLawyer.id, 'Approved', currentLawyer.name);
            closeModal();
        }

        // --- Reject ---
        function rejectLawyer() {
            if(!currentLawyer || !currentLawyer.id) return;
            const reason = prompt('Please provide a reason for rejection:');
            if(!reason) return;
            
            updateLawyerStatus(currentLawyer.id, 'Rejected', currentLawyer.name, reason);
            closeModal();
        }

        // --- Toast System ---
        function showToast(msg, type='info') {
            const colors = {success:'bg-[#059669] text-white',warning:'bg-[#D97706] text-white',error:'bg-[#DC2626] text-white',info:'bg-[#1D5083] text-white'};
            const t = document.createElement('div');
            t.className = `${colors[type]} px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-3`;
            t.style.animation = 'toastIn .3s ease-out';
            t.innerHTML = `<span>${msg}</span><button onclick="this.parentElement.remove()" class="opacity-70 hover:opacity-100">✕</button>`;
            document.getElementById('toast-container').appendChild(t);
            setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(()=>t.remove(),300);},4000);
        }

        // --- Init ---
        window.addEventListener('DOMContentLoaded', () => {
            const defaultBtn = document.getElementById('btn-all');
            setTimeout(() => switchTab('all', defaultBtn), 100);
            window.addEventListener('resize', () => {
                const activeBtn = document.querySelector('#tab-buttons button.text-white');
                if(activeBtn) { const pill=document.getElementById('tab-pill'); pill.style.width=activeBtn.offsetWidth+'px'; pill.style.transform=`translateX(${activeBtn.offsetLeft}px)`; }
            });
        });

        // ESC to close modals
        document.addEventListener('keydown', e => {
            if(e.key==='Escape'){closeRevisionModal();closeModal();document.getElementById('lightbox').classList.add('hidden');}
        });

        // Export Data functionality
        function exportData(btn) {
            const orig = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> Exporting...';
            setTimeout(() => {
                btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Exported!';
                btn.classList.add('border-[#059669]','text-[#059669]');
                showToast('Data exported successfully as CSV','success');
                setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; btn.classList.remove('border-[#059669]','text-[#059669]'); }, 2500);
            }, 1500);
        }
    </script>
</body>
</html>
