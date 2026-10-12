<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $notes = $request->user()
            ->notes()
            ->where('archived', false)
            ->orderByDesc('pinned')
            ->orderByDesc('updated_at')
            ->get();

        return response()->json($notes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
       $validated=  $request->validate([
            'title'   => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'items'   => 'nullable|array',
            'items.*.label' => 'required_with:items|string|max:255',
            'items.*.done'  => 'boolean',
            'items.*.order' => 'integer',
            'color'   => 'nullable|string|max:9',
            'pinned'  => 'boolean',
            'pinned_dashboard'  => 'boolean',
        ]);

        $note = $request->user()->notes()->create($validated);

        return response()->json($note, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Note $note)
    {    abort_if($note->user_id !== $request->user()->id, 403);

        return response()->json($note);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Note $note)
    {
        abort_if($note->user_id !== $request->user()->id, 403);

   $validated =      $request->validate([
            'title'    => 'nullable|string|max:255',
            'content'  => 'nullable|string',
            'items'    => 'nullable|array',
            'items.*.label' => 'required_with:items|string|max:255',
            'items.*.done'  => 'boolean',
            'items.*.order' => 'integer',
            'color'    => 'nullable|string|max:9',
            'pinned'   => 'boolean',
            'archived' => 'boolean',
                        'pinned_dashboard'  => 'boolean',

        ]);

        $note->update($validated);

        return response()->json($note);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Note $note)
    {
        abort_if($note->user_id !== $request->user()->id, 403);

        $note->delete();

        return response()->json(['message' => 'Note deleted successfully']);
    }
}
