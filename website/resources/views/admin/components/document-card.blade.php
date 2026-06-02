@php
    $type = $type ?? 'Document Type';
    $status = $status ?? 'Pending';
    $statusColor = $statusColor ?? 'bg-slate-100 text-slate-600';
    $icon = $icon ?? 'document';
    $updatedAt = $updatedAt ?? 'N/A';
    $active = $active ?? false;
@endphp

<div class="p-4 rounded-xl border {{ $active ? 'border-blue-200 bg-blue-50/50' : 'border-slate-100 bg-white' }} hover:border-blue-100 hover:bg-slate-50 transition-all duration-200 cursor-pointer flex items-center justify-between group">
    <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-[#1D5083] transition-colors">
            @if($icon === 'card')
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            @elseif($icon === 'license')
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            @elseif($icon === 'degree')
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg>
            @else
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            @endif
        </div>
        <div>
            <h4 class="text-sm font-semibold text-slate-800">{{ $type }}</h4>
            <span class="text-xs text-slate-500">Updated: {{ $updatedAt }}</span>
        </div>
    </div>
    <div class="flex items-center gap-2">
        <span class="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold {{ $statusColor }}">
            {{ $status }}
        </span>
        <button class="text-slate-400 hover:text-[#1D5083] transition-colors p-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
    </div>
</div>
