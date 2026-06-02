<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Cases Report Center - Lawsy</title>
    
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    
    <style>
        body { font-family: 'Poppins', sans-serif; background-color: #F8FAFC; color: #1A1A1A; }
        .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        .font-serif { font-family: 'Poppins', sans-serif; }
        .glow-red { box-shadow: 0 0 15px rgba(239, 68, 68, 0.2); }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .modal-scale { animation: modalScale 0.3s ease-out; }
        @keyframes modalScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .pulse-status { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        [x-cloak] { display: none !important; }

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
    showModal: false, 
    selectedLawyer: null,
    searchQuery: '{{ request('search') }}',
    statusFilter: '{{ request('status', 'All') }}',
    riskFilter: '{{ request('risk', 'All') }}',
    categoryFilter: '{{ request('category', 'All') }}'
}">

    @include('admin.components.sidebar')

    <div class="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        <!-- Header -->
        <header class="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between shrink-0">
            <!-- Left: Title -->
            <div class="flex items-center gap-4">
                <h1 class="text-xl font-bold text-[#1A1A1A]">Cases Report Center</h1>
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

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto p-8 flex flex-col gap-8 animate-fade-in">
            
            <!-- Page Header Section -->
            <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between shrink-0">
                <div>
                    <p class="text-sm text-[#6B7280] font-light">Comprehensive monitoring of professional misconduct and compliance violations.</p>
                </div>
                <div class="flex items-center gap-3">
                    <button class="bg-white border border-[#E2E8F0] text-[#475569] px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#F8FAFC] transition-all flex items-center gap-2 shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Export Report
                    </button>
                </div>
            </div>

            <!-- Header Stats Section -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white p-6 rounded-2xl border border-[#E2E8F0] flex flex-col gap-2 shadow-sm group hover:border-[#1D5083]/30 transition-all">
                    <div class="flex justify-between items-center">
                        <div class="w-12 h-12 bg-[#EBF3FA] rounded-xl flex items-center justify-center text-[#1D5083]">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                        <span class="text-[10px] font-bold text-[#8B95A5] uppercase tracking-widest">Total Reports</span>
                    </div>
                    <span class="text-3xl font-bold text-[#1A1A1A] mt-2">{{ $stats['total'] }}</span>
                    <p class="text-xs text-[#6B7280]">Total unique reported entities</p>
                </div>

                <div class="bg-white p-6 rounded-2xl border border-[#E2E8F0] flex flex-col gap-2 shadow-sm group hover:border-amber-500/30 transition-all">
                    <div class="flex justify-between items-center">
                        <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                        </div>
                        <span class="text-[10px] font-bold text-amber-600 uppercase tracking-widest pulse-status">Active Investigations</span>
                    </div>
                    <span class="text-3xl font-bold text-[#1A1A1A] mt-2">{{ $stats['active_investigations'] }}</span>
                    <p class="text-xs text-[#6B7280]">Currently under deep audit</p>
                </div>

                <div class="bg-white p-6 rounded-2xl border border-[#E2E8F0] flex flex-col gap-2 shadow-sm group hover:border-red-500/30 transition-all glow-red">
                    <div class="flex justify-between items-center">
                        <div class="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        <span class="text-[10px] font-bold text-red-600 uppercase tracking-widest pulse-status">Critical Cases</span>
                    </div>
                    <span class="text-3xl font-bold text-[#1A1A1A] mt-2">{{ $stats['critical'] }}</span>
                    <p class="text-xs text-[#6B7280]">High priority immediate action</p>
                </div>
            </div>

            <!-- Search & Filters -->
            <div class="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col gap-6 lg:flex-row lg:items-center">
                <form action="{{ route('admin.cases-report') }}" method="GET" class="w-full flex flex-col lg:flex-row gap-4">
                    <div class="flex-1 relative group">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                            <svg class="w-4 h-4 text-[#8B95A5] group-focus-within:text-[#1D5083] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <input type="text" name="search" value="{{ request('search') }}" 
                               placeholder="Search Lawyer Name or ID..." 
                               class="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-transparent rounded-xl text-sm transition-all outline-none focus:outline-none focus:ring-0 focus:border-transparent"
                               style="outline: none !important; box-shadow: none !important; border: 1px solid transparent !important;">
                    </div>

                    <div class="flex flex-wrap gap-4">
                        <select name="status" class="bg-[#F8FAFC] border-none rounded-xl text-xs font-bold px-4 py-2.5 focus:ring-2 focus:ring-[#1D5083]/20 appearance-none cursor-pointer text-[#475569]">
                            <option value="All">All Status</option>
                            @foreach($statuses as $status)
                                <option value="{{ $status }}" {{ request('status') == $status ? 'selected' : '' }}>{{ $status }}</option>
                            @endforeach
                        </select>

                        <select name="risk" class="bg-[#F8FAFC] border-none rounded-xl text-xs font-bold px-4 py-2.5 focus:ring-2 focus:ring-[#1D5083]/20 appearance-none cursor-pointer text-[#475569]">
                            <option value="All">All Risk</option>
                            @foreach($riskLevels as $level)
                                <option value="{{ $level }}" {{ request('risk') == $level ? 'selected' : '' }}>{{ $level }} Risk</option>
                            @endforeach
                        </select>

                        <select name="category" class="bg-[#F8FAFC] border-none rounded-xl text-xs font-bold px-4 py-2.5 focus:ring-2 focus:ring-[#1D5083]/20 appearance-none cursor-pointer text-[#475569]">
                            <option value="All">All Categories</option>
                            @foreach($categories as $category)
                                <option value="{{ $category }}" {{ request('category') == $category ? 'selected' : '' }}>{{ $category }}</option>
                            @endforeach
                        </select>

                        <button type="submit" class="bg-[#1D5083] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#153c63] transition-all shadow-md shadow-[#1D5083]/10">Apply Filters</button>
                        <a href="{{ route('admin.cases-report') }}" class="flex items-center justify-center px-4 py-2.5 text-[#8B95A5] hover:text-[#1D5083] font-bold text-sm transition-all">Reset</a>
                    </div>
                </form>
            </div>

            <!-- Table Section -->
            <div class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex-1 flex flex-col min-h-[600px]">
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="sticky top-0 bg-[#F8FAFC] border-b border-[#E2E8F0] z-20 text-[10px] uppercase tracking-widest text-[#8B95A5] font-bold">
                            <tr>
                                <th class="px-6 py-4">Lawyer Information</th>
                                <th class="px-6 py-4">Reports</th>
                                <th class="px-6 py-4">Report Category</th>
                                <th class="px-6 py-4">Risk Level</th>
                                <th class="px-6 py-4">Status</th>
                                <th class="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-[#E2E8F0]">
                            @forelse($lawyers as $lawyer)
                            <tr class="hover:bg-[#F8FAFC] transition-colors group">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div class="relative">
                                            <img src="{{ $lawyer['photo'] }}" alt="{{ $lawyer['name'] }}" class="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm">
                                            @if($lawyer['online'] ?? false)
                                                <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10B981] border-2 border-white rounded-full"></span>
                                            @endif
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold text-[#1A1A1A] group-hover:text-[#1D5083] transition-colors">{{ $lawyer['name'] }}</p>
                                            <div class="flex items-center gap-2 mt-0.5">
                                                <span class="text-[10px] text-[#8B95A5] font-mono">{{ $lawyer['id'] }}</span>
                                                <span class="w-1 h-1 bg-[#CBD5E1] rounded-full"></span>
                                                <span class="text-[10px] text-[#6B7280]">{{ $lawyer['law_firm'] }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex flex-col gap-0.5">
                                        <span class="text-sm font-bold text-[#1A1A1A]">{{ $lawyer['reports_count'] }} Reports</span>
                                        <span class="text-[10px] text-[#8B95A5]">Last: {{ $lawyer['last_activity'] }}</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="text-xs text-[#475569] font-medium">{{ $lawyer['category'] }}</span>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="px-3 py-1 rounded-full text-[10px] font-bold border {{ $lawyer['risk_color'] }} uppercase tracking-wider">
                                        {{ $lawyer['risk_level'] }}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-2">
                                        <div class="w-2 h-2 rounded-full {{ str_contains($lawyer['status'], 'High') || str_contains($lawyer['status'], 'Escalated') ? 'bg-red-500 pulse-status' : (str_contains($lawyer['status'], 'Resolved') ? 'bg-[#10B981]' : 'bg-amber-500') }}"></div>
                                        <span class="text-xs font-bold text-[#1A1A1A]">{{ $lawyer['status'] }}</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <button @click="selectedLawyer = {{ json_encode($lawyer) }}; showModal = true" class="px-4 py-2 bg-white border border-[#E2E8F0] text-[#1D5083] rounded-lg text-xs font-bold hover:bg-[#1D5083] hover:text-white hover:border-[#1D5083] transition-all shadow-sm">
                                        View Details
                                    </button>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="6" class="px-6 py-20 text-center">
                                    <div class="flex flex-col items-center gap-3">
                                        <div class="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center text-[#CBD5E1]">
                                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        </div>
                                        <p class="text-sm font-bold text-[#8B95A5]">No reported lawyers found matching your criteria.</p>
                                    </div>
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                <!-- Custom Pagination -->
                <div class="px-6 py-6 border-t border-[#E2E8F0] bg-[#FAFBFF] mt-auto flex items-center justify-between">
                    <div class="text-xs text-[#8B95A5] font-bold uppercase tracking-widest">
                        Showing <span class="text-[#1D5083]">{{ $lawyers->firstItem() ?? 0 }}</span> to <span class="text-[#1D5083]">{{ $lawyers->lastItem() ?? 0 }}</span> of <span class="text-[#1D5083]">{{ $lawyers->total() }}</span> Results
                    </div>
                    
                    <div class="flex items-center gap-2">
                        {{-- Previous Page Link --}}
                        @if ($lawyers->onFirstPage())
                            <span class="p-2 text-[#CBD5E1] cursor-not-allowed">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                            </span>
                        @else
                            <a href="{{ $lawyers->previousPageUrl() }}" class="p-2 text-[#475569] hover:bg-[#EBF3FA] hover:text-[#1D5083] rounded-lg transition-all">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                            </a>
                        @endif

                        {{-- Pagination Elements --}}
                        <div class="flex items-center gap-1">
                            @foreach ($lawyers->getUrlRange(1, $lawyers->lastPage()) as $page => $url)
                                @if ($page == $lawyers->currentPage())
                                    <span class="w-10 h-10 flex items-center justify-center bg-[#1D5083] text-white rounded-xl font-bold text-xs shadow-md shadow-[#1D5083]/20 z-10">{{ $page }}</span>
                                @else
                                    <a href="{{ $url }}" class="w-10 h-10 flex items-center justify-center text-[#475569] hover:bg-[#EBF3FA] hover:text-[#1D5083] rounded-xl font-bold text-xs transition-all">{{ $page }}</a>
                                @endif
                            @endforeach
                        </div>

                        {{-- Next Page Link --}}
                        @if ($lawyers->hasMorePages())
                            <a href="{{ $lawyers->nextPageUrl() }}" class="p-2 text-[#475569] hover:bg-[#EBF3FA] hover:text-[#1D5083] rounded-lg transition-all">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                            </a>
                        @else
                            <span class="p-2 text-[#CBD5E1] cursor-not-allowed">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                            </span>
                        @endif
                    </div>
                </div>
            </div>

            <!-- Spacer -->
            <div class="h-8 shrink-0"></div>
        </main>
    </div>

    <!-- Details Modal -->
    <template x-teleport="body">
        <div x-show="showModal" x-cloak class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <!-- Backdrop -->
            <div x-show="showModal" 
                 x-transition:enter="transition ease-out duration-300"
                 x-transition:enter-start="opacity-0"
                 x-transition:enter-end="opacity-100"
                 x-transition:leave="transition ease-in duration-200"
                 x-transition:leave-start="opacity-100"
                 x-transition:leave-end="opacity-0"
                 @click="showModal = false" class="absolute inset-0 bg-[#0E1B2A]/60 backdrop-blur-md"></div>
            
            <!-- Modal Content -->
            <div x-show="showModal"
                 x-transition:enter="transition ease-out duration-300"
                 x-transition:enter-start="opacity-0 scale-95 translate-y-4"
                 x-transition:enter-end="opacity-100 scale-100 translate-y-0"
                 x-transition:leave="transition ease-in duration-200"
                 x-transition:leave-start="opacity-100 scale-100 translate-y-0"
                 x-transition:leave-end="opacity-0 scale-95 translate-y-4"
                 class="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col modal-scale">
                
                <!-- Modal Header -->
                <div class="px-8 py-6 border-b border-[#E2E8F0] flex justify-between items-center bg-[#FAFBFF]">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-[#EBF3FA] rounded-2xl flex items-center justify-center text-[#1D5083]">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>
                        <div>
                            <h2 class="font-serif text-xl font-bold text-[#1A1A1A]">Detailed Misconduct Audit</h2>
                            <p class="text-xs text-[#8B95A5] font-bold uppercase tracking-widest">Case Audit ID: #AUD-{{ rand(10000, 99999) }}</p>
                        </div>
                    </div>
                    <button @click="showModal = false" class="p-2 hover:bg-[#F1F5F9] rounded-xl transition-all text-[#8B95A5] hover:text-[#1D5083]">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <!-- Modal Body -->
                <div class="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
                    <!-- Lawyer Summary -->
                    <div class="flex flex-col md:flex-row gap-8 items-start">
                        <div class="w-full md:w-1/3 flex flex-col gap-4">
                            <img :src="selectedLawyer?.photo" class="w-full aspect-square rounded-2xl object-cover shadow-lg border-4 border-white">
                            <div class="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                                <span class="text-[10px] font-bold text-[#8B95A5] uppercase tracking-widest">Assigned Administrator</span>
                                <p class="text-sm font-bold text-[#1A1A1A] mt-1" x-text="selectedLawyer?.assigned_admin"></p>
                            </div>
                        </div>
                        <div class="w-full md:w-2/3 flex flex-col gap-6">
                            <div>
                                <h3 class="text-2xl font-bold text-[#1D5083]" x-text="selectedLawyer?.name"></h3>
                                <p class="text-sm text-[#6B7280]" x-text="selectedLawyer?.law_firm + ' • ' + selectedLawyer?.specialization"></p>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div class="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                                    <span class="text-[10px] font-bold text-[#8B95A5] uppercase tracking-widest">Risk Factor</span>
                                    <div class="flex items-center gap-2 mt-1">
                                        <span class="w-2 h-2 rounded-full bg-red-500 pulse-status"></span>
                                        <p class="text-sm font-bold text-[#1A1A1A]" x-text="selectedLawyer?.risk_level + ' Risk'"></p>
                                    </div>
                                </div>
                                <div class="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                                    <span class="text-[10px] font-bold text-[#8B95A5] uppercase tracking-widest">Incident Category</span>
                                    <p class="text-sm font-bold text-[#1A1A1A] mt-1" x-text="selectedLawyer?.category"></p>
                                </div>
                            </div>

                            <!-- AI Summary -->
                            <div class="bg-[#0E3A68] text-white p-6 rounded-2xl relative overflow-hidden">
                                <div class="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4">
                                    <svg class="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM5.884 4.47a1 1 0 10-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM14.116 4.47a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM4.5 10a.5.5 0 000 1h1a.5.5 0 000-1h-1zM14.5 10a.5.5 0 000 1h1a.5.5 0 000-1h-1zM7 14a1 1 0 11-2 0 1 1 0 012 0zM19 11a1 1 0 100-2h-1a1 1 0 100 2h1zM15.116 15.116a1 1 0 101.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM4.47 14.116a1 1 0 101.414 1.414l.707-.707a1 1 0 00-1.414-1.414l-.707.707z"></path></svg>
                                </div>
                                <div class="flex items-center gap-2 mb-3">
                                    <svg class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3z"></path></svg>
                                    <span class="text-[10px] font-bold uppercase tracking-widest opacity-80">AI Compliance Summary</span>
                                </div>
                                <p class="text-sm leading-relaxed font-medium">Subject shows a pattern of <span class="text-amber-400" x-text="selectedLawyer?.category"></span> across multiple jurisdictions. Sentiment analysis of client disputes indicates a 84% probability of intentional malpractice. Recommend immediate suspension pending verification of secondary license credentials.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Report Timeline & Evidence -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="flex flex-col gap-4">
                            <h4 class="font-bold text-[#1A1A1A] text-sm flex items-center gap-2">
                                <svg class="w-4 h-4 text-[#1D5083]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Incident Timeline
                            </h4>
                            <div class="flex flex-col gap-4 pl-4 border-l-2 border-[#E2E8F0]">
                                <div class="relative">
                                    <div class="absolute -left-[21px] top-1 w-4 h-4 bg-[#1D5083] rounded-full border-4 border-white ring-1 ring-[#1D5083]"></div>
                                    <p class="text-[10px] font-bold text-[#1D5083] uppercase tracking-wider" x-text="selectedLawyer?.last_activity"></p>
                                    <p class="text-xs font-bold text-[#1A1A1A] mt-1">Final Escalation Logged</p>
                                    <p class="text-[10px] text-[#6B7280]">AI automated check triggered manual audit.</p>
                                </div>
                                <div class="relative">
                                    <div class="absolute -left-[21px] top-1 w-4 h-4 bg-[#CBD5E1] rounded-full border-4 border-white"></div>
                                    <p class="text-[10px] font-bold text-[#8B95A5] uppercase tracking-wider">MAR 12, 2024</p>
                                    <p class="text-xs font-bold text-[#1A1A1A] mt-1">Secondary Client Dispute</p>
                                    <p class="text-[10px] text-[#6B7280]">Unresolved fee disagreement reported by verified user.</p>
                                </div>
                                <div class="relative opacity-50">
                                    <div class="absolute -left-[21px] top-1 w-4 h-4 bg-[#CBD5E1] rounded-full border-4 border-white"></div>
                                    <p class="text-[10px] font-bold text-[#8B95A5] uppercase tracking-wider">FEB 28, 2024</p>
                                    <p class="text-xs font-bold text-[#1A1A1A] mt-1">Verification Initial Failure</p>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col gap-4">
                            <h4 class="font-bold text-[#1A1A1A] text-sm flex items-center gap-2">
                                <svg class="w-4 h-4 text-[#1D5083]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                Evidence Preview
                            </h4>
                            <div class="grid grid-cols-2 gap-3">
                                <div class="group relative aspect-video bg-[#F1F5F9] rounded-xl overflow-hidden cursor-pointer">
                                    <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all z-10 text-white text-[10px] font-bold">VIEW DOCUMENT</div>
                                    <div class="p-4 flex flex-col gap-2">
                                        <div class="w-full h-1 bg-[#CBD5E1] rounded"></div>
                                        <div class="w-2/3 h-1 bg-[#CBD5E1] rounded"></div>
                                        <div class="w-full h-8 bg-[#E2E8F0] rounded mt-2"></div>
                                    </div>
                                    <span class="absolute bottom-2 left-2 px-1.5 py-0.5 bg-white/90 text-[#1D5083] text-[8px] font-bold rounded">LICENSE_SCAN.PDF</span>
                                </div>
                                <div class="group relative aspect-video bg-[#F1F5F9] rounded-xl overflow-hidden cursor-pointer">
                                    <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all z-10 text-white text-[10px] font-bold">VIEW TRANSCRIPT</div>
                                    <div class="p-4 flex flex-col gap-2">
                                        <div class="w-full h-1 bg-red-200 rounded"></div>
                                        <div class="w-full h-8 bg-[#FEE2E2] rounded mt-2 border border-red-100 flex items-center justify-center text-[8px] text-red-500 font-bold">MALICIOUS DETECTED</div>
                                    </div>
                                    <span class="absolute bottom-2 left-2 px-1.5 py-0.5 bg-white/90 text-[#1D5083] text-[8px] font-bold rounded">CHAT_LOG_V2.XLS</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Internal Notes -->
                    <div class="flex flex-col gap-3">
                        <label class="text-[10px] font-bold text-[#8B95A5] uppercase tracking-widest">Internal Admin Audit Notes</label>
                        <textarea placeholder="Add private notes for other administrators..." class="w-full p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-sm focus:ring-2 focus:ring-[#1D5083]/10 transition-all resize-none min-h-[100px]"></textarea>
                    </div>
                </div>

                <!-- Modal Footer Actions -->
                <div class="px-8 py-6 border-t border-[#E2E8F0] bg-[#FAFBFF] flex flex-wrap gap-3 justify-end items-center">
                    <button @click="showModal = false" class="px-6 py-2.5 text-[#6B7280] font-bold text-sm hover:text-[#1D5083] transition-all">Close Audit</button>
                    <button class="px-6 py-2.5 bg-white border border-[#E2E8F0] text-[#1D5083] rounded-xl font-bold text-sm hover:bg-[#F8FAFC] transition-all">Request Evidence</button>
                    <button class="px-6 py-2.5 bg-white border border-[#E2E8F0] text-[#10B981] rounded-xl font-bold text-sm hover:bg-[#E1FCEF] hover:border-[#10B981]/30 transition-all">Mark Resolved</button>
                    <button class="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">Suspend Lawyer</button>
                </div>
            </div>
        </div>
    </template>

</body>
</html>
