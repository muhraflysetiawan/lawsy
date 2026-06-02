@php
    $ocrScore = $ocrScore ?? 98;
    $blurLevel = $blurLevel ?? 'Low';
    $authScore = $authScore ?? 'High';
@endphp

<div class="flex flex-col gap-4">
    <!-- OCR Score -->
    <div>
        <div class="flex justify-between items-center mb-1.5">
            <span class="text-sm font-medium text-slate-600">OCR Confidence</span>
            <span class="text-sm font-bold text-emerald-600">{{ $ocrScore }}%</span>
        </div>
        <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full" style="width: {{ $ocrScore }}%"></div>
        </div>
    </div>
    
    <!-- Blur Score -->
    <div>
        <div class="flex justify-between items-center mb-1.5">
            <span class="text-sm font-medium text-slate-600">Blur Detection</span>
            <span class="text-sm font-bold {{ $blurLevel === 'Low' ? 'text-emerald-600' : 'text-amber-500' }}">{{ $blurLevel }}</span>
        </div>
        <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full {{ $blurLevel === 'Low' ? 'bg-emerald-500' : 'bg-amber-400' }} rounded-full" style="width: {{ $blurLevel === 'Low' ? '90%' : '60%' }}"></div>
        </div>
    </div>

    <!-- Authenticity Score -->
    <div>
        <div class="flex justify-between items-center mb-1.5">
            <span class="text-sm font-medium text-slate-600">Authenticity Score</span>
            <span class="text-sm font-bold text-emerald-600">{{ $authScore }}</span>
        </div>
        <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full" style="width: {{ $authScore === 'High' ? '95%' : '70%' }}"></div>
        </div>
    </div>
</div>
