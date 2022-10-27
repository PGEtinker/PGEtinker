<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\MainController;

Route::post('/share',       [ MainController::class, "Share"]);
Route::get('/code/{code}',  [ MainController::class, "GetCode"]);
Route::get('/default-code', [ MainController::class, "GetDefaultCode"]);
Route::post('/compile',     [ MainController::class, "Compile"]);
