// Configuration for API URL
// Silakan aktifkan (uncomment) salah satu opsi di bawah ini sesuai dengan lingkungan running Anda.
// PENTING UNTUK EXPO/REACT NATIVE:
// Penggunaan 'localhost' biasa di bawah ini AKAN MENYEBABKAN error "Network request failed" di Emulator/HP Fisik
// karena Emulator/HP menganggap 'localhost' adalah diri mereka sendiri, bukan PC Anda yang menjalankan XAMPP.

// OPSI 1: Ngrok Tunnel (PALING DIREKOMENDASIKAN & Paling Stabil untuk HP Fisik + Emulator)
// Langkah: 1) Jalankan `ngrok http 80` di terminal PC Anda
//          2) Salin URL HTTPS dari ngrok (misal: https://xxxx.ngrok-free.app) dan tempel di bawah ini:
// export const VPS_URL = 'https://agrostologic-predeterminative-gema.ngrok-free.dev/lawsy';

// OPSI 2: Emulator Android (Menghubungkan emulator ke XAMPP di localhost PC Anda)
// export const VPS_URL = 'http://10.0.2.2/lawsy';

// OPSI 3: HP Fisik via Expo Go (Menghubungkan HP ke XAMPP via Wifi yang sama)
// Ganti '192.168.1.6' dengan IP lokal PC Anda (cek dengan ketik `ipconfig` di command prompt PC)
// export const VPS_URL = 'http://192.168.1.6/lawsy';

// OPSI 4: VPS Production (Resmi Lawsy)
export const VPS_URL = 'https://lawsy.site';

// OPSI 5: Localhost Browser PC biasa (Hanya berfungsi jika Anda merunning project sebagai web di browser PC Anda)
// export const VPS_URL = 'http://localhost/lawsy';

export const NGROK_URL = VPS_URL.endsWith('/lawsy') ? VPS_URL.replace('/lawsy', '') : VPS_URL;

export const BASE_URL = `${VPS_URL}/backend/`;
export const API_URL = `${VPS_URL}/backend/auth.php`;
export const REGISTRATION_API_URL = `${VPS_URL}/backend/lawyer_registration.php`;
export const LAWYER_PROFILE_API_URL = `${VPS_URL}/backend/lawyer_profile.php`;
export const LAWYERS_MAP_API_URL = `${VPS_URL}/backend/get_lawyers_map.php`;
export const BOOKING_API_URL = `${VPS_URL}/backend/book_appointment.php`;
export const MANAGE_BOOKING_API_URL = `${VPS_URL}/backend/manage_booking.php`;
export const GET_LAWYER_BOOKINGS_API_URL = `${VPS_URL}/backend/get_lawyer_bookings.php`;
export const GET_USER_BOOKINGS_API_URL = `${VPS_URL}/backend/get_user_bookings.php`;
export const MANAGE_AVAILABILITY_API_URL = `${VPS_URL}/backend/manage_availability.php`;
export const CREATE_CASE_API_URL = `${VPS_URL}/backend/create_case.php`;
export const CHAT_API_URL = `${VPS_URL}/backend/chat_handler.php`;
export const CALL_API_URL = `${VPS_URL}/backend/call_handler.php`;
export const CHAT_LIST_API_URL = `${VPS_URL}/backend/get_chat_list.php`;
export const AI_CHAT_API_URL = `${VPS_URL}/backend/ai_chat_handler.php`;
export const LAWYERS_AI_CONTEXT_API_URL = `${VPS_URL}/backend/get_lawyers_ai_context.php`;
export const CASE_STATUS_API_URL = `${VPS_URL}/backend/get_case_status.php`;
export const PAY_BILL_API_URL = `${VPS_URL}/backend/pay_bill.php`;
export const GET_OR_CREATE_PAYMENT_API_URL = `${VPS_URL}/backend/get_or_create_payment.php`;
export const CHECK_PAYMENT_STATUS_API_URL = `${VPS_URL}/backend/check_payment_status.php`;
export const CLIENT_PROFILE_API_URL = `${VPS_URL}/backend/client_profile.php`;
export const GENERATED_DOCUMENTS_API_URL = `${VPS_URL}/backend/document_handler.php`;
export const LEGAL_DICTIONARY_API_URL = `${VPS_URL}/backend/legal_dictionary.php`;
export const LAW_INSIGHTS_API_URL = `${VPS_URL}/backend/law_insights.php`;
export const LAWYER_STATS_API_URL = `${VPS_URL}/backend/lawyer_stats.php`;
export const USER_PROFILE_API_URL = `${VPS_URL}/backend/user_profile.php`;
export const CHANGE_PASSWORD_API_URL = `${VPS_URL}/backend/change_password.php`;





// Simpan LOCAL_IP sebagai cadangan jika diperlukan
// const LOCAL_IP = '192.168.1.6'; 
// export const API_URL = `http://${LOCAL_IP}/lawsy/backend/auth.php`;

// Google Maps API Key
// Silakan isi API Key Anda di bawah ini
export const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

// OpenRouter API Key
export const OPENROUTER_API_KEY = 'YOUR_OPENROUTER_API_KEY';

