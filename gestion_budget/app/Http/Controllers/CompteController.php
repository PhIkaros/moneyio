<?php

namespace App\Http\Controllers;

use App\Models\Compte;
use Illuminate\Http\Request;

class CompteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
   $comptes = $request->user()->comptes;
   return response()->json($comptes);
        }

    /* public function create()
    {

    }

     */

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

       $request->validate([
        'name' => 'required|string|max:255',
        'balance' => 'required|numeric',
        'type' => 'required|string|in:bank,cash,savings',
       ]);

       $compte =$request->user()->comptes()->create($request->all());
       return response()->json($compte,201);
    }

    /**
     * Display the specified resource.
     */
    public function show( Request $request, Compte $compte)
    {abort_if($compte->user_id !== $request->user()->id, 403);
        return response()->json($compte);
    }

    /* public function edit(Compte $compte, Request $request)
    {

    }
     */


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Compte $compte)
    {abort_if($compte->user_id !== $request->user()->id, 403);
 $compte->update($request->all());
       return response()->json($compte);    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Compte $compte)
    {abort_if($compte->user_id !== $request->user()->id, 403);
      $compte->delete();
      return response()->json(['message' => 'Compte deleted successfully']);
    }
}
