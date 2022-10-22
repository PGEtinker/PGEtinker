<?php

 
namespace App\Http\Controllers;
 
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use App\Models\Code;

class PageController extends Controller
{
    // Web Route: /
    public function index(Request $request)
    {
        return view('app', [
            'pgeTinkerFilename' => Session::get('pgeTinkerFilename'),
            'code'              => file_get_contents(base_path() . '/public/data/'. Session::get('pgeTinkerFilename') . '.cpp'),
        ]);
    }
    
    // Web Route: /{shared}
    public function shared(Request $request)
    {
        $codeSlug = ltrim($request->getRequestUri(), '/');

        $codeFromDB = Code::where('slug', $codeSlug)->first();
        $code = '';

        if($codeFromDB)
        {
            $base_data_path = base_path() . '/public/data/' . Session::get('pgeTinkerFilename');

            if(file_exists("{$base_data_path}.js"))   unlink("{$base_data_path}.js");
            if(file_exists("{$base_data_path}.wasm")) unlink("{$base_data_path}.wasm");

            file_put_contents(base_path() . '/public/data/'. Session::get('pgeTinkerFilename') . '.cpp', $codeFromDB->text);
            $code = $codeFromDB->text;
        }
        
        return view('app', [
            'pgeTinkerFilename' => Session::get('pgeTinkerFilename'),
            'code'              => $code,
        ]);
    }

    // Web Route: /player
    public function player()
    {
        // if we don't have a compiled version to display, show the intro screen
        if(!file_exists(base_path() . '/public/data/'. Session::get('pgeTinkerFilename') . '.js'))
            return view('player-intro');
            
        return view('player', [
            'pgeTinkerFilename' => Session::get('pgeTinkerFilename'),
        ]);
    }
}
