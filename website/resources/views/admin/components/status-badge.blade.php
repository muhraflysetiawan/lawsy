@php
    $color = $color ?? 'blue';
    $status = $status ?? 'Under Review';
    
    $styles = [
        'blue' => ['bg' => 'bg-blue-50', 'text' => 'text-blue-700', 'border' => 'border-blue-100', 'dot' => 'bg-blue-500'],
        'amber' => ['bg' => 'bg-amber-50', 'text' => 'text-amber-700', 'border' => 'border-amber-100', 'dot' => 'bg-amber-500'],
        'emerald' => ['bg' => 'bg-emerald-50', 'text' => 'text-emerald-700', 'border' => 'border-emerald-100', 'dot' => 'bg-emerald-500'],
        'red' => ['bg' => 'bg-red-50', 'text' => 'text-red-700', 'border' => 'border-red-100', 'dot' => 'bg-red-500'],
        'slate' => ['bg' => 'bg-slate-50', 'text' => 'text-slate-600', 'border' => 'border-slate-100', 'dot' => 'bg-slate-400'],
    ];
    
    $style = $styles[$color] ?? $styles['blue'];
@endphp

<span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold {{ $style['bg'] }} {{ $style['text'] }} border {{ $style['border'] }} shadow-sm">
    <span class="w-1.5 h-1.5 {{ $style['dot'] }} rounded-full mr-1.5"></span>
    {{ $status }}
</span>
