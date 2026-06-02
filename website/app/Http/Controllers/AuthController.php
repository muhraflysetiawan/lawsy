<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|string',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        // Sync to Go Backend Database
        try {
            $apiUrl = env('GO_API_URL', 'http://localhost:8080/api');
            \Illuminate\Support\Facades\Http::post($apiUrl . '/users', [
                'name'     => $user->name,
                'email'    => $user->email,
                'password' => $user->password, // Syncing the hashed password
                'role'     => $user->role,
            ]);
        } catch (\Exception $e) {
            // Log error or handle silently if Go backend is down
            \Illuminate\Support\Facades\Log::error("Failed to sync user to Go: " . $e->getMessage());
        }

        return redirect()->route('signin')->with('success', 'Account created successfully. Please sign in.');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();

            $user = Auth::user();
            if ($user->role === 'admin') {
                return redirect()->route('dashboardadmin');
            }

            // Fallback if not admin
            return redirect()->intended('/');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('signin');
    }
}
