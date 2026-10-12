<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Income;
use App\Models\Outcome;
use App\Models\Budget;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class AIController extends Controller
{
    public function insights(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $now = Carbon::now();
            $currentMonth = $now->month;
            $currentYear = $now->year;
            $previousMonth = $now->copy()->subMonth();
            $language = $request->input('language', 'en');

            // Fetch incomes for current month
            $currentIncomes = Income::with(['sousCateg'])
                ->whereHas('compte', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->whereMonth('date', $currentMonth)
                ->whereYear('date', $currentYear)
                ->get();

            // Fetch outcomes for current month
            $currentOutcomes = Outcome::with(['sousCateg'])
                ->whereHas('compte', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->whereMonth('date', $currentMonth)
                ->whereYear('date', $currentYear)
                ->get();

            // Fetch outcomes for previous month
            $prevOutcomes = Outcome::whereHas('compte', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->whereMonth('date', $previousMonth->month)
                ->whereYear('date', $previousMonth->year)
                ->get();

            $totalTxnsCount = $currentIncomes->count() + $currentOutcomes->count();

            // Total transactions check
            if ($totalTxnsCount < 5) {
                return response()->json([
                    'success' => true,
                    'insight' => 'It looks like you have fewer than 5 transactions this month. Keep using the app and tracking your spending, and check back later for personalized financial insights!',
                    'generated_at' => now()->toIso8601String()
                ]);
            }

            // Calculate current month stats
            $totalIncome = $currentIncomes->sum('amount');
            $totalExpense = $currentOutcomes->sum('amount');
            $netSavings = $totalIncome - $totalExpense;

            // Calculate previous month expenses
            $prevExpense = $prevOutcomes->sum('amount');
            $expenseChange = $prevExpense > 0 ? (($totalExpense - $prevExpense) / $prevExpense) * 100 : 0;

            // Monthly budget (global budget, where categorie_id is null)
            $globalBudget = Budget::where('user_id', $user->id)
                ->where('month', $currentMonth)
                ->where('year', $currentYear)
                ->whereNull('categorie_id')
                ->first();

            $monthlyBudgetAmount = $globalBudget ? $globalBudget->amount : 0;
            $remainingBudget = $monthlyBudgetAmount > 0 ? $monthlyBudgetAmount - $totalExpense : null;
            $budgetUsagePct = $monthlyBudgetAmount > 0 ? ($totalExpense / $monthlyBudgetAmount) * 100 : null;

            // Top 3 categories
            $categories = [];
            foreach ($currentOutcomes as $txn) {
                $catName = $txn->sousCateg->name ?? $txn->description ?? 'Other';
                if (!isset($categories[$catName])) {
                    $categories[$catName] = 0;
                }
                $categories[$catName] += $txn->amount;
            }
            arsort($categories);
            $top3 = array_slice($categories, 0, 3, true);

            // Largest single expense
            $largestExpense = $currentOutcomes->sortByDesc('amount')->first();

            // Build summary string for the prompt
            $summaryLines = [
                "Total Income: " . number_format($totalIncome, 2),
                "Total Expenses: " . number_format($totalExpense, 2),
                "Net Savings: " . number_format($netSavings, 2),
            ];

            if ($monthlyBudgetAmount > 0) {
                $summaryLines[] = "Monthly Budget: " . number_format($monthlyBudgetAmount, 2);
                $summaryLines[] = "Remaining Budget: " . number_format($remainingBudget, 2);
                $summaryLines[] = "Budget Usage: " . number_format($budgetUsagePct, 1) . "%";
            }

            $summaryLines[] = "Percentage Change in Expenses (vs Last Month): " . number_format($expenseChange, 1) . "%";
            $summaryLines[] = "Total Transactions This Month: " . $totalTxnsCount;

            if (!empty($top3)) {
                $summaryLines[] = "Top 3 Spending Categories:";
                foreach ($top3 as $cat => $amt) {
                    $summaryLines[] = "- $cat: " . number_format($amt, 2);
                }
            }

            if ($largestExpense) {
                $catName = $largestExpense->sousCateg->name ?? 'Unknown';
                $summaryLines[] = "Largest Single Expense: {$largestExpense->description} ($catName) - " . number_format($largestExpense->amount, 2);
            }

            $financialSummary = implode("\n", $summaryLines);

$systemPrompt = <<<PROMPT
You are Monio AI, a friendly and encouraging personal finance coach.

Speak directly to the user in a warm, conversational tone.

Format your response using Markdown.

Always structure your response like this:

# 🌟 Monthly Financial Summary

A short overview of the user's financial situation.

## 👍 What's Going Well

- Mention 2-3 positive observations first whenever possible.

## ⚠️ Things to Watch

- Mention spending trends or budget concerns.
- Only mention concerns that are supported by the provided data.

## 💡 Suggestions

Provide 2-3 practical, personalized suggestions the user can apply.

Guidelines:

- Use **bold** for important numbers and categories.
- Use emojis naturally (📈 💰 🎉 ⚠️) but don't overdo them.
- Keep paragraphs short and easy to read.
- Sound supportive and motivating, not like a bank statement.
- Base every statement only on the provided financial summary.
- Never invent transactions, categories, dates, or numbers.
- If some information is missing, continue giving useful advice based on what is available instead of repeatedly saying there isn't enough data.

Keep the response between 120 and 180 words.

IMPORTANT: You MUST respond entirely in the requested language.
Requested Language: {$language}
PROMPT;
            $groqApiKey = env('GROQ_API_KEY');
            if (empty($groqApiKey)) {
                return response()->json(['error' => 'API key is not configured.'], 500);
            }

            $model = env('GROQ_MODEL', 'llama-3.3-70b-versatile');

            $response = Http::withToken($groqApiKey)
                ->timeout(15)
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => $model,
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => "Here is my financial summary for this month:\n\n" . $financialSummary]
                    ],
                    'max_tokens' => 300,
                    'temperature' => 0.7,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $insight = $data['choices'][0]['message']['content'] ?? 'No insight generated.';

                return response()->json([
                    'success' => true,
                    'insight' => trim($insight),
                    'generated_at' => now()->toIso8601String()
                ]);
            } else {
                Log::error('Groq API Error', ['response' => $response->body()]);
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to generate insights. Please try again later.'
                ], 502);
            }

        } catch (\Exception $e) {
            Log::error('AI Insights Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'An unexpected error occurred while generating insights.'
            ], 500);
        }
    }
}
