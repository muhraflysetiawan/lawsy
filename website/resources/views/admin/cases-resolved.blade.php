<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Resolved Cases History - Lawsy</title>
    
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    
    <style>
        body { font-family: 'Poppins', sans-serif; background-color: #F8FAFC; }
        .font-serif { font-family: 'Poppins', sans-serif; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .badge-suspended { background-color: #450A0A; color: #FECACA; border: 1px solid #7F1D1D; }
        .badge-warning-2 { background-color: #FFF7ED; color: #EA580C; border: 1px solid #FFEDD5; }
        .badge-warning-1 { background-color: #FEFCE8; color: #CA8A04; border: 1px solid #FEF08A; }
    </style>
</head>
<body class="flex h-screen bg-[#F8FAFC] overflow-hidden text-[#1A1A1A]">

    {{-- @include('admin.components.sidebar') --}}

    <div class="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        <header class="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-4">
                <a href="{{ route('reportlawyer') }}" class="p-2 hover:bg-gray-100 rounded-full transition">
                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </a>
                <h1 class="text-xl font-bold text-[#1A1A1A]">Resolved Cases History</h1>
            </div>
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
        </header>

        <main class="flex-1 overflow-y-auto p-8 animate-fade-in">
            
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
                    <h2 class="font-serif text-3xl font-bold text-[#1A1A1A] mb-1">Administrative Action Archive</h2>
                    <p class="text-sm text-[#6B7280] font-light">Historical record of all sanctions, suspensions, and resolved incidents across the network.</p>
                </div>
                <div class="bg-white px-4 py-2 rounded-xl border border-[#E2E8F0] shadow-sm flex items-center gap-3">
                    <div class="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
                    <span class="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">Database Synced</span>
                </div>
            </div>

            <!-- Enhanced Horizontal Stats Grid (Hardcoded Styles for Visibility) -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                
                <!-- Total Handled (OVERALL Style) -->
                <div class="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all">
                    <div class="flex justify-between items-center mb-6">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center text-[#1D5083]" style="background-color: #EBF3FA;">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                        <span class="px-3 py-1 rounded-full text-[10px] font-black text-[#1D5083] uppercase tracking-[0.05em] border border-[#D1E2F2]" style="background-color: #EBF3FA;">OVERALL</span>
                    </div>
                    <h3 class="text-2xl font-bold text-[#1A1A1A] leading-tight">{{ $cases->count() }} Handled Cases</h3>
                    <p class="text-[11px] text-[#8B95A5] mt-1 font-medium">Total resolution history recorded</p>
                </div>

                <!-- Suspended (CRITICAL Style) -->
                <div class="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all">
                    <div class="flex justify-between items-center mb-6">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center text-[#EF4444]" style="background-color: #FEF2F2;">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        <span class="px-3 py-1 rounded-full text-[10px] font-black text-[#EF4444] uppercase tracking-[0.05em] border border-[#FEE2E2]" style="background-color: #FEF2F2;">CRITICAL</span>
                    </div>
                    <h3 class="text-2xl font-bold text-[#1A1A1A] leading-tight">{{ $cases->where('sanction', 'Suspended')->count() }} Suspended</h3>
                    <p class="text-[11px] text-[#8B95A5] mt-1 font-medium">Immediate legal holds issued</p>
                </div>

                <!-- Warning Lvl 2 (MEDIUM Style) -->
                <div class="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all">
                    <div class="flex justify-between items-center mb-6">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center text-[#EA580C]" style="background-color: #FFF7ED;">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <span class="px-3 py-1 rounded-full text-[10px] font-black text-[#EA580C] uppercase tracking-[0.05em] border border-[#FFEDD5]" style="background-color: #FFF7ED;">MEDIUM</span>
                    </div>
                    <h3 class="text-2xl font-bold text-[#1A1A1A] leading-tight">{{ $cases->where('sanction', 'Warning Letter 2')->count() }} Lvl 2 Warning</h3>
                    <p class="text-[11px] text-[#8B95A5] mt-1 font-medium">Under strict compliance monitor</p>
                </div>

                <!-- Warning Lvl 1 (MINOR Style) -->
                <div class="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all">
                    <div class="flex justify-between items-center mb-6">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center text-[#10B981]" style="background-color: #F0FDF4;">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <span class="px-3 py-1 rounded-full text-[10px] font-black text-[#10B981] uppercase tracking-[0.05em] border border-[#DCFCE7]" style="background-color: #F0FDF4;">MINOR</span>
                    </div>
                    <h3 class="text-2xl font-bold text-[#1A1A1A] leading-tight">{{ $cases->where('sanction', 'Warning Letter 1')->count() }} Lvl 1 Warning</h3>
                    <p class="text-[11px] text-[#8B95A5] mt-1 font-medium">Disciplinary soft notification</p>
                </div>
            </div>

            <div class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div class="px-6 py-5 border-b border-[#E2E8F0] flex justify-between items-center bg-[#FAFBFF]">
                    <h3 class="font-bold text-[#1A1A1A] text-sm">Decision History Log</h3>
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] text-[#8B95A5] font-bold uppercase tracking-widest">Filter: </span>
                        <select class="bg-transparent border-none text-[10px] font-bold text-[#1D5083] outline-none cursor-pointer">
                            <option>Newest Decision</option>
                            <option>Highest Sanction</option>
                        </select>
                    </div>
                </div>
                <table class="w-full text-sm text-left">
                    <thead class="text-[10px] uppercase tracking-wider text-[#8B95A5] bg-[#F8FAFC] font-bold">
                        <tr>
                            <th class="px-6 py-4">Attorney</th>
                            <th class="px-6 py-4">Category</th>
                            <th class="px-6 py-4">Administrative Action</th>
                            <th class="px-6 py-4">Resolution Date</th>
                            <th class="px-6 py-4 text-right">View Log</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-[#E2E8F0]">
                        @foreach($cases as $case)
                        <tr class="hover:bg-[#F8FAFC] transition-colors">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <img src="{{ $case['photo'] }}" class="w-8 h-8 rounded-full border border-[#E2E8F0]">
                                    <div>
                                        <p class="font-bold text-[#1A1A1A]">{{ $case['name'] }}</p>
                                        <p class="text-[10px] text-[#8B95A5] font-mono">{{ $case['id'] }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-xs text-[#6B7280] font-medium">{{ $case['category'] }}</td>
                            <td class="px-6 py-4">
                                @php
                                    $badgeClass = match($case['sanction']) {
                                        'Suspended' => 'badge-suspended',
                                        'Warning Letter 2' => 'badge-warning-2',
                                        'Warning Letter 1' => 'badge-warning-1',
                                        default => 'badge-warning-1'
                                    };
                                @endphp
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold border {{ $badgeClass }}">
                                    {{ strtoupper($case['sanction']) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-xs text-[#1A1A1A] font-bold">{{ $case['sanction_date'] }}</td>
                            <td class="px-6 py-4 text-right">
                                <button class="text-[#1D5083] font-bold hover:underline text-xs">Full Record</button>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </main>
    </div>
</body>
</html>
