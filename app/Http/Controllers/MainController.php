<?php

 
namespace App\Http\Controllers;
 
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class MainController extends Controller
{
    
    // Web Route: /
    public function index()
    {
        return view('app', [
            'pgeTinkerFilename' => Session::get('pgeTinkerFilename'),
            'code'              => file_get_contents(base_path() . '/public/data/'. Session::get('pgeTinkerFilename') . '.cpp'),
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
    
    
    // API Route: GET /code/{id}
    public function get_code(Request $request)
    {

    }
    
    // API ROUTE: POST /code
    public function create_code(Request $request)
    {

    }
    
    // API ROUTE: PUT /code/{id}
    public function update_code(Request $request)
    {

    }
    
    // API Route: /compile
    public function build_and_run(Request $request)
    {
        return $this->compile($request);
    }
    
    // API Route: /share
    public function share(Request $request)
    {
        $base_data_path = base_path() . '/public/data/' . Session::get('pgeTinkerFilename');

        if(file_exists("{$base_data_path}.cpp") && file_exists("{$base_data_path}.js") && file_exists("{$base_data_path}.wasm"))
            return ['message' => 'can share'];
        
        return ['message' => 'can not world'];
    }

    private function compile(Request $request)
    {
        // cache original directory
        $original_directory = getcwd();
        
        // cache base data path
        $base_data_path = base_path() . '/public/data/' . Session::get('pgeTinkerFilename');

        // change working directory to laravel root
        chdir(base_path());
        
        // write the source file
        file_put_contents("{$base_data_path}.cpp", $request->get('code'));
        
        // initialize stdout/stderr buffers
        $stdout = null;
        $stderr = null;

        // open a process to our custom build script, pipe stdout/stderr streams
        $process = proc_open(
            base_path() . '/build-script.sh ' . Session::get('pgeTinkerFilename'), // command
            [1 => ['pipe', 'w'], 2 => ['pipe', 'w']],                              // define pipes
            $pipes                                                                 // handle for pipe streams
        );

        // read pipe 1 into $stdout, then close pipe 1
        $stdout = stream_get_contents($pipes[1]);
        fclose($pipes[1]);
        
        // read pipe 2 into $stderr, then close pipe 2
        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[2]);

        // close the process, to be tidy
        proc_close($process);
        
        // reset working directory
        chdir($original_directory);
        
        $out = $stdout . $stderr;
        
        // filter out stuff the end user doesn't need to know
        $out = str_replace("{$base_data_path}.cpp", "source.cpp", $out);
        $out = str_replace("{$base_data_path}.js", "source.js", $out);
        $out = str_replace("{$base_data_path}.wasm", "source.wasm", $out);
        $out = str_replace(base_path() . '/shared/include/', "", $out);
        $out = str_replace(base_path() . '/shared/include' , "include", $out);

        // your fans await your greatness!
        return [
            'messages'  => $out,
            'success' => (file_exists("{$base_data_path}.js") && file_exists("{$base_data_path}.wasm")),
        ];
    }

}
