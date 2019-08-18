<?php

namespace Mpakfm\AjaxInterface;

use Mpakfm\AjaxInterface\Localization as Loc;

class AbstractAjaxHandler {
    const DEFAUlT_ACTION = 'default';

    protected $request;
    protected $method;
    protected $errors   = [];
    protected $response = [];
    protected $data     = [];
    protected $result   = false;

    public function __construct($isBlackBox=true) {
        $this->request = new Request();

        if ($this->request->isPost()) {
            $this->method = ($this->request->getPost('action') ?? self::DEFAUlT_ACTION) . 'Action';
        } else {
            $this->method = ($this->request->getQuery('action') ?? self::DEFAUlT_ACTION) . 'Action';
        }

        if ($isBlackBox) {
            $this->handlerActions();
            $this->response();
        }
    }

    public function handlerActions() {
        try {

            if (!method_exists($this, $this->method)) {
                throw new \Exception(Loc::getMessage('ERROR_UNKNOWN_ACTION: #ACTION#', ['#ACTION#' => str_replace('Action', '', $this->method)]));
            }

            $method = $this->method;
            return $this->$method();
        } catch (\Throwable $t) {
            $this->errors[] = $t->getMessage();
        } catch (\Exception $e) {
            $this->errors[] = $e->getMessage();
        }
    }

    protected function preparePostFields(array $filter) {
        if (empty($this->request->getPostList())) {
            throw new \Exception(Loc::getMessage('ERROR_WRONG_PARAMETRS'));
        }

        return filter_input_array(INPUT_POST, $filter);
    }

    protected function prepareGetFields(array $filter) {
        if (empty($this->request->getQueryList())) {
            throw new \Exception(Loc::getMessage('ERROR_WRONG_PARAMETRS'));
        }
        return filter_input_array(INPUT_GET, $filter);
    }

    public function prepareFields(string $type, array $fields) {
        if (!in_array($type, ['GET', 'POST'])) {
            throw new \Exception(Loc::getMessage('ERROR_WRONG_PARAMETRS'));
        }
        $filter   = [];
        $required = [];

        foreach ($fields as $key => $param) {
            if (is_int($param)) {
                $filter[$key] = $param;
            } elseif (is_array($param)) {
                if (isset($param['filter'])) {
                    $filter[$key] = $param['filter'];
                }
                if (isset($param['required'])) {
                    $required[$key] = $param['required'];
                }
            }
        }

        if ($type == 'GET') {
            $this->data = $this->prepareGetFields($filter, $required);
        } else {
            $this->data = $this->preparePostFields($filter, $required);
        }

        foreach ($required as $field => $value) {
            if ($value && (!isset($this->data[$field]) || $this->data[$field] == '') ) {
                $fieldName = isset($fields[$field]['field']) ? $fields[$field]['field'] : $field;
                throw new \Exception(Loc::getMessage('ERROR_WRONG_FIELD', ['#FIELD#' => $fieldName]));
            }
        }
    }

    public function response() {
        $this->response['result'] = $this->result;
        $this->response['errors'] = $this->errors ?? null;
        if (!empty($this->response['errors'])) {
            $this->response['result'] = false;
        }
        $response = json_encode($this->response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_NUMERIC_CHECK);

        header('Content-Type: application/json');
        echo $response;
    }
}
