<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PageController;

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

Route::get('/player',            [ PageController::class, "player" ]);
Route::get('/player/{filename}', [ PageController::class, "player" ]);

Route::get('/embed/{slug}',      [ PageController::class, "player" ]);
Route::get('/s/{slug}',          [ PageController::class, "shared" ]);
Route::get('/',                  [ PageController::class, "index"  ]);
