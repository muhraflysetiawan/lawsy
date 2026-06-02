<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Upload Article - Lawsy</title>
    
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
            
            <!-- Header Section (Shared) -->
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
                <a href="{{ route('admin.documents.upload') }}" class="px-6 py-2.5 bg-[#1D5083] text-white text-sm font-medium rounded-full shadow-md shadow-[#1D5083]/20 transition-all duration-200">Upload Article</a>
                <a href="{{ route('admin.documents.index') }}" class="px-6 py-2.5 bg-white text-[#6B7280] border border-[#E2E8F0] text-sm font-medium rounded-full hover:bg-gray-50 transition-all duration-200">View Posts</a>
                <a href="{{ route('admin.documents.drafts') }}" class="px-6 py-2.5 bg-white text-[#6B7280] border border-[#E2E8F0] text-sm font-medium rounded-full hover:bg-gray-50 transition-all duration-200">View Drafts</a>
            </div>

            <!-- Specific Upload Page Breadcrumb & Title -->
            <div class="flex flex-col gap-2 shrink-0 mt-2">
                <div class="flex items-center gap-2 text-[10px] font-bold text-[#8B95A5] uppercase tracking-wider">
                    <span>Documents</span>
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    <span>Articles</span>
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    <span class="text-[#1D5083]">Upload Article</span>
                </div>
                <h2 class="font-serif text-[32px] font-bold text-[#1A1A1A]">Upload New Legal Article</h2>
            </div>

            <!-- 2-Column Layout -->
            <div class="flex gap-6 shrink-0 items-start">
                
                <!-- Left Column (Main Form) -->
                <div class="flex-1 flex flex-col gap-6">
                    
                    <!-- Core Metadata Card -->
                    <div class="bg-white rounded-[20px] p-8 border border-[#E2E8F0] shadow-sm">
                        <h3 class="font-serif text-xl font-bold text-[#1A1A1A] mb-8">Core Metadata</h3>
                        
                        <div class="flex flex-col gap-6">
                            <!-- Article Title -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Article Title</label>
                                <input type="text" id="article-title" placeholder="Enter legal article title..." class="w-full px-4 py-3.5 bg-[#F8FAFC] border-none rounded-xl text-[15px] text-[#1A1A1A] placeholder-[#8B95A5] focus:outline-none focus:ring-2 focus:ring-[#1D5083]/20 transition-all">
                            </div>

                            <div class="grid grid-cols-2 gap-6">
                                <!-- Category -->
                                <div class="flex flex-col gap-2">
                                    <label class="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Category</label>
                                    <div class="relative">
                                        <select id="article-category" class="w-full px-4 py-3.5 bg-[#F8FAFC] border-none rounded-xl text-[15px] text-[#1A1A1A] appearance-none focus:outline-none focus:ring-2 focus:ring-[#1D5083]/20 transition-all cursor-pointer">
                                            <option value="" disabled selected>Select category...</option>
                                            <option value="Regulation">Regulation</option>
                                            <option value="Compliance">Compliance</option>
                                            <option value="Reform">Reform</option>
                                        </select>
                                        <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#8B95A5]">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Admin Assignment -->
                                <div class="flex flex-col gap-2">
                                    <label class="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Responsible Admin</label>
                                    <div class="relative">
                                        <select id="article-admin" class="w-full px-4 py-3.5 bg-[#F8FAFC] border-none rounded-xl text-[15px] text-[#1A1A1A] appearance-none focus:outline-none focus:ring-2 focus:ring-[#1D5083]/20 transition-all cursor-pointer">
                                            <option value="" disabled selected>Assign an admin...</option>
                                            @foreach($admins as $admin)
                                                <option value="{{ $admin->name }}">{{ $admin->name }}</option>
                                            @endforeach
                                        </select>
                                        <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#8B95A5]">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Executive Summary -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Executive Summary</label>
                                <textarea rows="4" placeholder="Brief summary for indexing and previews..." class="w-full px-4 py-3.5 bg-[#F8FAFC] border-none rounded-xl text-[15px] text-[#1A1A1A] placeholder-[#8B95A5] focus:outline-none focus:ring-2 focus:ring-[#1D5083]/20 transition-all resize-none"></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Rich Text Editor Card -->
                    <div class="bg-white rounded-[20px] p-6 border border-[#E2E8F0] shadow-sm flex flex-col h-[500px]">
                        <!-- Toolbar -->
                        <div class="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-4">
                            <div class="flex items-center gap-4">
                                <div class="flex items-center gap-3 text-[#1A1A1A]">
                                    <button class="font-serif font-bold w-6 h-6 flex items-center justify-center hover:text-[#1D5083] hover:bg-gray-50 rounded transition-colors">B</button>
                                    <button class="font-serif italic w-6 h-6 flex items-center justify-center hover:text-[#1D5083] hover:bg-gray-50 rounded transition-colors">I</button>
                                    <button class="font-serif underline w-6 h-6 flex items-center justify-center hover:text-[#1D5083] hover:bg-gray-50 rounded transition-colors">U</button>
                                </div>
                                <div class="w-px h-5 bg-[#E2E8F0]"></div>
                                <div class="flex items-center gap-3 text-[#6B7280]">
                                    <button class="text-xs font-bold hover:text-[#1D5083] transition-colors">H1</button>
                                    <button class="text-xs font-bold hover:text-[#1D5083] transition-colors">H2</button>
                                </div>
                                <div class="w-px h-5 bg-[#E2E8F0]"></div>
                                <div class="flex items-center gap-3 text-[#6B7280]">
                                    <button class="hover:text-[#1D5083] transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></button>
                                    <button class="hover:text-[#1D5083] transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16"></path></svg></button>
                                </div>
                                <div class="w-px h-5 bg-[#E2E8F0]"></div>
                                <div class="flex items-center gap-3 text-[#6B7280]">
                                    <button class="hover:text-[#1D5083] transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg></button>
                                    <button class="font-serif font-bold text-lg hover:text-[#1D5083] transition-colors leading-none">"</button>
                                </div>
                            </div>
                            <div class="flex items-center gap-3 text-xs font-medium text-[#8B95A5]">
                                <span>Words: 0</span>
                                <span class="flex items-center gap-1 text-[#3B82F6]">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
                                    Saved
                                </span>
                            </div>
                        </div>
                        <!-- Editor Area -->
                        <div class="flex-1">
                            <textarea id="article-content" class="w-full h-full resize-none border-none focus:outline-none text-[15px] text-[#1A1A1A] placeholder-[#D1D5DB] font-light leading-relaxed" placeholder="Begin writing legal article content here..."></textarea>
                        </div>
                    </div>
                </div>

                <!-- Right Sidebar -->
                <div class="w-[340px] flex flex-col gap-6 shrink-0">
                    
                    <!-- Status Card -->
                    <div class="bg-white rounded-[20px] p-6 border border-[#E2E8F0] shadow-sm flex items-center justify-between">
                        <div class="flex flex-col gap-1">
                            <span class="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Status</span>
                            <div class="flex items-center gap-2 text-[#1A1A1A] font-bold text-sm">
                                <span class="w-2 h-2 rounded-full bg-[#8B95A5]"></span>
                                Draft
                            </div>
                        </div>
                        <div class="flex flex-col gap-1 text-right">
                            <span class="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Last Modified</span>
                            <span class="text-sm font-medium text-[#1A1A1A]">Just now</span>
                        </div>
                    </div>

                    <!-- Featured Image -->
                    <div class="bg-white rounded-[20px] p-6 border border-[#E2E8F0] shadow-sm flex flex-col gap-4">
                        <h3 class="font-serif text-[17px] font-bold text-[#1A1A1A]">Featured Image</h3>
                        <input type="file" id="image-input" class="hidden" accept="image/*">
                        <button onclick="document.getElementById('image-input').click()" id="image-preview-btn" class="w-full h-[140px] rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] flex flex-col items-center justify-center gap-2 hover:border-[#1D5083] hover:bg-blue-50/50 transition-all group overflow-hidden">
                            <div id="image-placeholder" class="flex flex-col items-center gap-2">
                                <div class="w-8 h-8 rounded-lg bg-white shadow-sm border border-[#E2E8F0] flex items-center justify-center text-[#8B95A5] group-hover:text-[#1D5083] transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                </div>
                                <div class="text-center">
                                    <p class="text-sm font-bold text-[#1A1A1A]">Click or drag image here</p>
                                    <p class="text-[11px] text-[#8B95A5] mt-1">16:9 ratio recommended. Max 5MB.</p>
                                </div>
                            </div>
                            <img id="image-display" class="hidden w-full h-full object-cover">
                        </button>
                    </div>

                    <!-- SEO & Taxonomy -->
                    <div class="bg-white rounded-[20px] p-6 border border-[#E2E8F0] shadow-sm flex flex-col gap-5">
                        <h3 class="font-serif text-[17px] font-bold text-[#1A1A1A]">SEO & Taxonomy</h3>
                        
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Focus Keyword</label>
                            <input type="text" placeholder="e.g., AI Regulations" class="w-full px-3 py-2.5 bg-[#F8FAFC] border border-[#F8FAFC] focus:bg-white rounded-xl text-[13px] text-[#1A1A1A] placeholder-[#8B95A5] focus:outline-none focus:border-[#1D5083] transition-all">
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">URL Slug</label>
                            <div class="flex items-center bg-[#F8FAFC] rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-[#1D5083] focus-within:bg-white transition-all">
                                <span class="pl-3 py-2.5 text-[13px] text-[#8B95A5]">/article/</span>
                                <input type="text" placeholder="article-title" class="flex-1 px-2 py-2.5 bg-transparent border-none text-[13px] text-[#1A1A1A] placeholder-[#8B95A5] focus:outline-none">
                            </div>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Tags</label>
                            <div class="flex flex-wrap gap-2 mb-2">
                                <span class="flex items-center gap-1.5 px-2.5 py-1 bg-[#F1F5F9] text-[#475569] text-[11px] font-bold rounded-lg border border-[#E2E8F0]">
                                    EU AI Act
                                    <button class="hover:text-red-500"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                                </span>
                                <span class="flex items-center gap-1.5 px-2.5 py-1 bg-[#F1F5F9] text-[#475569] text-[11px] font-bold rounded-lg border border-[#E2E8F0]">
                                    Regulation
                                    <button class="hover:text-red-500"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                                </span>
                            </div>
                            <input type="text" placeholder="Add tag and press enter..." class="w-full px-3 py-2.5 bg-[#F8FAFC] border border-[#F8FAFC] focus:bg-white rounded-xl text-[13px] text-[#1A1A1A] placeholder-[#8B95A5] focus:outline-none focus:border-[#1D5083] transition-all">
                        </div>
                    </div>

                    <!-- Draft Actions -->
                    <div class="bg-white rounded-[20px] p-6 border border-[#E2E8F0] shadow-sm flex flex-col gap-3">
                        <button onclick="validateArticle('draft')" class="w-full py-3 bg-white border border-[#1D5083] text-[#1D5083] text-sm font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-sm">
                            Save as Draft
                        </button>
                        <button onclick="validateArticle('published')" class="w-full py-3 bg-[#1D5083] text-white text-sm font-bold rounded-xl hover:bg-[#153c63] transition-colors shadow-sm">
                            Publish Article
                        </button>
                    </div>

                    <!-- Danger Zone -->
                    <div class="bg-white rounded-[20px] p-6 border border-[#FCA5A5] bg-[#FEF2F2]/30 shadow-sm flex flex-col gap-3">
                        <h3 class="font-serif text-[17px] font-bold text-[#EF4444]">Danger Zone</h3>
                        <p class="text-[11px] text-[#6B7280] leading-relaxed mb-1">
                            This action cannot be undone. This will permanently delete the draft.
                        </p>
                        <button onclick="confirmDeleteDraft()" class="w-full py-2.5 bg-[#FEF2F2] border border-[#FCA5A5] text-[#EF4444] text-sm font-bold rounded-xl hover:bg-red-100 transition-colors">
                            Delete Draft
                        </button>
                    </div>

                </div>
            </div>

            <!-- Spacer -->
            <div class="shrink-0 h-4"></div>
        </main>
    </div>


    <script>
        // Image Preview Handler
        const imageInput = document.getElementById('image-input');
        const imagePlaceholder = document.getElementById('image-placeholder');
        const imageDisplay = document.getElementById('image-display');

        imageInput.onchange = function(evt) {
            const [file] = imageInput.files;
            if (file) {
                imageDisplay.src = URL.createObjectURL(file);
                imageDisplay.classList.remove('hidden');
                imagePlaceholder.classList.add('hidden');
            }
        }

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
            } else if (options.type === 'success') {
                iconContainer.style.background = '#ECFDF5';
                iconEl.innerHTML = `<svg style="width: 44px; height: 44px; color: #10B981;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
                primaryBtn.style.background = '#10B981';
                primaryBtn.style.color = 'white';
                primaryBtn.style.boxShadow = '0 10px 25px -5px rgba(16, 185, 129, 0.4)';
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

        function validateArticle(status = 'published') {
            const title = document.getElementById('article-title').value.trim();
            const category = document.getElementById('article-category').value;
            const admin = document.getElementById('article-admin').value;
            const content = document.getElementById('article-content').value.trim();
            const imageFile = imageInput.files[0];

            let missing = [];
            if (!title) missing.push("Article Title");
            if (!category) missing.push("Category");
            if (!admin) missing.push("Responsible Admin");
            if (!content) missing.push("Article Content");
            if (status === 'published' && !imageFile) missing.push("Featured Image");

            if (missing.length > 0) {
                showModal({
                    type: 'warning',
                    title: 'Wait a Minute!',
                    message: `The following field(s) are missing: <br><span style="font-weight: 700; color: #1D5083;">${missing.join(', ')}</span>. <br>Please complete them to proceed.`,
                    confirmText: 'Got it, I\'ll fix it'
                });
                return;
            }

            // Prepare Data
            const formData = new FormData();
            formData.append('title', title);
            formData.append('category', category);
            formData.append('admin_name', admin);
            formData.append('content', content);
            if (imageFile) formData.append('image', imageFile);
            formData.append('status', status);
            formData.append('_token', '{{ csrf_token() }}');

            // Show loading
            const primaryBtn = document.querySelector(`button[onclick="validateArticle('${status}')"]`);
            const originalText = primaryBtn.innerText;
            primaryBtn.disabled = true;
            primaryBtn.innerText = status === 'published' ? 'Publishing...' : 'Saving...';

            fetch('{{ route("admin.articles.store") }}', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showModal({
                        type: 'success',
                        title: 'Success!',
                        message: data.message,
                        confirmText: 'Continue',
                        onConfirm: () => {
                            window.location.href = data.redirect;
                        }
                    });
                } else {
                    alert('Error: ' + data.message);
                    primaryBtn.disabled = false;
                    primaryBtn.innerText = originalText;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Something went wrong. Please try again.');
                primaryBtn.disabled = false;
                primaryBtn.innerText = originalText;
            });
        }

        function confirmDeleteDraft() {
            showModal({
                type: 'danger',
                title: 'Delete Draft?',
                message: 'Are you sure you want to delete this draft? This action is permanent and cannot be undone.',
                confirmText: 'Delete Permanently',
                showCancel: true,
                onConfirm: () => {
                    // Logic would go here
                    alert("Draft deleted successfully.");
                    window.location.href = "{{ route('admin.documents.index') }}";
                }
            });
        }
    </script>
    </script>
</body>
</html>
