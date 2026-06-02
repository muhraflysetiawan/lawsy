@php
    $items = $items ?? [
        ['label' => 'Document Visible', 'checked' => true],
        ['label' => 'Text Readable', 'checked' => false],
        ['label' => 'Face Clearly Visible', 'checked' => true],
        ['label' => 'No Cropped Areas', 'checked' => true],
        ['label' => 'Valid Expiration Date', 'checked' => true],
    ];
@endphp

<div class="flex flex-col gap-3">
    @foreach($items as $item)
    <label class="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
        <div class="flex items-center gap-3">
            <input type="checkbox" class="w-4 h-4 text-[#1D5083] rounded focus:ring-[#1D5083]/20 border-slate-300" {{ $item['checked'] ? 'checked' : '' }}>
            <span class="text-sm font-medium text-slate-700">{{ $item['label'] }}</span>
        </div>
        @if($item['checked'])
            <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        @else
            <svg class="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        @endif
    </label>
    @endforeach
</div>
