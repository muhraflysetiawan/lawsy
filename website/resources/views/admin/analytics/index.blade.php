<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Analytics & Legal Intelligence - Lawsy</title>
    
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #F8FAFC;
        }
        .font-serif {
            font-family: 'Poppins', sans-serif;
        }
        /* Custom scrollbar for webkit */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #F8FAFC; 
        }
        ::-webkit-scrollbar-thumb {
            background: #CBD5E1; 
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #94A3B8; 
        }
    </style>
</head>
<body class="flex h-screen bg-[#F8FAFC] overflow-hidden text-[#1A1A1A]">

    @include('admin.components.sidebar')

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col h-full overflow-hidden relative z-10 scroll-smooth">
        
        <!-- Header -->
        <header class="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between shrink-0">
            <!-- Left: Title -->
            <div class="flex items-center gap-4">
                <h1 class="text-xl font-bold text-[#1A1A1A]">Analytics</h1>
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

        <main class="flex-1 overflow-y-auto p-8 lg:p-12 flex flex-col gap-12 max-w-[1600px] mx-auto w-full">
            
            <!-- Page Header -->
            <div class="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 shrink-0">
                <div class="max-w-3xl flex flex-col gap-3">
                    <p class="text-[16px] text-[#6B7280] font-normal leading-relaxed">
                        Monitor legal operations, compliance performance, lawyer activity, publication engagement, and AI-driven analytics.
                    </p>
                </div>
                <div class="flex flex-wrap items-center gap-4 shrink-0">
                    <!-- Date Filter -->
                    <div class="relative group">
                        <select class="pl-5 pr-10 py-3 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#1A1A1A] appearance-none focus:outline-none focus:ring-2 focus:ring-[#0E3A68]/20 shadow-sm cursor-pointer group-hover:border-[#CBD5E1] transition-all duration-300">
                            <option>Last 30 Days</option>
                            <option>Last 3 Months</option>
                            <option selected>Last 6 Months</option>
                            <option>Last Year</option>
                        </select>
                        <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#8B95A5] group-hover:text-[#0E3A68] transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                    <!-- Outline Secondary Button -->
                    <button class="px-6 py-3 bg-white border border-[#E2E8F0] text-[#1A1A1A] text-sm font-semibold rounded-xl hover:bg-[#F8FAFC] hover:border-[#CBD5E1] shadow-sm hover:shadow transition-all duration-300 flex items-center gap-2 group">
                        <svg class="w-4 h-4 text-[#8B95A5] group-hover:text-[#1A1A1A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Download Report
                    </button>
                    <!-- Navy Primary Button -->
                    <button class="px-6 py-3 bg-[#0E3A68] text-white text-sm font-semibold rounded-xl hover:bg-[#0A2A4C] hover:-translate-y-0.5 shadow-md hover:shadow-lg hover:shadow-[#0E3A68]/20 transition-all duration-300 flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Export Analytics
                    </button>
                </div>
            </div>

            <!-- Row 1: 5 Overview Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 shrink-0">
                @php
                    $overviewStats = [
                        ['icon' => 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', 'title' => 'Total Active Cases', 'value' => number_format($caseStats['total']), 'trend' => '+18% from last month', 'color' => 'text-[#0E3A68]', 'bg' => 'bg-[#EBF4FF]'],
                        ['icon' => 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', 'title' => 'Verified Lawyers', 'value' => number_format($lawyerStats['total']), 'trend' => '+12% from last month', 'color' => 'text-[#10B981]', 'bg' => 'bg-[#ECFDF5]'],
                        ['icon' => 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-.586-1.414l-4.5-4.5A2 2 0 0012.5 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14z', 'title' => 'Published Articles', 'value' => $totalArticles, 'trend' => '+25% this quarter', 'color' => 'text-[#D97706]', 'bg' => 'bg-[#FEF3C7]'],
                        ['icon' => 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', 'title' => 'Compliance Score', 'value' => $complianceScore . '%', 'trend' => '+2% from last month', 'color' => 'text-[#6366F1]', 'bg' => 'bg-[#EEF2FF]'],
                        ['icon' => 'M13 10V3L4 14h7v7l9-11h-7z', 'title' => 'AI Requests', 'value' => '18.2k', 'trend' => '+45% in 6 months', 'color' => 'text-[#06B6D4]', 'bg' => 'bg-[#ECFEFF]'],
                    ];
                @endphp
                
                @foreach($overviewStats as $stat)
                <div class="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm hover:shadow-xl hover:shadow-[#0E3A68]/5 hover:-translate-y-1 transition-all duration-300 flex flex-col gap-5 group relative overflow-hidden">
                    <!-- Subtle Glow -->
                    <div class="absolute -right-10 -top-10 w-32 h-32 rounded-full {{ $stat['bg'] }} opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-2xl"></div>
                    
                    <div class="flex justify-between items-start relative z-10">
                        <div class="w-12 h-12 rounded-xl {{ $stat['bg'] }} {{ $stat['color'] }} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{ $stat['icon'] }}"></path></svg>
                        </div>
                        <span class="flex items-center gap-1 text-[11px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-1 rounded-md opacity-80 group-hover:opacity-100 transition-opacity">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                            {{ explode(' ', $stat['trend'])[0] }}
                        </span>
                    </div>
                    <div class="relative z-10 flex flex-col gap-1">
                        <h3 class="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">{{ $stat['title'] }}</h3>
                        <p class="font-serif text-[34px] font-bold text-[#1A1A1A] tracking-tight group-hover:text-[#0E3A68] transition-colors">{{ $stat['value'] }}</p>
                    </div>
                    <div class="mt-auto pt-4 border-t border-[#F1F5F9] relative z-10">
                        <p class="text-[12px] font-medium text-[#8B95A5]">{{ $stat['trend'] }}</p>
                    </div>
                </div>
                @endforeach
            </div>

            <!-- Row 2: Featured Line Chart (70%) + Stacked Widgets (30%) -->
            <div class="grid grid-cols-1 xl:grid-cols-3 gap-8 shrink-0">
                <!-- Large Featured Line Chart -->
                <div class="xl:col-span-2 bg-white rounded-[24px] border border-[#E5E7EB] p-8 shadow-sm hover:shadow-lg hover:shadow-[#0E3A68]/5 transition-all duration-300 flex flex-col h-[480px]">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex flex-col gap-1.5">
                            <h2 class="font-serif text-[26px] font-bold text-[#1A1A1A] tracking-tight">Case Activity Overview</h2>
                            <p class="text-[14px] text-[#6B7280]">Monthly trend: Cases opened vs cases resolved</p>
                        </div>
                        <div class="flex items-center gap-5 text-[13px] font-bold">
                            <div class="flex items-center gap-2">
                                <span class="w-3 h-3 rounded-full bg-[#0E3A68] shadow-sm"></span>
                                <span class="text-[#475569]">Cases Opened</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="w-3 h-3 rounded-full bg-[#93C5FD] shadow-sm"></span>
                                <span class="text-[#475569]">Cases Resolved</span>
                            </div>
                            <span class="ml-2 text-[12px] bg-[#F1F5F9] text-[#475569] px-2 py-1 rounded-md">Last 6 Months</span>
                        </div>
                    </div>

                    <!-- Interactive Chart Area -->
                    <div class="flex-1 relative w-full mt-6 group/chart">
                        <!-- Grid Lines -->
                        <div class="absolute inset-0 flex flex-col justify-between opacity-50 pb-8 pointer-events-none">
                            <div class="w-full border-t border-[#E2E8F0] flex-1"></div>
                            <div class="w-full border-t border-[#E2E8F0] flex-1"></div>
                            <div class="w-full border-t border-[#E2E8F0] flex-1"></div>
                            <div class="w-full border-t border-[#E2E8F0]"></div>
                        </div>
                        
                        <!-- SVG Lines -->
                        <svg class="absolute inset-0 w-full h-full pb-8 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                            <!-- Resolved -->
                            <path d="M5,80 Q20,65 35,70 T65,50 T95,45" fill="none" stroke="#93C5FD" stroke-width="2" stroke-linecap="round"/>
                            <!-- Opened -->
                            <path d="M5,65 Q20,50 35,40 T65,20 T95,10" fill="none" stroke="#0E3A68" stroke-width="3" stroke-linecap="round"/>
                        </svg>

                        <!-- Invisible Hover Columns for Tooltips -->
                        <div class="absolute inset-0 pb-8 flex z-10">
                            @php
                                $lineData = [];
                                foreach($monthlyTrend as $point) {
                                    // Calculate relative top position for SVG line connection (simple mock logic for height)
                                    $topOpened = 80 - (($point['opened'] / 600) * 70) . '%';
                                    $topResolved = 80 - (($point['resolved'] / 600) * 70) . '%';
                                    $lineData[] = [
                                        'label' => $point['label'],
                                        'opened' => $point['opened'],
                                        'resolved' => $point['resolved'],
                                        'top1' => $topOpened,
                                        'top2' => $topResolved
                                    ];
                                }
                            @endphp
                            @foreach($lineData as $point)
                            <div class="flex-1 h-full group/col relative cursor-crosshair">
                                <!-- Hover Highlight Column -->
                                <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-[#F1F5F9]/50 rounded-t-xl opacity-0 group-hover/col:opacity-100 transition-opacity duration-300"></div>
                                
                                <!-- Tooltip -->
                                <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 bg-[#1A1A1A] text-white px-4 py-3 rounded-xl opacity-0 group-hover/col:opacity-100 transition-all duration-300 shadow-xl pointer-events-none z-20 w-max transform group-hover/col:-translate-y-4">
                                    <p class="text-[11px] font-bold text-[#8B95A5] uppercase tracking-widest mb-1.5">{{ $point['label'] }} 2026</p>
                                    <div class="flex flex-col gap-1">
                                        <div class="flex items-center gap-3">
                                            <span class="w-2 h-2 rounded-full bg-[#93C5FD]"></span>
                                            <span class="text-[13px] font-medium">{{ $point['resolved'] }} Resolved</span>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <span class="w-2 h-2 rounded-full bg-[#3B82F6]"></span>
                                            <span class="text-[13px] font-medium">{{ $point['opened'] }} Opened</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Interactive Dots -->
                                <div class="absolute left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-[#0E3A68] rounded-full opacity-0 group-hover/col:opacity-100 transition-all duration-300 scale-50 group-hover/col:scale-100 shadow-md" style="top: {{ $point['top1'] }};"></div>
                                <div class="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-[#93C5FD] rounded-full opacity-0 group-hover/col:opacity-100 transition-all duration-300 scale-50 group-hover/col:scale-100 shadow-md" style="top: {{ $point['top2'] }};"></div>
                            </div>
                            @endforeach
                        </div>

                        <!-- Axis Labels -->
                        <div class="absolute bottom-0 left-0 right-0 flex justify-between text-[13px] font-bold text-[#8B95A5]">
                            <span class="w-10 text-center">Jan</span>
                            <span class="w-10 text-center">Feb</span>
                            <span class="w-10 text-center">Mar</span>
                            <span class="w-10 text-center">Apr</span>
                            <span class="w-10 text-center">May</span>
                            <span class="w-10 text-center">Jun</span>
                        </div>
                    </div>
                    
                    <!-- Bottom Insight -->
                    <div class="mt-6 pt-5 border-t border-[#F1F5F9] flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                        </div>
                        <p class="text-[13px] text-[#6B7280] font-medium">Case activity increased steadily over the last 6 months, showing a +22% peak growth in June.</p>
                    </div>
                </div>

                <!-- Right Stacked Widgets (Real-Time Timeline) -->
                <div class="bg-white rounded-[24px] border border-[#E5E7EB] p-8 shadow-sm hover:shadow-lg hover:shadow-[#0E3A68]/5 transition-all duration-300 flex flex-col h-[480px]">
                    <h2 class="font-serif text-[24px] font-bold text-[#1A1A1A] mb-1">Real-Time Legal Operations</h2>
                    <p class="text-[14px] text-[#6B7280] mb-6">Live operational timeline</p>
                    
                    <div class="flex-1 overflow-y-auto pr-3 flex flex-col gap-6 relative scroll-smooth">
                        <!-- Connecting Line -->
                        <div class="absolute left-[15px] top-6 bottom-4 w-px bg-[#E2E8F0] z-0"></div>
                        
                        @php
                            $timeline = [
                                ['icon' => 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', 'color' => 'bg-[#10B981]', 'title' => 'Lawyer Verification Approved', 'desc' => 'Marcus Thorne has been verified.', 'time' => '2 mins ago'],
                                ['icon' => 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-.586-1.414l-4.5-4.5A2 2 0 0012.5 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14z', 'color' => 'bg-[#0E3A68]', 'title' => 'New Article Published', 'desc' => 'AI Governance Regulations in the EU.', 'time' => '15 mins ago'],
                                ['icon' => 'M13 10V3L4 14h7v7l9-11h-7z', 'color' => 'bg-[#8B5CF6]', 'title' => 'AI Contract Analysis', 'desc' => 'Merger agreement #8492 analyzed.', 'time' => '1 hour ago'],
                                ['icon' => 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', 'color' => 'bg-[#D97706]', 'title' => 'Compliance Update Required', 'desc' => 'Precedent shift in IP law detected.', 'time' => '3 hours ago'],
                                ['icon' => 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', 'color' => 'bg-[#3B82F6]', 'title' => 'Case Status Changed', 'desc' => 'Case #1029 moved to resolved.', 'time' => '5 hours ago'],
                            ];
                        @endphp
                        
                        @foreach($timeline as $item)
                        <div class="flex items-start gap-4 relative z-10 group/item cursor-default">
                            <div class="w-[30px] h-[30px] mt-1 rounded-full {{ $item['color'] }} flex items-center justify-center text-white shrink-0 shadow-sm border-[3px] border-white ring-2 ring-[#F1F5F9] group-hover/item:scale-110 group-hover/item:ring-[#CBD5E1] transition-all duration-300">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{ $item['icon'] }}"></path></svg>
                            </div>
                            <div class="flex flex-col flex-1 bg-white border border-transparent group-hover/item:bg-[#F8FAFC] group-hover/item:border-[#E2E8F0] p-3 -mt-2 rounded-xl transition-colors duration-300">
                                <div class="flex justify-between items-start gap-2">
                                    <h4 class="text-[14px] font-bold text-[#1A1A1A]">{{ $item['title'] }}</h4>
                                    <span class="text-[11px] font-bold text-[#8B95A5] whitespace-nowrap shrink-0">{{ $item['time'] }}</span>
                                </div>
                                <p class="text-[13px] text-[#6B7280] mt-1 leading-snug">{{ $item['desc'] }}</p>
                            </div>
                        </div>
                        @endforeach
                    </div>
                </div>
            </div>

            <!-- Row 3: 2 Equal Large Charts (Horizontal Bar, Area Chart) -->
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 shrink-0">
                <!-- Lawyer Verification Distribution (Horizontal Bar) -->
                <div class="bg-white rounded-[24px] border border-[#E5E7EB] p-8 shadow-sm hover:shadow-lg hover:shadow-[#0E3A68]/5 transition-all duration-300 flex flex-col h-[460px]">
                    <div class="flex justify-between items-start mb-6">
                        <div class="flex flex-col gap-1.5">
                            <h2 class="font-serif text-[24px] font-bold text-[#1A1A1A] tracking-tight">Lawyer Verification Distribution</h2>
                            <p class="text-[14px] text-[#6B7280]">Verified lawyers active on platform by specialization</p>
                        </div>
                        <span class="text-[12px] bg-[#F1F5F9] text-[#475569] px-3 py-1.5 rounded-lg font-bold">Total: 1,120</span>
                    </div>
                    <div class="flex-1 flex flex-col justify-center gap-6 mt-2">
                        @php
                            $specializations = [
                                ['name' => 'Corporate Law', 'value' => 420, 'percent' => '85%', 'color' => 'bg-[#0E3A68]'],
                                ['name' => 'Intellectual Property', 'value' => 315, 'percent' => '65%', 'color' => 'bg-[#3B82F6]'],
                                ['name' => 'AI Law & Tech Ethics', 'value' => 210, 'percent' => '45%', 'color' => 'bg-[#8B5CF6]'],
                                ['name' => 'Compliance', 'value' => 175, 'percent' => '35%', 'color' => 'bg-[#10B981]'],
                            ];
                        @endphp
                        @foreach($specializations as $spec)
                        <div class="flex flex-col gap-2.5 group/bar cursor-pointer">
                            <div class="flex justify-between items-end">
                                <span class="text-[14px] font-bold text-[#1A1A1A] group-hover/bar:text-[#0E3A68] transition-colors">{{ $spec['name'] }}</span>
                                <!-- Interactive Value -->
                                <div class="flex items-center gap-3">
                                    <span class="text-[12px] font-medium text-[#8B95A5] opacity-0 group-hover/bar:opacity-100 transition-opacity -mr-2">Total Verified:</span>
                                    <span class="text-[15px] font-bold text-[#0E3A68]">{{ $spec['value'] }}</span>
                                </div>
                            </div>
                            <div class="w-full h-4 bg-[#F1F5F9] rounded-full overflow-hidden shadow-inner">
                                <div class="h-full {{ $spec['color'] }} rounded-full transition-all duration-1000 group-hover/bar:brightness-110" style="width: {{ $spec['percent'] }};"></div>
                            </div>
                        </div>
                        @endforeach
                    </div>
                    <!-- Bottom Insight -->
                    <div class="mt-8 pt-5 border-t border-[#F1F5F9] flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <p class="text-[13px] text-[#6B7280] font-medium">Corporate Law remains the dominant specialization, followed closely by Intellectual Property.</p>
                    </div>
                </div>

                <!-- Legal Publication Engagement (Area Chart) -->
                <div class="bg-white rounded-[24px] border border-[#E5E7EB] p-8 shadow-sm hover:shadow-lg hover:shadow-[#0E3A68]/5 transition-all duration-300 flex flex-col h-[460px]">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex flex-col gap-1.5">
                            <h2 class="font-serif text-[24px] font-bold text-[#1A1A1A] tracking-tight">Legal Publication Engagement</h2>
                            <p class="text-[14px] text-[#6B7280]">Article views and draft vs published trends</p>
                        </div>
                        <span class="flex items-center gap-1 text-[12px] font-bold text-[#10B981] bg-[#ECFDF5] px-3 py-1.5 rounded-lg border border-[#A7F3D0]">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                            +22% Monthly
                        </span>
                    </div>
                    <div class="flex-1 relative w-full mt-4 group/area">
                        <!-- Grid Lines -->
                        <div class="absolute inset-0 flex flex-col justify-between opacity-30 pb-8 pointer-events-none">
                            <div class="w-full border-t border-[#E2E8F0] flex-1"></div>
                            <div class="w-full border-t border-[#E2E8F0] flex-1"></div>
                            <div class="w-full border-t border-[#E2E8F0] flex-1"></div>
                            <div class="w-full border-t border-[#E2E8F0]"></div>
                        </div>

                        <!-- SVG Area -->
                        <svg class="absolute inset-0 w-full h-full pb-8 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                            <!-- Area fill -->
                            <path d="M5,80 Q25,75 50,45 T95,15 L95,100 L5,100 Z" fill="url(#areaGrad)" opacity="0.15" class="group-hover/area:opacity-25 transition-opacity duration-500"/>
                            <!-- Main line -->
                            <path d="M5,80 Q25,75 50,45 T95,15" fill="none" stroke="#0E3A68" stroke-width="3" stroke-linecap="round"/>
                            <defs>
                                <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stop-color="#0E3A68" stop-opacity="1"/>
                                    <stop offset="100%" stop-color="#0E3A68" stop-opacity="0"/>
                                </linearGradient>
                            </defs>
                        </svg>

                        <!-- Invisible Hover Columns -->
                        <div class="absolute inset-0 pb-8 flex z-10">
                            @php
                                $areaData = [
                                    ['label' => 'Jan', 'views' => '2.1k', 'top' => '80%'],
                                    ['label' => 'Feb', 'views' => '3.4k', 'top' => '70%'],
                                    ['label' => 'Mar', 'views' => '4.8k', 'top' => '55%'],
                                    ['label' => 'Apr', 'views' => '6.2k', 'top' => '35%'],
                                    ['label' => 'May', 'views' => '8.5k', 'top' => '20%'],
                                    ['label' => 'Jun', 'views' => '12.4k', 'top' => '10%'],
                                ];
                            @endphp
                            @foreach($areaData as $point)
                            <div class="flex-1 h-full group/col relative cursor-crosshair">
                                <!-- Tooltip -->
                                <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 bg-[#1A1A1A] text-white px-4 py-3 rounded-xl opacity-0 group-hover/col:opacity-100 transition-all duration-300 shadow-xl pointer-events-none z-20 w-max transform group-hover/col:-translate-y-4">
                                    <p class="text-[11px] font-bold text-[#8B95A5] uppercase tracking-widest mb-1">{{ $point['label'] }} 2026</p>
                                    <div class="flex items-center gap-2">
                                        <span class="w-2 h-2 rounded-full bg-[#3B82F6]"></span>
                                        <span class="text-[14px] font-bold">{{ $point['views'] }} Views</span>
                                    </div>
                                </div>
                                <!-- Interactive Dot -->
                                <div class="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-[3px] border-[#0E3A68] rounded-full opacity-0 group-hover/col:opacity-100 transition-all duration-300 scale-50 group-hover/col:scale-100 shadow-md" style="top: {{ $point['top'] }}; mt:-8px;"></div>
                            </div>
                            @endforeach
                        </div>

                        <!-- Axis Labels -->
                        <div class="absolute bottom-0 left-0 right-0 flex justify-between text-[13px] font-bold text-[#8B95A5]">
                            <span class="w-10 text-center">Jan</span>
                            <span class="w-10 text-center">Feb</span>
                            <span class="w-10 text-center">Mar</span>
                            <span class="w-10 text-center">Apr</span>
                            <span class="w-10 text-center">May</span>
                            <span class="w-10 text-center">Jun</span>
                        </div>
                    </div>
                    
                    <!-- Bottom Insight -->
                    <div class="mt-8 pt-5 border-t border-[#F1F5F9] flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                        </div>
                        <p class="text-[13px] text-[#6B7280] font-medium">Readership engagement skyrocketed in Q2, driven by new IP regulations.</p>
                    </div>
                </div>
            </div>

            <!-- Row 4: Compliance & AI Intelligence (Donut + Vertical Bar) -->
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 shrink-0 mb-12">
                <!-- Compliance Monitoring (Donut Chart) -->
                <div class="bg-white rounded-[24px] border border-[#E5E7EB] p-8 shadow-sm hover:shadow-lg hover:shadow-[#0E3A68]/5 transition-all duration-300 flex flex-col h-[460px]">
                    <div class="flex justify-between items-start mb-6">
                        <div class="flex flex-col gap-1.5">
                            <h2 class="font-serif text-[24px] font-bold text-[#1A1A1A] tracking-tight">Compliance Monitoring</h2>
                            <p class="text-[14px] text-[#6B7280]">Current organizational compliance breakdown</p>
                        </div>
                        <span class="text-[12px] bg-[#F1F5F9] text-[#475569] px-3 py-1.5 rounded-lg font-bold">Real-time</span>
                    </div>
                    <div class="flex-1 flex flex-col sm:flex-row items-center justify-center gap-12 mt-4">
                        <!-- Interactive Donut SVG -->
                        <div class="relative w-56 h-56 shrink-0 group/donut">
                            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path class="text-[#F1F5F9]" stroke-width="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <!-- Violations (3%) -->
                                <path class="text-[#EF4444] cursor-pointer hover:stroke-[6px] transition-all duration-300" stroke-dasharray="100, 100" stroke-width="4.5" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <!-- Pending Audit (8%) -->
                                <path class="text-[#D97706] cursor-pointer hover:stroke-[6px] transition-all duration-300" stroke-dasharray="97, 100" stroke-width="4.5" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <!-- Under Review (15%) -->
                                <path class="text-[#93C5FD] cursor-pointer hover:stroke-[6px] transition-all duration-300" stroke-dasharray="89, 100" stroke-width="4.5" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <!-- Compliant (74%) -->
                                <path class="text-[#0E3A68] cursor-pointer hover:stroke-[6px] transition-all duration-300" stroke-dasharray="74, 100" stroke-width="4.5" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span class="font-serif text-[38px] font-bold text-[#1A1A1A] leading-none group-hover/donut:scale-110 transition-transform duration-300">94%</span>
                                <span class="text-[12px] font-bold text-[#10B981] mt-2 bg-[#ECFDF5] px-2 py-0.5 rounded-md">Good Standing</span>
                            </div>
                        </div>
                        <!-- Legend -->
                        <div class="flex flex-col gap-5 w-full max-w-[200px]">
                            <div class="flex justify-between items-center group/leg cursor-pointer p-2 -m-2 rounded-lg hover:bg-[#F8FAFC] transition-colors">
                                <div class="flex items-center gap-3">
                                    <div class="w-4 h-4 rounded-md bg-[#0E3A68] shadow-sm group-hover/leg:scale-110 transition-transform"></div>
                                    <span class="text-[14px] font-bold text-[#1A1A1A]">Compliant</span>
                                </div>
                                <span class="text-[14px] font-bold text-[#6B7280]">74%</span>
                            </div>
                            <div class="flex justify-between items-center group/leg cursor-pointer p-2 -m-2 rounded-lg hover:bg-[#F8FAFC] transition-colors">
                                <div class="flex items-center gap-3">
                                    <div class="w-4 h-4 rounded-md bg-[#93C5FD] shadow-sm group-hover/leg:scale-110 transition-transform"></div>
                                    <span class="text-[14px] font-bold text-[#1A1A1A]">Under Review</span>
                                </div>
                                <span class="text-[14px] font-bold text-[#6B7280]">15%</span>
                            </div>
                            <div class="flex justify-between items-center group/leg cursor-pointer p-2 -m-2 rounded-lg hover:bg-[#F8FAFC] transition-colors">
                                <div class="flex items-center gap-3">
                                    <div class="w-4 h-4 rounded-md bg-[#D97706] shadow-sm group-hover/leg:scale-110 transition-transform"></div>
                                    <span class="text-[14px] font-bold text-[#1A1A1A]">Pending</span>
                                </div>
                                <span class="text-[14px] font-bold text-[#6B7280]">8%</span>
                            </div>
                            <div class="flex justify-between items-center group/leg cursor-pointer p-2 -m-2 rounded-lg hover:bg-[#FEF2F2] transition-colors">
                                <div class="flex items-center gap-3">
                                    <div class="w-4 h-4 rounded-md bg-[#EF4444] shadow-sm group-hover/leg:scale-110 transition-transform"></div>
                                    <span class="text-[14px] font-bold text-[#EF4444]">Violations</span>
                                </div>
                                <span class="text-[14px] font-bold text-[#EF4444]">3%</span>
                            </div>
                        </div>
                    </div>
                    <!-- Bottom Insight -->
                    <div class="mt-8 pt-5 border-t border-[#F1F5F9] flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                        </div>
                        <p class="text-[13px] text-[#6B7280] font-medium">Compliance review completion improved by 12% following the recent internal audit.</p>
                    </div>
                </div>

                <!-- AI Legal Intelligence Usage (Vertical Bar) -->
                <div class="bg-white rounded-[24px] border border-[#E5E7EB] p-8 shadow-sm hover:shadow-lg hover:shadow-[#0E3A68]/5 transition-all duration-300 flex flex-col h-[460px]">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex flex-col gap-1.5">
                            <h2 class="font-serif text-[24px] font-bold text-[#1A1A1A] tracking-tight">AI Legal Intelligence Usage</h2>
                            <p class="text-[14px] text-[#6B7280]">AI requests and analysis volume over 6 months</p>
                        </div>
                        <span class="flex items-center gap-1 text-[12px] font-bold text-[#10B981] bg-[#ECFDF5] px-3 py-1.5 rounded-lg border border-[#A7F3D0]">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                            +45%
                        </span>
                    </div>
                    
                    <div class="flex-1 flex items-end justify-between gap-2 pt-4 relative mt-2 group/bars">
                        <!-- Background Grid -->
                        <div class="absolute inset-0 flex flex-col justify-between pb-8 opacity-40 z-0 pointer-events-none">
                            <div class="w-full border-t border-[#E2E8F0] flex-1"></div>
                            <div class="w-full border-t border-[#E2E8F0] flex-1"></div>
                            <div class="w-full border-t border-[#E2E8F0] flex-1"></div>
                            <div class="w-full border-t border-[#E2E8F0]"></div>
                        </div>
                        
                        @php
                            $bars = [
                                ['label' => 'Jan', 'val1' => '30%', 'val2' => '40%', 'tooltip' => '1.2k Total'],
                                ['label' => 'Feb', 'val1' => '40%', 'val2' => '45%', 'tooltip' => '1.5k Total'],
                                ['label' => 'Mar', 'val1' => '35%', 'val2' => '55%', 'tooltip' => '1.8k Total'],
                                ['label' => 'Apr', 'val1' => '50%', 'val2' => '60%', 'tooltip' => '2.1k Total'],
                                ['label' => 'May', 'val1' => '65%', 'val2' => '75%', 'tooltip' => '2.9k Total'],
                                ['label' => 'Jun', 'val1' => '85%', 'val2' => '90%', 'tooltip' => '3.8k Total'],
                            ];
                        @endphp
                        @foreach($bars as $bar)
                        <div class="flex flex-col items-center gap-3 h-full justify-end z-10 flex-1 relative group/bcol cursor-pointer">
                            <!-- Tooltip -->
                            <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 bg-[#1A1A1A] text-white px-3 py-2 rounded-lg opacity-0 group-hover/bcol:opacity-100 transition-all duration-300 shadow-xl pointer-events-none z-20 w-max transform group-hover/bcol:-translate-y-6">
                                <p class="text-[12px] font-bold text-center">{{ $bar['tooltip'] }}</p>
                            </div>
                            
                            <div class="flex items-end justify-center gap-1.5 w-full h-full pb-0">
                                <!-- Contract Analysis -->
                                <div class="w-[30%] max-w-[28px] bg-[#93C5FD] rounded-t-lg transition-all duration-500 group-hover/bcol:brightness-110 group-hover/bcol:-translate-y-1" style="height: {{ $bar['val1'] }};"></div>
                                <!-- Compliance Scans -->
                                <div class="w-[30%] max-w-[28px] bg-[#0E3A68] rounded-t-lg transition-all duration-500 group-hover/bcol:brightness-110 group-hover/bcol:-translate-y-1 shadow-sm" style="height: {{ $bar['val2'] }};"></div>
                            </div>
                            <span class="text-[13px] font-bold text-[#8B95A5] group-hover/bcol:text-[#1A1A1A] transition-colors">{{ $bar['label'] }}</span>
                        </div>
                        @endforeach
                    </div>
                    
                    <!-- Legend -->
                    <div class="flex justify-center items-center gap-8 mt-2 pb-2">
                        <div class="flex items-center gap-2 cursor-pointer group/leg">
                            <span class="w-3.5 h-3.5 rounded-md bg-[#93C5FD] shadow-sm group-hover/leg:scale-110 transition-transform"></span>
                            <span class="text-[13px] font-bold text-[#6B7280] group-hover/leg:text-[#1A1A1A] transition-colors">AI Contract Analysis</span>
                        </div>
                        <div class="flex items-center gap-2 cursor-pointer group/leg">
                            <span class="w-3.5 h-3.5 rounded-md bg-[#0E3A68] shadow-sm group-hover/leg:scale-110 transition-transform"></span>
                            <span class="text-[13px] font-bold text-[#6B7280] group-hover/leg:text-[#1A1A1A] transition-colors">Compliance Scans</span>
                        </div>
                    </div>
                    
                    <!-- Bottom Insight -->
                    <div class="mt-4 pt-5 border-t border-[#F1F5F9] flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-[#ECFEFF] text-[#06B6D4] flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <p class="text-[13px] text-[#6B7280] font-medium">AI legal analysis usage peaked in June, processing over 3.8k automated requests.</p>
                    </div>
                </div>
            </div>

        </main>
    </div>
</body>
</html>
