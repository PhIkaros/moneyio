<?php

namespace App\Http\Controllers;

use App\Models\NikkiEntry;
use Illuminate\Http\Request;

class NikkiEntryController extends Controller
{
    public function index(Request $request)
    {
        return NikkiEntry::where('user_id', $request->user()->id)
            ->orderBy('date', 'desc')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'   => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'date'    => 'required|date',
        ]);

        $entry = NikkiEntry::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'date'    => $data['date'],
            ],
            [
                'title'   => $data['title'] ?? 'Untitled',
                'content' => $data['content'] ?? '',
            ]
        );

        return response()->json($entry, 201);
    }

    public function show(NikkiEntry $nikkiEntry)
    {
        abort_if($nikkiEntry->user_id !== auth()->id(), 403);
        return response()->json($nikkiEntry);
    }

    public function update(Request $request, NikkiEntry $nikkiEntry)
    {
        abort_if($nikkiEntry->user_id !== $request->user()->id, 403);

        $data = $request->validate([
            'title'   => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'date'    => 'nullable|date',
        ]);

        $nikkiEntry->update($data);

        return response()->json($nikkiEntry);
    }

    public function destroy(NikkiEntry $nikkiEntry)
    {
        abort_if($nikkiEntry->user_id !== auth()->id(), 403);
        $nikkiEntry->delete();
        return response()->json(null, 204);
    }
}
