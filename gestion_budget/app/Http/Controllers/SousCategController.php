<?php

namespace App\Http\Controllers;

use App\Models\SousCateg;
use Illuminate\Http\Request;

class SousCategController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $sousCategs= SousCateg::with('category')->get();
        return response()->json($sousCategs);
    }

    /**
     * Show the form for creating a new resource.
     */

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
              $request->validate(['name' => 'required|string|max:255',
       'description' => 'nullable|string',
       'categorie_id' => 'required|exists:categories,id']);

       $sousCateg= SousCateg::create($request->only(['name','description','categorie_id']));
       return response()->json($sousCateg,201);
    }

    /**
     * Display the specified resource.
     */


    /**
     * Show the form for editing the specified resource.
     */


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SousCateg $sousCateg)
    {
         $request->validate([
            'name' => 'nullable|string',
            'description' => 'nullable|string',
            'categorie_id' => 'nullable|exists:categories,id',
        ]);


        $sousCateg->update($request->only(['name', 'description', 'categorie_id']));
        return response()->json($sousCateg);

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SousCateg $sousCateg)
    {
        $sousCateg->delete();
        return response()->json(['message' => 'Sous-catégorie deleted'],204);
    }
}
