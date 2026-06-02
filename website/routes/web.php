<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CasesReportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LawyerVerificationController;
use App\Http\Controllers\SupportController;

Route::get('/', function () {
    return view('splashscreen');
});

Route::get('/landingpageadmin', function () {
    return view('admin.landingpageadmin');
})->name('landingpageadmin');

Route::get('/signin', function () {
    return view('admin.SignInadmin');
})->name('signin');

Route::get('/login', function () {
    return redirect()->route('signin');
})->name('login');

Route::get('/createaccount', function () {
    return view('admin.createaccount');
})->name('createaccount');

Route::post('/createaccount', [AuthController::class, 'register'])->name('register.submit');
Route::post('/signin', [AuthController::class, 'login'])->name('login.submit');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::get('/dashboardadmin', [DashboardController::class, 'index'])->name('dashboardadmin')->middleware('auth');
Route::get('/api/admin/dashboard-stats', [\App\Http\Controllers\Api\AdminDashboardController::class, 'getStats'])->middleware('auth');


Route::get('/reportlawyer', [CasesReportController::class, 'index'])->name('reportlawyer')->middleware('auth');
Route::get('/admin/cases-report', [CasesReportController::class, 'index'])->name('admin.cases-report')->middleware('auth');
Route::get('/admin/cases/resolved', [CasesReportController::class, 'resolved'])->name('admin.cases.resolved')->middleware('auth');
Route::get('/admin/cases-report/review', function () {
    return view('admin.cases-review');
})->name('admin.cases.review')->middleware('auth');

Route::get('/lawyers-verification', [LawyerVerificationController::class, 'index'])->name('lawyers_verification')->middleware('auth');
Route::post('/lawyers-verification/{id}/status', [LawyerVerificationController::class, 'updateStatus'])->name('lawyers.verification.status')->middleware('auth');

Route::get('/admin/documents', [App\Http\Controllers\ArticleController::class, 'index'])->name('admin.documents.index')->middleware('auth');
Route::get('/admin/documents/drafts', [App\Http\Controllers\ArticleController::class, 'drafts'])->name('admin.documents.drafts')->middleware('auth');
Route::get('/admin/documents/upload', [App\Http\Controllers\ArticleController::class, 'create'])->name('admin.documents.upload')->middleware('auth');
Route::post('/admin/articles', [App\Http\Controllers\ArticleController::class, 'store'])->name('admin.articles.store')->middleware('auth');
Route::delete('/admin/articles/{id}', [App\Http\Controllers\ArticleController::class, 'destroy'])->name('admin.articles.destroy')->middleware('auth');

Route::get('/admin/documents/preview', function () {
    return view('admin.documents.preview');
})->name('admin.documents.preview')->middleware('auth');

Route::get('/admin/analytics', [\App\Http\Controllers\AnalyticsController::class, 'index'])->name('admin.analytics')->middleware('auth');

Route::get('/admin/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('admin.notifications')->middleware('auth');
Route::post('/admin/notifications/{id}/mark-read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->middleware('auth');
Route::post('/admin/notifications/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->middleware('auth');
Route::delete('/admin/notifications/{id}', [\App\Http\Controllers\NotificationController::class, 'destroy'])->middleware('auth');

Route::get('/admin/compliance', [\App\Http\Controllers\ComplianceController::class, 'index'])->name('admin.compliance')->middleware('auth');
Route::get('/api/admin/compliance-stats', [\App\Http\Controllers\Api\AdminComplianceController::class, 'getLogs'])->middleware('auth');

Route::get('/admin/settings', function () {
    return view('admin.settings');
})->name('admin.settings')->middleware('auth');

Route::post('/admin/profile/update', [App\Http\Controllers\ProfileController::class, 'update'])->name('admin.profile.update')->middleware('auth');

Route::get('/admin/support', [SupportController::class, 'index'])->name('admin.support')->middleware('auth');
Route::get('/admin/support/messages', [SupportController::class, 'getMessages'])->name('admin.support.messages')->middleware('auth');
Route::post('/admin/support/message', [SupportController::class, 'sendMessage'])->name('admin.support.send')->middleware('auth');
Route::post('/admin/support/upload', [SupportController::class, 'uploadFile'])->name('admin.support.upload')->middleware('auth');
Route::post('/admin/support/draft', [SupportController::class, 'generateDraft'])->name('admin.support.draft')->middleware('auth');
Route::post('/admin/support/analyze-ocr', [SupportController::class, 'analyzeOCR'])->name('admin.support.analyze-ocr')->middleware('auth');
Route::post('/admin/support/summarize', [\App\Http\Controllers\SupportController::class, 'summarize'])->name('admin.support.summarize')->middleware('auth');
Route::post('/admin/support/assign-admin', [\App\Http\Controllers\SupportController::class, 'assignAdmin'])->name('admin.support.assign-admin')->middleware('auth');
