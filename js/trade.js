"use strict";

var Trade = function (data){

    this.initiator = null;
    this.proposedTo = null;
    this.propertiesProposed = [];
    this.proposedPrice = 0;
    this.mode = '';     // can be Sale or Purchase

    this.template_id = 'trade-template';

    var _this = this;
    Object.keys(data).forEach(function(key) {
        _this[key] = data[key];
    });

    return this;
};

Trade.prototype.showDialog = function (){
    var _this = this.initiator;
    var data = [];

    var template = jQuery('#'+this.template_id).html();
    data['current_player'] = _this.getDataForTemplate(this.template_id);
    data['players'] = [];
    data['validBuyData'] = false;
    var players_count = game.getPlayersCount();
    for(var i=0;i<players_count;i++){
        var player = game.getPlayer(i);
        if(player != _this){
            var players_data = player.getDataForTemplate(this.template_id);
            data['players'].push(players_data);
            if(players_data.displayControls){
                data['validBuyData'] = true;
            }
        }
    }


    var html = Mustache.render(template, data);
    BootstrapDialog.dialog('Trade Properties', html, true);

    $('#buy-btn-group input[type=radio]:first').attr('checked','checked');
    $('#buy-btn-group label:first').addClass('active');
    $('.players-sales-section .buy-player-wrapper:first').show();
};

Trade.prototype.proposeSale = function (){
    // TODO: uncomment the following line when making multi-player
    //if(game.clientPlayer == game.currentTrade.proposedTo)
    {
        var trade = game.currentTrade;
        var properties =  trade.propertiesProposed;
        var names = [];
        for(var i=0;i<properties.length; i++){
            names.push(properties[i].title);
        }
        var message = trade.initiator.name+" has offered "+names.join(', ') + " for "+gameConfig.currency+trade.proposedPrice;
        console.log('going to propose sale...');
        BootstrapDialog.confirm('Trade Proposal', message,function (){
            trade.proposedTo.payMoney(trade.proposedPrice);
            for(var i=0;i<properties.length; i++){
                trade.proposedTo.buySquare(properties[i],0);
                trade.initiator.saleSquare(properties[i],0);
            }
            trade.initiator.collectMoney(trade.proposedPrice);
            BootstrapDialog.remove(BootstrapDialog.getCompleteId('bootstrapConfirm'));
            events.emit('saleProposalAccepted',game.currentTrade);
            game.currentTrade.showAcceptedResponse();
        },function (){
            game.currentTrade.showRejectedResponse();
            events.emit('saleProposalRejected',game.currentTrade);
            BootstrapDialog.remove(BootstrapDialog.getCompleteId('bootstrapConfirm'));
        },"Accept","Reject");
    }
};

Trade.prototype.proposePurchase = function (){
    // TODO: uncomment the following line when making multi-player
    //if(game.clientPlayer == game.currentTrade.proposedTo)
    {
        var trade = game.currentTrade;
        var properties =  trade.propertiesProposed;
        var names = [];
        for(var i=0;i<properties.length; i++){
            names.push(properties[i].title);
        }
        var message = trade.initiator.name+" has proposed "+gameConfig.currency+trade.proposedPrice+ " for "+ names.join(', ') ;

        BootstrapDialog.confirm('Trade Proposal', message,function (){
            trade.proposedTo.collectMoney(trade.proposedPrice);
            for(var i=0;i<properties.length; i++){
                trade.initiator.buySquare(properties[i],0);
                trade.proposedTo.saleSquare(properties[i],0);
            }
            trade.initiator.payMoney(trade.proposedPrice);
            BootstrapDialog.remove(BootstrapDialog.getCompleteId('bootstrapConfirm'));
            events.emit('purchaseProposalAccepted',game.currentTrade);
            game.currentTrade.showAcceptedResponse();
        },function (){
            game.currentTrade.showRejectedResponse();
            events.emit('purchaseProposalRejected',game.currentTrade);
            BootstrapDialog.remove(BootstrapDialog.getCompleteId('bootstrapConfirm'));
        },"Accept","Reject");
    }
};



Trade.prototype.showAcceptedResponse = function (){
    //if(game.clientPlayer == game.currentTrade.initiator)
    {
        var message = game.currentTrade.proposedTo.name+" has accepted your offer";
        BootstrapDialog.alert('Trade Proposal',message);
    }
};


Trade.prototype.showRejectedResponse = function (){
    //if(game.clientPlayer == game.currentTrade.initiator)
    {
        var message = game.currentTrade.proposedTo.name+" has not accepted your offer";
        BootstrapDialog.alert('Trade Proposal',message);
    }
};



Trade.prototype.addProperty = function (square){
    this.propertiesProposed.push(square);
};

Trade.prototype.reset = function (square){
    this.propertiesProposed = [];
    this.proposedPrice = 0;
    this.proposedTo = null;
    this.mode = null;
};


