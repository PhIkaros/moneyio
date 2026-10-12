<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Income;
use App\Models\Outcome;
use App\Models\Transfert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function dashboard()
    {
        $totalUsers = User::count();
        $totalIncomes = Income::count();
        $totalOutcomes = Outcome::count();
        $totalTransfers = Transfert::count();
        $totalTransactions = $totalIncomes + $totalOutcomes + $totalTransfers;

        $totalIncomeAmount = Income::sum('amount');
        $totalExpenseAmount = Outcome::sum('amount');

        // Most active users (by transaction count)
        $mostActive = User::select('users.id', 'users.name', 'users.email', 'users.avatar', 'users.role', 'users.is_active', 'users.created_at')
            ->leftJoin('comptes', 'comptes.user_id', '=', 'users.id')
            ->leftJoin('incomes', 'incomes.compte_id', '=', 'comptes.id')
            ->selectRaw('COUNT(incomes.id) as transaction_count')
            ->groupBy('users.id', 'users.name', 'users.email', 'users.avatar', 'users.role', 'users.is_active', 'users.created_at')
            ->orderByDesc('transaction_count')
            ->limit(5)
            ->get();

        // New signups over time (last 12 months)
        $signups = User::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count")
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'total_users'          => $totalUsers,
            'total_transactions'   => $totalTransactions,
            'total_income_amount'  => $totalIncomeAmount,
            'total_expense_amount' => $totalExpenseAmount,
            'most_active_users'    => $mostActive,
            'signups_over_time'    => $signups,
        ]);
    }

    public function users()
    {
        $users = User::withCount([
            'comptes',
        ])->orderByDesc('created_at')->get();

        return response()->json($users);
    }

    public function updateUser(Request $request, User $user)
    {
        $data = $request->validate([
            'role'      => 'sometimes|string|in:user,admin',
            'is_active' => 'sometimes|boolean',
        ]);

        $user->update($data);

        return response()->json($user);
    }

    public function deleteUser(User $user)
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Cannot delete yourself.'], 422);
        }

        $user->delete();

        return response()->json(null, 204);
    }
}
