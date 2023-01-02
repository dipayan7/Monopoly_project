"use strict";

(function (){


    jQuery("#player-game-actions-container").on("click","#btn-action-mortgage", function (){
        showPopup('Mortgage Property','mortgage-template');
    });

    jQuery("#player-game-actions-container").on("click","#btn-action-unmortgage", function (){
        showPopup('Unmortgage Property','unmortgage-template');
    });

    jQuery("#player-game-actions-container").on("click","#btn-action-sale", function (){
        showPopup('Sale Property', 'sale-template');
    });

    jQuery("#player-game-actions-container").on("click","#btn-action-build", function (){
        showPopup('Improve Property', 'build-template');
    });

    jQuery("#player-game-actions-container").on("click","#btn-action-trade", function (){
        game.currentTrade = new Trade({
            initiator: game.turnPlayer,
        });
        game.currentTrade.showDialog();
    });


    var showPopup = function (title, template_id){
        var html = getTemplateHTML(template_id);
        BootstrapDialog.dialog(title, html, true);
    };


    var getTemplateHTML = function (template_id){
        var _this = game.turnPlayer;
        var template = jQuery('#'+template_id).html();
        var data = _this.getDataForTemplate(template_id);
        return Mustache.render(template, data);
    };


    jQuery(document).on('click', '#btn-do-mortgage', function (){
        return mortgageUnmortgageSquare(this);
    });


    jQuery(document).on('click', '#btn-do-unmortgage', function (){
        return mortgageUnmortgageSquare(this);
    });

    var mortgageUnmortgageSquare = function (element){
        var _this = game.turnPlayer;
        var chkbox = jQuery(element).parents('.modal-body').find('input[type=checkbox][name^="selected_properties"]:checked');
        var action = "";
        var failure = [];
        if(chkbox.length > 0){
            var squares = [];
            jQuery(chkbox).each(function (){
                var index = jQuery(this).attr('id').substr('3');
                var sq = game.getSquare(index);
                var success = true;
                if(sq.isMortgaged){
                    success = _this.unmortgageSquare(sq);
                    action = "Unmortgage";
                }else {
                    success = _this.mortgageSquare(sq);
                    action = "Mortgage";
                }
                if(success) {
                    jQuery(this).parents('.property-summary').remove();
                    squares.push(sq.title);
                }else{
                    failure.push(sq.title);
                }
            });
            if(failure.length > 0) {
                updateModalAlert(element, 'alert-danger', 'Unable to '+action + ' ' + failure.join(", "));
            }else{
                updateModalAlert(element, 'alert-success', action + 'd ' + squares.join(", "));
            }
        }else{
            updateModalAlert(element, 'alert-danger', 'Please select properties first');
        }
        return false;
    };



    jQuery(document).on('click','#btn-do-construction', function (){
        var _this = game.turnPlayer;
        var radio = jQuery(this).parents('.modal-body').find('input[type=radio][name="selected_properties"]:checked');
        if(radio.length > 0){
            var index = radio.attr('id').substr('3');
            var sq = game.getSquare(index);
            var issue = {'statement': ''};
            if( sq.canBuildMore(issue) ){
                _this.constructBuilding(sq);
                updateModalAlert(this,'alert-success',sq.title+' improved');
            }else{
                updateModalAlert(this,'alert-warning',issue.statement);
            }
        }else{
            updateModalAlert(element, 'alert-danger', 'Please select properties first');
        }
        return false;
    });

    jQuery(document).on('click','#btn-do-sale', function (){
        var _this = game.turnPlayer;
        var radio = jQuery(this).parents('.modal-body').find('input[type=radio][name="selected_properties"]:checked');
        if(radio.length > 0){
            var index = radio.attr('id').substr('3');
            var sq = game.getSquare(index);
            _this.saleBuilding(sq);
            var html = getTemplateHTML( jQuery('#sale-template').html() );
            jQuery(this).parents('.modal-body').html( html );
            updateModalAlert(this,'alert-success',sq.title+' sold');
        }else{
            updateModalAlert(element, 'alert-danger', 'Please select properties first');
        }
        return false;
    });


    var updateModalAlert = function (element,alert_class, message){
        var alert = jQuery(element).parents('.modal-body').find('.alert');
        alert.find('p').html(message);
        alert.removeClass().addClass('alert alert-dismissible '+alert_class);
    }

})();