@php
    $status = $status ?? 'Action Taken';
    $description = $description ?? 'Description of the action.';
    $date = $date ?? 'Just now';
    $color = $color ?? 'bg-slate-400';
@endphp

<div class="relative mb-6 last:mb-0">
    <!-- Dot -->
    <div class="absolute -left-[22px] top-1.5 w-4 h-4 rounded-full border-4 border-white {{ $color }} shadow-sm"></div>
    <div>
        <div class="flex items-center gap-2 mb-0.5">
            <h4 class="text-sm font-semibold text-slate-800">{{ $status }}</h4>
            <span class="text-xs text-slate-400">{{ $date }}</span>
        </div>
        <p class="text-sm text-slate-500 leading-relaxed">
            {{ $description }}
        </p>
    </div>
</div>
