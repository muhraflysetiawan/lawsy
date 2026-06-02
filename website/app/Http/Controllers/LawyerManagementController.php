<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LawyerManagementController extends Controller
{
    public function index(Request $request)
    {
        return view('admin.lawyersverification');
    }
}
