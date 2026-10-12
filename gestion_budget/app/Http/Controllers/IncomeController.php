<?php

namespace App\Http\Controllers;

use App\Models\Income;
use App\Models\Compte;
use Illuminate\Http\Request;

class IncomeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $incomes = $request->user()->comptes()
        ->with('incomes.sousCateg')
        ->get()->pluck('incomes')
        ->flatten();

        return response()->json($incomes);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'description' => 'nullable|string',
            'compte_id' => 'required|exists:comptes,id',
            'sous_categ_id' => 'nullable|exists:sous_categs,id',
        ]);

        $income = Income::create(array_merge(
            $request->only(['amount', 'date', 'description', 'compte_id']),
            ['sous_categ_id' => $request->sous_categ_id ?? null]
        ));

        $compte = $request->user()->comptes()->findOrFail($request->compte_id);// finds the compte assosiated with the income and the loggedin user , no adding to other user's compte
        $compte->increment('balance', $request->amount); //Add income to le compte glooball's balance
        $income->load(['compte', 'sousCateg']);
        return response()->json($income, 201);
    }


    /**
     * Update the specified resource in storage.
     */
   public function update(Request $request, Income $income)
{
    if ($request->has('amount')) {
        $oldAmount = $income->amount; // get old amount BEFORE updating
        $newAmount = $request->amount;
        $difference = $newAmount - $oldAmount;

        $compte = Compte::find($income->compte_id);
        $compte->increment('balance', $difference);
    }

    // update AFTER the balance logic
    $income->update($request->only([
        'amount', 'date', 'description', 'sous_categ_id'
    ]));

    return response()->json($income);
}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Income $income)
    {
        $income->compte->decrement('balance',$income->amount);
        $income->delete();
    }
}