Trade.prototype.updateAlert = function (alertClass, message){
    var alert = jQuery('#trade-'+game.currentTrade.mode.toLowerCase()+'-property').find('.alert');
    alert.find('p').html(message);
    alert.removeClass().addClass('alert alert-dismissible '+alertClass);
};

jQuery(document).on('click','#btn-do-trade-sale', function (){
    game.currentTrade.reset();
    game.currentTrade.mode = 'Sale';
    var chkbox = jQuery(this).parents('#trade-sale-property').find('input[type=checkbox][name^="selected_properties"]:checked');
    if(chkbox.length > 0){
        var price = parseInt( jQuery(this).parents('#trade-sale-property').find('input[name="proposed_price"]').val() );
        if(price > 1){
            game.currentTrade.proposedPrice = price;
            var gamePlayers = game.getPlayersCount();
            var proposedTo = null;
            if(gamePlayers < 3){
                var index = (game.turnPlayer.index == 1)?0:1;
                proposedTo = game.getPlayer(index);
            }else{
                var player = jQuery(this).parents('#trade-sale-property').find('input[type=radio][name="selected_player"]:checked');
                if(player.length > 0){
                    var index = player.attr('id').substr('3');
                    proposedTo = game.getPlayer(index);
                }
            }

            if(proposedTo != null){

                game.currentTrade.proposedTo = proposedTo;

                var squares = [];
                jQuery(chkbox).each(function (){
                    var index = jQuery(this).attr('id').substr(3);
                    var sq = game.getSquare(index);
                    game.currentTrade.addProperty(sq);
                    squares.push(sq.title);
                });
                BootstrapDialog.remove(BootstrapDialog.getCompleteId('bootstrapDialog'));

                var message = "Are you sure you want to propose "+gameConfig.currency+game.currentTrade.proposedPrice+" for "+squares.join(", ")+ " to "+
                                game.currentTrade.proposedTo.name+"? ";

                BootstrapDialog.confirm("Confirmation", message,function (){
                    events.emit('saleProposed',game.currentTrade);
                    BootstrapDialog.remove(BootstrapDialog.getCompleteId('bootstrapConfirm'));
                    //setTimeout(function (){
                        game.currentTrade.proposeSale();
                    //}, 3000);

                });

            }else{
                game.currentTrade.updateAlert('alert-danger','Please select player to trade with');
            }
        }else{
            game.currentTrade.updateAlert('alert-danger','Please specify price for the selected properties');
        }
    }else{
        game.currentTrade.updateAlert('alert-danger','Please select properties to trade');
    }
    return false;
});

jQuery(document).on('click', '#buy-btn-group label.btn', function (){
    jQuery('#buy-btn-group label.btn input').removeAttr('checked');
    var chkbox = jQuery(this).find('input').attr('checked','checked');
    var index = chkbox.attr('id').substr(7);

    jQuery('.players-sales-section').find('div[id^=player-specific-trade-]').hide();
    jQuery('.players-sales-section #player-specific-trade-'+index).show();
});

jQuery(document).on('click', '.btn-do-trade-purchase', function (){
    game.currentTrade.reset();
    game.currentTrade.mode = 'Purchase';
    var wrapper = jQuery(this).parents('.buy-player-wrapper');
    var index = wrapper.attr('id').substr(22);
    game.currentTrade.proposedTo = game.getPlayer(index);
    if(game.currentTrade.proposedTo != null){
        var chkbox = wrapper.find('input[type=checkbox][name^="selected_properties"]:checked');
        if(chkbox.length > 0) {
            var price = parseInt( wrapper.find('input[name="offered_price"]').val() );
            if (price > 1) {
                game.currentTrade.proposedPrice = price;
                var squares = [];
                jQuery(chkbox).each(function (){
                    var index = jQuery(this).attr('id').substr(7);
                    var sq = game.getSquare(index);
                    game.currentTrade.addProperty(sq);
                    squares.push(sq.title);
                });
                BootstrapDialog.remove(BootstrapDialog.getCompleteId('bootstrapDialog'));

                var message = "Are you sure you want to offer "+gameConfig.currency+game.currentTrade.proposedPrice+" for "+squares.join(", ")+ " to "+
                    game.currentTrade.proposedTo.name+"? ";

                BootstrapDialog.confirm("Confirmation", message,function (){
                    events.emit('purchaseProposed',game.currentTrade);
                    BootstrapDialog.remove(BootstrapDialog.getCompleteId('bootstrapConfirm'));
                    game.currentTrade.proposePurchase();
                });

            } else {
                game.currentTrade.updateAlert('alert-danger', 'Please specify offered price for the selected properties');
            }
        }else{
            game.currentTrade.updateAlert('alert-danger','Please select properties to trade');
        }
    }else{
        game.currentTrade.updateAlert('alert-danger','Something went wrong...');
    }
});