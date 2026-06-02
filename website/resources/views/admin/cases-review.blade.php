<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Review - Case #LGL-8492</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Poppins', sans-serif; background-color: #F8FAFC; color: #1A1A1A; }
        .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        .font-serif { font-family: 'Poppins', sans-serif; }

        .badge-financial {
            background-color: #EFF6FF;
            color: #2563EB;
            border: 1px solid #BFDBFE;
        }
        .badge-critical {
            background-color: #FEF2F2;
            color: #DC2626;
            border: 1px solid #FECACA;
        }
        .badge-high {
            background-color: #FFF7ED;
            color: #EA580C;
            border: 1px solid #FFEDD5;
        }
        .badge-medium {
            background-color: #FEFCE8;
            color: #CA8A04;
            border: 1px solid #FEF08A;
        }
        .badge-low {
            background-color: #F0FDF4;
            color: #16A34A;
            border: 1px solid #BBF7D0;
        }
        .badge-investigating {
            background-color: #EFF6FF;
            color: #2563EB;
            border: 1px solid #BFDBFE;
        }
        .badge-resolved {
            background-color: #F0FDF4;
            color: #16A34A;
            border: 1px solid #BBF7D0;
        }
        .badge-suspended {
            background-color: #450A0A;
            color: #FECACA;
            border: 1px solid #7F1D1D;
        }
        .badge-pending {
            background-color: #F8FAFC;
            color: #64748B;
            border: 1px solid #E2E8F0;
        }
        .progress-bar {
            background: linear-gradient(90deg, #1e3a5f 0%, #2563EB 100%);
        }
        .btn-suspend {
            background: #1e3a5f;
        }
        .btn-suspend:hover {
            background: #162d4a;
        }
        .btn-revoke {
            color: #DC2626;
            border: 1px solid #FECACA;
            background: #FEF2F2;
        }
        .btn-revoke:hover {
            background: #FEE2E2;
        }
        .timeline-dot-active {
            background-color: #2563EB;
        }
        .timeline-dot-inactive {
            background-color: #CBD5E1;
        }
        .card {
            background: #fff;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
        }
        .evidence-card {
            border: 1px solid #E2E8F0;
            border-radius: 10px;
            background: #FAFAFA;
        }
        .evidence-card:hover {
            border-color: #CBD5E1;
            background: #F1F5F9;
        }
        .icon-pdf { color: #EF4444; background: #FEF2F2; }
        .icon-csv { color: #10B981; background: #ECFDF5; }
        .icon-docx { color: #3B82F6; background: #EFF6FF; }
        .icon-mp4 { color: #6B7280; background: #F3F4F6; }

        input[type=checkbox]:checked {
            accent-color: #2563EB;
        }

        .checklist-done {
            text-decoration: line-through;
            color: #94A3B8;
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen" x-data="{ 
    showModal: false,
    modalType: 'info',
    modalTitle: '',
    modalMessage: '',
    modalConfirmText: 'Confirm',
    onConfirm: null,
    previewFile: null,
    selectedWarning: '2',
    
    openActionModal(type, title, message, confirmText, callback) {
        this.modalType = type;
        this.modalTitle = title;
        this.modalMessage = message;
        this.modalConfirmText = confirmText;
        this.onConfirm = callback;
        this.showModal = true;
    },
    
    closeModal() {
        this.showModal = false;
        this.previewFile = null;
    },

    showToast(msg, type='success') {
        const container = document.getElementById('toast-container');
        const colors = {success:'bg-[#10B981]', error:'bg-[#EF4444]', info:'bg-[#1D5083]'};
        const toast = document.createElement('div');
        toast.className = `${colors[type]} text-white px-5 py-3 rounded-xl shadow-lg text-sm font-bold flex items-center gap-3 animate-fade-in mb-3`;
        toast.innerHTML = `<span>${msg}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s ease';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
}">

    <!-- Toast Container -->
    <div id="toast-container" class="fixed bottom-6 right-6 z-[200]"></div>

    <!-- Global Modal -->
    <div x-show="showModal || previewFile" 
         x-transition:enter="transition ease-out duration-300"
         x-transition:enter-start="opacity-0"
         x-transition:enter-end="opacity-100"
         x-transition:leave="transition ease-in duration-200"
         x-transition:leave-start="opacity-100"
         x-transition:leave-end="opacity-0"
         class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" x-cloak>
        
        <div @click.away="closeModal()" 
             class="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            
            <!-- Evidence Preview Mode -->
            <template x-if="previewFile">
                <div class="p-0">
                    <div class="bg-gray-900 p-4 flex items-center justify-between text-white">
                        <div class="flex items-center gap-3">
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                            <span class="text-sm font-medium" x-text="previewFile"></span>
                        </div>
                        <button @click="closeModal()" class="hover:bg-white/10 p-1 rounded-lg transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div class="bg-gray-100 h-[500px] flex items-center justify-center relative overflow-hidden">
                        <!-- Simulated Doc Preview -->
                        <div class="bg-white w-[80%] h-[90%] shadow-lg p-10 space-y-4">
                            <div class="h-4 bg-gray-200 w-1/3 rounded"></div>
                            <div class="h-4 bg-gray-100 w-full rounded"></div>
                            <div class="h-4 bg-gray-100 w-full rounded"></div>
                            <div class="h-4 bg-gray-100 w-4/5 rounded"></div>
                            <div class="pt-8 space-y-4">
                                <div class="h-3 bg-gray-50 w-full rounded"></div>
                                <div class="h-3 bg-gray-50 w-full rounded"></div>
                                <div class="h-3 bg-gray-50 w-3/4 rounded"></div>
                            </div>
                        </div>
                        <div class="absolute inset-0 bg-gradient-to-t from-gray-100/50 to-transparent pointer-events-none"></div>
                    </div>
                    <div class="p-6 bg-white flex justify-end gap-3">
                        <button @click="closeModal()" class="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition">Close</button>
                        <button @click="showToast('Downloading ' + previewFile + '...', 'info'); closeModal();" class="px-6 py-2.5 bg-[#1D5083] text-white rounded-xl font-bold text-sm hover:bg-[#153c63] transition shadow-md">Download File</button>
                    </div>
                </div>
            </template>

            <!-- Action Confirmation Mode -->
            <template x-if="!previewFile">
                <div class="p-8 text-center">
                    <div :class="{
                        'bg-blue-100 text-blue-600': modalType === 'info',
                        'bg-red-100 text-red-600': modalType === 'danger',
                        'bg-amber-100 text-amber-600': modalType === 'warning'
                    }" class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <template x-if="modalType === 'danger'">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        </template>
                        <template x-if="modalType === 'info' || modalType === 'warning'">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </template>
                    </div>
                    
                    <h3 class="text-2xl font-bold text-gray-900 mb-2" x-text="modalTitle"></h3>
                    <p class="text-gray-500 mb-10 leading-relaxed" x-text="modalMessage"></p>
                    
                    <div class="flex flex-col gap-3">
                        <button @click="onConfirm(); closeModal();" 
                                :class="{
                                    'bg-blue-600 hover:bg-blue-700': modalType === 'info',
                                    'bg-red-600 hover:bg-red-700': modalType === 'danger',
                                    'bg-amber-600 hover:bg-amber-700': modalType === 'warning'
                                }"
                                class="w-full py-4 text-white font-bold rounded-2xl shadow-lg transition" x-text="modalConfirmText"></button>
                        <button @click="closeModal()" class="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition">Cancel</button>
                    </div>
                </div>
            </template>
        </div>
    </div>

    <!-- Top Bar -->
    <div class="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <button onclick="history.back()" class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
        </button>
        <h1 class="text-xl font-semibold text-gray-900">Review</h1>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-6 space-y-5">

        <!-- Subject Header Card -->
        <div class="card p-5">
            <div class="flex items-start justify-between gap-4 flex-wrap">
                <!-- Left: Avatar + Info -->
                <div class="flex items-start gap-4">
                    <div class="relative flex-shrink-0">
                        <img src="https://i.pravatar.cc/64?img=12" alt="Julian Sterling"
                             class="w-14 h-14 rounded-full object-cover border-2 border-gray-200"/>
                    </div>
                    <div class="space-y-2">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="text-lg font-semibold text-gray-900">Julian Sterling</span>
                            <!-- Verified tick -->
                            <svg class="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                            <span class="text-sm text-gray-400 mono">ID: #LGL-8492</span>
                        </div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="badge-financial text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/><path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd"/></svg>
                                Financial Misconduct
                            </span>
                            
                            {{-- Dynamic Risk Badge Example --}}
                            @php $risk = 'Critical'; @endphp
                            <span class="text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 {{ 
                                $risk === 'Critical' ? 'badge-critical' : (
                                $risk === 'High' ? 'badge-high' : (
                                $risk === 'Medium' ? 'badge-medium' : 'badge-low'))
                            }}">
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                                {{ strtoupper($risk) }}
                            </span>

                            <span class="badge-investigating text-xs font-medium px-2.5 py-1 rounded-full">
                                Status: Investigating
                            </span>
                        </div>
                        <p class="text-sm text-gray-400">Incident Date: Oct 12, 2023</p>
                    </div>
                </div>

                <!-- Right: Progress + Admin -->
                <div class="flex flex-col items-end gap-3 min-w-[220px]">
                    <div class="text-right w-full">
                        <div class="flex items-center justify-between mb-1.5">
                            <span class="text-xs text-gray-500 flex items-center gap-1">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"/></svg>
                                12 Files Logged
                            </span>
                            <span class="text-xs font-semibold text-blue-600">65% Reviewed</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-1.5">
                            <div class="progress-bar h-1.5 rounded-full" style="width: 65%"></div>
                        </div>
                    </div>
                    <!-- Assigned Admin Dropdown -->
                    <div class="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition w-full justify-between">
                        <div class="flex items-center gap-2">
                            <div class="relative">
                                <div class="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-semibold">SV</div>
                                <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></span>
                            </div>
                            <div>
                                <p class="text-xs text-gray-400 leading-none">Assigned Admin</p>
                                <p class="text-sm font-medium text-gray-800">Sarah Vance (Senior)</p>
                            </div>
                        </div>
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

            <!-- LEFT COLUMN (2/3) -->
            <div class="lg:col-span-2 space-y-5">

                <!-- Case Detail Card -->
                <div class="card p-6 space-y-5">
                    <h2 class="text-2xl font-bold text-gray-900">Escrow Fund Misappropriation</h2>

                    <!-- Chronology -->
                    <div>
                        <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                            <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Chronology
                        </h3>
                        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 leading-relaxed">
                            On Oct 12, 2023, client funds totaling $450,000 were wired to the Sterling firm's primary escrow account for a real estate transaction closing. On Oct 15, an unauthorized outbound transfer of $120,000 was initiated from this account to an offshore entity not listed in the closing disclosures.
                        </div>
                    </div>

                    <!-- Statements Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="border border-gray-200 rounded-lg p-4 bg-white">
                            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">User Statement</p>
                            <p class="text-sm text-gray-600 italic leading-relaxed">
                                "I trusted Mr. Sterling with my life savings for this property. The seller never received the final deposit, and when I asked for bank receipts, the firm stopped returning my calls."
                            </p>
                        </div>
                        <div class="border border-gray-200 rounded-lg p-4 bg-white">
                            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Lawyer Response</p>
                            <p class="text-sm text-gray-600 italic leading-relaxed">
                                "The transfer was an administrative error committed by a paralegal mixing up wire instructions for two concurrent commercial closings. Funds are being reversed."
                            </p>
                        </div>
                    </div>

                    <!-- Internal Summary -->
                    <div>
                        <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                            <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            Internal Summary
                        </h3>
                        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 leading-relaxed">
                            Preliminary review indicates the outbound wire destination matches an LLC registered to the lawyer's sibling. The 'administrative error' claim requires immediate auditing of the firm's overall transaction ledger to determine intent vs. negligence.
                        </div>
                    </div>
                </div>

                <!-- Evidence Files Card -->
                <div class="card p-6">
                    <div class="flex items-center justify-between mb-5">
                        <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"/>
                            </svg>
                            Evidence Files
                        </h3>
                        <a href="#" class="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                            View All
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </a>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

                        <!-- File 1 -->
                        <div class="evidence-card p-4 flex flex-col items-center gap-3 text-center transition cursor-pointer">
                            <div class="icon-pdf w-12 h-12 rounded-xl flex items-center justify-center">
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17v-1h8v1H8zm0-3v-1h8v1H8zm0-3V10h5v1H8z"/></svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-800">Bank_Transfer_Receipt.pdf</p>
                                <p class="text-xs text-gray-400 mt-0.5">2.4 MB • Uploaded Oct 16</p>
                            </div>
                            <button @click="previewFile = 'Bank_Transfer_Receipt.pdf'" class="w-full border border-gray-200 rounded-lg py-1.5 text-xs font-medium text-gray-600 hover:bg-white hover:border-gray-300 transition">Preview</button>
                        </div>

                        <!-- File 2 -->
                        <div class="evidence-card p-4 flex flex-col items-center gap-3 text-center transition cursor-pointer" @click="previewFile = 'Escrow_Agreement.pdf'">
                            <div class="icon-pdf w-12 h-12 rounded-xl flex items-center justify-center">
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17v-1h8v1H8zm0-3v-1h8v1H8zm0-3V10h5v1H8z"/></svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-800">Escrow_Agreement.pdf</p>
                                <p class="text-xs text-gray-400 mt-0.5">1.1 MB • Uploaded Oct 12</p>
                            </div>
                            <button @click="previewFile = 'Escrow_Agreement.pdf'" class="w-full border border-gray-200 rounded-lg py-1.5 text-xs font-medium text-gray-600 hover:bg-white hover:border-gray-300 transition">Preview</button>
                        </div>

                        <!-- File 3 -->
                        <div class="evidence-card p-4 flex flex-col items-center gap-3 text-center transition cursor-pointer" @click="previewFile = 'WhatsApp_Logs.csv'">
                            <div class="icon-csv w-12 h-12 rounded-xl flex items-center justify-center">
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4 3a2 2 0 00-2 2v14a2 2 0 002 2h16a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h16v3H4V5zm0 5h4v2H4v-2zm0 4h4v2H4v-2zm6-4h4v2h-4v-2zm0 4h4v2h-4v-2zm6-4h4v2h-4v-2zm0 4h4v2h-4v-2z"/></svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-800">WhatsApp_Logs.csv</p>
                                <p class="text-xs text-gray-400 mt-0.5">45 KB • Uploaded Oct 17</p>
                            </div>
                            <button @click="previewFile = 'WhatsApp_Logs.csv'" class="w-full border border-gray-200 rounded-lg py-1.5 text-xs font-medium text-gray-600 hover:bg-white hover:border-gray-300 transition">Preview</button>
                        </div>

                        <!-- File 4 -->
                        <div class="evidence-card p-4 flex flex-col items-center gap-3 text-center transition cursor-pointer" @click="previewFile = 'Signed_Contract_v2.docx'">
                            <div class="icon-docx w-12 h-12 rounded-xl flex items-center justify-center">
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM7 13h10v1H7v-1zm0 3h7v1H7v-1zm0-6h3v1H7v-1z"/></svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-800">Signed_Contract_v2.docx</p>
                                <p class="text-xs text-gray-400 mt-0.5">3.2 MB • Uploaded Oct 12</p>
                            </div>
                            <button @click="previewFile = 'Signed_Contract_v2.docx'" class="w-full border border-gray-200 rounded-lg py-1.5 text-xs font-medium text-gray-600 hover:bg-white hover:border-gray-300 transition">Preview</button>
                        </div>

                        <!-- File 5 -->
                        <div class="evidence-card p-4 flex flex-col items-center gap-3 text-center transition cursor-pointer" @click="previewFile = 'CCTV_Garage_Entry.mp4'">
                            <div class="icon-mp4 w-12 h-12 rounded-xl flex items-center justify-center">
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M15 8v8H5V8h10m1-2H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4V7a1 1 0 00-1-1z"/></svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-800">CCTV_Garage_Entry.mp4</p>
                                <p class="text-xs text-gray-400 mt-0.5">128 MB • Uploaded Oct 18</p>
                            </div>
                            <button @click="previewFile = 'CCTV_Garage_Entry.mp4'" class="w-full border border-gray-200 rounded-lg py-1.5 text-xs font-medium text-gray-600 hover:bg-white hover:border-gray-300 transition">Preview</button>
                        </div>

                    </div>
                </div>
            </div>

            <!-- RIGHT COLUMN (1/3) -->
            <div class="space-y-5">

                <!-- Investigation Actions -->
                <div class="card p-5 space-y-3">
                    <h3 class="text-sm font-semibold text-gray-800">Investigation Actions</h3>

                    <!-- Warning Options -->
                    <div class="space-y-2">
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Disciplinary Actions</p>
                        <div class="grid grid-cols-1 gap-2" x-data="{ selectedWarning: '' }">
                            <button @click="selectedWarning = '1'" :class="selectedWarning === '1' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'" class="w-full border rounded-lg py-2 text-xs font-bold transition flex items-center justify-between px-3">
                                <span>Warning Letter 1 (Soft)</span>
                                <template x-if="selectedWarning === '1'">
                                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>
                                </template>
                            </button>
                            <button @click="selectedWarning = '2'" :class="selectedWarning === '2' ? 'border-amber-600 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'" class="w-full border rounded-lg py-2 text-xs font-bold transition flex items-center justify-between px-3">
                                <span>Warning Letter 2 (Medium)</span>
                                <template x-if="selectedWarning === '2'">
                                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>
                                </template>
                            </button>
                            <button @click="selectedWarning = '3'" :class="selectedWarning === '3' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'" class="w-full border rounded-lg py-2 text-xs font-bold transition flex items-center justify-between px-3">
                                <span>Warning Letter 3 (Final)</span>
                                <template x-if="selectedWarning === '3'">
                                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>
                                </template>
                            </button>
                        </div>
                    </div>

                    <button @click="openActionModal('warning', 'Suspend Lawyer?', 'Are you sure you want to temporarily suspend this lawyer\'s access to the Lawsy network during investigation?', 'Suspend Access', () => showToast('Lawyer suspended successfully'))" class="btn-suspend w-full text-white rounded-lg py-2.5 text-sm font-medium transition flex items-center justify-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                        </svg>
                        Suspend Lawyer
                    </button>

                    <button @click="openActionModal('info', 'Start Full Audit?', 'This will initiate a deep forensic audit of all transactions related to Julian Sterling.', 'Start Audit', () => showToast('Full audit initiated'))" class="w-full border border-gray-200 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Start Full Audit
                    </button>

                    <div class="grid grid-cols-2 gap-3">
                        <button @click="openActionModal('info', 'Escalate Case?', 'Forward this case to the Lead Compliance Officer for final review?', 'Escalate Now', () => showToast('Case escalated to senior management'))" class="border border-gray-200 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition">
                            Escalate
                        </button>
                        <button @click="openActionModal('danger', 'Revoke License?', 'CRITICAL: This will permanently revoke the legal license for Julian Sterling on this platform. This action is irreversible.', 'Revoke Permanently', () => showToast('License revoked permanently', 'error'))" class="btn-revoke rounded-lg py-2.5 text-sm font-medium transition">
                            Revoke License
                        </button>
                    </div>
                </div>

                <!-- Checklist -->
                <div class="card p-5 space-y-3">
                    <h3 class="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                        </svg>
                        Checklist
                    </h3>

                    <div class="space-y-2.5">
                        <label class="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" checked class="w-4 h-4 rounded border-gray-300 accent-blue-600">
                            <span class="text-sm checklist-done group-has-[:checked]:checklist-done">Verify Plaintiff Identity</span>
                        </label>
                        <label class="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" checked class="w-4 h-4 rounded border-gray-300 accent-blue-600">
                            <span class="text-sm checklist-done group-has-[:checked]:checklist-done">Secure Initial Evidence</span>
                        </label>
                        <label class="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" class="w-4 h-4 rounded border-gray-300">
                            <span class="text-sm text-gray-700">Audit Primary Escrow Ledger</span>
                        </label>
                        <label class="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" class="w-4 h-4 rounded border-gray-300">
                            <span class="text-sm text-gray-700">Interview Managing Partner</span>
                        </label>
                    </div>
                </div>

                <!-- Admin Notes -->
                <div class="card p-5 space-y-3">
                    <h3 class="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                        </svg>
                        Admin Notes
                    </h3>
                    <textarea
                        rows="5"
                        placeholder="Add confidential internal notes here..."
                        class="w-full text-sm text-gray-700 placeholder-gray-400 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    ></textarea>
                    <div class="flex justify-end">
                        <button @click="showToast('Admin note saved locally')" class="text-sm font-medium text-blue-600 hover:text-blue-800 transition">Save Note</button>
                    </div>
                </div>

                <!-- Case Timeline -->
                <div class="card p-5 space-y-4">
                    <h3 class="text-sm font-semibold text-gray-800">Case Timeline</h3>

                    <div class="relative space-y-4">
                        <!-- Line -->
                        <div class="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200"></div>

                        <!-- Entry 1 -->
                        <div class="flex gap-4 relative">
                            <div class="timeline-dot-active w-3.5 h-3.5 rounded-full flex-shrink-0 mt-1 z-10 border-2 border-white ring-2 ring-blue-500"></div>
                            <div>
                                <p class="text-xs font-semibold text-blue-600">Today, 09:14 AM</p>
                                <p class="text-sm font-medium text-gray-800">Investigation Active</p>
                                <p class="text-xs text-gray-400">Status updated by System.</p>
                            </div>
                        </div>

                        <!-- Entry 2 -->
                        <div class="flex gap-4 relative">
                            <div class="timeline-dot-inactive w-3.5 h-3.5 rounded-full flex-shrink-0 mt-1 z-10 border-2 border-white"></div>
                            <div>
                                <p class="text-xs text-gray-400">Oct 17, 04:30 PM</p>
                                <p class="text-sm font-medium text-gray-800">Lawyer Notified</p>
                                <p class="text-xs text-gray-400">Automated legal hold notice sent.</p>
                            </div>
                        </div>

                        <!-- Entry 3 -->
                        <div class="flex gap-4 relative">
                            <div class="timeline-dot-inactive w-3.5 h-3.5 rounded-full flex-shrink-0 mt-1 z-10 border-2 border-white"></div>
                            <div>
                                <p class="text-xs text-gray-400">Oct 17, 10:15 AM</p>
                                <p class="text-sm font-medium text-gray-800">Admin Assigned</p>
                                <p class="text-xs text-gray-400">Assigned to Sarah Vance.</p>
                            </div>
                        </div>

                        <!-- Entry 4 -->
                        <div class="flex gap-4 relative">
                            <div class="timeline-dot-inactive w-3.5 h-3.5 rounded-full flex-shrink-0 mt-1 z-10 border-2 border-white"></div>
                            <div>
                                <p class="text-xs text-gray-400">Oct 16, 08:22 PM</p>
                                <p class="text-sm font-medium text-gray-800">Report Submitted</p>
                                <p class="text-xs text-gray-400">Initial client complaint logged.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

</body>
</html>
