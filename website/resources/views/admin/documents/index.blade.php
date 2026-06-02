@php
    // The $articles variable is now passed from ArticleController
@endphp

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Documents & Legal Publications - Lawsy</title>
    
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    
    <style>
        body { font-family: 'Poppins', sans-serif; background-color: #F8FAFC; }
        .font-serif { font-family: 'Poppins', sans-serif; }
    </style>
</head>
<body class="flex h-screen bg-[#F8FAFC] overflow-hidden text-[#1A1A1A]">

    <!-- Global Custom Modal System -->
    <div id="global-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 999999; display: none; align-items: center; justify-content: center; background: rgba(14, 58, 104, 0.4); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); transition: all 0.3s ease;">
        <div id="modal-container" style="background: white; border-radius: 32px; box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.4); width: 440px; padding: 48px; text-align: center; transform: scale(0.9); opacity: 0; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); border: 1px solid rgba(255,255,255,0.4); position: relative;">
            
            <!-- Close Icon -->
            <button onclick="closeModal()" style="position: absolute; top: 24px; right: 24px; color: #8B95A5; cursor: pointer; border: none; background: none; padding: 8px; border-radius: 12px; transition: all 0.2s;" onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background='none'">
                <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <!-- Icon Header -->
            <div id="modal-icon-container" style="width: 88px; height: 88px; border-radius: 30px; display: flex; align-items: center; justify-content: center; margin: 0 auto 32px; shadow: inner;">
                <div id="modal-icon"></div>
            </div>

            <!-- Content -->
            <h2 id="modal-title" style="font-family: 'Poppins', serif; font-size: 26px; font-weight: 800; color: #1A1A1A; margin-bottom: 12px; tracking: -0.02em;"></h2>
            <p id="modal-desc" style="color: #6B7280; font-size: 15px; line-height: 1.65; margin-bottom: 40px; font-medium;"></p>
            
            <!-- Actions -->
            <div id="modal-actions" style="display: flex; flex-direction: column; gap: 12px;">
                <button id="modal-primary-btn" style="width: 100%; padding: 18px; font-weight: 700; border-radius: 20px; border: none; cursor: pointer; transition: all 0.2s ease; font-size: 15px; shadow: 0 10px 20px -5px;"></button>
                <button id="modal-secondary-btn" onclick="closeModal()" style="width: 100%; padding: 18px; background: transparent; color: #8B95A5; font-weight: 700; border-radius: 20px; border: 1px solid #E2E8F0; cursor: pointer; transition: all 0.2s ease; font-size: 15px;">Cancel</button>
            </div>
        </div>
    </div>

    @include('admin.components.sidebar')

    <!-- Main Content -->
    <div class="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        <!-- Header -->
        <header class="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between shrink-0">
            <!-- Left: Title -->
            <div class="flex items-center gap-4">
                <h1 class="text-xl font-bold text-[#1A1A1A]">Documents & Legal Publications</h1>
            </div>

            <!-- Profile -->
            <div class="flex items-center gap-6">
                <!-- User Profile -->
                <div class="flex items-center gap-3">
                    <div class="text-right">
                        <p class="text-[10px] font-bold text-[#8B95A5] uppercase tracking-wider">Admin Panel</p>
                        <p class="text-sm font-bold text-[#1A1A1A]">{{ Auth::user()->name }}</p>
                    </div>
                    <div class="w-10 h-10 bg-[#EBF3FA] rounded-full flex items-center justify-center text-[#1D5083] font-bold border border-[#D1E2F2] overflow-hidden">
                        @if(Auth::user()->avatar)
                            <img src="{{ asset('storage/' . Auth::user()->avatar) }}" class="w-full h-full object-cover">
                        @else
                            {{ strtoupper(substr(Auth::user()->name, 0, 1)) }}
                        @endif
                    </div>
                </div>
            </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto p-10 flex flex-col gap-8">
            
            <!-- Header Section -->
            <div class="flex justify-between items-start shrink-0">
                <div class="max-w-2xl">
                    <p class="text-[15px] text-[#6B7280] font-normal leading-relaxed">
                        Manage legal articles, internal directives, compliance publications, and draft content.
                    </p>
                </div>
                <div class="flex gap-4 pt-2">
                    <button class="px-5 py-2.5 bg-white border border-[#E2E8F0] text-[#1A1A1A] text-sm font-semibold rounded-xl hover:bg-[#F8FAFC] shadow-sm transition-colors">
                        Manage Categories
                    </button>
                    <a href="{{ route('admin.documents.upload') }}" class="px-5 py-2.5 bg-[#1D5083] text-white text-sm font-semibold rounded-xl hover:bg-[#153c63] shadow-sm flex items-center gap-2 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        Upload Article
                    </a>
                </div>
            </div>

            <!-- Internal Navigation Tabs -->
            <div class="flex gap-4 shrink-0">
                <a href="{{ route('admin.documents.upload') }}" class="px-6 py-2.5 bg-white text-[#6B7280] border border-[#E2E8F0] text-sm font-medium rounded-full hover:bg-gray-50 transition-all duration-200">Upload Article</a>
                <a href="{{ route('admin.documents.index') }}" class="px-6 py-2.5 bg-[#1D5083] text-white text-sm font-medium rounded-full shadow-md shadow-[#1D5083]/20 transition-all duration-200">View Posts</a>
                <a href="{{ route('admin.documents.drafts') }}" class="px-6 py-2.5 bg-white text-[#6B7280] border border-[#E2E8F0] text-sm font-medium rounded-full hover:bg-gray-50 transition-all duration-200">View Drafts</a>
            </div>

            <!-- Search & Filter Toolbar -->
            <div class="bg-white rounded-2xl border border-[#E2E8F0] p-3 flex gap-4 items-center shrink-0 shadow-sm">
                <!-- Search Input -->
                <div class="relative flex-1">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8B95A5]">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input type="text" placeholder="Search documents..." class="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8B95A5] focus:outline-none focus:ring-2 focus:ring-[#1D5083]/20 focus:border-[#1D5083] transition-all">
                </div>
                
                <!-- Filters -->
                <div class="flex gap-3">
                    <button class="px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] text-[#1A1A1A] text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2">
                        All Categories
                        <svg class="w-4 h-4 text-[#8B95A5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <button class="px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] text-[#1A1A1A] text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2">
                        Any Status
                        <svg class="w-4 h-4 text-[#8B95A5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <button class="px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] text-[#1A1A1A] text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2">
                        Newest First
                        <svg class="w-4 h-4 text-[#8B95A5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                </div>
            </div>

            <!-- Posts List -->
            <div class="flex flex-col gap-6 shrink-0">
                @forelse($articles as $article)
                <div class="bg-white rounded-3xl border border-[#E2E8F0] p-6 hover:shadow-lg hover:shadow-[#102A43]/5 transition-all duration-300 flex items-center gap-8">
                    
                    <!-- Left Thumbnail -->
                    <div class="relative w-[320px] h-[190px] rounded-2xl overflow-hidden shrink-0 shadow-inner">
                        @if($article->image_path)
                            <img src="{{ \Illuminate\Support\Str::startsWith($article->image_path, ['http://', 'https://']) ? $article->image_path : asset('storage/' . $article->image_path) }}" alt="Thumbnail" class="w-full h-full object-cover">
                        @else
                            <div class="w-full h-full bg-[#315783] flex items-center justify-center">
                                <svg class="w-16 h-16 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m-14 0V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                            </div>
                        @endif
                        
                        <!-- Status Badge overlay on image -->
                        <div class="absolute top-4 left-4">
                            <span class="bg-white/95 backdrop-blur-sm text-[#1D5083] text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm">{{ ucfirst($article->status) }}</span>
                        </div>
                    </div>

                    <!-- Center Content -->
                    <div class="flex-1 flex flex-col justify-center">
                        <span class="bg-[#EBF4FF] text-[#2563EB] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider w-max mb-3">{{ $article->category }}</span>
                        
                        <h2 class="font-serif text-2xl font-bold text-[#1A1A1A] mb-2 leading-tight">{{ $article->title }}</h2>
                        
                        <p class="text-[14px] text-[#6B7280] leading-relaxed mb-6 max-w-2xl line-clamp-2">
                            {{ Str::limit(strip_tags($article->content), 150) }}
                        </p>
                        
                        <div class="flex items-center gap-6 text-[#8B95A5] text-[13px] font-medium">
                            <div class="flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
                                {{ $article->created_at->format('M d, Y') }}
                            </div>
                            <div class="flex items-center gap-2 text-[#6B7280]">
                                <div class="w-6 h-6 rounded-full bg-[#1D5083] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                    {{ substr($article->admin_name, 0, 1) }}
                                </div>
                                {{ $article->admin_name }}
                            </div>
                            <div class="flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                {{ number_format($article->views) }} Views
                            </div>
                        </div>
                    </div>

                    <!-- Right Actions -->
                    <div class="flex flex-col gap-3 shrink-0 ml-4">
                        <button class="w-[110px] py-2.5 bg-white border border-[#E2E8F0] text-[#1D5083] text-sm font-bold rounded-xl hover:bg-[#F8FAFC] transition-colors flex items-center justify-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            Edit
                        </button>
                        <button onclick="confirmDelete('{{ $article->id }}', '{{ addslashes($article->title) }}')" class="w-[110px] py-2.5 bg-white border border-[#FCA5A5] text-[#EF4444] text-sm font-bold rounded-xl hover:bg-[#FEF2F2] transition-colors flex items-center justify-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            Delete
                        </button>
                    </div>
                </div>
                @empty
                <div class="py-20 text-center bg-white rounded-3xl border border-dashed border-[#E2E8F0]">
                    <p class="text-[#6B7280]">No articles published yet.</p>
                </div>
                @endforelse
            </div>

            <!-- Pagination -->
            <div class="flex items-center justify-between pt-10 border-t border-[#E2E8F0]">
                <div class="text-[13px] text-[#8B95A5] font-medium">
                    @if($articles->total() > 0)
                        Showing <span class="text-[#1A1A1A] font-bold">{{ $articles->firstItem() }}-{{ $articles->lastItem() }}</span> of <span class="text-[#1A1A1A] font-bold">{{ $articles->total() }}</span> articles
                    @else
                        Showing <span class="text-[#1A1A1A] font-bold">0</span> articles
                    @endif
                </div>
                <div class="flex items-center gap-2">
                    @if($articles->onFirstPage())
                        <span class="px-4 py-2 text-[#8B95A5] text-sm font-bold cursor-not-allowed">Previous</span>
                    @else
                        <a href="{{ $articles->previousPageUrl() }}" class="px-4 py-2 text-[#1D5083] text-sm font-bold hover:text-[#0E3A68] transition-colors">Previous</a>
                    @endif

                    <div class="flex items-center gap-1 mx-2">
                        @foreach ($articles->getUrlRange(1, $articles->lastPage()) as $page => $url)
                            @if ($page == $articles->currentPage())
                                <span class="w-10 h-10 flex items-center justify-center bg-[#1D5083] text-white text-sm font-bold rounded-xl shadow-md">{{ $page }}</span>
                            @else
                                <a href="{{ $url }}" class="w-10 h-10 flex items-center justify-center bg-white border border-[#E2E8F0] text-[#6B7280] text-sm font-bold rounded-xl hover:bg-[#F8FAFC] transition-colors">{{ $page }}</a>
                            @endif
                        @endforeach
                    </div>

                    @if($articles->hasMorePages())
                        <a href="{{ $articles->nextPageUrl() }}" class="px-4 py-2 text-[#1D5083] text-sm font-bold hover:text-[#0E3A68] transition-colors">Next</a>
                    @else
                        <span class="px-4 py-2 text-[#8B95A5] text-sm font-bold cursor-not-allowed">Next</span>
                    @endif
                </div>
            </div>
            
            <!-- Spacer to ensure bottom padding is respected when scrolling -->
            <div class="shrink-0 h-4"></div>
        </main>
    </div>
    <script>
        function showModal(options) {
            const modal = document.getElementById('global-modal');
            const container = document.getElementById('modal-container');
            const titleEl = document.getElementById('modal-title');
            const descEl = document.getElementById('modal-desc');
            const iconContainer = document.getElementById('modal-icon-container');
            const iconEl = document.getElementById('modal-icon');
            const primaryBtn = document.getElementById('modal-primary-btn');
            const secondaryBtn = document.getElementById('modal-secondary-btn');

            // Setup Theme
            if (options.type === 'danger') {
                iconContainer.style.background = '#FEF2F2';
                iconEl.innerHTML = `<svg style="width: 44px; height: 44px; color: #EF4444;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;
                primaryBtn.style.background = '#EF4444';
                primaryBtn.style.color = 'white';
                primaryBtn.style.boxShadow = '0 10px 25px -5px rgba(239, 68, 68, 0.4)';
            } else {
                iconContainer.style.background = '#F0F7FF';
                iconEl.innerHTML = `<svg style="width: 44px; height: 44px; color: #1D5083;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
                primaryBtn.style.background = '#1D5083';
                primaryBtn.style.color = 'white';
                primaryBtn.style.boxShadow = '0 10px 25px -5px rgba(29, 80, 131, 0.4)';
            }

            titleEl.innerText = options.title;
            descEl.innerHTML = options.message;
            primaryBtn.innerText = options.confirmText || 'Understand';
            
            primaryBtn.onclick = function() {
                if (options.onConfirm) options.onConfirm();
                closeModal();
            };

            secondaryBtn.style.display = options.showCancel ? 'block' : 'none';

            modal.style.display = 'flex';
            setTimeout(() => {
                container.style.transform = 'scale(1)';
                container.style.opacity = '1';
            }, 10);
        }

        function closeModal() {
            const modal = document.getElementById('global-modal');
            const container = document.getElementById('modal-container');
            
            container.style.transform = 'scale(0.9)';
            container.style.opacity = '0';
            
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }

        function confirmDelete(id, title) {
            showModal({
                type: 'danger',
                title: 'Delete Article?',
                message: `Are you sure you want to delete the article: <br><span style="font-weight: 700; color: #1A1A1A;">'${title}'</span>?<br><br>This action is permanent and cannot be undone.`,
                confirmText: 'Delete Permanently',
                showCancel: true,
                onConfirm: () => {
                    fetch(`/admin/articles/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRF-TOKEN': '{{ csrf_token() }}',
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            location.reload();
                        } else {
                            alert('Error: ' + data.message);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Something went wrong.');
                    });
                }
            });
        }
    </script>
</body>
</html>
