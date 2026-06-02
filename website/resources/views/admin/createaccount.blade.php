<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Create Account - Lawsy</title>
    
    <!-- Scripts / Styles -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    
    <style>
        body { font-family: 'Poppins', sans-serif; background-color: #F8FAFC; }
        .font-serif { font-family: 'Poppins', sans-serif; }
    </style>
</head>
<body class="bg-white min-h-screen flex overflow-hidden">

    <!-- Split Screen: Left Side (Branding & Vision) -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-[#102A43] text-white p-16 flex-col justify-between overflow-hidden">
        
        <!-- Background Overlay (Slight gradient) -->
        <div class="absolute inset-0 bg-gradient-to-tr from-[#0A1D2E] via-[#102A43] to-[#1D5083]/20 z-0"></div>

        <!-- Content (Sit above background) -->
        <div class="relative z-10 flex flex-col h-full justify-between">
            
            <!-- Logo -->
            <div class="flex items-center gap-3">
                <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2l-8 4v2h16V6l-8-4zM2 10h2v6H2v-6zm4 0h2v6H6v-6zm4 0h2v6h-2v-6zm4 0h2v6h-2v-6zm4 0h2v6h-2v-6zM1 18h18v2H1v-2z"/>
                </svg>
                <div>
                    <span class="text-2xl font-serif font-bold text-white">Lawsy</span>
                    <p class="text-[9px] uppercase tracking-widest text-white/60 font-bold">Digital Jurisprudence</p>
                </div>
            </div>

            <!-- Image Card In the Middle -->
            <div class="relative w-full max-w-md mx-auto aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <img src="/images/create_account_left_image.png" class="w-full h-full object-cover" alt="Architectural Scene">
                
                <!-- Badge Top Left -->
                <div class="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium">
                    <!-- Sparkles Icon -->
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                    Pre-litigative analysis active
                </div>

                <!-- Badge Bottom Right -->
                <div class="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium">
                    <!-- Check Badge Icon -->
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    Compliant verified
                </div>
            </div>

            <!-- Bottom Text -->
            <div class="flex flex-col gap-3">
                <h2 class="font-serif text-4xl text-white font-normal leading-tight">
                    Precision in every legal directive.
                </h2>
                <p class="text-white/60 text-sm font-light leading-relaxed">
                    Join the most sophisticated legal network powered by secure digital intelligence.
                </p>
            </div>
            
        </div>
        
    </div>

    <!-- Split Screen: Right Side (Sign Up Form) -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-white overflow-y-auto">
        
        <div class="w-full max-w-lg flex flex-col gap-6">
            
            <!-- Heading -->
            <div>
                <h1 class="font-serif text-4xl text-[#1A1A1A] font-normal mb-1">Create Account</h1>
                <p class="text-[#6B7280] text-sm font-light">Step into the future of digital jurisprudence.</p>
            </div>

            <!-- Divider -->
            <div class="flex items-center gap-4 text-[#8B95A5] text-xs font-bold mt-2">
                <div class="flex-1 h-[1px] bg-[#E2E8F0]"></div>
                <span class="uppercase tracking-wider text-[10px]">Or Register Via Email</span>
                <div class="flex-1 h-[1px] bg-[#E2E8F0]"></div>
            </div>

            <!-- Form -->
            <form action="{{ route('register.submit') }}" method="POST" class="flex flex-col gap-5">
                @csrf
                
                <!-- Full Name and Professional Role (Side by Side) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Full Name -->
                    <div class="flex flex-col gap-2">
                        <label class="text-[#8B95A5] font-bold text-[10px] tracking-wider uppercase">Full Name</label>
                        @error('name')
                            <p class="text-[#EF4444] text-xs font-medium">{{ $message }}</p>
                        @enderror
                        <input type="text" name="name" placeholder="e.g. Julian Sterling" class="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8B95A5] focus:outline-none focus:ring-2 focus:ring-[#1D5083]/20 focus:border-[#1D5083] transition-all" required>
                    </div>

                    <!-- Professional Role -->
                    <div class="flex flex-col gap-2">
                        <label class="text-[#8B95A5] font-bold text-[10px] tracking-wider uppercase">Professional Role</label>
                        @error('role')
                            <p class="text-[#EF4444] text-xs font-medium">{{ $message }}</p>
                        @enderror
                        <div class="relative">
                            <select name="role" class="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1D5083]/20 focus:border-[#1D5083] transition-all appearance-none cursor-pointer" required>
                                <option value="admin">Admin</option>
                                <option value="superadmin">Superadmin</option>
                            </select>
                            <!-- Chevron Icon -->
                            <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#8B95A5]">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Email Address -->
                <div class="flex flex-col gap-2">
                    <label class="text-[#8B95A5] font-bold text-[10px] tracking-wider uppercase">Email Address</label>
                    @error('email')
                        <p class="text-[#EF4444] text-xs font-medium">{{ $message }}</p>
                    @enderror
                    <input type="email" name="email" placeholder="julian@sterling-partners.com" class="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8B95A5] focus:outline-none focus:ring-2 focus:ring-[#1D5083]/20 focus:border-[#1D5083] transition-all" required>
                </div>

                <!-- Password and Confirm Password (Side by Side) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Password -->
                    <div class="flex flex-col gap-2">
                        <label class="text-[#8B95A5] font-bold text-[10px] tracking-wider uppercase">Password</label>
                        @error('password')
                            <p class="text-[#EF4444] text-xs font-medium">{{ $message }}</p>
                        @enderror
                        <div class="relative">
                            <input type="password" name="password" placeholder="••••••••" class="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8B95A5] focus:outline-none focus:ring-2 focus:ring-[#1D5083]/20 focus:border-[#1D5083] transition-all" required>
                            <div class="absolute inset-y-0 right-0 pr-4 flex items-center text-[#8B95A5] cursor-pointer hover:text-[#1D5083] transition-colors">
                                <!-- Eye Icon -->
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            </div>
                        </div>
                    </div>

                    <!-- Confirm Password -->
                    <div class="flex flex-col gap-2">
                        <label class="text-[#8B95A5] font-bold text-[10px] tracking-wider uppercase">Confirm Password</label>
                        <input type="password" name="password_confirmation" placeholder="••••••••" class="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8B95A5] focus:outline-none focus:ring-2 focus:ring-[#1D5083]/20 focus:border-[#1D5083] transition-all" required>
                    </div>
                </div>

                <!-- Terms and Conditions -->
                <div class="flex items-center gap-3">
                    <input type="checkbox" id="terms" class="w-4 h-4 rounded border-[#E2E8F0] text-[#1D5083] focus:ring-[#1D5083]/20" required>
                    <label for="terms" class="text-[#6B7280] text-xs font-light cursor-pointer select-none">
                        I agree to the <a href="#" class="text-[#1D5083] font-bold hover:text-[#153c63]">Terms of Service</a> and <a href="#" class="text-[#1D5083] font-bold hover:text-[#153c63]">Legal Protocol</a> of Lawsy.
                    </label>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="w-full bg-[#1D5083] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#1D5083]/20 hover:bg-[#153c63] transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 mt-2">
                    Begin Practice
                    <!-- Arrow Right -->
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
                
            </form>

            <!-- Footer Link -->
            <div class="text-center text-sm mt-4">
                <span class="text-[#6B7280] font-light">Already a member of the firm? </span>
                <a href="{{ route('signin') }}" class="text-[#1D5083] font-bold hover:text-[#153c63] transition-colors">Secure Sign In</a>
            </div>

            <!-- Page Indicators -->
            <div class="flex justify-center gap-2 mt-2">
                <div class="w-1.5 h-1.5 bg-[#E2E8F0] rounded-full"></div>
                <div class="w-1.5 h-1.5 bg-[#1D5083] rounded-full"></div>
                <div class="w-1.5 h-1.5 bg-[#E2E8F0] rounded-full"></div>
            </div>

        </div>
        
    </div>

</body>
</html>
