<?php

 
namespace App\Http\Controllers;
 
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use App\Models\Code;
use Kvz\YoutubeId\Converter;

class MainController extends Controller
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
    
    public function get_code(Request $request)
    {
        $base_include_path = base_path() . '/shared/include';
        $codeFile = str_replace('/api/code/', '', $request->getRequestUri());

        if(strpos($codeFile, '../') !== false)
            return [ "message" => "illegal file name", "success" => false, ];
        
        if(file_exists("{$base_include_path}/{$codeFile}"))
        {
            return [
                "code" => file_get_contents("{$base_include_path}/{$codeFile}"),
                "success" => true,
            ];
        }

        return [
            "message" => "file not found",
            "success" => false,
        ];
    }

    // API Route: /compile
    public function build_and_run(Request $request)
    {
        return $this->compile($request);
    }
    
    // API Route: /reset
    public function reset()
    {
        $base_data_path = base_path() . '/public/data/' . Session::get('pgeTinkerFilename');
        
        if(file_exists("{$base_data_path}.cpp"))  unlink("{$base_data_path}.cpp");
        if(file_exists("{$base_data_path}.js"))   unlink("{$base_data_path}.js");
        if(file_exists("{$base_data_path}.wasm")) unlink("{$base_data_path}.wasm");
        return [];
    }

    // API Route: /share
    public function build_and_share(Request $request)
    {
        $compile = $this->compile($request);
        $share   = [];

        // if we compiled successfully, let's actually store it
        if($compile['success'])
        {
            $code = new Code;
            $code->text = $request->get('code');
            $code->slug = '';
            $code->save();

            $code->slug = Converter::toAlphanumeric($code->id, 11, env('APP_KEY'));
            $code->save();

            $share[ 'url' ] = env('APP_URL') . '/' . $code->slug;
        }
        
        // no matter what happens, we return the result
        return array_merge($compile, $share);
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

        // thanks Ciarán for pointing out this was needed
        if($this->tries_to_include_bad_files($request->get('code')))
        {
            // your fans await your greatness!
            return [
                'messages'  => "Ah ah ah, you tried to include a file you're not supposed to see.",
                'success' => false,
            ];
        }

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
    
    // thanks Ciarán for pointing out this was needed
    private function tries_to_include_bad_files(String $code)
    {
        $filters = [
            '#include "/',
            '#include </',
        ];
        
        $found = false;

        foreach($filters as $filter)
        {
            if(strpos($code, $filter) !== false)
                $found = true;
        }
        
        return $found;
    }
}
