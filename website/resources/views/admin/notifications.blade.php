<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Notifications - Lawsy</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Poppins', sans-serif; background-color: #F8FAFC; }
        .font-serif { font-family: 'Poppins', sans-serif; }
        @keyframes slideIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .anim-slide { animation: slideIn 0.4s ease-out forwards; opacity:0; }
    </style>
</head>
<body class="flex h-screen bg-[#F8FAFC] overflow-hidden text-[#1A1A1A]">
    @include('admin.components.sidebar')

    <div class="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <header class="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between shrink-0">
            <!-- Left: Title -->
            <div class="flex items-center gap-4">
                <h1 class="text-xl font-bold text-[#1A1A1A]">Notifications</h1>
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

        <main class="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
            <!-- Page Header -->
            <div class="flex justify-between items-center shrink-0">
                <div>
                    <p class="text-[15px] text-[#6B7280]">Stay updated with the latest system activities and alerts.</p>
                </div>
                <button onclick="markAllRead()" class="px-5 py-2.5 bg-white border border-[#E2E8F0] text-[#1D5083] text-sm font-semibold rounded-xl hover:bg-[#F8FAFC] shadow-sm transition-all flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    Mark All Read
                </button>
            </div>

            <!-- Filter Tabs -->
            <div class="flex gap-3 shrink-0">
                <button onclick="filterNotifs('all',this)" class="notif-tab active-tab px-5 py-2.5 bg-[#1D5083] text-white text-sm font-medium rounded-full shadow-md transition-all">All</button>
                <button onclick="filterNotifs('unread',this)" class="notif-tab px-5 py-2.5 bg-white text-[#6B7280] border border-[#E2E8F0] text-sm font-medium rounded-full hover:bg-gray-50 transition-all">Unread ({{ $unreadCount }})</button>
                <button onclick="filterNotifs('read',this)" class="notif-tab px-5 py-2.5 bg-white text-[#6B7280] border border-[#E2E8F0] text-sm font-medium rounded-full hover:bg-gray-50 transition-all">Read</button>
            </div>

            <!-- Notification Cards -->
            <div class="flex flex-col gap-4" id="notif-list">
                @foreach($notifications as $i => $n)
                @php
                    $icon = 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
                    $iconBg = 'bg-[#EBF3FA]';
                    $iconColor = 'text-[#1D5083]';
                    if($n->type === 'success') { $iconBg = 'bg-[#D1FAE5]'; $iconColor = 'text-[#059669]'; $icon = 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'; }
                    if($n->type === 'warning') { $iconBg = 'bg-[#FEF3C7]'; $iconColor = 'text-[#D97706]'; $icon = 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'; }
                    if($n->type === 'error') { $iconBg = 'bg-[#FEE2E2]'; $iconColor = 'text-[#DC2626]'; $icon = 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'; }
                @endphp
                <div class="notif-card anim-slide group bg-white rounded-2xl p-6 border {{ !$n->is_read ? 'border-[#1D5083]/20 bg-[#FAFBFF]' : 'border-[#E2E8F0]' }} shadow-sm hover:shadow-lg hover:shadow-[#1D5083]/5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex items-start gap-5" 
                     data-id="{{ $n->id }}"
                     data-unread="{{ !$n->is_read ? '1' : '0' }}" 
                     data-type="{{ $n->type }}" 
                     data-text="{{ strtolower($n->title.' '.$n->message) }}" 
                     style="animation-delay: {{ $i * 60 }}ms">
                    <!-- Icon -->
                    <div class="w-12 h-12 {{ $iconBg }} rounded-xl flex items-center justify-center {{ $iconColor }} shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{ $icon }}"></path></svg>
                    </div>
                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-3 mb-1">
                            <h3 class="text-[15px] font-bold text-[#1A1A1A]">{{ $n->title }}</h3>
                            @if(!$n->is_read)
                            <span class="w-2 h-2 bg-[#1D5083] rounded-full shrink-0"></span>
                            @endif
                        </div>
                        <p class="text-[13px] text-[#6B7280] leading-relaxed mb-2">{{ $n->message }}</p>
                        <span class="text-[11px] font-bold text-[#8B95A5] uppercase tracking-wider">{{ $n->created_at->diffForHumans() }}</span>
                    </div>
                    <!-- Actions -->
                    <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0">
                        <button onclick="event.stopPropagation();markOneRead(this.closest('.notif-card'))" class="p-2 hover:bg-[#F1F5F9] rounded-lg text-[#8B95A5] hover:text-[#1D5083] transition-colors" title="Mark as read">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        </button>
                        <button onclick="event.stopPropagation();deleteNotif(this.closest('.notif-card'))" class="p-2 hover:bg-[#FEF2F2] rounded-lg text-[#8B95A5] hover:text-[#EF4444] transition-colors" title="Delete">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
                @endforeach
            </div>
            <div class="shrink-0 h-4"></div>
        </main>
    </div>

    <div id="toast-container" class="fixed bottom-6 right-6 z-[500] flex flex-col gap-3"></div>
    <style>@keyframes toastIn{from{opacity:0;transform:translateX(100px)}to{opacity:1;transform:translateX(0)}}</style>
    <script>
        function showToast(m,t='info'){const c={success:'bg-[#059669] text-white',info:'bg-[#1D5083] text-white',warning:'bg-[#D97706] text-white'};const e=document.createElement('div');e.className=`${c[t]} px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-3`;e.style.animation='toastIn .3s ease-out';e.innerHTML=`<span>${m}</span><button onclick="this.parentElement.remove()" class="opacity-70 hover:opacity-100">✕</button>`;document.getElementById('toast-container').appendChild(e);setTimeout(()=>{e.style.opacity='0';e.style.transition='opacity .3s';setTimeout(()=>e.remove(),300)},4000)}
        function filterNotifs(type,btn){document.querySelectorAll('.notif-tab').forEach(t=>{t.className='notif-tab px-5 py-2.5 bg-white text-[#6B7280] border border-[#E2E8F0] text-sm font-medium rounded-full hover:bg-gray-50 transition-all'});btn.className='notif-tab active-tab px-5 py-2.5 bg-[#1D5083] text-white text-sm font-medium rounded-full shadow-md transition-all';document.querySelectorAll('.notif-card').forEach(c=>{if(type==='all')c.style.display='flex';else if(type==='unread')c.style.display=c.dataset.unread==='1'?'flex':'none';else c.style.display=c.dataset.unread==='0'?'flex':'none'})}
        function markAllRead(){let count=0;document.querySelectorAll('.notif-card').forEach(c=>{if(c.dataset.unread==='1')count++;c.dataset.unread='0';c.classList.remove('border-[#1D5083]/20','bg-[#FAFBFF]');c.classList.add('border-[#E2E8F0]');const dot=c.querySelector('.bg-\\[\\#1D5083\\].rounded-full.w-2');if(dot)dot.remove()});if(count)showToast(`${count} notifications marked as read`,'success')}
        function markOneRead(card){card.dataset.unread='0';card.classList.remove('border-[#1D5083]/20','bg-[#FAFBFF]');card.classList.add('border-[#E2E8F0]');const dot=card.querySelector('.w-2.h-2');if(dot)dot.remove();showToast('Notification marked as read','success')}
        function deleteNotif(card){card.style.opacity='0';card.style.transform='translateX(30px)';card.style.transition='all .3s';setTimeout(()=>{card.remove();showToast('Notification deleted','info')},300)}
        function searchNotifs(q){q=q.toLowerCase();document.querySelectorAll('.notif-card').forEach(c=>{c.style.display=(c.dataset.text||'').includes(q)?'flex':'none'})}
    </script>
</body>
</html>
