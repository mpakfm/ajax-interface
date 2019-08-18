<?php

include_once __DIR__ . '/../vendor/autoload.php';

?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>AI Test</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
        <script
  src="https://code.jquery.com/jquery-3.4.1.min.js"
  integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="
  crossorigin="anonymous"></script>
        
        <!--<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>-->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.css" />
<script src="https://cdn.jsdelivr.net/gh/fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.js"></script>

    </head>
    <body>
        <script>
            
            var AI;
            $(document).ready(function () {
                AI = new ajaxInterface({helloModal: true, defaultLibrary: 'fancybox'});
            });
            
            $(document).ready(function () {
                $('#btn1').click(function(){
                    call1();
                });
                $('#btn2').click(function(){
                    call2();
                });
                $('#btn3').click(function(){
                    call3();
                });
            });
            
            function test() {
                alert('test');
            }
            
            function call1() {
                let data = {
                    action: 'test'
                }
                AI.send('/unknown.php', data);
            }
            
            function call2() {
                let data = {
                    action: 'testUnknown'
                }
                AI.send('/ajax.php', data);
            }
            
            function call3() {
                let data = {
                    action: 'test',
                    callback: clb
                }
                AI.send('/ajax.php', data);
            }
            
            function clb(response) {
                AI.simpleInfoMessage(response.message, 'Success', true);
            }
        </script>
        <h1>AI Test</h1>
        
        <div class="container">
            <div class="row">
                <div class="col-md-3 m-4">
                    <button id="btn1" type="button" class="btn btn-info">Get unknown url</button>
                </div>
                <div class="col-md-3 m-4">
                    <button id="btn2" type="button" class="btn btn-info">Get unknown action</button>
                </div>
                <div class="col-md-3 m-4">
                    <button id="btn3" type="button" class="btn btn-info">Open modal info</button>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <div id="response1"></div>
                </div>
            </div>
        </div>
        
        <?php \Mpakfm\AjaxInterface\Compiler::init();?>
    </body>
</html>
