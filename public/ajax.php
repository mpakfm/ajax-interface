<?php

include_once __DIR__ . '/../vendor/autoload.php';

class AjaxHandler extends \Mpakfm\AjaxInterface\AbstractAjaxHandler {
    
    public function testAction() {
        $this->result = true;
        $this->response['message'] = 'Good job!';
    }
}

$handler = new AjaxHandler();