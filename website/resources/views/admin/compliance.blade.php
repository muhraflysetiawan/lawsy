<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Compliance - Lawsy</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Poppins', sans-serif; background-color: #F8FAFC; }
        .font-serif { font-family: 'Poppins', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .anim-up { animation: fadeUp 0.5s ease-out forwards; opacity:0; }
    </style>
</head>
<body class="flex h-screen bg-[#F8FAFC] overflow-hidden text-[#1A1A1A]">
    @include('admin.components.sidebar')

    <div class="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <header class="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between shrink-0">
            <!-- Left: Title -->
            <div class="flex items-center gap-4">
                <h1 class="text-xl font-bold text-[#1A1A1A]">Compliance Monitor</h1>
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

        <main class="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 flex flex-col gap-6 lg:gap-8 max-w-7xl mx-auto w-full" x-data="complianceRealtime" x-init="init()">
            <!-- Header Info -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                    <h2 class="text-2xl font-bold text-[#1A1A1A] font-serif tracking-tight">System Compliance</h2>
                    <p class="text-sm text-[#6B7280] mt-1">Live monitoring of verification, audit logs, and security checks.</p>
                </div>
                <button onclick="exportReport(this)" class="group px-4 py-2.5 bg-white border border-[#E2E8F0] text-[#1D5083] text-sm font-semibold rounded-xl hover:bg-[#F0F5FF] hover:border-[#D1E2F2] hover:shadow-md transition-all duration-300 flex items-center gap-2">
                    <svg class="w-4 h-4 text-[#8B95A5] group-hover:text-[#1D5083] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    <span>Export Report</span>
                </button>
            </div>

            <!-- Compliance Score Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 shrink-0">
                <!-- Card 1 -->
                <div class="bg-white p-5 lg:p-6 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group cursor-default">
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-10 h-10 bg-[#F0F5FF] rounded-xl flex items-center justify-center text-[#1D5083] group-hover:scale-110 transition-transform duration-300">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        </div>
                        <span class="text-[#059669] bg-[#D1FAE5] text-[10px] font-bold px-2 py-1 rounded-md tracking-wide">+2.1%</span>
                    </div>
                    <div>
                        <p class="text-xs text-[#6B7280] mb-1 font-medium uppercase tracking-wider">Compliance Score</p>
                        <p class="font-serif text-2xl lg:text-3xl font-bold text-[#1A1A1A]">94.2%</p>
                    </div>
                </div>

                <!-- Card 2 -->
                <div class="bg-white p-5 lg:p-6 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group cursor-default">
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-10 h-10 bg-[#FFF8EB] rounded-xl flex items-center justify-center text-[#B45309] group-hover:scale-110 transition-transform duration-300">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <span class="text-[#1D5083] bg-[#F0F5FF] text-[10px] font-bold px-2 py-1 rounded-md tracking-wide">LIVE</span>
                    </div>
                    <div>
                        <p class="text-xs text-[#6B7280] mb-1 font-medium uppercase tracking-wider">Total Audits</p>
                        <p class="font-serif text-2xl lg:text-3xl font-bold text-[#1A1A1A]" x-text="stats.total_audits"></p>
                    </div>
                </div>

                <!-- Card 3 -->
                <div class="bg-white p-5 lg:p-6 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group cursor-default">
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-10 h-10 bg-[#D1FAE5] rounded-xl flex items-center justify-center text-[#059669] group-hover:scale-110 transition-transform duration-300">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <span class="text-[#059669] bg-[#D1FAE5] text-[10px] font-bold px-2 py-1 rounded-md tracking-wide">+18%</span>
                    </div>
                    <div>
                        <p class="text-xs text-[#6B7280] mb-1 font-medium uppercase tracking-wider">Passed Checks</p>
                        <p class="font-serif text-2xl lg:text-3xl font-bold text-[#1A1A1A]" x-text="stats.passed"></p>
                    </div>
                </div>

                <!-- Card 4 -->
                <div class="bg-white p-5 lg:p-6 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group cursor-default">
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-10 h-10 bg-[#FCE8E8] rounded-xl flex items-center justify-center text-[#EF4444] group-hover:scale-110 transition-transform duration-300">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                        </div>
                        <span class="text-[#EF4444] bg-[#FCE8E8] text-[10px] font-bold px-2 py-1 rounded-md tracking-wide">CRITICAL</span>
                    </div>
                    <div>
                        <p class="text-xs text-[#6B7280] mb-1 font-medium uppercase tracking-wider">Warning / Failed</p>
                        <p class="font-serif text-2xl lg:text-3xl font-bold text-[#1A1A1A]" x-text="stats.warning + stats.failed"></p>
                    </div>
                </div>
            </div>

            <!-- Verification Logs Table -->
            <div class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col anim-up" style="animation-delay:400ms">
                <div class="flex flex-col md:flex-row md:items-center justify-between p-5 lg:p-6 border-b border-[#E2E8F0] gap-4 bg-[#F8FAFC]/50">
                    <div>
                        <h2 class="text-lg font-bold text-[#1A1A1A] font-serif tracking-tight">Verification Audit Log</h2>
                        <p class="text-[13px] text-[#6B7280] mt-0.5">Complete history of all verification actions.</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button onclick="filterLogs('all',this)" class="log-tab px-3.5 py-2 bg-[#1D5083] text-white text-[12px] font-semibold rounded-lg shadow-sm transition-all duration-200">All</button>
                        <button onclick="filterLogs('approved',this)" class="log-tab px-3.5 py-2 bg-white border border-[#E2E8F0] text-[#6B7280] text-[12px] font-semibold rounded-lg hover:text-[#1D5083] hover:bg-[#F8FAFC] transition-all duration-200 shadow-sm">Approvals</button>
                        <button onclick="filterLogs('rejected',this)" class="log-tab px-3.5 py-2 bg-white border border-[#E2E8F0] text-[#6B7280] text-[12px] font-semibold rounded-lg hover:text-[#1D5083] hover:bg-[#F8FAFC] transition-all duration-200 shadow-sm">Rejections</button>
                        <button onclick="filterLogs('revision',this)" class="log-tab px-3.5 py-2 bg-white border border-[#E2E8F0] text-[#6B7280] text-[12px] font-semibold rounded-lg hover:text-[#1D5083] hover:bg-[#F8FAFC] transition-all duration-200 shadow-sm">Revisions</button>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
                        <thead>
                            <tr class="border-b border-[#E2E8F0] bg-white">
                                <th class="py-4 px-6 text-[11px] font-bold text-[#8B95A5] uppercase tracking-wider">Timestamp</th>
                                <th class="py-4 px-6 text-[11px] font-bold text-[#8B95A5] uppercase tracking-wider">Admin</th>
                                <th class="py-4 px-6 text-[11px] font-bold text-[#8B95A5] uppercase tracking-wider">Action</th>
                                <th class="py-4 px-6 text-[11px] font-bold text-[#8B95A5] uppercase tracking-wider">Category</th>
                                <th class="py-4 px-6 text-[11px] font-bold text-[#8B95A5] uppercase tracking-wider">Description</th>
                                <th class="py-4 px-6 text-[11px] font-bold text-[#8B95A5] uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-[#F3F4F6] bg-white">
                            <template x-for="log in logs" :key="log.id">
                                <tr class="hover:bg-[#F8FAFC] transition-colors log-row cursor-pointer group" :data-status="log.raw_status" :data-text="(log.admin_name + ' ' + log.action).toLowerCase()" @click="showToast('Viewing details for ' + log.admin_name + ' — ' + log.action, 'info')">
                                    <td class="py-4 px-6 text-[13px] text-[#6B7280] font-medium" x-text="log.created_at"></td>
                                    <td class="py-4 px-6 text-[13px] font-bold text-[#1A1A1A] group-hover:text-[#1D5083] transition-colors" x-text="log.admin_name"></td>
                                    <td class="py-4 px-6 text-[13px] font-semibold text-[#4B5563]" x-text="log.action"></td>
                                    <td class="py-4 px-6 text-[13px] font-medium text-[#6B7280] capitalize" x-text="log.category"></td>
                                    <td class="py-4 px-6 text-[13px] text-[#6B7280] truncate max-w-xs" x-text="log.description" :title="log.description"></td>
                                    <td class="py-4 px-6">
                                        <template x-if="log.status === 'Passed'">
                                            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#D1FAE5] text-[#059669]">Passed</span>
                                        </template>
                                        <template x-if="log.status === 'Warning'">
                                            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#FEF3C7] text-[#D97706]">Warning</span>
                                        </template>
                                        <template x-if="log.status === 'Failed'">
                                            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#FEE2E2] text-[#DC2626]">Failed</span>
                                        </template>
                                    </td>
                                </tr>
                            </template>
                            <template x-if="logs.length === 0">
                                <tr>
                                    <td colspan="6" class="py-12 text-center text-[13px] text-[#8B95A5] font-medium">No compliance logs found.</td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Approval Activity Timeline -->
            <div class="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col anim-up" style="animation-delay:500ms">
                <div class="p-5 lg:p-6 border-b border-[#E2E8F0] bg-[#F8FAFC]/50 flex items-center gap-3">
                    <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#1D5083] shadow-sm border border-[#E2E8F0]">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                        <h2 class="text-lg font-bold text-[#1A1A1A] font-serif tracking-tight">Timeline History</h2>
                        <p class="text-[13px] text-[#6B7280] mt-0.5">Key verification events from the past 24 hours.</p>
                    </div>
                </div>

                <div class="p-6 lg:p-8 relative max-w-4xl">
                    <!-- Vertical Line -->
                    <div class="absolute left-[39px] lg:left-[47px] top-10 bottom-8 w-px bg-[#E2E8F0]"></div>
                    
                    <div class="flex flex-col gap-8">
                        @php
                        $timeline = [
                            [
                                'time' => '10:02 AM', 'date' => 'Today', 'title' => 'Sarah Jenkins approved',
                                'desc' => 'All 6 documents verified successfully against Bar Association database.',
                                'status' => 'success', 'icon' => 'M5 13l4 4L19 7'
                            ],
                            [
                                'time' => '09:45 AM', 'date' => 'Today', 'title' => 'Revision requested for Elena Rodriguez',
                                'desc' => 'Identity Card flagged as blurry. Notification sent to lawyer for resubmission.',
                                'status' => 'warning', 'icon' => 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                            ],
                            [
                                'time' => '04:30 PM', 'date' => 'Yesterday', 'title' => 'David Chen approved',
                                'desc' => 'Fast-track verification completed. Corporate specialization confirmed.',
                                'status' => 'success', 'icon' => 'M5 13l4 4L19 7'
                            ],
                            [
                                'time' => '02:15 PM', 'date' => 'Yesterday', 'title' => 'John Doe rejected',
                                'desc' => 'Fraudulent lawyer license detected. Security protocol initiated.',
                                'status' => 'danger', 'icon' => 'M6 18L18 6M6 6l12 12'
                            ],
                        ];
                        @endphp

                        @foreach($timeline as $t)
                        <div class="relative flex gap-5 lg:gap-6 group">
                            <!-- Left: Indicator Icon -->
                            <div class="relative z-10 shrink-0 mt-0.5">
                                @php
                                    $colorClass = 'bg-[#10B981] text-white border-[#D1FAE5]';
                                    if($t['status'] === 'warning') $colorClass = 'bg-[#F59E0B] text-white border-[#FEF3C7]';
                                    if($t['status'] === 'danger') $colorClass = 'bg-[#EF4444] text-white border-[#FEE2E2]';
                                @endphp
                                <div class="w-8 h-8 rounded-full {{ $colorClass }} flex items-center justify-center border-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="{{ $t['icon'] }}"></path></svg>
                                </div>
                            </div>

                            <!-- Right: Content -->
                            <div class="flex-1">
                                <div class="flex flex-wrap items-center gap-2 mb-1">
                                    <h4 class="text-[14px] font-bold text-[#1A1A1A] group-hover:text-[#1D5083] transition-colors">{{ $t['title'] }}</h4>
                                    <span class="text-[11px] font-bold text-[#8B95A5] hidden sm:block">•</span>
                                    <span class="text-[12px] font-medium text-[#6B7280]">{{ $t['time'] }}, {{ $t['date'] }}</span>
                                </div>
                                <p class="text-[13px] text-[#4B5563] leading-relaxed max-w-2xl">{{ $t['desc'] }}</p>
                                
                                <div class="mt-2.5 inline-flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-md">
                                    <div class="w-4 h-4 rounded-sm bg-[#EBF3FA] flex items-center justify-center text-[7px] font-bold text-[#1D5083]">AD</div>
                                    <span class="text-[10px] font-bold text-[#6B7280]">Verified by Admin</span>
                                </div>
                            </div>
                        </div>
                        @endforeach
                    </div>
                </div>
            </div>
            <div class="shrink-0 h-4"></div>
        </main>
    </div>
    <div id="toast-container" class="fixed bottom-6 right-6 z-[500] flex flex-col gap-3"></div>
    <style>@keyframes toastIn { from { opacity:0; transform:translateX(100px); } to { opacity:1; transform:translateX(0); } }</style>
    <script>
        function showToast(msg, type='info') {
            const colors = {success:'bg-[#059669] text-white',warning:'bg-[#D97706] text-white',error:'bg-[#DC2626] text-white',info:'bg-[#1D5083] text-white'};
            const t = document.createElement('div'); t.className = `${colors[type]} px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-3`; t.style.animation='toastIn .3s ease-out';
            t.innerHTML = `<span>${msg}</span><button onclick="this.parentElement.remove()" class="opacity-70 hover:opacity-100">✕</button>`;
            document.getElementById('toast-container').appendChild(t); setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(()=>t.remove(),300);},4000);
        }
        function exportReport(btn) {
            const orig=btn.innerHTML; btn.disabled=true; btn.innerHTML='<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> Generating...';
            setTimeout(()=>{btn.innerHTML='<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Done!';btn.classList.add('border-[#059669]','text-[#059669]');showToast('Compliance report exported as PDF','success');setTimeout(()=>{btn.innerHTML=orig;btn.disabled=false;btn.classList.remove('border-[#059669]','text-[#059669]');},2000);},1500);
        }
        function filterLogs(status, btn) {
            document.querySelectorAll('.log-tab').forEach(b=>{b.className='log-tab px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] text-[#6B7280] text-xs font-bold rounded-lg hover:text-[#1D5083] transition-colors';});
            btn.className='log-tab px-4 py-2 bg-[#1D5083] text-white text-xs font-bold rounded-lg';
            document.querySelectorAll('.log-row').forEach(r=>{r.style.display=(status==='all'||r.dataset.status===status)?'':'none';});
        }
        function searchLogs(q) {
            q=q.toLowerCase(); document.querySelectorAll('.log-row').forEach(r=>{r.style.display=r.dataset.text.includes(q)?'':'none';});
        }
        
        document.addEventListener('alpine:init', () => {
            @php
                $defaultStats = ['total_audits' => 0, 'passed' => 0, 'warning' => 0, 'failed' => 0];
            @endphp
            Alpine.data('complianceRealtime', () => ({
                stats: @json($stats ?? $defaultStats),
                logs: [],
                
                init() {
                    // Fetch live compliance stats and logs on initialization
                    this.fetchStats();
                    // Set up dynamic polling interval of 15 seconds
                    setInterval(() => this.fetchStats(), 15000);
                },

                fetchStats() {
                    fetch('/api/admin/compliance-stats')
                        .then(res => res.json())
                        .then(data => {
                            if(data.stats) this.stats = data.stats;
                            if(data.logs) this.logs = data.logs;
                        })
                        .catch(err => console.error("Error fetching compliance:", err));
                }
            }));
        });
    </script>
</body>
</html>
