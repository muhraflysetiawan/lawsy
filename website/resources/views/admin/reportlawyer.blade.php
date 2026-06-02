<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Report & Compliance Center - Lawsy</title>
    
    <!-- Scripts / Styles -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    
    <style>
        body { font-family: 'Poppins', sans-serif; background-color: #F8FAFC; }
        .font-serif { font-family: 'Poppins', sans-serif; }
        .mod-btn-active { background-color: #1D5083 !important; color: #FFFFFF !important; border-color: transparent !important; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        [x-cloak] { display: none !important; }

        /* Premium Badge System */
        .badge-critical { background-color: #FEF2F2 !important; color: #DC2626 !important; border: 1px solid #FECACA !important; }
        .badge-high { background-color: #FFF7ED !important; color: #EA580C !important; border: 1px solid #FFEDD5 !important; }
        .badge-medium { background-color: #FEFCE8 !important; color: #CA8A04 !important; border: 1px solid #FEF08A !important; }
        .badge-low { background-color: #F0FDF4 !important; color: #16A34A !important; border: 1px solid #BBF7D0 !important; }
        
        .badge-status-resolved { background-color: #F0FDF4 !important; color: #16A34A !important; border: 1px solid #BBF7D0 !important; }
        .badge-status-suspended { background-color: #FEF2F2 !important; color: #DC2626 !important; border: 1px solid #FECACA !important; }
        .badge-status-pending { background-color: #F8FAFC !important; color: #64748B !important; border: 1px solid #E2E8F0 !important; }
        .badge-status-review { background-color: #EFF6FF !important; color: #2563EB !important; border: 1px solid #BFDBFE !important; }

        /* Global Focus Kill - Menghilangkan Sekat Hitam */
        input:focus, select:focus, textarea:focus, button:focus {
            outline: none !important;
            border-color: transparent !important;
            box-shadow: none !important;
            ring: 0 !important;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0px 1000px white inset !important;
            transition: background-color 5000s ease-in-out 0s;
        }
    </style>
</head>
<body class="flex h-screen bg-[#F8FAFC] overflow-hidden text-[#1A1A1A]" x-data="{ 
    selectedLawyer: {{ json_encode($lawyers->first()) }},
    showModal: false
}">

    @include('admin.components.sidebar')

    <!-- Main Content -->
    <div class="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        <!-- Header -->
        <header class="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between shrink-0">
            <!-- Left: Title -->
            <div class="flex items-center gap-4">
                <h1 class="text-xl font-bold text-[#1A1A1A]">Report & Compliance Center</h1>
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
        <main class="flex-1 overflow-y-auto p-8 flex flex-col gap-8 animate-fade-in">
            
            <!-- Title & Subtitle -->
            <div class="flex justify-between items-start shrink-0">
                <div>
                    <p class="text-sm text-[#6B7280] font-light max-w-2xl">
                        Manage user-submitted reports regarding attorney incompetence. Review evidence, issue warnings, and uphold integrity across the network.
                    </p>
                </div>
                <div class="flex gap-3">
                    <a href="{{ route('admin.cases.resolved') }}" class="bg-white border border-[#E2E8F0] text-[#1A1A1A] px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#F8FAFC] transition-colors flex items-center gap-2 shadow-sm">
                        <svg class="w-4 h-4 text-[#1D5083]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                        Resolved Cases
                    </a>
                    <button @click="showModal = true" class="bg-[#1D5083] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#153c63] transition-colors flex items-center gap-2 shadow-md shadow-[#1D5083]/10">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                        Filters & Sort
                    </button>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Stat 1: Pending Reports -->
                <div class="bg-white p-6 rounded-2xl border border-[#E2E8F0] flex flex-col gap-2 shadow-sm">
                    <div class="flex justify-between items-center">
                        <div class="w-10 h-10 bg-[#FCE8E8] rounded-full flex items-center justify-center text-[#EF4444]">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        <span class="text-xs font-bold text-[#EF4444] uppercase tracking-wider">Critical</span>
                    </div>
                    <span class="text-2xl font-bold text-[#1A1A1A] mt-2">{{ $stats['critical'] }} Critical Cases</span>
                    <span class="text-xs text-[#6B7280] font-light">Immediate intervention required</span>
                </div>
                <!-- Stat 2: Compliance Rate -->
                <div class="bg-white p-6 rounded-2xl border border-[#E2E8F0] flex flex-col gap-2 shadow-sm">
                    <div class="flex justify-between items-center">
                        <div class="w-10 h-10 bg-[#E1FCEF] rounded-full flex items-center justify-center text-[#10B981]">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <span class="text-xs font-bold text-[#10B981] uppercase tracking-wider">Active</span>
                    </div>
                    <span class="text-2xl font-bold text-[#1A1A1A] mt-2">{{ $stats['active_investigations'] }} Active Audits</span>
                    <span class="text-xs text-[#6B7280] font-light">Currently under investigation</span>
                </div>
                <!-- Stat 3: Total -->
                <div class="bg-white p-6 rounded-2xl border border-[#E2E8F0] flex flex-col gap-2 shadow-sm">
                    <div class="flex justify-between items-center">
                        <div class="w-10 h-10 bg-[#EBF3FA] rounded-full flex items-center justify-center text-[#1D5083]">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                        <span class="text-xs font-bold text-[#1D5083] uppercase tracking-wider">Overall</span>
                    </div>
                    <span class="text-2xl font-bold text-[#1A1A1A] mt-2">{{ $stats['total'] }} Reported Lawyers</span>
                    <span class="text-xs text-[#6B7280] font-light">Total unique entities flagged</span>
                </div>
            </div>

            <!-- Main Grid Layout -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <!-- Left Column: Table & Moderation -->
                <div class="lg:col-span-2 flex flex-col gap-6">
                    
                    <!-- Table Card -->
                    <div class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                        <div class="px-6 py-5 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 class="font-serif text-lg font-bold text-[#1A1A1A]">Active Incident Reports</h2>
                            
                            <form action="{{ route('reportlawyer') }}" method="GET" class="flex-1 max-w-md">
                                <div class="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-4 focus-within:ring-[#1D5083]/10 focus-within:border-[#1D5083] transition-all">
                                    <div class="pl-4 pr-1 flex items-center justify-center">
                                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                        </svg>
                                    </div>
                                    <input type="text" name="search" value="{{ request('search') }}" 
                                           placeholder="Search ID, Name, or Category..." 
                                           class="flex-1 py-3 bg-transparent border-none outline-none text-sm focus:ring-0 focus:outline-none placeholder:text-gray-400"
                                           style="border: none !important; outline: none !important; box-shadow: none !important;">
                                    <button type="submit" class="bg-[#1D5083] text-white px-6 py-3 text-sm font-bold hover:bg-[#153c63] transition-colors border-l border-gray-200 focus:ring-0">
                                        Search
                                    </button>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Table -->
                        <div class="overflow-x-auto flex-1">
                            <table class="w-full text-sm text-left">
                                <thead class="text-[10px] uppercase tracking-wider text-[#8B95A5] bg-[#F8FAFC] font-bold">
                                    <tr>
                                        <th class="px-6 py-4">Accused Attorney</th>
                                        <th class="px-6 py-4">Violation Category</th>
                                        <th class="px-6 py-4">Risk</th>
                                        <th class="px-6 py-4">Status</th>
                                        <th class="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-[#E2E8F0]">
                                    @foreach($lawyers as $lawyer)
                                    <tr class="hover:bg-[#F8FAFC] transition-colors group" :class="selectedLawyer?.id === '{{ $lawyer['id'] }}' ? 'bg-[#F8FAFC]' : ''">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-3">
                                                <img src="{{ $lawyer['photo'] }}" class="w-8 h-8 rounded-full border border-[#E2E8F0] shadow-sm">
                                                <div>
                                                    <p class="font-bold text-[#1A1A1A] group-hover:text-[#1D5083] transition-colors">{{ $lawyer['name'] }}</p>
                                                    <p class="text-[10px] text-[#8B95A5] font-mono">{{ $lawyer['id'] }}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 text-xs text-[#6B7280] font-medium">{{ $lawyer['category'] }}</td>
                                        <td class="px-6 py-4">
                                            @php
                                                $riskClass = match($lawyer['risk_level']) {
                                                    'Critical' => 'badge-critical',
                                                    'High' => 'badge-high',
                                                    'Medium' => 'badge-medium',
                                                    'Low' => 'badge-low',
                                                    default => 'badge-low'
                                                };
                                            @endphp
                                            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold border {{ $riskClass }}">
                                                {{ $lawyer['risk_level'] }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4">
                                            @php
                                                $statusClass = match(true) {
                                                    str_contains($lawyer['status'], 'Resolved') => 'badge-status-resolved',
                                                    str_contains($lawyer['status'], 'Suspended') => 'badge-status-suspended',
                                                    str_contains($lawyer['status'], 'Pending') => 'badge-status-pending',
                                                    str_contains($lawyer['status'], 'Review') => 'badge-status-review',
                                                    default => 'badge-status-pending'
                                                };
                                            @endphp
                                            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold border {{ $statusClass }}">
                                                {{ $lawyer['status'] }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 text-right">
                                            <a href="{{ route('admin.cases.review') }}" class="inline-block bg-[#1D5083] text-white px-4 py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#153c63] transition-all shadow-sm">Review</a>
                                        </td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>

                        <!-- Pagination Section -->
                        <div class="px-6 py-5 border-t border-[#E2E8F0] bg-[#FAFBFF] flex items-center justify-between">
                            <div class="text-[13px] text-[#8B95A5] font-medium">
                                @if($lawyers->total() > 0)
                                    Showing <span class="text-[#1A1A1A] font-bold">{{ $lawyers->firstItem() }}-{{ $lawyers->lastItem() }}</span> of <span class="text-[#1A1A1A] font-bold">{{ $lawyers->total() }}</span> cases
                                @else
                                    Showing <span class="text-[#1A1A1A] font-bold">0</span> cases
                                @endif
                            </div>
                            
                            <div class="flex items-center gap-2">
                                {{-- Previous --}}
                                @if ($lawyers->onFirstPage())
                                    <span class="px-4 py-2 text-[#8B95A5] text-sm font-bold cursor-not-allowed">Previous</span>
                                @else
                                    <a href="{{ $lawyers->previousPageUrl() }}" class="px-4 py-2 text-[#1D5083] text-sm font-bold hover:text-[#0E3A68] transition-colors">Previous</a>
                                @endif

                                {{-- Numbers --}}
                                <div class="flex items-center gap-1 mx-2">
                                    @foreach ($lawyers->getUrlRange(1, $lawyers->lastPage()) as $page => $url)
                                        @if ($page == $lawyers->currentPage())
                                            <span class="w-10 h-10 flex items-center justify-center bg-[#1D5083] text-white text-sm font-bold rounded-xl shadow-md">{{ $page }}</span>
                                        @else
                                            <a href="{{ $url }}" class="w-10 h-10 flex items-center justify-center bg-white border border-[#E2E8F0] text-[#6B7280] text-sm font-bold rounded-xl hover:bg-[#F8FAFC] transition-colors">{{ $page }}</a>
                                        @endif
                                    @endforeach
                                </div>

                                {{-- Next --}}
                                @if ($lawyers->hasMorePages())
                                    <a href="{{ $lawyers->nextPageUrl() }}" class="px-4 py-2 text-[#1D5083] text-sm font-bold hover:text-[#0E3A68] transition-colors">Next</a>
                                @else
                                    <span class="px-4 py-2 text-[#8B95A5] text-sm font-bold cursor-not-allowed">Next</span>
                                @endif
                            </div>
                        </div>
                    </div>

                    <!-- Moderation Interface -->
                    <div class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col gap-6" x-show="selectedLawyer">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-3">
                                <span class="text-[#1D5083] font-bold text-sm flex items-center gap-1.5">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.745-2.713 9.48a11.573 11.573 0 006.713 0C14.991 17.745 14 14.517 14 11V6.207l-2-2-2 2V11z"></path></svg>
                                    Moderation Interface: Audit for <span x-text="selectedLawyer.name"></span>
                                </span>
                            </div>
                            <span class="text-[10px] text-[#8B95A5] font-bold uppercase tracking-widest" x-text="'ID: ' + selectedLawyer.id"></span>
                        </div>

                        <div>
                            <p class="text-xs font-bold text-[#1A1A1A] mb-2 uppercase tracking-widest text-[#8B95A5]">Incident Narrative</p>
                            <p class="text-sm text-[#475569] font-light leading-relaxed bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] italic">
                                "Subject has been flagged for <span class="font-bold text-[#1D5083]" x-text="selectedLawyer.category"></span>. Initial algorithmic scan indicates inconsistencies in historical filing records compared to the provided Law Firm credentials (<span x-text="selectedLawyer.law_firm"></span>). Manual audit of license validity and client testimonials required."
                            </p>
                        </div>

                        <div class="flex gap-2">
                            <button class="px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] rounded-xl text-[10px] font-bold hover:bg-[#EBF3FA] hover:text-[#1D5083] hover:border-[#1D5083]/30 transition-all">Request More Info</button>
                            <button class="px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] rounded-xl text-[10px] font-bold hover:bg-[#FCE8E8] hover:text-[#EF4444] hover:border-[#EF4444]/30 transition-all">Flag as Malicious</button>
                            <button class="px-4 py-2 bg-[#1D5083] text-white rounded-xl text-[10px] font-bold shadow-sm">Mark for Full Audit</button>
                        </div>

                        <!-- Evidence Section -->
                        <div class="border-t border-[#E2E8F0] pt-6 flex flex-col gap-4">
                            <p class="text-xs font-bold text-[#1A1A1A] uppercase tracking-widest text-[#8B95A5]">Evidence Document Fragments</p>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] group cursor-pointer hover:border-[#1D5083]/30 transition-all">
                                    <div class="flex items-center gap-2 mb-2">
                                        <svg class="w-4 h-4 text-[#1D5083]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        <span class="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">LICENSE_VERIF.PDF</span>
                                    </div>
                                    <p class="text-[10px] text-[#6B7280] leading-relaxed">Official bar scan shows a name mismatch on Article 4... <span class="text-[#1D5083] font-bold">View Fragment</span></p>
                                </div>
                                <div class="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] group cursor-pointer hover:border-[#1D5083]/30 transition-all">
                                    <div class="flex items-center gap-2 mb-2">
                                        <svg class="w-4 h-4 text-[#1D5083]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 1.657-2.388 3-5.333 3H12l-4 4v-4c-2.945 0-5.333-1.343-5.333-3s2.388-3 5.333-3h8c2.945 0 5.333 1.343 5.333 3z"></path></svg>
                                        <span class="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">CLIENT_CHAT_LOG.XLS</span>
                                    </div>
                                    <p class="text-[10px] text-[#6B7280] leading-relaxed">Recorded 12 instances of unprofessional tone... <span class="text-[#1D5083] font-bold">Open Log</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Right Column: Actions & Metrics -->
                <div class="flex flex-col gap-6">
                    
                    <!-- Action Panel -->
                    <div class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col gap-6" x-show="selectedLawyer">
                        <div class="flex items-center gap-2 text-[#EF4444]">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m4-6V5a3 3 0 00-3-3H9a3 3 0 00-3 3v4m6 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V12a2 2 0 00-2-2z"></path></svg>
                            <h2 class="font-serif text-lg font-bold">Strict Protocol Required</h2>
                        </div>

                        <div class="w-max bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                            <span class="text-[10px] font-bold text-red-600 uppercase tracking-wider">Threat Level</span>
                            <p class="text-sm font-bold text-red-700" x-text="selectedLawyer.risk_level + ' Risk'"></p>
                        </div>

                        <div class="flex flex-col gap-3">
                            <p class="text-[10px] font-bold text-[#8B95A5] uppercase tracking-wider">Select Administrative Action</p>
                            
                            <button class="w-full bg-white border border-[#E2E8F0] px-4 py-3 rounded-xl flex justify-between items-center hover:border-[#1D5083] hover:shadow-sm transition-all group text-left">
                                <div>
                                    <p class="text-xs font-bold text-[#1A1A1A] group-hover:text-[#1D5083]">Issue Official Warning</p>
                                    <p class="text-[9px] text-[#6B7280]">Logged in legal audit trail</p>
                                </div>
                                <svg class="w-4 h-4 text-[#8B95A5] group-hover:text-[#1D5083]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                            </button>

                            <button class="w-full bg-white border border-[#E2E8F0] px-4 py-3 rounded-xl flex justify-between items-center hover:border-[#10B981] hover:shadow-sm transition-all group text-left">
                                <div>
                                    <p class="text-xs font-bold text-[#1A1A1A] group-hover:text-[#10B981]">Approve as Resolved</p>
                                    <p class="text-[9px] text-[#6B7280]">Dismiss incident report</p>
                                </div>
                                <svg class="w-4 h-4 text-[#8B95A5] group-hover:text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                            </button>

                            <button class="w-full bg-[#FCE8E8] border border-[#EF4444]/20 px-4 py-3 rounded-xl flex justify-between items-center hover:border-[#EF4444] hover:shadow-sm transition-all group text-left">
                                <div>
                                    <p class="text-xs font-bold text-[#EF4444]">Restrict Account Access</p>
                                    <p class="text-[9px] text-[#EF4444]/70">7-day temporary suspension</p>
                                </div>
                                <svg class="w-4 h-4 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                            </button>
                        </div>

                        <button @click="window.showToast('Decision saved successfully.', 'success')" class="w-full bg-[#1D5083] text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-[#1D5083]/20 hover:bg-[#153c63] transition-colors">
                            Save Audit Decision
                        </button>
                    </div>

                    <!-- Reporter Reliability -->
                    <div class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col gap-4">
                        <p class="text-[10px] font-bold text-[#8B95A5] uppercase tracking-wider">Audit Assignment</p>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-[#EBF3FA] rounded-xl flex items-center justify-center text-[#1D5083] font-bold">AI</div>
                            <div>
                                <p class="text-xs font-bold text-[#1A1A1A]">Admin AI System</p>
                                <p class="text-[10px] text-[#6B7280]">Automated Scoring: <span class="font-bold text-[#10B981]">94%</span></p>
                            </div>
                        </div>
                        <p class="text-[10px] text-[#6B7280] font-light leading-relaxed">
                            Case auto-assigned based on high risk and category complexity. Manual supervisor review pending.
                        </p>
                    </div>

                </div>

            </div>
            
            <!-- Spacer -->
            <div class="shrink-0 h-8"></div>
        </main>
    </div>

    <!-- Filter Modal -->
    <template x-teleport="body">
        <div x-show="showModal" x-cloak class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div @click="showModal = false" class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            <div class="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-[#E2E8F0]">
                <h3 class="font-serif text-lg font-bold text-[#1A1A1A] mb-6">Advanced Filter Suite</h3>
                
                <form action="{{ route('reportlawyer') }}" method="GET" class="flex flex-col gap-5">
                    @if(request('search'))
                        <input type="hidden" name="search" value="{{ request('search') }}">
                    @endif

                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-bold text-[#8B95A5] uppercase tracking-widest">Incident Status</label>
                        <select name="status" class="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#1D5083]">
                            <option value="All">All Statuses</option>
                            @foreach($statuses as $status)
                                <option value="{{ $status }}" {{ request('status') == $status ? 'selected' : '' }}>{{ $status }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-bold text-[#8B95A5] uppercase tracking-widest">Risk Level</label>
                        <select name="risk" class="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#1D5083]">
                            <option value="All">All Levels</option>
                            @foreach($riskLevels as $level)
                                <option value="{{ $level }}" {{ request('risk') == $level ? 'selected' : '' }}>{{ $level }} Risk</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-bold text-[#8B95A5] uppercase tracking-widest">Report Category</label>
                        <select name="category" class="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#1D5083]">
                            <option value="All">All Categories</option>
                            @foreach($categories as $category)
                                <option value="{{ $category }}" {{ request('category') == $category ? 'selected' : '' }}>{{ $category }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="flex gap-3 mt-4">
                        <button type="button" @click="showModal = false" class="flex-1 px-4 py-2.5 border border-[#E2E8F0] text-[#6B7280] rounded-xl font-bold text-xs hover:bg-[#F8FAFC] transition-all">Cancel</button>
                        <button type="submit" class="flex-1 px-4 py-2.5 bg-[#1D5083] text-white rounded-xl font-bold text-xs shadow-md shadow-[#1D5083]/10 hover:bg-[#153c63] transition-all">Apply Filters</button>
                    </div>
                </form>
            </div>
        </div>
    </template>

    <div id="toast-container" class="fixed bottom-6 right-6 z-[500] flex flex-col gap-3"></div>
    <script>
        function showToast(m,t='info'){const c={success:'bg-[#10B981] text-white',info:'bg-[#1D5083] text-white',warning:'bg-[#F59E0B] text-white',error:'bg-red-600 text-white'};const e=document.createElement('div');e.className=`${c[t]} px-4 py-2 rounded-lg shadow-lg text-xs font-bold flex items-center gap-2`;e.style.animation='fadeIn .3s ease-out';e.innerHTML=`<span>${m}</span><button onclick="this.parentElement.remove()" class="opacity-70 hover:opacity-100">✕</button>`;document.getElementById('toast-container').appendChild(e);setTimeout(()=>{e.style.opacity='0';e.style.transition='opacity .3s';setTimeout(()=>e.remove(),300)},4000)}
        window.showToast = showToast;
    </script>
</body>
</html>
