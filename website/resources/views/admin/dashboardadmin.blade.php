<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Dashboard - Lawsy</title>
    
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
                <h1 class="text-xl font-bold text-[#1A1A1A]">Dashboard</h1>
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
        <main class="flex-1 overflow-y-auto p-8 flex flex-col gap-8" x-data="dashboardRealtime" x-init="init()">
            
            <!-- Banner Section -->
            <div class="relative bg-[#102A43] text-white p-10 rounded-3xl overflow-hidden shadow-xl shadow-[#102A43]/10 shrink-0">
                <div class="absolute inset-0 bg-gradient-to-r from-[#102A43] via-[#102A43] to-[#1D5083]/50 z-0"></div>
                <!-- Background Pattern (Placeholder for Scales) -->
                <div class="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 flex items-center justify-center z-0">
                    <svg class="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2l-8 4v2h16V6l-8-4zM2 10h2v6H2v-6zm4 0h2v6H6v-6zm4 0h2v6h-2v-6zm4 0h2v6h-2v-6zm4 0h2v6h-2v-6zM1 18h18v2H1v-2z"/>
                    </svg>
                </div>

                <div class="relative z-10 max-w-2xl flex flex-col gap-4">
                    <h1 class="font-serif text-4xl font-bold leading-tight">Mastering Modern Jurisprudence.</h1>
                    <p class="text-white/70 text-sm leading-relaxed font-light">
                        Welcome to Lawsy's central command. Oversee registrations, monitor active cases, and review AI-powered legal directives with precision.
                    </p>
                    <div class="flex gap-4 mt-2">
                        <a href="{{ route('admin.documents.index') }}" class="bg-white text-[#102A43] px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-[#F8FAFC] transition-colors">Review Documents</a>
                        <a href="{{ route('admin.compliance') }}" class="bg-transparent border border-white/30 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-white/10 transition-colors">Compliance Reports</a>
                    </div>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 shrink-0">
                <a href="#" class="bg-white p-6 rounded-2xl border border-[#E2E8F0] flex flex-col gap-2 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-[#1D5083]/20 transition-all duration-300 cursor-pointer group">
                    <div class="flex justify-between items-center text-[#8B95A5]">
                        <svg class="w-5 h-5 group-hover:text-[#1D5083] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        <span class="text-xs font-bold text-[#10B981] bg-[#E1FCEF] px-2 py-0.5 rounded-full">+12%</span>
                    </div>
                    <span class="text-xs font-bold text-[#8B95A5] uppercase tracking-wider mt-2">Total Users</span>
                    <span class="text-3xl font-bold text-[#1A1A1A]" x-text="Number(totalUsers).toLocaleString('en-US')">{{ number_format($totalUsers ?? 0) }}</span>
                </a>
                <a href="{{ route('lawyers_verification') }}" class="bg-white p-6 rounded-2xl border border-[#E2E8F0] flex flex-col gap-2 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-[#1D5083]/20 transition-all duration-300 cursor-pointer group">
                    <div class="flex justify-between items-center text-[#8B95A5]">
                        <svg class="w-5 h-5 group-hover:text-[#1D5083] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        <span class="text-xs font-bold text-[#1D5083] bg-[#EBF3FA] px-2 py-0.5 rounded-full">+6%</span>
                    </div>
                    <span class="text-xs font-bold text-[#8B95A5] uppercase tracking-wider mt-2">Total Lawyers</span>
                    <span class="text-3xl font-bold text-[#1A1A1A]" x-text="lawyerStats.total"></span>
                </a>
                <a href="{{ route('lawyers_verification') }}" class="bg-white p-6 rounded-2xl border border-[#E2E8F0] flex flex-col gap-2 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-[#1D5083]/20 transition-all duration-300 cursor-pointer group">
                    <div class="flex justify-between items-center text-[#8B95A5]">
                        <svg class="w-5 h-5 group-hover:text-[#EF4444] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                        <span class="text-xs font-bold text-[#EF4444] bg-[#FCE8E8] px-2 py-0.5 rounded-full">Urgent</span>
                    </div>
                    <span class="text-xs font-bold text-[#8B95A5] uppercase tracking-wider mt-2">Pending Reqs</span>
                    <span class="text-3xl font-bold text-[#1A1A1A]" x-text="lawyerStats.pending"></span>
                </a>
                <a href="{{ route('reportlawyer') }}" class="bg-white p-6 rounded-2xl border border-[#E2E8F0] flex flex-col gap-2 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-[#1D5083]/20 transition-all duration-300 cursor-pointer group">
                    <div class="flex justify-between items-center text-[#8B95A5]">
                        <svg class="w-5 h-5 group-hover:text-[#F59E0B] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"></path></svg>
                        <span class="text-xs font-bold text-[#F59E0B] bg-[#FEF3C7] px-2 py-0.5 rounded-full"><span x-text="caseStats.active_investigations"></span> New</span>
                    </div>
                    <span class="text-xs font-bold text-[#8B95A5] uppercase tracking-wider mt-2">Active Reports</span>
                    <span class="text-3xl font-bold text-[#1A1A1A]" x-text="caseStats.total"></span>
                </a>
                <a href="{{ route('admin.documents.index') }}" class="bg-white p-6 rounded-2xl border border-[#E2E8F0] flex flex-col gap-2 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-[#1D5083]/20 transition-all duration-300 cursor-pointer group">
                    <div class="flex justify-between items-center text-[#8B95A5]">
                        <svg class="w-5 h-5 group-hover:text-[#1D5083] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.747 5.754 18 7.5 18s3.232.747 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.75 0 3.332.477 4.5 1.253v13c-1.168-.753-2.754-1.253-4.5-1.253-1.75 0-3.232.747-4.5 1.253"></path></svg>
                        <span class="text-xs font-bold text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full">Published</span>
                    </div>
                    <span class="text-xs font-bold text-[#8B95A5] uppercase tracking-wider mt-2">Articles</span>
                    <span class="text-3xl font-bold text-[#1A1A1A]" x-text="Number(totalArticles).toLocaleString('en-US')">{{ number_format($totalArticles ?? 0) }}</span>
                </a>
            </div>

            <!-- Content Grid (Charts & Lists) -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <!-- Main Chart (Case Volume Analytics) -->
                <div class="lg:col-span-2 bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col gap-6">
                    <div class="flex justify-between items-center">
                        <div>
                            <h2 class="font-serif text-xl font-bold text-[#1A1A1A]">Case Volume Analytics</h2>
                            <p class="text-xs text-[#6B7280] font-light">Monitoring platform throughput over 30 days.</p>
                        </div>
                        <div class="flex gap-2">
                            <button class="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#6B7280] hover:text-[#1D5083] hover:border-[#1D5083] transition-colors">Monthly</button>
                            <button class="px-3 py-1.5 bg-[#EBF3FA] border border-[#1D5083] rounded-lg text-xs font-bold text-[#1D5083]">Weekly</button>
                        </div>
                    </div>

                    <!-- Bars -->
                    <div class="flex items-end justify-between gap-4 h-64 mt-4">
                        <!-- Bar 1 -->
                        <div class="flex flex-col items-center gap-2 w-full h-full justify-end">
                            <div class="w-full bg-[#BACBD9] rounded-t-lg h-[40%] hover:bg-[#95B2CC] transition-colors cursor-pointer"></div>
                            <span class="text-[10px] text-[#8B95A5] font-bold uppercase">Aug 01</span>
                        </div>
                        <!-- Bar 2 -->
                        <div class="flex flex-col items-center gap-2 w-full h-full justify-end">
                            <div class="w-full bg-[#BACBD9] rounded-t-lg h-[60%] hover:bg-[#95B2CC] transition-colors cursor-pointer"></div>
                            <span class="text-[10px] text-[#8B95A5] font-bold uppercase">Aug 05</span>
                        </div>
                        <!-- Bar 3 -->
                        <div class="flex flex-col items-center gap-2 w-full h-full justify-end">
                            <div class="w-full bg-[#BACBD9] rounded-t-lg h-[30%] hover:bg-[#95B2CC] transition-colors cursor-pointer"></div>
                            <span class="text-[10px] text-[#8B95A5] font-bold uppercase">Aug 10</span>
                        </div>
                        <!-- Bar 4 -->
                        <div class="flex flex-col items-center gap-2 w-full h-full justify-end">
                            <div class="w-full bg-[#BACBD9] rounded-t-lg h-[75%] hover:bg-[#95B2CC] transition-colors cursor-pointer"></div>
                            <span class="text-[10px] text-[#8B95A5] font-bold uppercase">Aug 15</span>
                        </div>
                        <!-- Bar 5 -->
                        <div class="flex flex-col items-center gap-2 w-full h-full justify-end">
                            <div class="w-full bg-[#1D5083] rounded-t-lg h-[90%] hover:bg-[#153c63] transition-colors cursor-pointer"></div>
                            <span class="text-[10px] text-[#8B95A5] font-bold uppercase">Aug 20</span>
                        </div>
                        <!-- Bar 6 -->
                        <div class="flex flex-col items-center gap-2 w-full h-full justify-end">
                            <div class="w-full bg-[#BACBD9] rounded-t-lg h-[80%] hover:bg-[#95B2CC] transition-colors cursor-pointer"></div>
                            <span class="text-[10px] text-[#8B95A5] font-bold uppercase">Aug 25</span>
                        </div>
                        <!-- Bar 7 -->
                        <div class="flex flex-col items-center gap-2 w-full h-full justify-end">
                            <div class="w-full bg-[#BACBD9] rounded-t-lg h-[50%] hover:bg-[#95B2CC] transition-colors cursor-pointer"></div>
                            <span class="text-[10px] text-[#8B95A5] font-bold uppercase">Aug 30</span>
                        </div>
                    </div>

                    <!-- Jurisdiction Split (Sub panel) -->
                    <div class="border-t border-[#E2E8F0] pt-6 flex flex-col gap-4">
                        <h3 class="font-serif text-sm font-bold text-[#1A1A1A]">Jurisdiction Split</h3>
                        
                        <!-- Progress Bars -->
                        <div class="flex flex-col gap-3">
                            <div>
                                <div class="flex justify-between text-xs font-medium mb-1">
                                    <span class="text-[#6B7280]">Corporate Law</span>
                                    <span class="text-[#1A1A1A] font-bold">42%</span>
                                </div>
                                <div class="w-full bg-[#F3F4F6] rounded-full h-1.5">
                                    <div class="bg-[#1D5083] h-1.5 rounded-full" style="width: 42%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between text-xs font-medium mb-1">
                                    <span class="text-[#6B7280]">Intellectual Property</span>
                                    <span class="text-[#1A1A1A] font-bold">28%</span>
                                </div>
                                <div class="w-full bg-[#F3F4F6] rounded-full h-1.5">
                                    <div class="bg-[#1D5083] h-1.5 rounded-full" style="width: 28%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between text-xs font-medium mb-1">
                                    <span class="text-[#6B7280]">Employment</span>
                                    <span class="text-[#1A1A1A] font-bold">15%</span>
                                </div>
                                <div class="w-full bg-[#F3F4F6] rounded-full h-1.5">
                                    <div class="bg-[#1D5083] h-1.5 rounded-full" style="width: 15%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity List -->
                <div class="bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col gap-6">
                    <div class="flex justify-between items-center">
                        <div>
                            <h2 class="font-serif text-xl font-bold text-[#1A1A1A]">Recent Activity</h2>
                            <p class="text-xs text-[#6B7280] font-light">System-wide event logs.</p>
                        </div>
                        <a href="{{ route('admin.notifications') }}" class="text-[#1D5083] font-bold text-xs hover:text-[#153c63]">View All</a>
                    </div>

                    <!-- Activity List -->
                    <div class="flex flex-col gap-5">
                        <template x-for="activity in recentActivities" :key="activity.id">
                            <div class="flex gap-4 transform transition-all duration-300 hover:translate-x-1">
                                <!-- Dynamic Icon -->
                                <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0" :class="`${activity.icon_bg} ${activity.icon_text}`">
                                    <template x-if="activity.icon_svg === 'check'">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    </template>
                                    <template x-if="activity.icon_svg === 'x'">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </template>
                                    <template x-if="activity.icon_svg === 'user'">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    </template>
                                    <template x-if="activity.icon_svg === 'document'">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    </template>
                                    <template x-if="activity.icon_svg === 'trash'">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </template>
                                    <template x-if="activity.icon_svg === 'settings'">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    </template>
                                    <template x-if="activity.icon_svg === 'alert'">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                    </template>
                                    <template x-if="activity.icon_svg === 'info' || !activity.icon_svg">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </template>
                                </div>
                                <div>
                                    <p class="text-sm font-bold text-[#1A1A1A]" x-text="activity.action"></p>
                                    <p class="text-xs text-[#6B7280] font-light" x-text="activity.description + ' • ' + activity.admin_name"></p>
                                    <p class="text-[10px] text-[#8B95A5] font-bold uppercase mt-0.5" x-text="activity.time_ago"></p>
                                </div>
                            </div>
                        </template>
                        <!-- Fallback empty state -->
                        <template x-if="recentActivities.length === 0">
                            <div class="text-center py-4 text-sm text-[#6B7280] font-light">
                                No recent activity found.
                            </div>
                        </template>
                    </div>

                    <!-- Export Log Button -->
                    <button onclick="this.innerHTML='<svg class=\'w-4 h-4 animate-spin\' fill=\'none\' viewBox=\'0 0 24 24\'><circle class=\'opacity-25\' cx=\'12\' cy=\'12\' r=\'10\' stroke=\'currentColor\' stroke-width=\'4\'></circle><path class=\'opacity-75\' fill=\'currentColor\' d=\'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z\'></path></svg> Exporting...';setTimeout(()=>{this.innerHTML='<svg class=\'w-4 h-4\' fill=\'none\' stroke=\'currentColor\' viewBox=\'0 0 24 24\'><path stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M5 13l4 4L19 7\'></path></svg> Exported!';this.classList.add('text-[#059669]','border-[#059669]');setTimeout(()=>{this.innerHTML='<svg class=\'w-4 h-4\' fill=\'none\' stroke=\'currentColor\' viewBox=\'0 0 24 24\'><path stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4\'></path></svg> Export Log';this.classList.remove('text-[#059669]','border-[#059669]');},2000);},1500);" class="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1A1A1A] py-3 rounded-xl font-bold text-sm hover:bg-[#F3F4F6] transition-all flex items-center justify-center gap-2 mt-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Export Log
                    </button>
                </div>

            </div>

            <!-- Bottom Section: Critical Regulatory Roadmap (Timeline) -->
            <div class="bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col gap-6">
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="font-serif text-xl font-bold text-[#1A1A1A]">Critical Regulatory Roadmap</h2>
                        <p class="text-xs text-[#6B7280] font-light">High-priority compliance milestones for Q3 2024.</p>
                    </div>
                    <div class="flex gap-2">
                        <button class="p-2 hover:bg-[#F8FAFC] rounded-full text-[#8B95A5] hover:text-[#1D5083]">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <button class="p-2 hover:bg-[#F8FAFC] rounded-full text-[#8B95A5] hover:text-[#1D5083]">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                </div>

                <!-- Timeline -->
                <div class="relative mt-4">
                    <!-- Line -->
                    <div class="absolute top-1/2 left-0 right-0 h-0.5 bg-[#E2E8F0] -translate-y-1/2 z-0"></div>

                    <!-- Steps -->
                    <div class="relative z-10 flex justify-between">
                        <!-- Step 1 -->
                        <div class="flex flex-col items-center gap-3">
                            <div class="w-8 h-8 bg-[#1D5083] text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                            <div class="text-center">
                                <p class="text-[10px] text-[#8B95A5] font-bold uppercase">SEP 12</p>
                                <p class="text-sm font-bold text-[#1A1A1A]">Data Privacy Audit</p>
                            </div>
                        </div>
                        <!-- Step 2 -->
                        <div class="flex flex-col items-center gap-3">
                            <div class="w-8 h-8 bg-[#1D5083] text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                            <div class="text-center">
                                <p class="text-[10px] text-[#8B95A5] font-bold uppercase">SEP 28</p>
                                <p class="text-sm font-bold text-[#1A1A1A]">AI Ethics Review</p>
                            </div>
                        </div>
                        <!-- Step 3 -->
                        <div class="flex flex-col items-center gap-3">
                            <div class="w-8 h-8 bg-white border-2 border-[#E2E8F0] text-[#8B95A5] rounded-full flex items-center justify-center font-bold text-sm">3</div>
                            <div class="text-center">
                                <p class="text-[10px] text-[#8B95A5] font-bold uppercase">OCT 15</p>
                                <p class="text-sm font-bold text-[#6B7280]">Firm Expansion Hub</p>
                            </div>
                        </div>
                        <!-- Step 4 -->
                        <div class="flex flex-col items-center gap-3">
                            <div class="w-8 h-8 bg-white border-2 border-[#E2E8F0] text-[#8B95A5] rounded-full flex items-center justify-center font-bold text-sm">4</div>
                            <div class="text-center">
                                <p class="text-[10px] text-[#8B95A5] font-bold uppercase">NOV 05</p>
                                <p class="text-sm font-bold text-[#6B7280]">QA Directives Release</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Spacer to ensure bottom padding is respected when scrolling -->
            <div class="shrink-0 h-4"></div>
        </main>
    </div>

    <script>
        document.addEventListener('alpine:init', () => {
            Alpine.data('dashboardRealtime', () => ({
                totalUsers: {{ $totalUsers ?? 0 }},
                totalArticles: {{ $totalArticles ?? 0 }},
                caseStats: @json($caseStats ?? ['total' => 0, 'active_investigations' => 0, 'critical' => 0]),
                lawyerStats: @json($lawyerStats ?? ['total' => 0, 'pending' => 0, 'approved' => 0]),
                recentActivities: @json($recentActivities ?? []),
                
                init() {
                    // Start fetching stats to be fully up-to-date and dynamic
                    this.fetchStats();
                    // Auto-refresh every 15 seconds to pull real-time database counts
                    setInterval(() => this.fetchStats(), 15000);
                },

                fetchStats() {
                    fetch('/api/admin/dashboard-stats')
                        .then(res => res.json())
                        .then(data => {
                            if(data.totalUsers !== undefined) this.totalUsers = data.totalUsers;
                            if(data.totalArticles !== undefined) this.totalArticles = data.totalArticles;
                            if(data.caseStats) this.caseStats = data.caseStats;
                            if(data.lawyerStats) this.lawyerStats = data.lawyerStats;
                            if(data.recentActivities) this.recentActivities = data.recentActivities;
                        })
                        .catch(err => console.error("Error fetching stats:", err));
                }
            }));
        });
    </script>
</body>
</html>
