<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Lawsy - Modern Legal Technology</title>
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Scripts / Styles -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <!-- AOS CSS -->
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    
    <!-- GSAP -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    
    <style>
        body {
            overflow: hidden;
            margin: 0;
            background-color: #ffffff;
            font-family: 'Inter', sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        
        /* Intro Animation Elements */
        #intro-container {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #ffffff;
        }
        
        #blue-rectangle {
            width: 70px;
            height: 0px; /* Start at 0, animate to 220px */
            background-color: #1D5083;
            border-radius: 35px;
            box-shadow: 0 0 40px rgba(29, 80, 131, 0.4);
            opacity: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        #logo-reveal {
            opacity: 0;
            filter: blur(10px);
            transform: scale(0.9);
            color: white;
            font-size: 2.2rem;
            font-weight: 800;
            letter-spacing: 0.5px;
            position: absolute;
        }

        /* Main Content Elements */
        #main-content {
            opacity: 0;
            visibility: hidden;
            /* Background image using user's full frame image */
            background-image: url('{{ asset('images/yunani.png') }}');
            background-size: cover;
            background-position: right center;
            background-repeat: no-repeat;
            background-color: #09131F;
            min-height: 100vh;
            color: white;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        /* Atmospheric glowing orbs */
        .glow-orb-1 {
            position: absolute;
            top: 10%;
            right: 15%;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(79, 125, 168, 0.15) 0%, rgba(0,0,0,0) 70%);
            filter: blur(60px);
            z-index: 0;
        }
        
        .glow-orb-2 {
            position: absolute;
            bottom: -10%;
            left: 5%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(29, 80, 131, 0.25) 0%, rgba(0,0,0,0) 70%);
            filter: blur(60px);
            z-index: 0;
        }

        /* Floating particles */
        .particle {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.15);
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
            pointer-events: none;
            z-index: 1;
        }

        /* Feature Card */
        .feature-card {
            background: rgba(20, 35, 55, 0.4);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 16px;
            transition: all 0.3s ease;
        }
        
        .feature-card:hover {
            background: rgba(29, 80, 131, 0.3);
            border-color: rgba(255, 255, 255, 0.1);
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2), 0 0 20px rgba(29, 80, 131, 0.2);
        }

        .feature-icon-box {
            background: rgba(29, 80, 131, 0.5);
            width: 36px;
            height: 36px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #8bb2d9;
        }

        /* Goddess Image (Centered & Dancing) */
        .goddess-container {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            z-index: 5; /* stays behind text (z-10) */
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            
            /* Ganti angka di bawah ini untuk menaik-turunkan seluruh gambar */
            /* Angka positif (misal: 10vh atau 100px) akan menurunkan gambar */
            /* Angka negatif (misal: -10vh atau -100px) akan menaikkan gambar */
            transform: translateY(25vh); 
        }

        .goddess-img {
            max-height: 150%; /* slightly larger to feel immersive */
            max-width: 100%;
            object-fit: contain; 
            object-position: center 70%; 
            opacity: 0.1; /* set to 40% as requested */
            mix-blend-mode: lighten;
            /* Dancing animation */
            animation: dancing 8s ease-in-out infinite;
        }

        @keyframes dancing {
            0% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-15px) scale(1.02); }
            100% { transform: translateY(0px) scale(1); }
        }

        /* CTA Button */
        .cta-btn {
            background: linear-gradient(135deg, #4F7DA8, #1D5083);
            box-shadow: 0 8px 25px rgba(29, 80, 131, 0.5);
            transition: all 0.3s ease;
        }
        
        .cta-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 30px rgba(79, 125, 168, 0.6);
        }

        /* Gradient Text */
        .text-gradient-dark {
            background: linear-gradient(to right, #4F7DA8, #2a6194);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .badge-glass {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(107, 161, 212, 0.2);
            box-shadow: 0 0 15px rgba(29, 80, 131, 0.2);
            backdrop-filter: blur(8px);
        }

    </style>
</head>
<body class="antialiased">

    <!-- SCENE 1 & 2 & 3: Intro Animation Overlay -->
    <div id="intro-container">
        <div id="blue-rectangle">
            <div id="logo-reveal"></div>
        </div>
    </div>

    <!-- SCENE 4: Main Content (Hero Section) - REMOVED -->
    <div id="main-content">
    </div>

    <script>
        document.addEventListener("DOMContentLoaded", (event) => {
            
            const blueRectangle = document.getElementById("blue-rectangle");
            const logoReveal = document.getElementById("logo-reveal");

            console.log("blueRectangle:", blueRectangle);
            console.log("logoReveal:", logoReveal);

            // Intro Animation Timeline
            const tl = gsap.timeline({
                onComplete: () => {
                    console.log("Timeline completed!");
                    window.location.href = "{{ url('/landingpageadmin') }}";
                }
            });

            if (blueRectangle && logoReveal) {
                // SCENE 1: Rectangle Fade in & Scale up
                tl.to(blueRectangle, {
                    opacity: 1,
                    height: "220px",
                    duration: 1.2,
                    ease: "expo.out"
                })

                // SCENE 2: Logo Reveal
                .to(logoReveal, {
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                    duration: 1,
                    ease: "power2.out"
                }, "-=0.4")
                
                // Hold logo
                .to({}, {duration: 0.8})

                // SCENE 3: Blue Expand Transition
                .to(logoReveal, {
                    opacity: 0,
                    scale: 1.1,
                    filter: "blur(5px)",
                    duration: 0.1,
                    ease: "power2.in"
                })
                .to(blueRectangle, {
                    width: "100vw",
                    height: "100vh",
                    borderRadius: "0px",
                    duration: 1.2,
                    ease: "expo.inOut"
                }, "-=0.2");
            } else {
                console.error("Required elements for animation not found!");
                // Fallback redirect if elements are missing
                setTimeout(() => {
                    window.location.href = "{{ url('/landingpageadmin') }}";
                }, 1000);
            }

        });
    </script>
</body>
</html>
