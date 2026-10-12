<?php

namespace App\Http\Controllers;

use App\Models\NikkiEntry;
use App\Models\NikkiEntryImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NikkiEntryImageController extends Controller
{
    public function store(Request $request, NikkiEntry $nikkiEntry)
    {
        abort_if($nikkiEntry->user_id !== $request->user()->id, 403);

        $request->validate([
            'images'   => 'required|array',
            'images.*' => 'image|max:4096',
        ]);

        $lastOrder = $nikkiEntry->images()->max('order') ?? -1;

        $uploaded = [];

        foreach ($request->file('images') as $index => $image) {

            $path = $image->store(
                "nikki/{$nikkiEntry->id}",
                'public'
            );

            $uploaded[] = $nikkiEntry->images()->create([
                'path'  => $path,
                'order' => $lastOrder + $index + 1,
            ]);
        }

        return response()->json($uploaded, 201);
    }

    public function destroy(
        Request $request,
        NikkiEntry $nikkiEntry,
        NikkiEntryImage $image
    ) {

        abort_if($nikkiEntry->user_id !== $request->user()->id, 403);

        abort_if(
            $image->nikki_entry_id !== $nikkiEntry->id,
            403
        );

        Storage::disk('public')->delete($image->path);

        $image->delete();

        return response()->json([
            'message' => 'Image deleted'
        ]);
    }

    public function reorder(
        Request $request,
        NikkiEntry $nikkiEntry
    ) {

        abort_if($nikkiEntry->user_id !== $request->user()->id, 403);

        $request->validate([
            'order'   => 'required|array',
            'order.*' => 'integer|exists:nikki_entry_images,id',
        ]);

        foreach ($request->order as $position => $imageId) {

            $nikkiEntry
                ->images()
                ->where('id', $imageId)
                ->update([
                    'order' => $position
                ]);
        }

        return response()->json([
            'message' => 'Reordered'
        ]);
    }
}
