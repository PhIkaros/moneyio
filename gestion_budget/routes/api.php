<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CompteController;
use App\Http\Controllers\IncomeController;
use App\Http\Controllers\NikkiEntryController;
use App\Http\Controllers\NikkiEntryImageController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\OutcomeController;
use App\Http\Controllers\SousCategController;
use App\Http\Controllers\TransfertController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Controllers\AIController;

// Public routes (no token needed)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (token required)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Profile
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);

    // Resources
    Route::apiResource('comptes', CompteController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('sous-categs', SousCategController::class);
    Route::apiResource('incomes', IncomeController::class);
    Route::apiResource('outcomes', OutcomeController::class);
    Route::apiResource('transferts', TransfertController::class);
    Route::apiResource('notes', NoteController::class);
    Route::apiResource('budgets', BudgetController::class);
    
    // AI Insights
    Route::post('/ai/insights', [AIController::class, 'insights']);

    Route::apiResource('nikki-entries', NikkiEntryController::class);
    Route::post('nikki-entries/{nikkiEntry}/images', [NikkiEntryImageController::class, 'store']);
    Route::delete('nikki-entries/{nikkiEntry}/images/{image}', [NikkiEntryImageController::class, 'destroy']);
    Route::put('nikki-entries/{nikkiEntry}/images/reorder', [NikkiEntryImageController::class, 'reorder']);

    // Admin routes
    Route::middleware(AdminMiddleware::class)->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::put('/users/{user}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);
    });
});
