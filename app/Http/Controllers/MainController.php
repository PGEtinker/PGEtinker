<?php

namespace App\Http\Controllers;
 
use App\Http\Controllers\Controller;
use App\Models\Code;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

use Kvz\YoutubeId\Converter;

class MainController extends Controller
{
    
    // POST /api/share
    public function Share(Request $request)
    {
        $sourceText = $request->get('code');
        $hashText = hash('sha256', $sourceText);
        
        // check database for existing source code
        $code = Code::where('hash_text', $hashText)->first();
        
        if($code == null)
        {
            // 
            $build_data = $this->build_and_report($request);

            if(!$build_data['success'])
            {
                return $build_data;
            }

            $code = new Code;
            $code->source_text = $sourceText;
            $code->hash_text   = $hashText;
            $code->save();
            $code->slug        = Converter::toAlphanumeric($code->id, 11, env('APP_KEY'));
            $code->save();

            // copy the files to their shared/id files.
            $base_data_path = base_path() . '/public/data';
            
            copy("{$base_data_path}/{$build_data['filename']}.wasm", "{$base_data_path}/{$code->slug}.wasm");
            
            file_put_contents(
                "{$base_data_path}/{$code->slug}.js",
                str_replace(
                    $build_data['filename'],
                    $code->slug,
                    file_get_contents("{$base_data_path}/{$build_data['filename']}.js")
                )
            );
            
        }
        
        Log::info("Shared: " . env('APP_URL') . "/{$code->slug}");

        // if we make it here, we need to create one!
        return [
            'success' => true,
            'message' => '',
            'slug' => $code->slug,
            'url' => env('APP_URL') . '/' . $code->slug
        ];
    }
    
    // GET /api/code/{slug}
    public function GetCode(String $slug)
    {
        Log::info("GET /api/code/{$slug}");
        
        $code = Code::find(Converter::toNumeric($slug, 11, env('APP_KEY')));
         
        // if no code exists, 404
        if($code == null)
        {
            Log::info("not found");
            return response([ "message" => "not found", "success" => false ], 404);
        }
            
        Log::info("found");
        
        // otherwise return code
        return response([ "code" => $code->source_text, "success" => true ], 200);
    }
    
    // GET /api/default-code
    public function GetDefaultCode(Request $request)
    {
        return response([ "code" => file_get_contents(base_path() . '/shared/default.cpp'), "success" => true ], 200);
    }
    
    // POST /api/compile
    public function Compile(Request $request)
    {
        return $this->build_and_report($request);
    }
    
    private function build_and_report(Request $request)
    {
        if(strlen($request->get('code')) > 50000)
        {
            Log::info('BUILD: attempted compile excessively sized code');
            
            return [
                'filename' => '',
                'message'  => 'Source code in excess of 50,000 characters.',
                'success' => false,
            ];
        }
        
        $base_data_path = base_path() . '/public/data';
        
        // cache original directory
        $original_directory = getcwd();
        
        // change working directory to laravel root
        chdir(base_path());

        // initialize stdout/stderr buffers
        $stdout = null;
        $stderr = null;

        // thanks Ciarán for pointing out this was needed
        if($this->tries_to_include_bad_files($request->get('code')))
        {
            Log::info('BUILD: attempted to include invalid header');

            // your fans await your greatness!
            return [
                'message'  => "Ah ah ah, you tried to include a file you're not supposed to see.",
                'success' => false,
            ];
        }
        
        // create a temp file
        $keepGoing = true;
        $attempt   = 0;
        $temp = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';

        do
        {
            $attempt++;
            $filename = "{$base_data_path}/" . 'pgetinker.';
            
            for($i = 0; $i < 11; $i++)
                $filename .= $temp[mt_rand(0, 63)];
            
            if(!file_exists("{$filename}.js"))
                $keepGoing = false;

        } while($keepGoing);

        Log::info("Create File: {$filename} in {$attempt} attempts.");

        // write the source file
        file_put_contents("{$filename}.cpp", $request->get('code'));

        $docker_filename = str_replace("{$base_data_path}/", "/src/", $filename);

        // open a process to our custom build script, pipe stdout/stderr streams
        $process = proc_open(
            base_path() . "/build-script.sh {$docker_filename}", // command
            [1 => ['pipe', 'w'], 2 => ['pipe', 'w']],     // define pipes
            $pipes                                        // handle for pipe streams
        );

        // read pipe 1 into $stdout, then close pipe 1
        $stdout = stream_get_contents($pipes[1]);
        fclose($pipes[1]);
        
        // read pipe 2 into $stderr, then close pipe 2
        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[2]);

        // close the process, to be tidy
        proc_close($process);
        
        // buffer for output;
        $out = $stdout . $stderr;

        // reset working directory
        chdir($original_directory);

        // remove temp file
        unlink("{$filename}.cpp");

        // filter out stuff the end user doesn't need to know
        $out = str_replace("{$docker_filename}.js", "source.js", $out);
        $out = str_replace("{$docker_filename}.wasm", "source.wasm", $out);
        $out = str_replace("{$docker_filename}.cpp", "source.cpp", $out);

        $out = str_replace("/src/third-party/olcPixelGameEngine/", "", $out);
        $out = str_replace("/src/third-party/olcSoundWaveEngine/", "", $out);

        // did we compile succcessfully?
        $success = file_exists("{$filename}.js") && file_exists("{$filename}.wasm");

        // filter filename
        $filename = str_replace(base_path() . "/public/data/", "", $filename);
        
        if($success)
            Log::info("BUILD: success");
        else
            Log::info("BUILD: fail");

        Log::info($out);

        return [
            "filename" => $filename,
            "message" => $out,
            "success" => $success,
        ];
    }
    
    // thanks Ciarán for pointing out this was needed
    private function tries_to_include_bad_files(String $code)
    {
        // find all #include directives
        preg_match_all("/#include ?(\"|<)(.*)(\"|>)/", $code, $matches);

        if(count($matches) != 4)
            return false;
        
        if(count($matches[2]) > 0)
        {
            foreach($matches[2] as $match)
            {
                if(strpos($match, "..") !== false) return true;
                if(strpos($match, "~/") !== false) return true;
                if(strpos($match, "/")  === 0)     return true;
            }
        }
        
        return false;
    }

}
