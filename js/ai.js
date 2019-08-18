var AI_JQUERY_ERROR = "You need to include jQuery library to use AjaxInterface.";
var AI_ERROR      = "You need to define var aiParams as object whith field 'site' to use AI library: \n";
var AI_ERROR_CODE = "var aiParams{url: '<?=\Synergy\Helpers\Tools::getMainSiteUrl();?>'}; ";

var BOOTSTRAP3_CSS_URL = 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css';
var BOOTSTRAP4_CSS_URL = 'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css';
var BOOTSTRAP3_JS_URL  = 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js';
var BOOTSTRAP4_JS_URL  = 'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js';

class ajaxInterface {
    constructor(params) {
        this.helloModal  = false;
        this.defaultLibrary        = 'bootstrap';
        this.defaultLibraryVersion = 4;

        this.bootstrapVersion = null;
        this.fancyboxVersion = null;
        this.modalResponseId = 'modalAiResponse';

        this._readyFn = [];
        this._errors      = [];

        // Очень нужная штука для поиска регуляркой внутри атрибутов.
        // Используется для проверки есть ли на странице bootstrap.css и какой версии (3/4)
        // Для последующей подгрузки соотв. js если его нет
        jQuery.expr[':'].regex = function(elem, index, match) {
            var matchParams = match[3].split(','),
                validLabels = /^(data|css):/,
                attr = {
                    method: matchParams[0].match(validLabels) ?
                        matchParams[0].split(':')[0] : 'attr',
                    property: matchParams.shift().replace(validLabels,'')
                },
                regexFlags = 'ig',
                regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g,''), regexFlags);
            return regex.test(jQuery(elem)[attr.method](attr.property));
        }

        for (let param in params) {
            this[param] = params[param];
        }

        if (this.defaultLibrary == 'bootstrap') {
            this.getBootstrapVersion();
            this.checkBootstrap();
        } else if (this.defaultLibrary == 'fancybox') {
            this.getFancyboxVersion();
            this.checkFancybox();
        } else {
            alert('Unknown js library. Sorry.');
        }
    }

    get readyFn () {
        return this._readyFn;
    }

    set readyFn (fn) {
        this._readyFn.push(fn);
    }

    get errors () {
        return this._errors;
    }

    getProperties() {
        let prop = [];
        for (var p in this) {
            if (p[0] == '_') {
                continue;
            }
            prop.push(p + ': ' + this[p]);
        }
        return prop.join("\n");
    }

    init() {
        for (let fn of this._readyFn) {
            fn();
        }
        if (this.helloModal) {
            var listProperties = this.getProperties();
            var message = 'JS Library: ' + (this.bootstrapVersion?'Bootstrap':'Fancybox');
            var text = this.escapeHtml(message + "\n" +listProperties, true);
            this.simpleInfoMessage(text, 'Success');
        }
    }

    alertInitFail(message) {
        alert(message);
    }
    
    checkFancybox() {
        if ($('#modalAiResponse').length == 0 || $('#modalAiResponse').length > 1) {
            this.renderResponseModal();
        }
        this.checkParams();
    }

    checkBootstrap() {
        var bootstrapCss = $('link:regex(href, .*bootstrap.*)');
        if (!bootstrapCss.length) {
            this.alertInitFail('bootstrap.css not found');
        }
        if (!this.bootstrapVersion) {
            this.alertInitFail('bootstrap.js not found');
        } else {
            if ($('#modalAiResponse').length == 0 || $('#modalAiResponse').length > 1) {
                this.renderResponseModal();
            }
            this.checkParams();
        }
    }

    checkParams() {
        if (typeof $.ajax == 'undefined') {
            this.simpleWarningMessage('Unknown $.ajax function. Check out you jquery libray, maybe this is a slim version.');
            return;
        }
        this.init();
    }

    getBootstrapVersion() {
        if (this.bootstrapVersion) {
            return this.bootstrapVersion;
        }
        try {
            let version = $.fn.tooltip.Constructor.VERSION.split('.');
            this.bootstrapVersion = version[0];
            return this.bootstrapVersion;
        } catch(e) {
            return null;
        }
    }
    
    getFancyboxVersion() {
        if (this.fancyboxVersion) {
            return this.fancyboxVersion;
        }
        if (typeof $.fancybox == 'undefined') {
            this.alertInitFail('fancybox not found');
        }
        try {
            let version = $.fancybox.version.split('.');
            this.fancyboxVersion = version[0];
            return this.fancyboxVersion;
        } catch(e) {
            return null;
        }
        
    }

    renderResponseModal() {
        var modal;
        if (this.bootstrapVersion && this.bootstrapVersion < 4) {
            modal = '<div id="' + this.modalResponseId + '" class="modal fade">\n' +
                '    <div class="modal-dialog">\n' +
                '        <div class="modal-content" style="padding: 10px;">\n' +
                '            <div class="modal-header">\n' +
                '                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>\n' +
                '                <h4 class="modal-title"></h4>\n' +
                '            </div>\n' +
                '            <div class="modal-body">\n' +
                '                <div class="alert"></div>\n' +
                '            </div>\n' +
                '        </div>\n' +
                '    </div>\n' +
                '</div>';

        } else if (this.bootstrapVersion && this.bootstrapVersion >= 4) {
            modal = '<div class="modal fade" id="' + this.modalResponseId + '" tabindex="-1" role="dialog" aria-labelledby="' + this.modalResponseId + 'Label" aria-hidden="true">\n' +
                '  <div class="modal-dialog" role="document">\n' +
                '    <div class="modal-content">\n' +
                '      <div class="modal-header">\n' +
                '        <h5 class="modal-title""></h5>\n' +
                '        <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
                '          <span aria-hidden="true">&times;</span>\n' +
                '        </button>\n' +
                '      </div>\n' +
                '      <div class="modal-body">\n' +
                '        <div class="alert"></div>\n' +
                '      </div>\n' +
                '    </div>\n' +
                '  </div>\n' +
                '</div>';
        } else if (this.fancyboxVersion >= 3) {
            modal = '<div id="' + this.modalResponseId + '" class="p-5" style="display: none;max-width:600px;">\n' +
                        '<h2 class="modal-title">\n' +
                            'I`m a modal!\m' +
                        '</h2>\n' +
                        '      <div class="modal-body">\n' +
                '        <div class="alert"></div>\n' +
                '      </div>\n' +
                    '</div>';
        }
        $('body').append(modal);
    }

    simpleInfoMessage(message, title, large) {
        this.clearMessageClasses();
        $('#' + this.modalResponseId + ' .alert').addClass('alert-info');
        return this.simpleMessage(message, title, large);
    }

    simpleInfoMessage(message, title, large) {
        this.clearMessageClasses();
        $('#' + this.modalResponseId + ' .alert').addClass('alert-success');
        return this.simpleMessage(message, title, large);
    }

    simpleWarningMessage(message, title, large) {
        this.clearMessageClasses();
        $('#' + this.modalResponseId + ' .alert').addClass('alert-danger');
        return this.simpleMessage(message, title, large);
    }

    clearMessageClasses() {
        $('#' + this.modalResponseId + ' .alert').empty().removeClass('alert-danger').removeClass('alert-success').removeClass('alert-info').show();
    }

    simpleMessage(message, title, large) {
        if (typeof large != 'undefined' && large === true) {
            $('#' + this.modalResponseId).find('.modal-dialog').addClass('modal-lg');
        } else {
            $('#' + this.modalResponseId).find('.modal-dialog').removeClass('modal-lg');
        }

        $('#' + this.modalResponseId).find('.modal-title').text(title);

        if (typeof title == 'undefined') {
            title = 'VIM: Very Important Message';
        }

        if (typeof message == 'array') {
            for (var i in message) {
                $('#' + this.modalResponseId + ' .alert').append('<p>' + message[i] + '</p>');
            }
        } else if (message != ''){
            $('#' + this.modalResponseId + ' .alert').append('<p>' + message + '</p>');
        } else {
            $('#' + this.modalResponseId + ' .alert').hide();
        }
        $('#' + this.modalResponseId).find('.modal-title').text(title);
        if (this.defaultLibrary == 'bootstrap') {
            $('#' + this.modalResponseId).modal('show');
        } else if (this.defaultLibrary == 'fancybox') {
            var self = this;
            var instance = $.fancybox.open(
                $('#' + self.modalResponseId), {
                    touch: false
                }
            );
        }
        
    }

    // Для простого окна с ответом, предварительная отрисовка окна
    preResponse(title, large) {
        if (typeof large != 'undefined' && large === true) {
            $('#' + this.modalResponseId).find('.modal-dialog').addClass('modal-lg');
        } else {
            $('#' + this.modalResponseId).find('.modal-dialog').removeClass('modal-lg');
        }
        $('#' + this.modalResponseId + ' .alert').empty().removeClass('alert-danger').removeClass('alert-success');
        $('#' + this.modalResponseId).find('.modal-title').text(title);
        $('#' + this.modalResponseId).modal('show');
    }

    // Для простого окна с ответом, результат в окне
    successResponse(result) {
        var title, text;
        $('#' + this.modalResponseId).css('cursor', 'default');
        $('#' + this.modalResponseId + ' .alert').empty().removeClass('alert-danger').removeClass('alert-success');
        if (!result.result) {
            title = 'Ошибка операции';
            $('#' + this.modalResponseId).find('.alert').addClass('alert-danger');
            if (typeof result.error == 'array') {
                for (var i in result.error) {
                    $('#' + this.modalResponseId + ' .alert').append('<p>' + result.error[i] + '</p>');
                }
            } else {
                $('#' + this.modalResponseId + ' .alert').append('<p>' + result.error + '</p>');
            }

        } else if (result.message) {
            title = 'Операция удалась';
            text  = result.message;
            $('#' + this.modalResponseId).find('.alert').addClass('alert-success');
        } else {
            title = 'Операция удалась';
            text  = 'Операция прошла успешно.';
            $('#' + this.modalResponseId).find('.alert').addClass('alert-success');
        }
        $('#' + this.modalResponseId).find('.modal-title').text(title);
        $('#' + this.modalResponseId).find('.alert').text(text);
        //$('#' + this.modalResponseId).modal
        $('#' + this.modalResponseId).modal('show');
    }

    ready(fn) {
        this._readyFn.push(fn);
    }

    escapeHtml(text, withSpaces) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        text = text.replace(/[&<>"']/g, function(m) { return map[m]; });
        if (typeof withSpaces != 'undefined' && withSpaces) {
            text = text.replace(/\n/g, '<br/>');
            return text.replace(/\s/g, '&nbsp;');
        }

        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    /**
     * Основной интерфейс отправки данных
     *
     * @param url
     * @param data
     */
    send(url, data) {
        var callbackFn = null;
        var method     = 'POST';
        var fields     = {};

        if (typeof data.callback != 'undefined') {
            callbackFn = data.callback;
            delete data.callback;
        }

        if (typeof data.method != 'undefined' && $.inArray(data.method, ['POST', 'GET'])) {
            method = data.method;
            delete data.method;
        }

        for (let i in data) {
            if (typeof data[i] != 'function') {
                fields[i] = data[i];
            }
        }
        var self = this;
        $.ajax({
            url: url,
            type: method,
            data: fields,
            success: function (result) {
                // Errors
                if (typeof result.result == 'undefined' || !result.result) {
                    let title = 'Server response: error'
                    if (typeof result.errors != 'undefined') {
                        var message = result.errors.join('<br/>');
                        self.simpleWarningMessage(message, title);
                    } else {
                        var text = 'Unknown error. url: ' + url;
                        if (typeof result == 'string') {
                            text += "<br/>\n" + result;
                        }
                        self.simpleWarningMessage(text, title);
                    }
                    return;
                }

                if (callbackFn) {
                    return callbackFn(result);
                }
                return result;
            },
            error: function(jqXHR, textStatus, errorThrown) {
                self.simpleWarningMessage(jqXHR.responseText, jqXHR.status + '. ' + jqXHR.statusText);
            }
        })
    }
}

//var AI;
if (typeof $ == 'undefined') {
    alert(AI_JQUERY_ERROR);
} else {
    $(document).ready(function () {
        //console.log('ai.js typeof AI: ' + typeof AI);
        if (typeof AI != 'object') {
            //console.log('ai.js init AI');
            //AI = new ajaxInterface({});
        }
    });
}
