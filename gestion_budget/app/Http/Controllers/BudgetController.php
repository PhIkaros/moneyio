<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        return Budget::where('user_id', auth()->id())
            ->with('category')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'categorie_id' => 'nullable|exists:categories,id',
            'amount'       => 'required|numeric|min:0',
            'month'        => 'required|integer|between:1,12',
            'year'         => 'required|integer',
        ]);

        $budget = Budget::updateOrCreate(
            [
                'user_id'      => auth()->id(),
                'categorie_id' => $data['categorie_id'] ?? null,
                'month'        => $data['month'],
                'year'         => $data['year'],
            ],
            ['amount' => $data['amount']]
        );

        return response()->json($budget->load('category'), 201);
    }

    public function update(Request $request, Budget $budget)
    {
        abort_if($budget->user_id !== auth()->id(), 403);

        $budget->update($request->validate([
            'amount' => 'required|numeric|min:0',
        ]));

        return response()->json($budget->load('category'));
    }

    public function destroy(Budget $budget)
    {
        abort_if($budget->user_id !== auth()->id(), 403);
        $budget->delete();
        return response()->json(null, 204);
    }
}
