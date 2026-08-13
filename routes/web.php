<?php

use App\Http\Controllers\Admin\CallController as AdminCallController;
use App\Http\Controllers\Admin\ConversationController as AdminConversationController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ManualTopUpController as AdminManualTopUpController;
use App\Http\Controllers\Admin\NameChangeController as AdminNameChangeController;
use App\Http\Controllers\Admin\BannerController as AdminBannerController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Admin\TransactionController as AdminTransactionController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\VerificationController as AdminVerificationController;
use App\Http\Controllers\Admin\WithdrawalController as AdminWithdrawalController;
use App\Http\Controllers\CallController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CreatorController;
use App\Http\Controllers\FemaleDashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\WithdrawalController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

Route::get('/about', [PageController::class, 'about'])->name('about');
Route::get('/how-it-works', [PageController::class, 'howItWorks'])->name('how-it-works');
Route::get('/safety', [PageController::class, 'safety'])->name('safety');
Route::get('/faq', [PageController::class, 'faq'])->name('faq');
Route::get('/contact', [PageController::class, 'contact'])->name('contact');
Route::get('/pricing', [PageController::class, 'pricing'])->name('pricing');
Route::get('/terms', [PageController::class, 'terms'])->name('terms');
Route::get('/privacy', [PageController::class, 'privacy'])->name('privacy');
Route::get('/community', [PageController::class, 'community'])->name('community');
Route::get('/careers', [PageController::class, 'careers'])->name('careers');
Route::get('/blog', [PageController::class, 'blog'])->name('blog');
Route::get('/blog/{slug}', [PageController::class, 'blogShow'])->name('blog.show');

Route::post('/stripe/webhook', [WalletController::class, 'webhook'])->name('stripe.webhook');

Route::middleware(['auth', 'online'])->group(function () {
    Route::get('/dashboard', HomeController::class)->name('dashboard');
    Route::get('/creators/{female}', [CreatorController::class, 'show'])->name('creators.show');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/wallet', [WalletController::class, 'index'])->name('wallet.index');
    Route::post('/wallet/top-up', [WalletController::class, 'topUp'])->name('wallet.top-up');
    Route::post('/wallet/manual-top-up', [WalletController::class, 'requestManualTopUp'])->name('wallet.manual-top-up');

    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::post('/chat/start/{female}', [ChatController::class, 'start'])->name('chat.start');
    Route::get('/chat/{conversation}', [ChatController::class, 'show'])->name('chat.show');
    Route::post('/chat/{conversation}/send', [ChatController::class, 'send'])->name('chat.send');

    Route::post('/calls/start/{female}', [CallController::class, 'start'])->name('calls.start');
    Route::get('/calls/{call}', [CallController::class, 'show'])->name('calls.show');
    Route::get('/calls/{call}/token', [CallController::class, 'token'])->name('calls.token');
    Route::post('/calls/{call}/accept', [CallController::class, 'accept'])->name('calls.accept');
    Route::post('/calls/{call}/reject', [CallController::class, 'reject'])->name('calls.reject');
    Route::post('/calls/{call}/end', [CallController::class, 'end'])->name('calls.end');
    Route::post('/calls/{call}/tick', [CallController::class, 'tick'])->name('calls.tick');

    Route::middleware('role:female')->prefix('female')->name('female.')->group(function () {
        Route::get('/dashboard', FemaleDashboardController::class)->name('dashboard');
        Route::post('/pricing', [FemaleDashboardController::class, 'updatePricing'])->name('pricing');
        Route::post('/bank', [FemaleDashboardController::class, 'updateBank'])->name('bank');
        Route::post('/avatar', [FemaleDashboardController::class, 'updateAvatar'])->name('avatar');
        Route::post('/bio', [FemaleDashboardController::class, 'updateBio'])->name('bio');
        Route::post('/verification', [FemaleDashboardController::class, 'submitVerification'])->name('verification');
        Route::get('/withdrawals', [WithdrawalController::class, 'index'])->name('withdrawals');
        Route::post('/withdrawals', [WithdrawalController::class, 'store'])->name('withdrawals.store');
    });

    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/', AdminDashboardController::class)->name('dashboard');

        Route::get('/users', [AdminUserController::class, 'index'])->name('users');
        Route::get('/users/create', [AdminUserController::class, 'create'])->name('users.create');
        Route::post('/users', [AdminUserController::class, 'store'])->name('users.store');
        Route::get('/users/{user}/edit', [AdminUserController::class, 'edit'])->name('users.edit');
        Route::put('/users/{user}', [AdminUserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');
        Route::post('/users/{user}/ban', [AdminUserController::class, 'toggleBan'])->name('users.ban');
        Route::post('/users/{user}/wallet', [AdminUserController::class, 'adjustWallet'])->name('users.wallet');

        Route::get('/verifications', [AdminVerificationController::class, 'index'])->name('verifications');
        Route::post('/verifications/{verification}/approve', [AdminVerificationController::class, 'approve'])->name('verifications.approve');
        Route::post('/verifications/{verification}/reject', [AdminVerificationController::class, 'reject'])->name('verifications.reject');

        Route::get('/name-changes', [AdminNameChangeController::class, 'index'])->name('name-changes');
        Route::post('/name-changes/{nameChange}/approve', [AdminNameChangeController::class, 'approve'])->name('name-changes.approve');
        Route::post('/name-changes/{nameChange}/reject', [AdminNameChangeController::class, 'reject'])->name('name-changes.reject');

        Route::get('/chats', [AdminConversationController::class, 'index'])->name('chats');
        Route::get('/chats/{conversation}', [AdminConversationController::class, 'show'])->name('chats.show');

        Route::get('/calls', [AdminCallController::class, 'index'])->name('calls');
        Route::get('/calls/{call}', [AdminCallController::class, 'show'])->name('calls.show');

        Route::get('/transactions', [AdminTransactionController::class, 'index'])->name('transactions');

        Route::get('/top-ups', [AdminManualTopUpController::class, 'index'])->name('top-ups');
        Route::post('/top-ups/{topUp}/approve', [AdminManualTopUpController::class, 'approve'])->name('top-ups.approve');
        Route::post('/top-ups/{topUp}/reject', [AdminManualTopUpController::class, 'reject'])->name('top-ups.reject');

        Route::get('/withdrawals', [AdminWithdrawalController::class, 'index'])->name('withdrawals');
        Route::post('/withdrawals/{withdrawal}/approve', [AdminWithdrawalController::class, 'approve'])->name('withdrawals.approve');
        Route::post('/withdrawals/{withdrawal}/reject', [AdminWithdrawalController::class, 'reject'])->name('withdrawals.reject');

        Route::get('/banners', [AdminBannerController::class, 'index'])->name('banners');
        Route::get('/banners/create', [AdminBannerController::class, 'create'])->name('banners.create');
        Route::post('/banners', [AdminBannerController::class, 'store'])->name('banners.store');
        Route::get('/banners/{banner}/edit', [AdminBannerController::class, 'edit'])->name('banners.edit');
        Route::put('/banners/{banner}', [AdminBannerController::class, 'update'])->name('banners.update');
        Route::delete('/banners/{banner}', [AdminBannerController::class, 'destroy'])->name('banners.destroy');
        Route::post('/banners/{banner}/toggle', [AdminBannerController::class, 'toggle'])->name('banners.toggle');

        Route::get('/settings', [AdminSettingsController::class, 'edit'])->name('settings');
        Route::post('/settings', [AdminSettingsController::class, 'update'])->name('settings.update');
    });
});

require __DIR__.'/auth.php';
