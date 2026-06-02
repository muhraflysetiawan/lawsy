<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'avatar' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
            // Delete old avatar
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->save();

        \App\Services\AdminActivityService::log(
            action: 'update_profile',
            category: 'settings',
            description: "Updated profile information",
            metadata: ['user_id' => $user->id],
            riskLevel: 'Low'
        );

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully!',
            'avatar_url' => $user->avatar ? asset('storage/' . $user->avatar) : null,
            'name' => $user->name
        ]);
    }
}
