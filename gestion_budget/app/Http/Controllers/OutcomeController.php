<?php

namespace App\Http\Controllers;

use App\Models\Compte;
use App\Models\Outcome;
use Illuminate\Http\Request;

class OutcomeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $outcomes = $request->user()->comptes()
        ->with('outcomes.sousCateg.category', 'outcomes.compte')
        ->get()
        ->pluck('outcomes')
        ->flatten();

        return response()->json($outcomes);
    }



    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
    $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'description' => 'nullable|string',
            'compte_id' => 'required|exists:comptes,id',
            'sous_categ_id' => 'nullable|exists:sous_categs,id',
        ]);

        $outcome = Outcome::create(array_merge(
            $request->only(['amount', 'date', 'description', 'compte_id']),
            ['sous_categ_id' => $request->sous_categ_id ?? null]
        ));
$compte = Compte::find($request->compte_id);
     $compte->decrement('balance', $request->amount);
     $outcome->load(['compte', 'sousCateg.category']);
     return response()->json($outcome,201);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Outcome $outcome)
    {
      if($request->has('amount')){
        $oldAmount = $outcome->amount;
        $newAmount = $request->amount;
         $difference = $newAmount - $oldAmount;

        $compte = Compte::find($outcome->compte_id);
        $compte->decrement('balance',$difference);

      }

      $outcome->update($request->only(['amount', 'date', 'description', 'sous_categ_id']));
        return response()->json($outcome);
    }

    public function destroy(Outcome $outcome)
    {
        $compte = Compte::find($outcome->compte_id);
        $compte->increment('balance', $outcome->amount);
        $outcome->delete();
        return response()->json(['message' => 'Outcome deleted'],204);
    }
}
