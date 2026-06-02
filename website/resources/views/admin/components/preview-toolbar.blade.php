@php
    $title = $title ?? 'Document Preview';
    $subtitle = $subtitle ?? 'Page 1 of 1';
@endphp

<div class="bg-slate-50 px-6 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
    <div class="flex items-center gap-4">
        <span class="text-sm font-semibold text-slate-700">{{ $title }}</span>
        <span class="text-xs text-slate-500">{{ $subtitle }}</span>
    </div>
    <div class="flex items-center gap-2">
        <button title="Zoom Out" class="p-2 text-slate-600 hover:text-[#1D5083] hover:bg-white rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path></svg>
        </button>
        <button title="Zoom In" class="p-2 text-slate-600 hover:text-[#1D5083] hover:bg-white rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
        </button>
        <span class="text-sm text-slate-500 px-2">100%</span>
        <div class="w-px h-5 bg-slate-300 mx-1"></div>
        <button title="Rotate Clockwise" class="p-2 text-slate-600 hover:text-[#1D5083] hover:bg-white rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.582m-15.356-2A8.001 8.001 0 0019.418 15m0 0H15"></path></svg>
        </button>
        <button title="Fullscreen" class="p-2 text-slate-600 hover:text-[#1D5083] hover:bg-white rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1h4m0 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
        </button>
        <div class="w-px h-5 bg-slate-300 mx-1"></div>
        <button title="Download" class="p-2 text-slate-600 hover:text-[#1D5083] hover:bg-white rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
        </button>
    </div>
</div>
