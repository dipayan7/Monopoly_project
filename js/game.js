"use strict";

game = (function (){

    var squares = [];
    var groups = [];
    var players = [];
    var communityCards = [];
    var chanceCards = [];
    var _this = this;

    var turn = -1;

    this.die1 = 0;
    this.die2 = 0;
    this.dice = new Dice("");
    this.jailDice = new Dice("jail");

    this.turnPlayer = null;
    this.clientPlayer = null;

    this.currentAuction = null;
    this.currentTrade = null;


    var multiMachineGame = false;

    var $dom = {
        game: jQuery('#gameboard #squares-container'),
        players: jQuery('#players-container'),
        dice: jQuery("#dice1, #dice2"),
        fakeDice: jQuery("#fake-dice"),
        buttonsContainer: jQuery('#buttons-container'),
        jail: jQuery('#jail .jailed-players'),
        log: jQuery('#game-log')
    };

    for (var key in gameConfig.groups) {
        groups[key] = new Group(gameConfig.groups[key]) ;
    }

    for (var i=0;i < gameConfig.chanceCards.length;i++){
        var card = gameConfig.chanceCards[i];
        chanceCards.push(new Card(card.text, card.action));
    }

    for (var i=0; i< gameConfig.communityCard.length; i++){
        var card = gameConfig.communityCard[i];
        communityCards.push(new Card(card.text, card.action));
    }

    for (var className in gameConfig.squares) {
        for (var i = 0; i < gameConfig.squares[className].length; i++){
            var index = gameConfig.squares[className][i].index;
            //console.log(index+" - "+ className);
            squares[index] = createNewInstance(className, gameConfig.squares[className][i]) ;
            if (className.match("BuildingSquare") ){
                squares[index].group = groups[ gameConfig.squares["BuildingSquare"][i].group ];
                squares[index].group.squares.push(squares[index]);
            }else if( className.match("CommunityCardSquare") ){
                squares[index].setCards(communityCards);
            }else if( className.match("ChanceCardSquare") ){
                squares[index].setCards(chanceCards);
            }
        }
    }


    function renderGameBoard(){
        var html = '';

        html += '<div class="row">';
        for (var i = 20; i<=30; i++){
            html += squares[i].html();
        }
        html += '</div>';
        html += '<div class="row">'+ squares[19].html() + squares[31].html()+'</div>' ;
        html += '<div class="row">'+ squares[18].html() + squares[32].html()+'</div>' ;
        html += '<div class="row">'+ squares[17].html() + squares[33].html()+'</div>' ;
        html += '<div class="row">'+ squares[16].html() + squares[34].html()+'</div>' ;
        html += '<div class="row">'+ squares[15].html() + squares[35].html()+'</div>' ;
        html += '<div class="row">'+ squares[14].html() + squares[36].html()+'</div>' ;
        html += '<div class="row">'+ squares[13].html() + squares[37].html()+'</div>' ;
        html += '<div class="row">'+ squares[12].html() + squares[38].html()+'</div>' ;
        html += '<div class="row">'+ squares[11].html() + squares[39].html()+'</div>' ;
        html += '<div class="row">';
            for (var i = 10; i>=0; i--){
                html += squares[i].html();
            }
        html += '</div>';
        $dom.game.html(html);

        bindQTips();
        renderJail();
    }


    function renderPlayers(){
        var html = '';
        for(var i=0; i<players.length;i++){
            html += players[i].html();
        }
        $dom.players.html(html);

    }

    function renderJail(){
        var html = '';
        for(var i=0; i<players.length;i++){
            if(players[i].inJail) {
                html += '<div class="player-position-holder '+players[i].cssClass+'"></div>'
            }
        }
        $dom.jail.html(html);
    }

    function render(){
        renderGameBoard();
        renderPlayers();
    }

    this.getSquare = function (index){
        return squares[index];
    };

    this.getPlayer = function (index){
        return players[index];
    };

    this.getPlayersCount = function (){
        return players.length;
    };



    this.joinGame = function(player){
        var len = players.push(player);
        player.setIndex(len-1);
        player.setPosition(0);
        squares[0].setStayer(player);
        renderPlayers();
        squares[0].render();
    };

    this.play = function(index){
        this.setPlayerTurn(index);

        this.turnPlayer.renderActions();
        this.turnPlayer.takeTurn();
    };

    this.setPlayerTurn = function(index){
        turn = index;
        this.turnPlayer = players[turn];
        game.log("It's "+this.turnPlayer.name+"'s turn. Click Dice to roll");

        //TODO: remove the next line when making game multi-machine compatible
        this.clientPlayer = this.turnPlayer;

        renderPlayers();
    };

    this.showEndTurnOption = function (){
        if(this.turnPlayer.doubleRolled){
            game.log("Double was rolled. "+game.turnPlayer.name+" will take turn again");
            this.showDice();
        }else{
            if(jQuery('.end-turn').length == 0) {
                $dom.buttonsContainer.append('<input type="button" class="btn btn-info end-turn" value="End Turn" />');
            }
        }

    };

    /* ---------------- Dice related methods -------------------------- */
    this.renderDice = function(){

        var render = multiMachineGame?(this.turnPlayer == clientPlayer?true:false):true;
        if(render){
            if( $dom.dice.length == 0 ){
                jQuery("#dice-container #real-dice").html(this.dice.html());
                $dom.dice = jQuery("#dice1, #dice2");
            }
            game.showDice();
        }else{
            if( $dom.dice.length > 0 ) {
                game.hideDice();
            }
        }
    };

    var onDiceClicked = function(){
        game.turnPlayer.rollDice();
    };

    this.showDice = function(){
        $dom.dice.on('click', onDiceClicked);
        $dom.fakeDice.hide();
        $dom.dice.show();
    };

    this.hideDice = function(){
        $dom.dice.off('click',onDiceClicked);
        $dom.dice.hide();
        game.showFakeDice();
    };

    this.showFakeDice = function(){
        // TODO: improve the following code
        var html = '<img id="fake-dice1" src="'+jQuery($dom.dice[0]).attr('src')+'">';
        html += '<img id="fake-dice2" src="'+jQuery($dom.dice[1]).attr('src')+'">';
        $dom.fakeDice.html(html);
        $dom.fakeDice.show();
    };

    this.resetDice = function (){
        jQuery('#dice1').attr('src',baseUrl+'/images/dice/blank.gif');
        jQuery('#dice2').attr('src',baseUrl+'/images/dice/blank.gif');
    };

    this.resetFakeDice = function (){
        jQuery('#fake-dice1').attr('src',baseUrl+'/images/dice/blank.gif');
        jQuery('#fake-dice2').attr('src',baseUrl+'/images/dice/blank.gif');
    };



    /* ------------- Players related methods --------------------------- */

    this.setClientPlayer = function (player){
        this.clientPlayer = player;
    };

    this.movePlayer = function(player, index){
        console.log('moving player '+player.name+ ' to square '+index);
        player.moveTo(index,true);
    };

    this.payToPlayer = function (player, amount){
        player.collectMoney(amount);
    };

    this.collectFromPlayer = function (player, amount){
        player.payMoney(amount);
    };


    this.payOtherPlayers = function(player, amount){
        var total = 0;
        for(var i=0;i<players.length;i++){
            if(players[i] != player){
                total += amount;
                players[i].collectMoney(amount);
            }
        }
        player.payMoney(amount);
    };

    this.payFromOtherPlayers = function(player, amount){
        var total = 0;
        for(var i=0;i<players.length;i++){
            if(players[i] != player){
                total += amount;
                players[i].payMoney(amount);
            }
        }
        player.collectMoney(amount);
    };

    this.movePlayerToJail = function(player){
        player.moveToJail();
        this.turnPlayer.doubleRolled = false;   // end turn even if double was rolled...
    };

    this.movePlayerToNearestRailRoad = function(player,nearestSquares, factor){
        if(factor > 1) {
            player.rentFactor = factor;
        }
        movePlayerToNearestSquare(player,nearestSquares);
    };


    this.movePlayerToNearestUtility = function(player,nearestSquares){

        var factor = (this.die1 + this.die2) * 10;
        player.rentFactor = factor;

        movePlayerToNearestSquare(player,nearestSquares);
    };

    var movePlayerToNearestSquare = function(player,nearestSquares){
        var pos = player.getPosition();
        if(pos < nearestSquares[0]){
            player.moveTo(nearestSquares[0],true);
        }else {
            for (var i = 1; i < nearestSquares.length; i++) {
                if( pos >= nearestSquares[i-1] && pos < nearestSquares[i] ){
                    player.moveTo(nearestSquares[i], true);
                    break;
                }
            }
        }
    };


    this.giveJailCardToPlayer = function(player, type){
        if(type.match('CommunityCard')){
            player.addCommunityChestJailCard();
        }else if(type.match('ChanceCard')){
            player.addChanceJailCard();
        }
    };


    this.chargePlayerForRepairs = function (player, house, hotel){
        player.payForRepairs(house, hotel);
    };

    this.changePlayerPositionRelatively = function(player, sq){
        var pos = player.getPosition();
        player.moveTo(pos + sq, true);
    };

    this.clearSquareStayer = function(index, player){
        squares[index].removeStayer(player);
    };


    this.log = function (str){
        $dom.log.append('<p>'+str+'</p>');
        scrollToBottom($dom.log);
    };

    /* ========================================================================= */
    /*----- Events Handling -----------------------------------------------------*/
    events.on('diceRolled',function(data){
        _this.die1 = data.die1;
        _this.die2 = data.die2;

        game.dice.roll(_this.die1,_this.die2, function (num){
                game.hideDice();
                game.log(game.turnPlayer.name +' rolled '+num);
                if(data.doubleRolled){
                    events.emit('doubleRolled',{times:data.doubleRolledCount, player: game.turnPlayer});
                }
                if (data.doubleRolledCount < 3) {
                    game.turnPlayer.updatePosition(num);
                }
            }
            ,_this.die1+_this.die2);

    });

    events.on('doubleRolled',function(data){
        var player = data.player;
        game.log(player.name +' rolled doubles');
        var doubleRolledCount = data.times;
        if(doubleRolledCount == 3) {
            game.movePlayerToJail(player);
            BootstrapDialog.alert('Double Rolled', 'You have rolled doubles three consecutive times. Go to Jail');
            game.log(player.name +' have rolled doubles three consecutive times.');
            game.showEndTurnOption();
        }
    });

    events.on('playerPositionUpdated',function(player){
        var index = player.getPosition();
        squares[index].setStayer(player);
        render();
        player.land(squares[index]);

    });

    events.on('playerPropertyUpdated',function(player){
        renderGameBoard();
    });

    events.on('playerMoneyUpdated',function(player){
        renderPlayers();
    });

    events.on('playerPaidRent', function (data){
        var player = data.player;
        var square = data.square;
        var rent = data.rent;
        game.log(player.name+ " paid "+gameConfig.currency+rent+ " as rent for "+square.title+" to "+square.owner.name);
    });

    events.on('playerLandedOnCardSquare',function(data){
        // draw a random card from the array of respective cards
        // call action attached to that card.
        var player = data.player;
        var square = data.square;
        var card = square.drawCard();
        //console.log(square);
        var container = (square instanceof ChanceCardSquare) ? 'chance-cards-stack-container':'community-cards-stack-container';
        animateCardOpen( container ,card, function (){
            game.log('Card drawn: '+card.text);
            (card.action)(player);
            game.showEndTurnOption();
            setTimeout(function (){
                // hide cards, if visible
                animateCardClose(container);
            }, 3000);
        });
    });

    events.on('playerJailed', function (player){
        var square = squares[player.position];
        square.removeStayer(player);
        renderGameBoard();
    });

    events.on('playerPayedJailFine', function (player){
        game.showEndTurnOption();
    });

    events.on('playerUsedCommunityChestJailCard', function (){
        game.showEndTurnOption();
        renderPlayers();
    });

    events.on('playerUsedChanceJailCard', function (){
        game.showEndTurnOption();
        renderPlayers();
    });

    events.on('playerReleasedFromJail', function (player){
        var square = squares[player.position];
        square.setStayer(player);
        renderGameBoard();
    });

    events.on('saleProposed', function (trade){
        var sq = [];
        for(var i=0;i<trade.propertiesProposed.length;i++){
            sq.push(trade.propertiesProposed[i].title);
        }
        game.log(trade.initiator.name+" has offered "+sq.join(', ')+" for "+gameConfig+trade.proposedPrice+ " to "+trade.proposedTo.name);
    });

    events.on('purchaseProposed', function (trade){
        var sq = [];
        for(var i=0;i<trade.propertiesProposed.length;i++){
            sq.push(trade.propertiesProposed[i].title);
        }
        game.log(trade.initiator.name+" has offered "+gameConfig+trade.proposedPrice+" for "+sq.join(', ')+" to "+trade.proposedTo.name);
    });

    events.on('saleProposalAccepted', function (trade){
        game.log(trade.proposedTo.name+" has accepted offer by "+trade.initiator.name+'.');
    });

    events.on('saleProposalRejected', function (trade){
        game.log(trade.proposedTo.name+" has not accepted sales offer by "+trade.initiator.name+'.');
    });

    events.on('purchaseProposalAccepted', function (trade){
        game.log(trade.proposedTo.name+" has accepted offer by "+trade.initiator.name+'.');
    });

    events.on('saleProposalRejected', function (trade){
        game.log(trade.proposedTo.name+" has not accepted offer by "+trade.initiator.name+'.');
    });


    events.on('squareMortgaged', function (square){
        game.log(square.owner.name+" has mortgaged "+square.title);
    });

    events.on('squareUnmortgaged', function (square){
        game.log(square.owner.name+" has unmortgaged "+square.title);
    });

    events.on('playerInsufficientFund', function (){
        jQuery('#player-game-actions-container').append('<button type="button" class="btn btn-danger" id="quit-game">Quit</button>');
    });

    events.on('playerQuitted', function (){
        game.log(turnPlayer.name+" has quitted the game. ");
        if(players.length > 1){
            var message = "";
            if(turnPlayer == currentPlayer){
                message = "You";
            }else{
                message = turnPlayer.name;
            }
            BootstrapDialog.alert('Player Quitted', message+" has quitted the game");
            jQuery('.end-turn').trigger('click');
        }else{
            game.log(players[0].name+" is the winner of this game");
            var message = "";
            if(players[0] == currentPlayer){
                message = "You";
            }else{
                message = players[0].name;
            }
            BootstrapDialog.alert('Winner',message+" has won this game");
        }
    });



    /* ================================================================= */
    /* --------- jQuery Events ----------------------------------------- */

    jQuery(document).on('click', '.buy-asset', function (){
        var sq_index = jQuery(this).data('square');
        game.turnPlayer.buySquare(squares[sq_index]);
        game.log(game.turnPlayer.name+" bought "+squares[sq_index].title);
        BootstrapDialog.remove(BootstrapDialog.getCompleteId('bootstrapCustom'));
        game.showEndTurnOption();
    });

    jQuery(document).on('click', '.auction-asset', function (){
        BootstrapDialog.remove(BootstrapDialog.getCompleteId('bootstrapCustom'));
        // dont know why but the code above closes the newly created Dialog as well...
        // so adding a short delay before opening new modal
        var sq_index = jQuery(this).data('square');
        //setTimeout(function (sq_index){
            game.currentAuction = new Auction({
                initiator: game.turnPlayer,
                square: squares[sq_index],
                players: players.slice(0)
            });
            game.currentAuction.showDialog();
        //}, 1000, sq_index);

        return false;
    });

    jQuery('#buttons-container').on('click', '.end-turn', function (){
        // hide actual dice and display placeholder dice
        game.hideDice();
        game.resetDice();

        // calculate turn...
        var turn = game.turnPlayer.index;
        turn++;
        if(turn > players.length -1){
            turn = 0;
        }

        // remove End Turn Button
        jQuery(this).remove();


        // start next move...
        game.play(turn);
    });


    jQuery(document).on('click', '#use-jail-card', function (){
        jQuery("#jailModal").modal("hide");
        game.turnPlayer.useJailCard();
        return false;
    });

    jQuery(document).on('click', '#pay-jail-fine', function (){
        jQuery("#jailModal").modal("hide");
        game.turnPlayer.payJailFine();
        return false;
    });

    jQuery(document).on('click', '#roll-jail-dice', function (){
        game.turnPlayer.jailedPlayerSelectedToRollDice();
        return false;
    });

    jQuery(document).on('click', '#jail-dice1,#jail-dice2', function (event){
        console.log(event);
        var callback = this;
        var die1 = Math.floor(Math.random() * 6) + 1;
        var die2 = Math.floor(Math.random() * 6) + 1;

        //die1 = 3;
        //die2 = 3;

        game.jailDice.roll(die1,die2, function (numbers){
                jQuery('#jail-dice1,#jail-dice2').off('click', callback);

                if(numbers[0] == numbers[1]){
                    var message = 'Doubles were rolled. You get out of jail.';
                    game.turnPlayer.releaseFromJail(numbers[0] + numbers[1]);
                    game.log('Doubles were rolled. '+game.turnPlayer.name+' got out of jail.');
                    jQuery("#jailModal").modal("hide");
                    BootstrapDialog.alert('Double Rolled', message);
                }else{
                    game.log(game.turnPlayer.name+' was not successful in rolling double');
                    setTimeout( function (){jQuery("#jailModal").modal("hide");},500);
                }
                game.showEndTurnOption();
            }
            ,[die1,die2]);
    });

    $(document).on('click', '#quit-game', function (){
       if(players.length > 2){
           for(var i=0;i<turnPlayer.squaresOwned.length;i++){
               var sq = turnPlayer.squaresOwned[i];
               sq.buildingCount = 0;
               sq.buildingType = "";
               sq.isMortgaged = false;
               sq.owner = null;
               turnPlayer.squaresOwned[i] = null;
           }
           turnPlayer.squaresOwned = [];
           players.removeElement(turnPlayer.index);
       }
       events.emit('playerQuitted',turnPlayer);
    });








    render();
    positionJail();
    return this;
}).call({});