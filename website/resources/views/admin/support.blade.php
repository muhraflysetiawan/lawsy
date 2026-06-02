<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Support - Lawsy</title>
    <script>window.currentUserId = {{ Auth::user()->id ?? 0 }};</script>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Poppins', sans-serif; background-color: #F8FAFC; }
        .font-serif { font-family: 'Poppins', sans-serif; }
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .anim-up{animation:fadeUp .5s ease-out forwards;opacity:0}
        @keyframes msgSlide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .msg-anim{animation:msgSlide .3s ease-out}
        @keyframes toastIn{from{opacity:0;transform:translateX(100px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pulse-dot{0%,80%,100%{transform:scale(0.6)}40%{transform:scale(1)}}
    </style>
    <!-- Alpine.js is now loaded via Vite in app.js -->

    @php
        $initialMessages = $activeTicket ? $activeTicket->messages->map(function($m) {
            return [
                'role' => $m->role,
                'content' => $m->content,
                'type' => $m->type ?? 'text',
                'file_url' => $m->file_path ? asset('storage/' . $m->file_path) : null,
                'preview' => ($m->type === 'file' && $m->file_type && str_starts_with($m->file_type, 'image/')) ? asset('storage/' . $m->file_path) : null,
                'time' => $m->created_at->format('H:i'),
                'options' => $m->options
            ];
        }) : [];

        $allTicketsJson = $tickets->map(function($t) {
            return [
                'id' => $t->id,
                'name' => $t->user->name,
                'ticket' => $t->ticket_id,
                'status' => $t->status,
                'avatar' => strtoupper(substr($t->user->name, 0, 1)),
                'online' => true,
                'messages' => [],
            ];
        });
    @endphp
</head>
<body class="flex h-screen bg-[#F8FAFC] overflow-hidden text-[#1A1A1A]">
    @include('admin.components.sidebar')

    <div class="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <header class="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between shrink-0">
            <!-- Left: Title -->
            <div class="flex items-center gap-4">
                <h1 class="text-xl font-bold text-[#1A1A1A]">Support</h1>
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

        <input type="hidden" id="active-ticket-id" value="{{ $activeTicket ? $activeTicket->id : '' }}">

        <main class="flex-1 overflow-x-auto p-6 flex gap-6 bg-[#F8FAFC]" 
              x-data="supportCenter"
              x-cloak>
            <!-- Inner container to maintain min-width for large dashboard -->
            <div class="flex-1 flex gap-6 min-w-[1200px]">
                <!-- LEFT PANEL — SUPPORT NAVIGATION -->
                <div class="w-[280px] flex flex-col gap-6 shrink-0">
                <!-- Search -->
                <div class="relative group">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[#8B95A5] group-focus-within:text-[#0E3A68] transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input type="text" placeholder="Search tickets..." 
                           class="w-full bg-white border border-[#E2E8F0] rounded-2xl py-3 pl-11 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E3A68]/10 focus:border-[#0E3A68] transition-all shadow-sm placeholder-[#8B95A5]">
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-white p-3 rounded-2xl border border-[#E2E8F0] flex flex-col gap-0.5">
                        <span class="text-[10px] font-bold text-[#8B95A5] uppercase tracking-wider">Total</span>
                        <div class="flex items-baseline justify-between">
                            <span class="text-xl font-bold text-[#0E3A68]">24</span>
                            <svg class="w-4 h-4 text-[#8B95A5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                    </div>
                    <div class="bg-white p-3 rounded-lg border border-[#E2E8F0] flex flex-col gap-0.5">
                        <span class="text-[10px] font-bold text-[#EF4444] uppercase tracking-wider">Waiting</span>
                        <div class="flex items-baseline justify-between">
                            <span class="text-xl font-bold text-[#EF4444]">5</span>
                            <svg class="w-4 h-4 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                    </div>
                    <div class="bg-white p-3 rounded-lg border border-[#E2E8F0] flex flex-col gap-0.5">
                        <span class="text-[10px] font-bold text-[#8B95A5] uppercase tracking-wider">Handled</span>
                        <div class="flex items-baseline justify-between">
                            <span class="text-xl font-bold text-[#0E3A68]">142</span>
                            <svg class="w-4 h-4 text-[#8B95A5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                    </div>
                    <div class="bg-white p-3 rounded-lg border border-[#E2E8F0] flex flex-col gap-0.5">
                        <span class="text-[10px] font-bold text-[#10B981] uppercase tracking-wider">Online</span>
                        <div class="flex items-baseline justify-between">
                            <span class="text-xl font-bold text-[#10B981]">8</span>
                            <svg class="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        </div>
                    </div>
                </div>

                <!-- Queues -->
                <div class="flex flex-col gap-1">
                    <span class="text-[11px] font-bold text-[#8B95A5] uppercase tracking-wider mb-1">Queues</span>
                    <button @click="activeQueue = 'all'" :class="activeQueue === 'all' ? 'bg-[#EBF3FA] text-[#0E3A68]' : 'text-[#475569] hover:bg-[#F1F5F9]'" class="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all font-semibold text-sm w-full text-left">
                        <div class="flex items-center gap-3">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 1.657-2.388 3-5.333 3H12l-4 4v-4c-2.945 0-5.333-1.343-5.333-3s2.388-3 5.333-3h8c2.945 0 5.333 1.343 5.333 3z"></path></svg>
                            <span>All Conversations</span>
                        </div>
                        <span class="bg-[#0E3A68] text-white text-xs font-bold px-1.5 py-0.5 rounded" x-text="'24'"></span>
                    </button>
                    <button @click="activeQueue = 'unread'" :class="activeQueue === 'unread' ? 'bg-[#EBF3FA] text-[#0E3A68]' : 'text-[#475569] hover:bg-[#F1F5F9]'" class="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all font-semibold text-sm w-full text-left">
                        <div class="flex items-center gap-3">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5"></path></svg>
                            <span>Unread</span>
                        </div>
                        <span class="bg-[#E2E8F0] text-[#475569] text-xs font-bold px-1.5 py-0.5 rounded">3</span>
                    </button>
                    <button @click="activeQueue = 'assigned'" :class="activeQueue === 'assigned' ? 'bg-[#EBF3FA] text-[#0E3A68]' : 'text-[#475569] hover:bg-[#F1F5F9]'" class="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all font-semibold text-sm w-full text-left">
                        <div class="flex items-center gap-3">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            <span>Assigned to Me</span>
                        </div>
                        <span class="bg-[#E2E8F0] text-[#475569] text-xs font-bold px-1.5 py-0.5 rounded">12</span>
                    </button>
                    <button @click="activeQueue = 'escalated'" :class="activeQueue === 'escalated' ? 'bg-[#EBF3FA] text-[#0E3A68]' : 'text-[#475569] hover:bg-[#F1F5F9]'" class="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all font-semibold text-sm w-full text-left">
                        <div class="flex items-center gap-3">
                            <svg class="w-4 h-4 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            <span>Escalated by AI</span>
                        </div>
                        <span class="bg-[#EF4444] text-white text-xs font-bold px-1.5 py-0.5 rounded">2</span>
                    </button>
                </div>

                <!-- AI Insight Card -->
                <div class="bg-gradient-to-br from-[#0E3A68] to-[#1D5083] text-white p-5 rounded-2xl flex flex-col gap-3 relative overflow-hidden shadow-md">
                    <div class="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4">
                        <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM5.884 4.47a1 1 0 10-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM14.116 4.47a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM4.5 10a.5.5 0 000 1h1a.5.5 0 000-1h-1zM14.5 10a.5.5 0 000 1h1a.5.5 0 000-1h-1zM7 14a1 1 0 11-2 0 1 1 0 012 0zM19 11a1 1 0 100-2h-1a1 1 0 100 2h1zM15.116 15.116a1 1 0 101.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM4.47 14.116a1 1 0 101.414 1.414l.707-.707a1 1 0 00-1.414-1.414l-.707.707z"></path></svg>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <span class="text-[10px] font-bold uppercase tracking-widest text-white/90">AI Insight</span>
                    </div>
                    <p class="text-xs font-medium leading-relaxed text-white/95">Verification traffic is 15% above baseline. Suggest using OCR quick-replies.</p>
                    <button class="self-start text-[10px] font-bold bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all border border-white/10 backdrop-blur-sm">View Analytics</button>
                </div>

                <!-- New Ticket Button -->
                <button class="w-full bg-[#0E3A68] text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-[#0A2A4D] transition-all flex items-center justify-center gap-2 shadow-md group">
                    <svg class="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    <span>New Ticket</span>
                </button>
            </div>

                <!-- MIDDLE PANEL — LIVE QUEUE -->
                <div class="w-[380px] bg-white border border-[#E2E8F0] rounded-2xl flex flex-col overflow-hidden shrink-0 shadow-sm">
                <!-- Header -->
                <div class="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#FAFBFF]">
                    <h2 class="text-base font-bold text-[#0E3A68]">Live Queue</h2>
                    <div class="flex items-center gap-1">
                        <button class="p-1.5 hover:bg-[#E2E8F0] rounded-md transition-all text-[#475569]">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-4.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                        </button>
                        <button class="p-1.5 hover:bg-[#E2E8F0] rounded-md transition-all text-[#475569]">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        </button>
                    </div>
                </div>

                <!-- List -->
                <div class="flex-1 overflow-y-auto divide-y divide-[#E2E8F0]">
                    @foreach($tickets as $convo)
                        @php
                            $statusColor = 'bg-[#FEF2F2] text-[#EF4444]';
                            if($convo->status === 'Handled') $statusColor = 'bg-[#ECFDF5] text-[#10B981]';
                            if($convo->status === 'Closed') $statusColor = 'bg-[#F1F5F9] text-[#6B7280]';
                            
                            $priorityColor = 'text-[#EF4444]';
                            if($convo->priority === 'Medium') $priorityColor = 'text-[#D97706]';
                            if($convo->priority === 'Low') $priorityColor = 'text-[#10B981]';
                        @endphp
<button @click="selectedConvoId = {{ $convo->id }}" class="p-4 cursor-pointer transition-all flex flex-col gap-1.5 relative h-[100px] justify-between w-full text-left" :class="selectedConvoId === {{ $convo->id }} ? 'bg-[#F8FAFC]' : 'hover:bg-[#F8FAFC]'">

                            <div x-show="selectedConvoId === {{ $convo->id }}" class="absolute left-0 top-0 bottom-0 w-1 bg-[#0E3A68]"></div>
                            
                            <div class="flex justify-between items-start">
                                <div class="flex gap-3 items-center">
                                    <div class="relative shrink-0">
                                        <div class="w-8 h-8 bg-[#0E3A68] text-white rounded-full flex items-center justify-center font-bold text-xs">{{ substr($convo->user->name, 0, 1) }}</div>
                                        <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10B981] border-2 border-white rounded-full"></span>
                                    </div>
                                    <div>
                                        <h3 class="font-bold text-sm text-[#0E3A68]">{{ $convo->user->name }}</h3>
                                        <span class="text-[10px] text-[#8B95A5]">{{ $convo->ticket_id }}</span>
                                    </div>
                                </div>
                                <span class="text-[10px] text-[#8B95A5]">{{ $convo->last_message_at ? $convo->last_message_at->diffForHumans() : '' }}</span>
                            </div>

                            <p class="text-xs text-[#475569] truncate">{{ $convo->subject }}</p>

                            <div class="flex justify-between items-center">
                                <span class="{{ $statusColor }} text-[10px] font-bold px-1.5 py-0.5 rounded">{{ $convo->status }}</span>
                                <div class="flex items-center gap-0.5">
                                    <span class="{{ $priorityColor }} text-[10px] font-bold">{{ $convo->priority }}</span>
                                    <svg class="w-3 h-3 {{ $priorityColor }}" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 13a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 9a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
                                </div>
                            </div>
                        </button>
                    @endforeach
                </div>
            </div>

            <!-- RIGHT PANEL — ACTIVE CONVERSATION -->
            <div class="flex-1 bg-white border border-[#E2E8F0] rounded-2xl flex flex-col overflow-hidden shadow-sm">
                <!-- Header -->
                <div class="px-8 py-5 border-b border-[#E2E8F0] flex items-center gap-4 bg-[#FAFBFF]">
                    <!-- Left: Profile Info -->
                    <div class="flex items-center gap-4 flex-1 min-w-0" x-show="currentConvo">
                        <div class="relative shrink-0">
                            <div class="w-12 h-12 bg-gradient-to-br from-[#0E3A68] to-[#1D5083] text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-md border border-[#0E3A68]/10" x-text="currentConvo?.avatar"></div>
                            <span x-show="currentConvo?.online" class="absolute -bottom-1 -right-1 w-4 h-4 bg-[#10B981] border-3 border-white rounded-full shadow-sm"></span>
                        </div>
                        <div class="flex flex-col min-w-0">
                            <h2 class="font-bold text-base text-[#1A1A1A] leading-tight truncate" x-text="currentConvo?.name"></h2>
                            <div class="flex items-center gap-2 text-[11px] text-[#8B95A5] mt-1 whitespace-nowrap">
                                <span class="bg-[#F1F5F9] px-2 py-0.5 rounded-md font-bold text-[#0E3A68]" x-text="currentConvo?.ticket"></span>
                                <span class="w-1 h-1 bg-[#CBD5E1] rounded-full"></span>
                                <span class="font-bold text-[#10B981] uppercase tracking-widest" x-text="currentConvo?.status"></span>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Action Buttons -->
                    <div class="flex items-center gap-3 shrink-0">
                        <button @click="simulateUserMessage()" class="px-5 py-2 border border-[#E2E8F0] bg-white rounded-xl text-[11px] font-bold text-[#475569] hover:border-[#0E3A68]/30 hover:text-[#0E3A68] hover:shadow-sm transition-all whitespace-nowrap">Simulate</button>
                        <button @click="assignRandomAdmin()" class="px-5 py-2 border border-[#E2E8F0] bg-white rounded-xl text-[11px] font-bold text-[#475569] hover:border-[#0E3A68]/30 hover:text-[#0E3A68] hover:shadow-sm transition-all flex items-center gap-2 whitespace-nowrap">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                            <span>Assign</span>
                        </button>
                        <button @click="showToast('Ticket #L-9042 resolved.', 'success')" class="px-5 py-2 border border-[#E2E8F0] bg-white rounded-xl text-[11px] font-bold text-[#EF4444] hover:bg-[#FEF2F2] hover:border-[#EF4444]/30 transition-all whitespace-nowrap">Close Ticket</button>
                        <div class="w-px h-6 bg-[#E2E8F0] mx-1"></div>
                        <button class="p-2 hover:bg-[#E2E8F0] rounded-lg transition-all text-[#8B95A5] hover:text-[#0E3A68]">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                        </button>
                    </div>
                </div>

                <!-- Chat History -->
                <div id="chat-history-container" class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                    <div class="flex justify-center">
                        <span class="bg-[#F1F5F9] text-[#6B7280] text-[10px] font-bold px-3 py-0.5 rounded-full">MARCH 14, 2024</span>
                    </div>

                    <template x-if="currentConvo">
                        <template x-for="(msg, idx) in currentConvo.messages" :key="idx">
                            <div>
                                <!-- User Message -->
                                <template x-if="msg.role === 'user' && msg.type !== 'file'">
                                    <div class="flex flex-col gap-1.5 items-start max-w-[80%] msg-anim">
                                        <div class="bg-white border border-[#E2E8F0] text-[#1A1A1A] p-4 rounded-2xl rounded-tl-none text-[13px] leading-relaxed shadow-sm">
                                            <p x-text="msg.content"></p>
                                        </div>
                                        <span class="text-[10px] text-[#8B95A5] font-medium ml-1 uppercase tracking-tighter" x-text="msg.time"></span>
                                    </div>
                                </template>

                                <!-- Admin Message -->
                                <template x-if="msg.role === 'admin' && msg.type !== 'file'">
                                    <div class="flex flex-col gap-1.5 items-end ml-auto max-w-[80%] msg-anim">
                                        <div class="bg-gradient-to-br from-[#0E3A68] to-[#1D5083] text-white p-4 rounded-2xl rounded-tr-none text-[13px] leading-relaxed shadow-md">
                                            <p x-text="msg.content"></p>
                                        </div>
                                        <div class="flex items-center gap-1.5 text-[10px] text-[#8B95A5] mr-1 uppercase tracking-tighter font-medium">
                                            <span x-text="msg.time"></span>
                                            <svg class="w-3.5 h-3.5 text-[#0E3A68]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
                                        </div>
                                    </div>
                                </template>

                                <!-- System/Bot Message -->
                                <template x-if="msg.role === 'system'">
                                    <div class="flex flex-col gap-1.5 items-start max-w-[80%] msg-anim">
                                        <div class="flex items-center gap-2 ml-1 mb-1">
                                            <div class="w-6 h-6 bg-gradient-to-br from-[#0E3A68] to-[#1D5083] rounded-full flex items-center justify-center">
                                                <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                            </div>
                                            <span class="text-[10px] font-bold text-[#0E3A68] uppercase tracking-wider">AI Support</span>
                                        </div>
                                        <div class="bg-[#F8FAFC] border border-[#E2E8F0] text-[#1A1A1A] p-4 rounded-2xl rounded-tl-none text-[13px] leading-relaxed shadow-sm">
                                            <p x-text="msg.content"></p>
                                            <template x-if="msg.options">
                                                <div class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#E2E8F0]">
                                                    <template x-for="opt in msg.options">
                                                        <button @click="handleOptionClick(opt)" class="px-3.5 py-2 bg-white border border-[#0E3A68]/20 text-[#0E3A68] text-[11px] font-bold rounded-xl hover:bg-[#0E3A68] hover:text-white transition-all shadow-sm" x-text="opt.label"></button>
                                                    </template>
                                                </div>
                                            </template>
                                        </div>
                                        <span class="text-[10px] text-[#8B95A5] font-medium ml-1 uppercase tracking-tighter" x-text="msg.time"></span>
                                    </div>
                                </template>

                                <!-- File Attachment Message -->
                                <template x-if="msg.type === 'file'">
                                    <div class="flex flex-col gap-0.5 items-end ml-auto max-w-[75%]">
                                        <div class="bg-[#0E3A68] text-white p-2 rounded-lg rounded-tr-none text-xs flex flex-col gap-2 border border-[#0E3A68]/20 shadow-sm overflow-hidden">
                                            <!-- Image Preview -->
                                            <template x-if="msg.preview">
                                                <div class="rounded-md overflow-hidden bg-white/5 border border-white/10 mb-1">
                                                    <img :src="msg.preview" class="max-w-full max-h-48 object-contain">
                                                </div>
                                            </template>
                                            <div class="flex items-center gap-3 px-1 pb-1">
                                                <div class="w-8 h-8 bg-white/10 rounded flex items-center justify-center shrink-0">
                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                </div>
                                                <div class="flex flex-col min-w-0">
                                                    <span class="font-bold truncate max-w-[150px]" x-text="msg.content"></span>
                                                    <span class="text-[9px] opacity-70 uppercase tracking-tighter" x-text="msg.preview ? 'Image Preview' : 'Document Attachment'"></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-0.5 text-[10px] text-[#8B95A5]">
                                            <span x-text="msg.time"></span>
                                            <svg class="w-3 h-3 text-[#10B981]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
                                        </div>
                                    </div>
                                </template>

                                <!-- AI Report Message -->
                                <template x-if="msg.role === 'ai_report'">
                                    <div class="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3.5 flex flex-col gap-3 max-w-[85%] mx-auto my-1 text-xs">
                                        <div class="flex justify-between items-center">
                                            <div class="flex items-center gap-2">
                                                <div class="w-6 h-6 bg-[#EBF3FA] text-[#0E3A68] rounded flex items-center justify-center">
                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                                </div>
                                                <div>
                                                    <h4 class="font-bold text-[#0E3A68]">AI Escalation Report</h4>
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-1 text-[10px]">
                                                <span class="font-bold text-[#8B95A5]">Confidence:</span>
                                                <span class="font-bold text-[#10B981]" x-text="(msg.confidence || 0) + '%'"></span>
                                            </div>
                                        </div>
                                        <p class="text-[#6B7280]" x-text="msg.content"></p>
                                    </div>
                                </template>
                            </div>
                        </template>
                    </template>

                    <!-- Empty state when no conversation selected -->
                    <div x-show="!currentConvo" class="flex-1 flex flex-col items-center justify-center text-[#8B95A5]">
                        <svg class="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 1.657-2.388 3-5.333 3H12l-4 4v-4c-2.945 0-5.333-1.343-5.333-3s2.388-3 5.333-3h8c2.945 0 5.333 1.343 5.333 3z"></path></svg>
                        <p class="font-bold">Select a conversation to start chatting</p>
                    </div>
                    
                    <!-- Typing Indicator -->
                    <div x-show="isTyping" class="flex flex-col gap-0.5 items-start max-w-[75%] msg-anim">
                        <div class="bg-[#F3F4F6] text-[#1A1A1A] p-3 rounded-lg rounded-tl-none text-xs leading-relaxed flex items-center gap-1">
                            <span class="w-1.5 h-1.5 bg-[#8B95A5] rounded-full animate-bounce" style="animation-delay: 0s"></span>
                            <span class="w-1.5 h-1.5 bg-[#8B95A5] rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                            <span class="w-1.5 h-1.5 bg-[#8B95A5] rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
                        </div>
                    </div>
                </div>

                <!-- AI Draft Suggestion -->
                <div class="bg-[#FAFBFF] border-t border-b border-[#E2E8F0] p-3 flex flex-col gap-2" x-show="currentConvo?.aiDraft || isGeneratingDraft">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 text-[#0E3A68]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            <span class="text-[10px] font-bold text-[#0E3A68] uppercase tracking-wider">AI Draft Suggestion</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <button @click="generateDraft()" class="text-[10px] font-bold text-[#0E3A68] hover:opacity-80 transition-all" :disabled="isGeneratingDraft">
                                <span x-show="!isGeneratingDraft">Regenerate</span>
                                <span x-show="isGeneratingDraft">Generating...</span>
                            </button>
                            <button x-show="currentConvo?.aiDraft && !isGeneratingDraft" @click="applyDraft()" class="text-[10px] font-bold text-[#10B981] hover:opacity-80 transition-all">Apply Draft</button>
                        </div>
                    </div>
                    <div class="bg-white p-2.5 rounded border border-[#E2E8F0] text-xs text-[#475569] italic min-h-[40px] flex items-center">
                        <p x-text="currentConvo?.aiDraft || 'No draft generated yet.'" :class="{'opacity-50': isGeneratingDraft}"></p>
                    </div>
                </div>

                <!-- Message Input -->
                <div class="p-6 bg-[#FAFBFF] flex flex-col gap-4 border-t border-[#E2E8F0]">
                    <div class="bg-white border border-[#E2E8F0] rounded-2xl flex flex-col p-3 gap-3 focus-within:ring-4 focus-within:ring-[#0E3A68]/5 focus-within:border-[#0E3A68]/30 transition-all shadow-sm relative group">
                        <textarea x-model="newMessage" rows="2" placeholder="Type your professional response..." class="w-full text-[13px] placeholder-[#8B95A5] focus:outline-none resize-none px-2 py-1 leading-relaxed bg-transparent" @keydown.enter.prevent="sendMessage()"></textarea>
                        
                        <div class="flex items-center justify-between border-t border-[#F1F5F9] pt-3 px-1">
                            <div class="flex items-center gap-1">
                                <!-- Hidden File Input -->
                                <input type="file" id="chat-file-input" class="hidden" @change="handleFileUpload($event)">
                                
                                <button @click="document.getElementById('chat-file-input').click()" class="p-2 hover:bg-[#F1F5F9] rounded-xl transition-all text-[#475569] hover:text-[#0E3A68] flex items-center gap-2 group/btn" title="Attach file">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                    <span class="text-[10px] font-bold uppercase tracking-wider hidden group-hover/btn:block">Attach</span>
                                </button>
                                
                                <div class="w-px h-4 bg-[#E2E8F0] mx-1"></div>

                                <!-- Emoticon Picker -->
                                <div class="relative">
                                    <button @click="showEmoji = !showEmoji" class="p-2 hover:bg-[#F1F5F9] rounded-xl transition-all text-[#475569] hover:text-[#0E3A68]" title="Insert emoji">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </button>
                                    
                                    <div x-show="showEmoji" @click.away="showEmoji = false" class="absolute bottom-full left-0 mb-3 p-2 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl z-50 grid grid-cols-4 gap-1.5 w-36 backdrop-blur-xl bg-white/90" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 translate-y-2 scale-95" x-transition:enter-end="opacity-100 translate-y-0 scale-100">
                                        <template x-for="emoji in ['😊', '👍', '🙏', '⚖️', '📋', '📁', '💡', '✅']">
                                            <button @click="newMessage += emoji; showEmoji = false" class="p-2 hover:bg-[#EBF3FA] rounded-lg text-lg transition-all transform hover:scale-110" x-text="emoji"></button>
                                        </template>
                                    </div>
                                </div>

                                <button class="p-2 hover:bg-[#F1F5F9] rounded-xl transition-all text-[#475569] hover:text-[#0E3A68]">
                                    <span class="font-bold text-xs">B</span>
                                </button>

                                <button @click="analyzeOCR()" :disabled="isAnalyzing" class="ml-2 bg-[#EBF3FA] text-[#0E3A68] px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 hover:bg-[#D9EAFD] transition-all disabled:opacity-50 border border-[#0E3A68]/10 shadow-sm">
                                    <svg class="w-3.5 h-3.5" :class="isAnalyzing ? 'animate-spin' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    <span x-show="!isAnalyzing">ANALYZE OCR</span>
                                    <span x-show="isAnalyzing">ANALYZING...</span>
                                </button>
                            </div>

                            <button @click="sendMessage()" :disabled="isTyping || !newMessage.trim()" class="bg-gradient-to-r from-[#0E3A68] to-[#1D5083] text-white px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[0px] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md">
                                <span>Send Message</span>
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            </button>
                        </div>
                    </div>
                    <div class="flex justify-center">
                        <span class="text-[10px] text-[#8B95A5] uppercase tracking-widest font-bold opacity-60">End-to-end encryption active • Legal Admin Protocol 4.2</span>
                    </div>
                </div>
                </div>
            </div>
        </main>
    </div>

    <!-- New Ticket Modal -->
    <div id="new-ticket-modal" class="hidden fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-[#0E3A68]/20 backdrop-blur-md" onclick="this.parentElement.classList.add('hidden')"></div>
        <div class="relative bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl border border-[#E2E8F0] z-10 anim-up">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-bold text-[#1A1A1A]">Create New Ticket</h3>
                <button onclick="document.getElementById('new-ticket-modal').classList.add('hidden')" class="p-2 hover:bg-[#F1F5F9] rounded-xl transition-all text-[#8B95A5]">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            
            <div class="flex flex-col gap-5">
                <div class="flex flex-col gap-2">
                    <label class="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest ml-1">Ticket Subject</label>
                    <input type="text" id="ticket-subj" placeholder="e.g. Legal Document Clarification" class="w-full px-5 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#0E3A68]/5 focus:border-[#0E3A68]/30 transition-all">
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest ml-1">Priority Level</label>
                        <div class="relative">
                            <select class="w-full px-5 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#0E3A68]/5 focus:border-[#0E3A68]/30 transition-all appearance-none cursor-pointer">
                                <option>Low Priority</option>
                                <option selected>Medium Priority</option>
                                <option>High Priority</option>
                                <option>Urgent / Critical</option>
                            </select>
                            <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[#8B95A5]">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest ml-1">Category</label>
                        <div class="relative">
                            <select class="w-full px-5 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#0E3A68]/5 focus:border-[#0E3A68]/30 transition-all appearance-none cursor-pointer">
                                <option>General Inquiry</option>
                                <option>Document Review</option>
                                <option>Technical Issue</option>
                                <option>Billing / Payment</option>
                            </select>
                            <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[#8B95A5]">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest ml-1">Detailed Description</label>
                    <textarea rows="4" placeholder="Please provide as much detail as possible..." class="w-full px-5 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#0E3A68]/5 focus:border-[#0E3A68]/30 transition-all resize-none"></textarea>
                </div>

                <div class="flex gap-3 justify-end mt-4">
                    <button onclick="document.getElementById('new-ticket-modal').classList.add('hidden')" class="px-6 py-3 bg-white border border-[#E2E8F0] text-[#6B7280] text-sm font-bold rounded-2xl hover:bg-[#F8FAFC] transition-all">Cancel</button>
                    <button onclick="submitTicket(this)" class="px-8 py-3 bg-gradient-to-r from-[#0E3A68] to-[#1D5083] text-white text-sm font-bold rounded-2xl hover:shadow-lg hover:translate-y-[-1px] transition-all flex items-center gap-2">
                        <span>Initialize Ticket</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div id="toast-container" class="fixed bottom-6 right-6 z-[500] flex flex-col gap-3"></div>

    <!-- All tickets data for Alpine hydration -->
    <script id="all-tickets-data" type="application/json">
        @json($allTicketsJson)
    </script>

    @if($activeTicket)
    <script id="initial-messages-data" type="application/json">
        @json($initialMessages)
    </script>
    @endif

    <script>
        window.showToast = function(m,t='info'){const c={success:'bg-gradient-to-r from-[#059669] to-[#10B981] text-white',info:'bg-gradient-to-r from-[#0E3A68] to-[#1D5083] text-white',warning:'bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white',error:'bg-gradient-to-r from-[#DC2626] to-[#EF4444] text-white'};const e=document.createElement('div');e.className=`${c[t]} px-5 py-3 rounded-2xl shadow-2xl text-[13px] font-bold flex items-center gap-3 border border-white/10 backdrop-blur-md`;e.style.animation='toastIn .4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';e.innerHTML=`<div class="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div><span class="flex-1">${m}</span><button onclick="this.parentElement.remove()" class="opacity-60 hover:opacity-100 transition-opacity">✕</button>`;document.getElementById('toast-container').appendChild(e);setTimeout(()=>{e.style.opacity='0';e.style.transform='translateX(50px) scale(0.9)';e.style.transition='all .4s ease-in';setTimeout(()=>e.remove(),400)},5000)}
        function submitTicket(btn){const orig=btn.innerHTML;btn.disabled=true;btn.innerHTML='<svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Processing...</span>';setTimeout(()=>{document.getElementById('new-ticket-modal').classList.add('hidden');btn.innerHTML=orig;btn.disabled=false;showToast('Legal support ticket successfully initialized.','success')},1500)}
    </script>
</body>
</html>
