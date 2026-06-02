<!-- Sidebar Container -->
<div class="bg-white border-r border-[#E2E8F0] flex flex-col h-screen sticky top-0 z-50 shrink-0 w-[280px]">
    
    <!-- Custom thin scrollbar area -->
    <div class="flex-1 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[#E2E8F0] hover:scrollbar-thumb-[#CBD5E1] scrollbar-track-transparent">
        
        <!-- Logo Section -->
        <div class="px-8 py-8 mb-4 flex items-center gap-4 shrink-0 cursor-pointer group/logo">
            <svg class="w-8 h-8 text-[#0E3A68] shrink-0 transition-transform duration-700 ease-in-out group-hover/logo:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2l-8 4v2h16V6l-8-4zM2 10h2v6H2v-6zm4 0h2v6H6v-6zm4 0h2v6h-2v-6zm4 0h2v6h-2v-6zM1 18h18v2H1v-2z"/>
            </svg>
            <div class="flex flex-col">
                <span class="text-[24px] font-serif font-bold text-[#0E3A68] leading-none tracking-tight">Lawsy</span>
                <span class="text-[9px] uppercase tracking-[0.25em] text-[#8B95A5] font-bold mt-1.5">Intelligence</span>
            </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex flex-col gap-2 px-4 shrink-0">
            
            @php
                $unreadNotifCount = \App\Models\Notification::where('user_id', auth()->id())->where('is_read', false)->count();
                $lawyerPendingCount = \App\Models\Lawyer::where('status', 'pending')->count(); // You might want to fetch this from Go later
                
                $navItems = [
                    ['route' => 'dashboardadmin', 'label' => 'Dashboard', 'icon' => 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', 'badge' => null, 'badgeStyle' => 'bg-[#EFF6FF] text-[#3B82F6]'],
                    ['route' => 'reportlawyer', 'label' => 'Cases', 'icon' => 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', 'badge' => null, 'badgeStyle' => 'bg-[#FFFBEB] border border-[#FDE68A] text-[#D97706]'],
                    ['route' => 'lawyers_verification', 'label' => 'Lawyers', 'icon' => 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', 'badge' => $lawyerPendingCount > 0 ? 'dot' : null],
                    ['route' => 'admin.documents.index', 'label' => 'Documents', 'icon' => 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', 'badge' => null],
                    ['route' => 'admin.analytics', 'label' => 'Analytics', 'icon' => 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z', 'badge' => null],
                ];
                $navItems2 = [
                    ['route' => 'admin.notifications', 'label' => 'Notifications', 'icon' => 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', 'badge' => $unreadNotifCount > 0 ? $unreadNotifCount . ' New' : null, 'badgeStyle' => 'bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444]', 'pulse' => $unreadNotifCount > 0],
                    ['route' => 'admin.compliance', 'label' => 'Compliance', 'icon' => 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', 'badge' => null],
                    ['route' => 'admin.settings', 'label' => 'Settings', 'icon' => 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', 'badge' => null, 'iconExtra' => 'M15 12a3 3 0 11-6 0 3 3 0 016 0z'],
                ];
            @endphp

            @foreach($navItems as $item)
            @php
                $isActive = request()->routeIs($item['route']) || (isset($item['route']) && Str::contains($item['route'], 'documents') && request()->routeIs('admin.documents.*'));
            @endphp
            <a href="{{ route($item['route']) }}" class="relative flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group/item overflow-hidden {{ $isActive ? 'bg-[#F8FAFC]' : 'hover:bg-[#F8FAFC]' }}">
                @if($isActive)
                <div class="absolute inset-0 bg-gradient-to-r from-[#0E3A68]/5 to-transparent opacity-100"></div>
                @endif
                <div class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] bg-[#0E3A68] rounded-r-md transition-all duration-300 {{ $isActive ? 'h-8 opacity-100 shadow-[2px_0_8px_rgba(14,58,104,0.3)]' : 'h-0 opacity-0 group-hover/item:h-5 group-hover/item:opacity-30' }}"></div>
                <div class="flex items-center gap-4 relative z-10 flex-1">
                    <svg class="w-[22px] h-[22px] shrink-0 transition-all duration-300 {{ $isActive ? 'text-[#0E3A68]' : 'text-[#8B95A5] group-hover/item:text-[#0E3A68] group-hover/item:scale-110 group-hover/item:-translate-y-0.5' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{ $item['icon'] }}"></path></svg>
                    <span class="text-[14px] font-semibold transition-all duration-300 {{ $isActive ? 'text-[#0E3A68] translate-x-1' : 'text-[#6B7280] group-hover/item:text-[#0E3A68] group-hover/item:translate-x-1' }}">{{ $item['label'] }}</span>
                </div>
                @if(isset($item['badge']) && $item['badge'] === 'dot')
                <div class="relative z-10 flex items-center justify-center"><div class="w-2 h-2 bg-[#EF4444] rounded-full shadow-[0_0_6px_rgba(239,68,68,0.6)] group-hover/item:scale-125 transition-all duration-300"></div></div>
                @elseif(isset($item['badge']) && $item['badge'])
                <div class="relative z-10 flex items-center justify-center min-w-[20px] h-5 px-1.5 {{ $item['badgeStyle'] ?? 'bg-[#EFF6FF] text-[#3B82F6]' }} text-[11px] font-bold rounded-md opacity-90 transition-all duration-300 group-hover/item:scale-110">{{ $item['badge'] }}</div>
                @endif
            </a>
            @endforeach

            <div class="w-full h-px bg-[#F1F5F9] my-1.5"></div>

            @foreach($navItems2 as $item)
            @php $isActive = request()->routeIs($item['route']); @endphp
            <a href="{{ route($item['route']) }}" class="relative flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group/item overflow-hidden {{ $isActive ? 'bg-[#F8FAFC]' : 'hover:bg-[#F8FAFC]' }}">
                @if($isActive)
                <div class="absolute inset-0 bg-gradient-to-r from-[#0E3A68]/5 to-transparent opacity-100"></div>
                @endif
                <div class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] bg-[#0E3A68] rounded-r-md transition-all duration-300 {{ $isActive ? 'h-8 opacity-100 shadow-[2px_0_8px_rgba(14,58,104,0.3)]' : 'h-0 opacity-0 group-hover/item:h-5 group-hover/item:opacity-30' }}"></div>
                <div class="flex items-center gap-4 relative z-10 flex-1">
                    <svg class="w-[22px] h-[22px] shrink-0 transition-all duration-300 {{ $isActive ? 'text-[#0E3A68]' : 'text-[#8B95A5] group-hover/item:text-[#0E3A68] group-hover/item:scale-110 group-hover/item:-translate-y-0.5' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{ $item['icon'] }}"></path>
                        @if(isset($item['iconExtra']))
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{ $item['iconExtra'] }}"></path>
                        @endif
                    </svg>
                    <span class="text-[14px] font-semibold transition-all duration-300 {{ $isActive ? 'text-[#0E3A68] translate-x-1' : 'text-[#6B7280] group-hover/item:text-[#0E3A68] group-hover/item:translate-x-1' }}">{{ $item['label'] }}</span>
                </div>
                @if(isset($item['badge']) && $item['badge'])
                <div class="relative z-10 flex items-center justify-center px-2.5 h-5 {{ $item['badgeStyle'] ?? '' }} text-[11px] font-bold rounded-full opacity-95 transition-all duration-300 group-hover/item:scale-110 shadow-sm overflow-visible">
                    <span class="relative z-10">{{ $item['badge'] }}</span>
                    @if(isset($item['pulse']) && $item['pulse'])
                    <div class="absolute inset-0 rounded-full border border-[#EF4444] animate-ping opacity-20"></div>
                    @endif
                </div>
                @endif
            </a>
            @endforeach
        </nav>
        
        <!-- Push bottom actions to end -->
        <div class="flex-1"></div>

        <!-- Bottom Actions -->
        <div class="flex flex-col gap-2 px-6 pb-8 mt-12 shrink-0">
            <!-- New Case Button -->
            <button class="relative flex items-center justify-center gap-3 bg-[#0E3A68] text-white py-3.5 rounded-xl font-bold text-[14px] shadow-md hover:shadow-lg hover:shadow-[#0E3A68]/30 hover:bg-[#0B2C52] transition-all duration-300 hover:-translate-y-0.5 group/btn overflow-hidden">
                <svg class="w-[20px] h-[20px] shrink-0 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:-rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                <span class="whitespace-nowrap transition-transform duration-300 group-hover/btn:translate-x-0.5">New Case</span>
            </button>
            
            <a href="{{ route('admin.support') }}" class="relative flex items-center gap-4 px-4 py-3.5 mt-2 rounded-xl transition-all duration-300 ease-out group/item overflow-hidden {{ request()->routeIs('admin.support') ? 'bg-[#F8FAFC]' : 'hover:bg-[#F8FAFC]' }}">
                <div class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] bg-[#0E3A68] rounded-r-md transition-all duration-300 {{ request()->routeIs('admin.support') ? 'h-8 opacity-100' : 'h-0 opacity-0 group-hover/item:h-5 group-hover/item:opacity-30' }}"></div>
                <div class="flex items-center gap-4 relative z-10 flex-1">
                    <svg class="w-[22px] h-[22px] shrink-0 transition-all duration-300 {{ request()->routeIs('admin.support') ? 'text-[#0E3A68]' : 'text-[#8B95A5] group-hover/item:text-[#0E3A68] group-hover/item:scale-110 group-hover/item:-translate-y-0.5' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span class="text-[14px] font-semibold transition-all duration-300 {{ request()->routeIs('admin.support') ? 'text-[#0E3A68]' : 'text-[#6B7280] group-hover/item:text-[#0E3A68] group-hover/item:translate-x-1' }}">Support</span>
                </div>
            </a>

            <!-- Logout Form -->
            <form action="{{ route('logout') }}" method="POST" class="m-0">
                @csrf
                <button type="submit" class="w-full text-left relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ease-out group/item overflow-hidden hover:bg-[#FEF2F2]">
                    <div class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] bg-[#EF4444] rounded-r-md transition-all duration-300 h-0 opacity-0 group-hover/item:h-5 group-hover/item:opacity-30"></div>
                    <div class="flex items-center gap-4 relative z-10 w-full flex-1">
                        <svg class="w-[22px] h-[22px] shrink-0 text-[#8B95A5] transition-all duration-300 group-hover/item:text-[#EF4444] group-hover/item:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        <span class="text-[14px] font-semibold text-[#6B7280] transition-all duration-300 group-hover/item:text-[#EF4444] group-hover/item:translate-x-1">Sign Out</span>
                    </div>
                </button>
            </form>
        </div>
    </div>
</div>
