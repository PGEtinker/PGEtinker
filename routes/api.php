<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MainController;

use App\Http\Controllers\BuildController;


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

// Legacy API

Route::get('/v0.1/code/{code}', [ MainController::class, "get_code" ]);

Route::post('/v0.1/reset',       [ MainController::class, "reset" ]);
Route::post('/v0.1/compile',     [ MainController::class, "build_and_run" ]);
Route::post('/v0.1/share',       [ MainController::class, "build_and_share" ]);
