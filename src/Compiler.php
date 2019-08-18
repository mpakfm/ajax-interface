<?php

namespace Mpakfm\AjaxInterface;

class Compiler {
    
    const JS_SRC = '/../js/ai.js';

    public static function init() {
        $jsFile = file_get_contents(__DIR__ . static::JS_SRC);
        echo '<script> ' . $jsFile . '</script>';
    }
}
