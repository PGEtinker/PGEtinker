<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class PGETinkerFilename
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $dataPath = base_path() . '/public/data';
        
        if(!Session::has('pgeTinkerFilename'))
        {
            // cheap semaphore
            Session::put('pgeTinkerFilename', 'default');

            // in the off, off, off, off, off, off chance we get a
            // duplicate, ensure unique.
            $keepGoing = true;
            $filename  = null;

            while($keepGoing)
            {
                $filename = Str::uuid();
                
                if(!file_exists("{$dataPath}/{$filename}.cpp"))
                {
                    Session::put('pgeTinkerFilename', $filename);
                    $keepGoing = false;
                }
            }
            
            Log::info("Created file {$dataPath}/{$filename}.cpp");

        } // !has('pgeTinkerFilename')

        // ensure C++ file exists
        if(!file_exists($dataPath . '/' . Session::get('pgeTinkerFilename') . '.cpp'))
            copy(base_path() . '/shared/default.cpp', $dataPath . '/' . Session::get('pgeTinkerFilename') . '.cpp');
        
        return $next($request);
    }
}
