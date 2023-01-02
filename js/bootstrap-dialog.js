"user strict";

var BootstrapDialog = (function ($){

    var alertId = "bootstrapAlert";
    var customId = "bootstrapCustom";
    var dialogId = "bootstrapDialog";
    var domDialogId = "bootstrapDomDialog";
    var confirmId = "bootstrapConfirm";
    var promptId = "bootstrapPrompt";

    var animation = false;


    this.custom = function (html, cssClass){
        cssClass = cssClass?cssClass:"";

        if( $("div[id^="+customId+"]:visible").length > 0){
            remove(BootstrapDialog.getCompleteId(customId));
        }

        var inner_html = getDialogCode(customId,"",html,'','',false);
        var dlg = $('<div>'+inner_html+'</div>').find("div[id^="+customId+"]").addClass(cssClass);
        $('body').append(dlg);

        $("div[id^="+customId+"]").modal({backdrop: 'static',keyboard:false});
    };


    this.alert = function (title, message){

        if( $("div[id^="+alertId+"]:visible").length > 0){
            remove(BootstrapDialog.getCompleteId(alertId));
        }

        var html = getDialogCode(alertId,title,message,null,null,true);
        $('body').append(html);

        $("div[id^="+alertId+"] .btn-cancel, div[id^="+alertId+"] .close").on('click', function(e) {
            e.preventDefault();
            remove(BootstrapDialog.getCompleteId(alertId));
        });

        $("div[id^="+alertId+"]").modal({backdrop: 'static',keyboard:false});
    };

    this.dialogFromDom = function(selector, title){
        $this = selector;
        //title =  title + ;

        if( $("div[id^="+domDialogId+"]:visible").length > 0){
            remove(BootstrapDialog.getCompleteId(domDialogId));
        }

        var html = getDialogCode(domDialogId,title,$(selector).html(),null,null,true);
        $('body').append(html);

        $("div[id^="+domDialogId+"] .btn-cancel").on('click', function(e) {
            e.preventDefault();
            remove(BootstrapDialog.getCompleteId(domDialogId));
        });

        $("div[id^="+domDialogId+"]").modal({backdrop: 'static',keyboard:false});
    };


    this.dialog = function (title, inner_html, cancelable, cancel_callback){

        if( $("div[id^="+dialogId+"]:visible").length > 0){
            remove(BootstrapDialog.getCompleteId(dialogId));
        }

        var footer = cancelable?null:'';
        var html = getDialogCode(dialogId,title,inner_html,null,footer,false);
        $('body').append(html);

        if(cancelable) {
            if(typeof cancel_callback == "function"){
                $("div[id^="+dialogId+"] .btn-cancel").on('click', function (e){
                    e.preventDefault();
                    cancel_callback();
                });
            }else{
                $("div[id^="+dialogId+"] .btn-cancel").on('click', function (e) {
                    e.preventDefault();
                    remove(BootstrapDialog.getCompleteId(dialogId));
                });
            }
        }

        $("div[id^="+dialogId+"]").modal({backdrop: 'static',keyboard:false});
    };


    this.confirm = function(title, message,ok_callback,cancel_callback, ok_title, cancel_title){

        ok_title = ok_title == null? "OK":ok_title;
        cancel_title = cancel_title == null? "Close":cancel_title;

        if( $("div[id^="+confirmId+"]:visible").length > 0){
            remove(BootstrapDialog.getCompleteId(confirmId));
        }

        var footer = '<div class="modal-footer"> \
                    <button class="btn btn-primary">'+ok_title+'</button> \
                    <button class="btn btn-cancel" data-dismiss="modal" aria-hidden="true">'+cancel_title+'</button>    \
                  </div>';
        var html = getDialogCode(confirmId, title, message, null, footer, false);
        $('body').append(html);

        $("div[id^="+confirmId+"] .btn-primary").on('click', function(e) {
            e.preventDefault();
            ok_callback();
        });

        if(typeof cancel_callback == "function"){
            $("div[id^="+confirmId+"] .btn-cancel").on('click', function(e) {
                e.preventDefault();
                cancel_callback();
            });
        }else{
            $("div[id^="+confirmId+"] .btn-cancel").on('click', function (e) {
                e.preventDefault();
                remove(BootstrapDialog.getCompleteId(confirmId));
            });
        }

        $("div[id^="+confirmId+"]").modal({backdrop: 'static',keyboard:false});
    };

    this.prompt = function(title, message,ok_callback,cancel_callback){

        if( $("div[id^="+promptId+"]:visible").length > 0){
            remove(BootstrapDialog.getCompleteId(promptId));
        }

        var body =  '<span class="message">'+ message +'</span><br><input type="text" name="prompt" value="">'
                    + '<span class="processing" style="display:none;">Processing ....</span>';

        var footer = '<div class="modal-footer">' +
                        '<button class="btn btn-primary">OK</button>' +
                        '<button class="btn btn-cancel" data-dismiss="modal" aria-hidden="true">Close</button>' +
                        '</div>';


        var html = getDialogCode(promptId,title,body,null,footer,true);
        $('body').append(html);


        $("div[id^="+promptId+"] .btn-primary").on('click', function(e) {
            e.preventDefault();
            ok_callback();
        });

        if(typeof cancel_callback == "function"){
            $("div[id^="+promptId+"] .btn-cancel").on('click', function(e) {
                e.preventDefault();
                cancel_callback();
            });
        }else{
            $("div[id^="+promptId+"] .btn-cancel").on('click', function(e) {
                e.preventDefault();
                remove(BootstrapDialog.getCompleteId(promptId));
            });
        }

        $("div[id^="+promptId+"]").modal({backdrop: 'static',keyboard:false});

    };






    var getDialogCode = function (id,title,body,customHeader,customFooter,addHeaderClose){
        var timestamp = new Date().getTime();
        id = id+"-"+timestamp;
        console.log(id);
        var fade = '';
        if(animation)fade = 'fade';
        var html = '<div id="'+id+'" class="modal '+fade+'" role="dialog" aria-labelledby="modalLabel" > \
            <div class="modal-dialog" role="document"> \
                <div class="modal-content">';

        if(customHeader == null){
            html += '<div class="modal-header">';
            if(addHeaderClose){
                html += '<button type="button" class="close"  aria-hidden="true">X</button>';
            }
            html += '<h3 class="'+id+'Label">'+title+'</h3>';
            html += '</div>';
        }else{
            html += customHeader;
        }

        html += '<div class="modal-body"><p>'+ body +'</p></div>';

        if(customFooter == null){
            html += '<div class="modal-footer"><button class="btn btn-cancel" aria-hidden="true">Close</button></div>';
        }else{
            html += customFooter;
        }

        html += "</div></div></div>";

        return html;
    };

    this.remove = function (id){
        console.log('removing '+id);

        var dlg = $("#"+id);
        if(dlg.length > 0){
            dlg.modal("hide");

            var timeout = animation?1000:0;
            setTimeout(function (dlg){
                dlg.remove();
                console.log($('.modal-backdrop').length);
                console.log($('.modal:visible').length);
                if($('.modal-backdrop').length > $('.modal:visible').length){
                    $('.modal-backdrop').first().remove();
                }
            },timeout, dlg);

        }
    };

    this.getCompleteId = function (id){
        return $("div[id^="+id+"]:visible").attr('id');
    };

    return this;
})(jQuery);