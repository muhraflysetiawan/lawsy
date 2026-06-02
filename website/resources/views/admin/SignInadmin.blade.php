<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Secure Sign In - Lawsy</title>
    
    <!-- Scripts / Styles -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    
    <!-- Google Fonts (Optional but good for serif) -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    
    <style>
        body { font-family: 'Poppins', sans-serif; background-color: #F8FAFC; }
        .font-serif { font-family: 'Poppins', sans-serif; }
    </style>
</head>
<body class="bg-white min-h-screen flex overflow-hidden">

    <!-- Split Screen: Left Side (Branding & Vision) -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-[#102A43] text-white p-16 flex-col justify-between overflow-hidden">
        
        <!-- Background Image with Blur and Overlay -->
        <div class="absolute inset-0 z-0">
            <img src="/images/office_bg.png" class="w-full h-full object-cover object-center filter scale-105" alt="Office Background">
            <!-- Dark Blue/Black Overlay -->
            <div class="absolute inset-0 bg-[#0A1D2E]/70 mix-blend-multiply"></div>
            <!-- Radial Gradient for depth -->
            <div class="absolute inset-0 bg-gradient-to-tr from-[#0A1D2E] via-transparent to-[#1D5083]/30"></div>
        </div>

        <!-- Content (Relative to sit above background) -->
        <div class="relative z-10 flex flex-col h-full justify-between">
            
            <!-- Logo -->
            <div class="flex items-center gap-3">
                <!-- Court/Building Icon -->
                <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2l-8 4v2h16V6l-8-4zM2 10h2v6H2v-6zm4 0h2v6H6v-6zm4 0h2v6h-2v-6zm4 0h2v6h-2v-6zm4 0h2v6h-2v-6zM1 18h18v2H1v-2z"/>
                </svg>
                <span class="text-2xl font-serif font-bold text-white">Lawsy</span>
            </div>

            <!-- Vision & Mission -->
            <div class="flex flex-col gap-12 max-w-lg">
                
                <!-- Vision -->
                <div class="flex flex-col gap-4">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-[1px] bg-white/40"></div>
                        <span class="text-[10px] uppercase tracking-widest font-bold text-white/60">Our Vision</span>
                    </div>
                    <h2 class="font-serif text-3xl leading-snug text-white font-normal">
                        To redefine the architecture of justice through the seamless integration of human expertise and artificial intelligence, setting the global standard for legal excellence.
                    </h2>
                </div>

                <!-- Mission -->
                <div class="flex flex-col gap-4">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-[1px] bg-white/40"></div>
                        <span class="text-[10px] uppercase tracking-widest font-bold text-white/60">Our Mission</span>
                    </div>
                    <p class="text-white/70 text-sm leading-relaxed font-light">
                        Empowering legal professionals with precision-engineered tools that accelerate insights, ensure uncompromising compliance, and uphold the highest institutional standards of the modern firm.
                    </p>
                </div>
                
            </div>

            <!-- Empty div for spacing/alignment -->
            <div></div>
            
        </div>
        
    </div>

    <!-- Split Screen: Right Side (Sign In Form) -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-white">
        
        <div class="w-full max-w-md flex flex-col gap-8">
            
            <!-- Heading -->
            <div class="text-center lg:text-left">
                <h1 class="font-serif text-4xl text-[#1A1A1A] font-normal mb-2">Secure Sign In</h1>
            </div>

            @if (session('success'))
                <div class="bg-[#E1FCEF] border border-[#10B981]/20 text-[#10B981] px-4 py-3 rounded-xl text-sm font-medium">
                    {{ session('success') }}
                </div>
            @endif

            <!-- Form -->
            <form action="{{ route('login.submit') }}" method="POST" class="flex flex-col gap-6">
                @csrf
                
                <!-- Email Field -->
                <div class="flex flex-col gap-2">
                    <label class="text-[#8B95A5] font-bold text-[10px] tracking-wider uppercase">Professional Email</label>
                    @error('email')
                        <p class="text-[#EF4444] text-xs font-medium">{{ $message }}</p>
                    @enderror
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8B95A5]">
                            <!-- Mail Icon -->
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </div>
                        <input type="email" name="email" placeholder="counsel@firm.com" class="w-full pl-12 pr-4 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8B95A5] focus:outline-none focus:ring-2 focus:ring-[#1D5083]/20 focus:border-[#1D5083] transition-all" required>
                    </div>
                </div>

                <!-- Password Field -->
                <div class="flex flex-col gap-2">
                    <div class="flex justify-between items-center">
                        <label class="text-[#8B95A5] font-bold text-[10px] tracking-wider uppercase">Password</label>
                        <a href="#" class="text-[#1D5083] text-[11px] font-bold hover:text-[#153c63] transition-colors">Forgot?</a>
                    </div>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8B95A5]">
                            <!-- Lock Icon -->
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m4-6V5a3 3 0 00-3-3H9a3 3 0 00-3 3v4m6 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V12a2 2 0 00-2-2z"></path></svg>
                        </div>
                        <input type="password" name="password" placeholder="••••••••" class="w-full pl-12 pr-12 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8B95A5] focus:outline-none focus:ring-2 focus:ring-[#1D5083]/20 focus:border-[#1D5083] transition-all" required>
                        <div class="absolute inset-y-0 right-0 pr-4 flex items-center text-[#8B95A5] cursor-pointer hover:text-[#1D5083] transition-colors">
                            <!-- Eye Icon (Hide) -->
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path></svg>
                        </div>
                    </div>
                </div>

                <!-- Remember Me -->
                <div class="flex items-center gap-3">
                    <input type="checkbox" id="remember" class="w-4 h-4 rounded border-[#E2E8F0] text-[#1D5083] focus:ring-[#1D5083]/20">
                    <label for="remember" class="text-[#6B7280] text-xs font-light cursor-pointer select-none">Remember my credentials</label>
                </div>

                <!-- Sign In Button -->
                <button type="submit" class="w-full bg-[#1D5083] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#1D5083]/20 hover:bg-[#153c63] transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                    Secure Sign In
                    <!-- Arrow Right -->
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
                
            </form>

            <!-- Divider -->
            <div class="flex items-center gap-4 text-[#8B95A5] text-xs font-bold">
                <div class="flex-1 h-[1px] bg-[#E2E8F0]"></div>
                <span class="uppercase tracking-wider text-[10px]">Or Authenticate Via</span>
                <div class="flex-1 h-[1px] bg-[#E2E8F0]"></div>
            </div>

            <!-- Google Sign In -->
            <button class="w-full bg-white border border-[#E2E8F0] text-[#1A1A1A] py-3.5 rounded-xl font-bold text-sm hover:bg-[#F8FAFC] transition-colors flex items-center justify-center gap-3 shadow-sm">
                <!-- Google Icon -->
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M5.266 9.765C6.199 6.963 8.854 5 12 5c1.737 0 3.305.642 4.511 1.696l3.418-3.418C17.882 1.391 15.111 0 12 0 7.354 0 3.327 2.651 1.253 6.544l4.013 3.221z"/>
                    <path fill="#FBBC05" d="M23.633 12.273c0-.814-.073-1.597-.21-2.355H12v4.46h6.52c-.282 1.493-1.124 2.76-2.384 3.606l3.754 2.91c2.196-2.025 3.473-5.01 3.473-8.621z"/>
                    <path fill="#4285F4" d="M12 24c3.24 0 5.955-1.076 7.942-2.911l-3.754-2.91c-1.1.736-2.511 1.173-4.188 1.173-3.218 0-5.939-2.17-6.912-5.084l-4.013 3.221C3.172 21.319 7.21 24 12 24z"/>
                    <path fill="#34A853" d="M5.088 14.268C4.85 13.563 4.717 12.81 4.717 12c0-.81.133-1.563.371-2.268V6.512L1.253 9.733C.454 11.233 0 12.567 0 14c0 1.433.454 2.767 1.253 4.267l3.835-3.001z"/>
                </svg>
                Continue with Google
            </button>

            <!-- Footer Text -->
            <div class="text-center text-sm">
                <span class="text-[#6B7280] font-light">New to the firm? </span>
                <a href="{{ route('createaccount') }}" class="text-[#1D5083] font-bold hover:text-[#153c63] transition-colors">Request Firm Access</a>
            </div>

        </div>
        
    </div>

</body>
</html>
