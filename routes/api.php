<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

Route::post('/compile', function(Request $request)
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
            // 'file'    => Session::get('pgeTinkerFilename'),
            'messages'  => $out,
            'success' => (file_exists("{$base_data_path}.js") && file_exists("{$base_data_path}.wasm")),
        ];    
});