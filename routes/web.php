<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/player', function()
{
    
    if(!file_exists(base_path() . '/public/data/'. Session::get('pgeTinkerFilename') . '.js'))
    {
        return view('player-intro');
    }
    return view('player', [
        'pgeTinkerFilename' => Session::get('pgeTinkerFilename'),
    ]);
});


Route::get('/', function ()
{
    return view('app', [
        'pgeTinkerFilename' => Session::get('pgeTinkerFilename'),
        'code'              => file_get_contents(base_path() . '/public/data/'. Session::get('pgeTinkerFilename') . '.cpp'),
    ]);
});
