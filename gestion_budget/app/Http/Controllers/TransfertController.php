<?php

namespace App\Http\Controllers;

use App\Models\Transfert;
use Illuminate\Http\Request;
use App\Models\Compte;
use Illuminate\Support\Facades\DB;

class TransfertController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $compteIds = $request->user()->comptes()->pluck('id');
        $transferts = Transfert::with('fromCompte', 'toCompte')
            ->whereIn('from_compte_id', $compteIds)
            ->orWhereIn('to_compte_id', $compteIds)
        ->get();

            return response()->json($transferts);
    }


    public function store(Request $request)
    {

        $request->validate([
            'from_compte_id' => 'required|exists:comptes,id',
            'to_compte_id' => 'required|exists:comptes,id|different:from_compte_id',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'date' => 'required|date',
        ]);

        $transfert = null;
        DB::transaction(function() use ($request, &$transfert){
            $source = Compte::find($request->from_compte_id);
            $destination = Compte::find($request->to_compte_id);

            $source->decrement('balance', $request->amount);
            $destination->increment('balance', $request->amount);

            $transfert = Transfert::create($request->only(['from_compte_id', 'to_compte_id', 'amount', 'date', 'description']));
        });

        $transfert->load('fromCompte', 'toCompte');
        return response()->json($transfert, 201);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Transfert $transfert)
    {

    $request->validate([
        'amount' => 'nullable|numeric|min:0',
        'description' => 'nullable|string',
        'date' => 'nullable|date',
    ]);

    if($request->has('amount')){
        DB::transaction(function () use ($request, $transfert){
            $source = Compte::find($transfert->from_compte_id);
           $destination = Compte::find($transfert->to_compte_id);

           //ribaaasu
           $source->increment('balance',$transfert->amount);
           $destination->decrement('balance', $transfert->amount);

           //atarashii transfer wo apply shimashouu
           $source->decrement('balance',$request->amount);
           $destination->increment('balance', $request->amount);
        });
    }

    $transfert->update($request->only([
        'amount', 'description','date'
    ]));

    $transfert->load('fromCompte', 'toCompte');
    return response()->json($transfert);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transfert $transfert)
    {
        DB::transaction(function()use ($transfert){
            $source = Compte::find($transfert->from_compte_id);
            $destination = Compte::find($transfert->to_compte_id);

            $source->increment('balance',$transfert->amount);
            $destination->decrement('balance',$transfert->amount);

            $transfert->delete();
        });
        return response()->json(['message'=>'Transfert deleted']);
    }
}
