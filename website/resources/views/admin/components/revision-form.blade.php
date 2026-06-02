@php
    $categories = $categories ?? [
        'Blurry Document',
        'Cropped Image',
        'Invalid Document',
        'Expired Document',
        'Incomplete Information',
        'Wrong File Upload'
    ];
@endphp

<div id="revision-form" class="hidden mt-2 p-4 bg-amber-50 rounded-xl border border-amber-100 flex flex-col gap-4">
    <div>
        <label class="text-xs font-semibold text-amber-700 block mb-1">Issue Category</label>
        <select class="w-full p-2.5 bg-white border border-amber-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all">
            <option>Select issue category...</option>
            @foreach($categories as $category)
                <option {{ $category === 'Blurry Document' ? 'selected' : '' }}>{{ $category }}</option>
            @endforeach
        </select>
    </div>
    
    <div>
        <label class="text-xs font-semibold text-amber-700 block mb-1">Revision Note to Lawyer</label>
        <textarea rows="4" class="w-full p-3 bg-white border border-amber-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none" placeholder="The uploaded KTP image is blurry and the text is unreadable. Please upload a clearer image with better lighting."></textarea>
    </div>

    <div class="flex gap-2">
        <button class="flex-1 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors">
            Send Request
        </button>
        <button onclick="document.getElementById('revision-form').classList.add('hidden')" class="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors">
            Cancel
        </button>
    </div>
</div>
