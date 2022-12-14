<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MainController;

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

Route::post('/reset',   [ MainController::class, "reset" ]);
Route::post('/compile', [ MainController::class, "build_and_run" ]);
Route::post('/share',   [ MainController::class, "build_and_share" ]);
