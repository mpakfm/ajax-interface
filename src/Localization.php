<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace Mpakfm\AjaxInterface;

class Localization {

    public static function getMessage(string $code, array $data = []): string {
        if (empty($data)) {
            return $code;
        }
        foreach ($data as $key => $val) {
            $code = str_replace($key, $val, $code);
        }
        return $code;
    }
}