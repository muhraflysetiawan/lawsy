<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Settings - Lawsy</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Poppins', sans-serif; background-color: #F8FAFC; }
        .font-serif { font-family: 'Poppins', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .anim-up { animation: fadeUp 0.5s ease-out forwards; opacity:0; }
        @keyframes toastIn { from { opacity:0; transform:translateX(100px); } to { opacity:1; transform:translateX(0); } }
    </style>
</head>
<body class="flex h-screen bg-[#F8FAFC] overflow-hidden text-[#1A1A1A]">
    @include('admin.components.sidebar')

    <div class="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <header class="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between shrink-0">
            <!-- Left: Title -->
            <div class="flex items-center gap-4">
                <h1 class="text-xl font-bold text-[#1A1A1A]">Settings</h1>
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

        <main class="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
            <div class="shrink-0">
                <p class="text-[15px] text-[#6B7280]">Manage your account, security, and system preferences.</p>
            </div>

            <div class="flex gap-3 shrink-0" id="settings-tabs">
                <button onclick="showSection('profile',this)" class="stab active-stab px-5 py-2.5 bg-[#1D5083] text-white text-sm font-medium rounded-full shadow-md transition-all">Profile</button>
                <button onclick="showSection('security',this)" class="stab px-5 py-2.5 bg-white text-[#6B7280] border border-[#E2E8F0] text-sm font-medium rounded-full hover:bg-gray-50 transition-all">Security</button>
                <button onclick="showSection('notifications-pref',this)" class="stab px-5 py-2.5 bg-white text-[#6B7280] border border-[#E2E8F0] text-sm font-medium rounded-full hover:bg-gray-50 transition-all">Notifications</button>
                <button onclick="showSection('appearance',this)" class="stab px-5 py-2.5 bg-white text-[#6B7280] border border-[#E2E8F0] text-sm font-medium rounded-full hover:bg-gray-50 transition-all">Appearance</button>
            </div>

            <!-- Profile Section -->
            <div id="sec-profile" class="settings-section flex flex-col gap-6">
                <div class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8 anim-up">
                    <h2 class="font-serif text-xl font-bold text-[#1A1A1A] mb-6">Profile Information</h2>
                    <div class="flex items-start gap-8 mb-8">
                        <div id="avatar-display" style="width: 80px; height: 80px; min-width: 80px; min-height: 80px; aspect-ratio: 1 / 1; background-color: #EBF3FA;" class="rounded-full flex items-center justify-center text-[#1D5083] font-bold text-3xl shrink-0 overflow-hidden cursor-pointer hover:ring-8 hover:ring-[#1D5083]/10 transition-all border-4 border-white shadow-sm" onclick="document.getElementById('avatar-upload').click()">
                            @if(Auth::user()->avatar)
                                <img src="{{ asset('storage/' . Auth::user()->avatar) }}" class="w-full h-full object-cover">
                            @else
                                {{ strtoupper(substr(Auth::user()->name, 0, 1)) }}
                            @endif
                        </div>
                        <input type="file" id="avatar-upload" class="hidden" accept="image/*" onchange="previewAvatar(this)">
                        <div class="flex flex-col gap-2">
                            <h3 class="text-lg font-bold text-[#1A1A1A]">{{ Auth::user()->name }}</h3>
                            <p class="text-sm text-[#6B7280]">{{ Auth::user()->email }}</p>
                            <button onclick="document.getElementById('avatar-upload').click()" class="mt-2 px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] text-[#1D5083] text-xs font-bold rounded-xl hover:bg-[#EBF3FA] transition-colors">Change Avatar</button>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-6">
                        <div class="flex flex-col gap-2">
                            <label class="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Full Name</label>
                            <input type="text" id="profile-name" value="{{ Auth::user()->name }}" class="w-full px-4 py-3 bg-[#F8FAFC] border-none rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1D5083]/20 transition-all">
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Email</label>
                            <input type="email" id="profile-email" value="{{ Auth::user()->email }}" class="w-full px-4 py-3 bg-[#F8FAFC] border-none rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1D5083]/20 transition-all">
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Role</label>
                            <input type="text" value="Administrator" class="w-full px-4 py-3 bg-[#F8FAFC] border-none rounded-xl text-[15px] text-[#8B95A5] cursor-not-allowed" disabled>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Firm</label>
                            <input type="text" value="Lawsy Intelligence Corp." class="w-full px-4 py-3 bg-[#F8FAFC] border-none rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1D5083]/20 transition-all">
                        </div>
                    </div>
                    <div class="flex justify-end mt-6">
                        <button onclick="updateProfile(this)" style="background-color: #1D5083; color: white;" class="px-6 py-3 text-sm font-bold rounded-xl hover:bg-[#153c63] transition-all shadow-md flex items-center gap-2">
                            <span>Save Changes</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Security Section -->
            <div id="sec-security" class="settings-section hidden flex flex-col gap-6">
                <div class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8 anim-up">
                    <h2 class="font-serif text-xl font-bold text-[#1A1A1A] mb-6">Security Settings</h2>
                    <div class="flex flex-col gap-6">
                        <div class="flex items-center justify-between p-5 bg-[#F8FAFC] rounded-xl">
                            <div>
                                <h4 class="text-[14px] font-bold text-[#1A1A1A]">Two-Factor Authentication</h4>
                                <p class="text-[13px] text-[#6B7280]">Add an extra layer of security to your account.</p>
                            </div>
                            <div class="relative inline-block w-12 h-6 cursor-pointer" onclick="toggle2FA(this)">
                                <input type="checkbox" class="sr-only peer" checked>
                                <div class="toggle-bg w-12 h-6 bg-[#1D5083] rounded-full transition-colors"></div>
                                <div class="toggle-dot absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm translate-x-6 transition-transform"></div>
                            </div>
                        </div>
                        <div class="flex flex-col gap-4">
                            <h4 class="text-[14px] font-bold text-[#1A1A1A]">Change Password</h4>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="flex flex-col gap-2">
                                    <label class="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Current Password</label>
                                    <input type="password" id="pw-current" placeholder="••••••••" class="w-full px-4 py-3 bg-[#F8FAFC] border-none rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1D5083]/20 transition-all">
                                </div>
                                <div></div>
                                <div class="flex flex-col gap-2">
                                    <label class="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">New Password</label>
                                    <input type="password" id="pw-new" placeholder="••••••••" class="w-full px-4 py-3 bg-[#F8FAFC] border-none rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1D5083]/20 transition-all">
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label class="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Confirm Password</label>
                                    <input type="password" id="pw-confirm" placeholder="••••••••" class="w-full px-4 py-3 bg-[#F8FAFC] border-none rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1D5083]/20 transition-all">
                                </div>
                            </div>
                            <div class="flex justify-end">
                                <button onclick="updatePassword(this)" style="background-color: #1D5083; color: white;" class="px-6 py-3 text-sm font-bold rounded-xl hover:bg-[#153c63] transition-all shadow-md flex items-center gap-2">
                                    <span>Update Password</span>
                                </button>
                            </div>
                        </div>
                        <div class="border-t border-[#E2E8F0] pt-6">
                            <h4 class="text-[14px] font-bold text-[#1A1A1A] mb-4">Login History</h4>
                            <div class="flex flex-col gap-3">
                                @foreach([['device'=>'Chrome on Windows','ip'=>'192.168.1.100','time'=>'Today, 09:00 AM','current'=>true],['device'=>'Safari on macOS','ip'=>'10.0.0.52','time'=>'Yesterday, 11:30 AM','current'=>false],['device'=>'Chrome on Android','ip'=>'172.16.0.1','time'=>'May 10, 03:15 PM','current'=>false]] as $s)
                                <div class="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl session-row">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#8B95A5]">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                        </div>
                                        <div>
                                            <p class="text-[13px] font-medium text-[#1A1A1A]">{{ $s['device'] }}</p>
                                            <p class="text-[11px] text-[#8B95A5]">{{ $s['ip'] }} • {{ $s['time'] }}</p>
                                        </div>
                                    </div>
                                    @if($s['current'])
                                    <span class="px-3 py-1 bg-[#D1FAE5] text-[#059669] text-[11px] font-bold rounded-full">Current</span>
                                    @else
                                    <button onclick="revokeSession(this)" class="text-[#EF4444] text-[11px] font-bold hover:underline">Revoke</button>
                                    @endif
                                </div>
                                @endforeach
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Notification Preferences Section -->
            <div id="sec-notifications-pref" class="settings-section hidden flex flex-col gap-6">
                <div class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8 anim-up">
                    <h2 class="font-serif text-xl font-bold text-[#1A1A1A] mb-6">Notification Preferences</h2>
                    @foreach([['title'=>'Email Notifications','desc'=>'Receive email alerts for important events.','checked'=>true],['title'=>'Push Notifications','desc'=>'Browser push notifications for real-time alerts.','checked'=>true],['title'=>'New Registration Alerts','desc'=>'Notify when a new lawyer registers.','checked'=>true],['title'=>'Revision Updates','desc'=>'Notify when a lawyer resubmits documents.','checked'=>true],['title'=>'Weekly Compliance Report','desc'=>'Receive weekly summary of compliance metrics.','checked'=>false],['title'=>'Marketing Emails','desc'=>'Product updates and announcements.','checked'=>false]] as $pref)
                    <div class="flex items-center justify-between p-5 bg-[#F8FAFC] rounded-xl mb-3 hover:bg-[#F1F5F9] transition-colors">
                        <div>
                            <h4 class="text-[14px] font-bold text-[#1A1A1A]">{{ $pref['title'] }}</h4>
                            <p class="text-[13px] text-[#6B7280]">{{ $pref['desc'] }}</p>
                        </div>
                        <div class="relative inline-block w-12 h-6 cursor-pointer" onclick="togglePref(this,'{{ $pref['title'] }}')">
                            <input type="checkbox" class="sr-only" {{ $pref['checked'] ? 'checked' : '' }}>
                            <div class="toggle-bg w-12 h-6 {{ $pref['checked'] ? 'bg-[#1D5083]' : 'bg-[#E2E8F0]' }} rounded-full transition-colors"></div>
                            <div class="toggle-dot absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform {{ $pref['checked'] ? 'translate-x-6' : '' }}"></div>
                        </div>
                    </div>
                    @endforeach
                </div>
            </div>

            <!-- Appearance Section -->
            <div id="sec-appearance" class="settings-section hidden flex flex-col gap-6">
                <div class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8 anim-up">
                    <h2 class="font-serif text-xl font-bold text-[#1A1A1A] mb-6">Appearance</h2>
                    <div class="flex flex-col gap-6">
                        <div>
                            <h4 class="text-[14px] font-bold text-[#1A1A1A] mb-4">Theme</h4>
                            <div class="grid grid-cols-3 gap-4" id="theme-selector">
                                <button onclick="selectTheme(this,'Light')" class="theme-btn p-4 bg-white border-2 border-[#1D5083] rounded-2xl text-center hover:shadow-lg transition-all">
                                    <div class="w-full h-16 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] mb-3"></div>
                                    <span class="text-sm font-bold text-[#1A1A1A]">Light</span>
                                </button>
                                <button onclick="selectTheme(this,'Dark')" class="theme-btn p-4 bg-white border-2 border-[#E2E8F0] rounded-2xl text-center hover:shadow-lg hover:border-[#1D5083]/30 transition-all">
                                    <div class="w-full h-16 bg-[#1A1A2E] rounded-xl mb-3"></div>
                                    <span class="text-sm font-bold text-[#1A1A1A]">Dark</span>
                                </button>
                                <button onclick="selectTheme(this,'System')" class="theme-btn p-4 bg-white border-2 border-[#E2E8F0] rounded-2xl text-center hover:shadow-lg hover:border-[#1D5083]/30 transition-all">
                                    <div class="w-full h-16 bg-gradient-to-r from-[#F8FAFC] to-[#1A1A2E] rounded-xl mb-3"></div>
                                    <span class="text-sm font-bold text-[#1A1A1A]">System</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <h4 class="text-[14px] font-bold text-[#1A1A1A] mb-4">Accent Color</h4>
                            <div class="flex gap-3" id="color-selector">
                                @foreach(['#1D5083','#0E3A68','#2563EB','#7C3AED','#059669','#DC2626'] as $color)
                                <button onclick="selectColor(this,'{{ $color }}')" class="color-btn w-10 h-10 rounded-xl border-2 {{ $color === '#1D5083' ? 'border-[#1A1A1A] scale-110 ring-4 ring-[#1D5083]/20' : 'border-transparent' }} hover:scale-110 transition-all" style="background-color:{{ $color }}"></button>
                                @endforeach
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="shrink-0 h-4"></div>
        </main>
    </div>

    <!-- Toast Container -->
    <div id="toast-container" class="fixed bottom-6 right-6 z-[500] flex flex-col gap-3"></div>

    <script>
        function showSection(id, btn) {
            document.querySelectorAll('.stab').forEach(t => { t.className = 'stab px-5 py-2.5 bg-white text-[#6B7280] border border-[#E2E8F0] text-sm font-medium rounded-full hover:bg-gray-50 transition-all'; });
            btn.className = 'stab active-stab px-5 py-2.5 bg-[#1D5083] text-white text-sm font-medium rounded-full shadow-md transition-all';
            document.querySelectorAll('.settings-section').forEach(s => s.classList.add('hidden'));
            document.getElementById('sec-' + id).classList.remove('hidden');
        }

        // Toast system
        function showToast(msg, type='success') {
            const colors = {success:'bg-[#059669] text-white',warning:'bg-[#D97706] text-white',error:'bg-[#DC2626] text-white',info:'bg-[#1D5083] text-white'};
            const t = document.createElement('div');
            t.className = `${colors[type]} px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-3`;
            t.style.animation = 'toastIn .3s ease-out';
            t.innerHTML = `<span>${msg}</span><button onclick="this.parentElement.remove()" class="opacity-70 hover:opacity-100">✕</button>`;
            document.getElementById('toast-container').appendChild(t);
            setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(()=>t.remove(),300);},4000);
        }

        // Profile update with AJAX
        function updateProfile(btn) {
            const name = document.getElementById('profile-name').value;
            const email = document.getElementById('profile-email').value;
            const avatarFile = document.getElementById('avatar-upload').files[0];

            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }
            formData.append('_token', '{{ csrf_token() }}');

            const orig = btn.innerHTML; 
            btn.disabled = true;
            btn.innerHTML = '<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> Saving...';

            fetch('{{ route("admin.profile.update") }}', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Saved!';
                    btn.classList.replace('bg-[#1D5083]','bg-[#059669]');
                    showToast(data.message);
                    
                    // Update header avatar and name if they exist
                    const headerName = document.querySelector('.text-sm.font-bold.text-[#1A1A1A]');
                    if (headerName) headerName.innerText = data.name;
                    
                    if (data.avatar_url) {
                        const headerAvatar = document.querySelector('.w-10.h-10.bg-[#EBF3FA]');
                        if (headerAvatar) {
                            headerAvatar.innerHTML = `<img src="${data.avatar_url}" class="w-full h-full object-cover rounded-full">`;
                        }
                    }

                    setTimeout(() => { 
                        btn.innerHTML = orig; 
                        btn.disabled = false; 
                        btn.classList.replace('bg-[#059669]','bg-[#1D5083]'); 
                    }, 2000);
                } else {
                    showToast('Update failed. Please try again.', 'error');
                    btn.innerHTML = orig;
                    btn.disabled = false;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Something went wrong.', 'error');
                btn.innerHTML = orig;
                btn.disabled = false;
            });
        }

        // Avatar preview
        function previewAvatar(input) {
            if(input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = e => {
                    document.getElementById('avatar-display').innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
                    showToast('Avatar updated!');
                };
                reader.readAsDataURL(input.files[0]);
            }
        }

        // 2FA toggle
        function toggle2FA(el) {
            const inp = el.querySelector('input'); inp.checked = !inp.checked;
            el.querySelector('.toggle-bg').classList.toggle('bg-[#1D5083]'); el.querySelector('.toggle-bg').classList.toggle('bg-[#E2E8F0]');
            el.querySelector('.toggle-dot').classList.toggle('translate-x-6');
            showToast(inp.checked ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled', inp.checked ? 'success' : 'warning');
        }

        // Password update
        function updatePassword(btn) {
            const cur = document.getElementById('pw-current').value;
            const nw = document.getElementById('pw-new').value;
            const cf = document.getElementById('pw-confirm').value;
            if(!cur) { showToast('Please enter current password','error'); return; }
            if(!nw || nw.length < 6) { showToast('New password must be at least 6 characters','error'); return; }
            if(nw !== cf) { showToast('Passwords do not match','error'); return; }
            saveBtn(btn, 'Password updated successfully!');
            setTimeout(() => { document.getElementById('pw-current').value=''; document.getElementById('pw-new').value=''; document.getElementById('pw-confirm').value=''; }, 1500);
        }

        // Revoke session
        function revokeSession(btn) {
            if(!confirm('Are you sure you want to revoke this session?')) return;
            const row = btn.closest('.session-row');
            row.style.opacity = '0'; row.style.transform = 'translateX(20px)'; row.style.transition = 'all .3s';
            setTimeout(() => { row.remove(); showToast('Session revoked successfully'); }, 300);
        }

        // Toggle notification preference
        function togglePref(el, name) {
            const inp = el.querySelector('input'); inp.checked = !inp.checked;
            el.querySelector('.toggle-bg').classList.toggle('bg-[#1D5083]'); el.querySelector('.toggle-bg').classList.toggle('bg-[#E2E8F0]');
            el.querySelector('.toggle-dot').classList.toggle('translate-x-6');
            showToast(`${name} ${inp.checked ? 'enabled' : 'disabled'}`, 'info');
        }

        // Theme selector
        function selectTheme(btn, name) {
            document.querySelectorAll('.theme-btn').forEach(b => { b.classList.remove('border-[#1D5083]'); b.classList.add('border-[#E2E8F0]'); });
            btn.classList.remove('border-[#E2E8F0]'); btn.classList.add('border-[#1D5083]');
            showToast(`Theme set to ${name}`, 'info');
        }

        // Color selector
        function selectColor(btn, color) {
            document.querySelectorAll('.color-btn').forEach(b => { b.classList.remove('border-[#1A1A1A]','scale-110','ring-4','ring-[#1D5083]/20'); b.classList.add('border-transparent'); });
            btn.classList.remove('border-transparent'); btn.classList.add('border-[#1A1A1A]','scale-110','ring-4','ring-[#1D5083]/20');
            showToast(`Accent color updated to ${color}`, 'info');
        }

        // Search settings
        function searchSettings(query) {
            const q = query.toLowerCase();
            if(q.includes('security') || q.includes('password') || q.includes('2fa')) { showSection('security', document.querySelectorAll('.stab')[1]); }
            else if(q.includes('notif') || q.includes('email') || q.includes('push')) { showSection('notifications-pref', document.querySelectorAll('.stab')[2]); }
            else if(q.includes('theme') || q.includes('color') || q.includes('appear') || q.includes('dark')) { showSection('appearance', document.querySelectorAll('.stab')[3]); }
            else if(q === '' || q.includes('profile') || q.includes('name')) { showSection('profile', document.querySelectorAll('.stab')[0]); }
        }
    </script>
</body>
</html>
