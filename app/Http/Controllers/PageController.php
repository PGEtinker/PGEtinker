<?php

 
namespace App\Http\Controllers;
 
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Code;

class PageController extends Controller
{
    // Web Route: /
    public function index()
    {
        return view('app', [ 'slug' => 'null', ]);
    }
    
    // Web Route: /player/{filename}
    public function player(String $filename = '')
    {
        // if we don't have a compiled version to display, show the intro screen
        if(!file_exists(base_path() . "/public/data/{$filename}.js"))
            return view('player-intro');
            
        return view('player', [ 'pgeTinkerFilename' => $filename, ]);
    }

    // Web Route: /{slug}
    public function shared(String $slug)
    {
        
        $code = Code::where('slug', $slug)->first();
        
        if($code == null)
            return response()->view('not-found', [], 404);

        return view('app', [ 'slug' => $slug ]);
    }

}
