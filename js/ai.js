var ERROR_AI_JQUERY_NOT_FOUND = "You need to include jQuery library to use AjaxInterface.";
var ERROR_AI_JQUERY_AJAX      = "'Unknown $.ajax function. Check out you jquery libray, maybe this is a slim version.'";

var ERROR_AI_UNKNOWN_JS_LIB           = "Unknown js library. Sorry.";
var ERROR_AI_BOOTSTRAP_CSS            = "bootstrap.css not found";
var ERROR_AI_BOOTSTRAP_JS             = "bootstrap.js not found";
var ERROR_AI_FANCYBOX_JS              = "fancybox not found";
var ERROR_AI_WARNING_TITLE            = "Server response: error";
var ERROR_AI_WARNING_UNKNOWN_WITH_URL = "Unknown error. url: ";

var DEFAULT_AI_MODAL_TITLE         = "VIM: Very Important Message";
var DEFAULT_AI_MODAL_ERROR_TITLE   = "Operation error";
var DEFAULT_AI_MODAL_SUCCESS_TITLE = "Operation success";
var DEFAULT_AI_MODAL_SUCCESS_TEXT  = "The operation was successful.";

var singleAjaxInterface = (function(){
    // Singleton instance
    var instance;
    
    class makeInstance {
        set readyFn(fn) {
            if (typeof fn == 'function') {
                this._readyFn.push(fn);
            } else if (typeof fn == 'object') {
                for (let i in fn) {
                    if (typeof fn[i] == 'function') {
                        this._readyFn.push(fn[i]);
                    }
                }
            }
        }
        
        get readyFn() {
            return this._readyFn;
        }
        
        get errors() {
            return this._errors;
        }
        
        constructor(params) {
            this.defaultLibrary        = 'bootstrap';
            this.defaultLibraryVersion = 4;
            this.bootstrapVersion      = null;
            this.fancyboxVersion       = null;
            this.modalResponseId       = 'modalAiResponse';

            this._readyFn = [];
            this._errors  = [];

            this.checkRegex();

            for (let param in params) {
                this[param] = params[param];
            }

            if (this.defaultLibrary == 'bootstrap') {
                this.getBootstrapVersion();
            } else if (this.defaultLibrary == 'fancybox') {
                this.getFancyboxVersion();
            } else {
                alert(ERROR_AI_UNKNOWN_JS_LIB);
                return null;
            }
            if (!this.checkLibrary()) {
                return null;
            }

            var self = this;

            return {
                defaultLibrary:        self.defaultLibrary,
                defaultLibraryVersion: self.defaultLibraryVersion,
                bootstrapVersion:      self.bootstrapVersion,
                fancyboxVersion:       self.fancyboxVersion,
                modalResponseId:       self.modalResponseId,

                getProperties: function() {
                    let prop = [];
                    for (var p in this) {
                        if (typeof this[p] == 'function') {
                            continue;
                        }
                        prop.push(p + ': ' + this[p]);
                    }
                    return prop.join("\n");
                },

                simpleInfoMessage:    self.simpleInfoMessage,
                simpleSuccessMessage: self.simpleSuccessMessage,
                simpleWarningMessage: self.simpleWarningMessage,
                clearMessageClasses:  self.clearMessageClasses,
                simpleMessage:        self.simpleMessage,
                preResponse:          self.preResponse,
                successResponse:      self.successResponse,
                openModal:            self.openModal,

                /**
                * Основной интерфейс отправки данных
                *
                * @param url
                * @param data
                **/
                send: function(url, data) {
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
                       url:  url,
                       type: method,
                       data: fields,

                       success: function (result) {
                           // Errors
                           if (typeof result.result == 'undefined' || !result.result) {
                               let title = ERROR_AI_WARNING_TITLE;
                               if (typeof result.errors != 'undefined') {
                                   var message = result.errors.join('<br/>');
                                   self.simpleWarningMessage(message, title);
                               } else {
                                   var text = ERROR_AI_WARNING_UNKNOWN_WITH_URL + url;
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
        }
        
        checkRegex() {
            if (typeof jQuery.expr[':'].regex == 'undefined') {
                // Очень нужная штука для поиска регуляркой внутри атрибутов.
                // Используется для проверки есть ли на странице bootstrap.css и какой версии (3/4)
                jQuery.expr[':'].regex = function(elem, index, match) {
                    var matchParams = match[3].split(','),
                        validLabels = /^(data|css):/,
                        attr = {
                            method: matchParams[0].match(validLabels) ?
                                matchParams[0].split(':')[0] : 'attr',
                                property: matchParams.shift().replace(validLabels,'')
                        },
                        regexFlags = 'ig',
                        regex      = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g,''), regexFlags);
                    return regex.test(jQuery(elem)[attr.method](attr.property));
                }
            }
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
            try {
                let version = $.fancybox.version.split('.');
                this.fancyboxVersion = version[0];
                return this.fancyboxVersion;
            } catch(e) {
                return null;
            }
        }

        checkLibrary() {
            if (this.defaultLibrary == 'bootstrap') {
                var bootstrapCss = $('link:regex(href, .*bootstrap.*)');
                if (!bootstrapCss.length) {
                    this.alertInitFail(ERROR_AI_BOOTSTRAP_CSS);
                    return false;
                }
                if (!this.bootstrapVersion) {
                    this.alertInitFail(ERROR_AI_BOOTSTRAP_JS);
                    return false;
                }
            } else if (this.defaultLibrary == 'funcybox') {
                if (typeof $.fancybox == 'undefined') {
                    this.alertInitFail(ERROR_AI_FANCYBOX_JS);
                    return false;
                }
            }
            if ($('#modalAiResponse').length == 0 || $('#modalAiResponse').length > 1) {
                this.renderResponseModal();
            }
            return this.checkParams();
        }

        checkParams() {
            if (typeof $.ajax == 'undefined') {
                this.simpleWarningMessage(ERROR_AI_JQUERY_AJAX);
                return false;
            }
            return this.init();
        }

        alertInitFail(message) {
            alert(message);
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
                    '   <h2 class="modal-title">\n' +
                    '       I`m a modal!\m' +
                    '   </h2>\n' +
                    '   <div class="modal-body">\n' +
                    '       <div class="alert"></div>\n' +
                    '   </div>\n' +
                    '</div>';
            }
            $('body').append(modal);
        }

        simpleInfoMessage(message, title, large) {
            this.clearMessageClasses();
            $('#' + this.modalResponseId + ' .alert').addClass('alert-info');
            return this.simpleMessage(message, title, large);
        }

        simpleSuccessMessage(message, title, large) {
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
                title = DEFAULT_AI_MODAL_TITLE;
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
            return this.openModal();
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
            return this.openModal();
        }

        // Для простого окна с ответом, результат в окне
        successResponse(result) {
            var title, text;
            $('#' + this.modalResponseId).css('cursor', 'default');
            $('#' + this.modalResponseId + ' .alert').empty().removeClass('alert-danger').removeClass('alert-success');
            if (!result.result) {
                title = DEFAULT_AI_MODAL_ERROR_TITLE;
                $('#' + this.modalResponseId).find('.alert').addClass('alert-danger');
                if (typeof result.error == 'array') {
                    for (var i in result.error) {
                        $('#' + this.modalResponseId + ' .alert').append('<p>' + result.error[i] + '</p>');
                    }
                } else {
                    $('#' + this.modalResponseId + ' .alert').append('<p>' + result.error + '</p>');
                }

            } else if (result.message) {
                title = DEFAULT_AI_MODAL_SUCCESS_TITLE;
                text  = result.message;
                $('#' + this.modalResponseId).find('.alert').addClass('alert-success');
            } else {
                title = DEFAULT_AI_MODAL_SUCCESS_TITLE;
                text  = DEFAULT_AI_MODAL_SUCCESS_TEXT;
                $('#' + this.modalResponseId).find('.alert').addClass('alert-success');
            }
            $('#' + this.modalResponseId).find('.modal-title').text(title);
            $('#' + this.modalResponseId).find('.alert').text(text);
            return this.openModal();
        }

        openModal() {
            if (this.defaultLibrary == 'bootstrap') {
                return $('#' + this.modalResponseId).modal('show');
            }  else if (this.defaultLibrary == 'fancybox') {
                var self = this;
                let modal = $.fancybox.open(
                    $('#' + self.modalResponseId), {
                        touch: false
                    }
                );
                return modal;
            }
        }

        init() {
            for (let fn of this.readyFn) {
                fn();
            }
            return true;
        }
    }
    
    return {
        getInstance: function(params) {
            if (!instance) {
                instance = new makeInstance(params);
            }
            return instance;
        }
    }
})();

var AI;
if (typeof $ == 'undefined') {
    alert(ERROR_AI_JQUERY_NOT_FOUND);
} else {
    $(document).ready(function () {
        var AI = singleAjaxInterface.getInstance();
    });
}
