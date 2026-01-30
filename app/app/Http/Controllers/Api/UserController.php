<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    /**
     * List all users
     */
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')->get();
        return response()->json(['data' => $users]);
    }

    /**
     * Update user role
     */
    public function updateRole(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|in:admin,health_professional,public'
        ]);

        // Prevent admin from demoting themselves if they are the last admin? 
        // For simplicity, just update.
        
        $user->role = $request->role;
        $user->save();

        return response()->json($user);
    }

    /**
     * Delete user
     */
    public function destroy(User $user)
    {
        // Prevent deleting yourself
        if (auth()->id() === $user->id) {
            return response()->json(['message' => 'Não pode eliminar a sua própria conta.'], 403);
        }

        $user->delete();

        return response()->json(null, 204);
    }
}
