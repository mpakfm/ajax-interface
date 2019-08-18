<?php

namespace Mpakfm\AjaxInterface;

class Request {
    
    private $request;
    private $get;
    private $post;
    private $files;
    private $cookie;


    public function __construct() {
        $this->request = $_REQUEST;
        $this->get = $_GET;
        $this->post = $_POST;
        $this->cookie = $_COOKIE;
    }
    
    public function isPost(): bool {
        return !empty($this->post);
    }
    
    public function getPost($key) {
        return $this->post[$key]??null;
    }
    
    public function getQuery($key) {
        return $this->request[$key]??null;
    }
}
