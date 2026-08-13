<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Login Lockout
    |--------------------------------------------------------------------------
    |
    | After the maximum number of failed login attempts, sign-in is blocked
    | for the configured number of minutes.
    |
    */

    'max_login_attempts' => (int) env('MAX_LOGIN_ATTEMPTS', 5),

    'lockout_minutes' => (int) env('LOGIN_LOCKOUT_MINUTES', 15),

];
