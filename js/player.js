"use strict";

var Player = function (data){

    this.index = 0;
    this.name = 'Player';
    this.facebookId = '';
    this.money = 1500;
    this.squaresOwned = [];
    this.position = 0;
    this.inJail = false;
    this.communityChestJailCard = 0;
    this.chanceJailCard = 0;
    this.turnsWhileInJail = 0;

    this.doubleRolled = false;
    this.doubleRolledCount = 0;
    this.rollJailCount = 0;
    this.cssClass = "";

    this.rentFactor = 1;

    this.domID = "";

    this.haveBuildings = false;
    this.haveMortgagedBuildings = false;

    //this.human = true;  //future feature
    this.template = jQuery('#player-template').html();
    this.actionsTemplate = jQuery('#player-game-actions').html();

    var _this = this;
    Object.keys(data).forEach(function(key) {
        _this[key] = data[key];
    });

    this.domID = this.name.replace(" ","_") +"_"+ this.index;

    return this;

};

Player.prototype.setIndex = function(idx){
    this.index = idx;
    this.domID = this.name.replace(" ","_") +"_"+ this.index;
};

Player.prototype.takeTurn = function(){
    //console.log('in Jail? '+this.inJail);
    if(this.inJail){
        this.turnsWhileInJail++;
        // display message to either pay money or use card, if any...
        var template = jQuery('#jail-dialog-template').html();

        var data = { 'currency':gameConfig.currency,
                     'jailCard': this.communityChestJailCard > 0 || this.chanceJailCard > 0,
                     'enoughMoney': this.money >= gameConfig.jailFee,
                     'name': this.name,
                     'canRoll': this.turnsWhileInJail < 4,
                     'turnsWhileInJail': this.turnsWhileInJail
        };

        var html = Mustache.render(template, data);
        if(jQuery('#jailModal').length > 0){
            jQuery('#jailModal').html(jQuery(html).html());
        }else {
            jQuery('body').append(html);
        }

        $("#jailModal").modal({backdrop: 'static',keyboard:false});
        game.renderDice();
        game.hideDice();

    }else{
        //this.rollDice();
        game.renderDice();
    }
};

Player.prototype.rollDice = function(){

    var die1 = Math.floor(Math.random() * 6) + 1;
    var die2 = Math.floor(Math.random() * 6) + 1;

    //die1 = 1;
    //die2 = 1;

    if( die1 == die2){
        this.doubleRolled = true;
        this.doubleRolledCount++;
        events.emit('diceRolled',{die1: die1, die2: die2, doubleRolled:this.doubleRolled, doubleRolledCount:this.doubleRolledCount});

        if(this.doubleRolledCount == 3){
            this.doubleRolledCount = 0;
            this.doubleRolled = false;
        }
    }else{
        this.doubleRolled = false;
        this.doubleRolledCount = 0;
        events.emit('diceRolled',{die1: die1, die2: die2, doubleRolled:false, doubleRolledCount:0});
    }
};

Player.prototype.getPosition = function (){ return this.position};

Player.prototype.setPosition = function (pos){
    game.clearSquareStayer(this.position, this);
    this.position = pos;
};

Player.prototype.updatePosition = function(numberRolled){

    this.setPosition(this.position+numberRolled);

    // Collect $200 salary as you pass GO
    if (this.position >= 40) {
        this.position -= 40;
        this.money += 200;
        events.emit('passedThroughGo',this);
    }

    events.emit('playerPositionUpdated',this);
};

Player.prototype.moveTo = function(index, collectSalary){

    if(this.position > index && collectSalary){
        // Collect $200 salary as you pass GO
        this.money += 200;
        events.emit('passedThroughGo',this);
    }
    this.setPosition(index);

    events.emit('playerPositionUpdated',this);
};

Player.prototype.moveToJail = function(){
    this.inJail = true;
    this.position = 10;
    events.emit('playerJailed',this);
};


Player.prototype.html = function (){
    var data = this.getDataForTemplate();
    data['turn'] = game.turnPlayer == this;

    return Mustache.render(this.template, data);
};

Player.prototype.render = function()
{
    var html = this.html();
    jQuery('#'+this.domID).html( jQuery(html).html()  );
};


Player.prototype.renderActions = function (){
    var data = this.getDataForTemplate();
    data['turn'] = game.turnPlayer == this;
    data['canConstructBuilding'] = this.canConstructBuilding();
    data['canMortgage'] = this.squaresOwned.length > 0;

    var html = Mustache.render(this.actionsTemplate, data);
    jQuery('#player-game-actions-container').html( jQuery(html).html() );

};


Player.prototype.buySquare = function (square, amount){

    var price = amount==null?square.price:amount;

    if(price <= this.money ) {
        this.money -= price;
        this.squaresOwned.push(square);
        square.setOwner(this);

        events.emit('playerMoneyUpdated', this);
        events.emit('playerPropertyUpdated', this);
    }else{
        var required = square.price - this.money;
        BootstrapDialog.alert('Insufficient Funds', 'You do not have enough money to buy '+square.title+'. You need '+gameConfig.currency+''+required+' more.');
    }
};


Player.prototype.saleSquare = function (square, amount){

    var price = amount==null?square.price:amount;

    this.money += price;

    var index = -1;
    for(var i=0;i<this.squaresOwned.length;i++){
        if(this.squaresOwned[i] == square){
            index = i;
            break;
        }
    }
    if(index > -1){
        this.squaresOwned.removeElement(index);
    }



    events.emit('playerMoneyUpdated', this);
    events.emit('playerPropertyUpdated', this);

};



Player.prototype.rentSquare = function (square){
    //square.setStayer(this);
    var rent = (square.getApplicableRent() * this.rentFactor );
    this.money -= rent;
    this.rentFactor = 1;
    this.checkForBankruptcy();
    events.emit('playerPaidRent',{player:this, square:square, rent: rent});
    events.emit('playerMoneyUpdated',this);
};


Player.prototype.canConstructBuilding = function (){
    if(this.squaresOwned.length > 0){
        var groupChecked = [];
        for(var i=0; i<this.squaresOwned.length;i++){
            if( (this.squaresOwned[i] instanceof BuildingSquare ) && groupChecked.indexOf( this.squaresOwned[i].group.name ) == -1){
                if(this.canConstructBuildingOnSquare(this.squaresOwned[i])){
                    return true;
                }
                groupChecked.push(this.squaresOwned[i].group.name);
            }
        }
    }
    return false;
};

Player.prototype.canConstructBuildingOnSquare = function (square){
    var can = false;
    if(square.owner == this && square.group.squares.length > 0) {
        can = true;
        for(var i=0;i < square.group.squares.length;i++){
            if(square.group.squares[i].owner != this ){
                return false;
            }
        }
    }
    return can;
};


Player.prototype.constructBuilding = function (square){

    if(this.canConstructBuildingOnSquare(square)) {
        var cost = square.getConstructionCost();
        if(cost < this.money) {
            square.constructBuilding();
            this.money -= square.getConstructionCost();

            this.haveBuildings = true;

            events.emit('playerMoneyUpdated', this);
            events.emit('playerPropertyUpdated', this);
        }else{
            var required = cost - this.money;
            BootstrapDialog.alert('Insufficient Funds', 'You do not have enough money for construction on '+square.title+'. You need '+gameConfig.currency+''+required+' more.');
        }
    }
};

Player.prototype.saleBuilding = function (square){
    square.saleBuilding();
    this.money += square.getBuildingSalePrice();

    var buildings = false;
    for(var i=0;i<this.squaresOwned.length;i++){
        if(this.squaresOwned[i].buildingCount > 0){
            buildings = true;
            break;
        }
    }
    this.haveBuildings = buildings;

    events.emit('playerMoneyUpdated',this);
    events.emit('playerPropertyUpdated',this);
};

Player.prototype.mortgageSquare = function (square){

    if(square instanceof BuildingSquare && square.buildingCount > 0){
        return false;
    }

    square.mortgage();
    this.money += square.getMortgageAmount();

    this.haveMortgagedBuildings = true;
    events.emit('playerMoneyUpdated',this);
    events.emit('playerPropertyUpdated',this);

    return true;
};

Player.prototype.unmortgageSquare = function (square){
    var amount = square.getUnmortgageAmount();
    if(this.money >= amount) {

        square.unmortgage();
        this.money -= amount;

        var mortgaged = false;
        for (var i = 0; i < this.squaresOwned.length; i++) {
            if (this.squaresOwned[i].isMortgaged) {
                mortgaged = true;
                break;
            }
        }
        this.haveMortgagedBuildings = mortgaged;

        events.emit('playerMoneyUpdated', this);
        events.emit('playerPropertyUpdated', this);

        return true;
    }else{
        BootstrapDialog.alert('Insufficient Funds','You do not have sufficient funds to carry out this transaction.');
        return false;
    }
};


Player.prototype.collectMoney = function(amount){
    this.money += amount;
    events.emit('playerMoneyUpdated');
    this.render();
};


Player.prototype.payMoney = function(amount){
    this.money -= amount;
    this.checkForBankruptcy();
    events.emit('playerMoneyUpdated');
    this.render();
};

Player.prototype.payForRepairs = function(house, hotel){
    var houseCount = 0;
    var hotelCount = 0;

    for(var i=0;i<this.squaresOwned;i++){
        var sq = this.squaresOwned[i];
        if( sq instanceof BuildingSquare ){
            var buildingType = sq.buildingType.toLowerCase();
            if( buildingType.match('house')){
                houseCount += sq.buildingCount;
            } else if( buildingType.match('hotel')){
                hotelCount += 1;
            }
        }
    }

    this.money -= (house*houseCount + hotel*hotelCount);
    this.checkForBankruptcy();
    this.render();
};

Player.prototype.checkForBankruptcy = function(){
    if(this.money < 0){
        // give option to either declare bankrupcy or to mortgage/sell assets
        BootstrapDialog.alert('Insufficient Funds','You owe money to bank. Either Mortgage or Sale your property to get funds.');
        events.emit('playerInsufficientFund',this);
    }
};

Player.prototype.addCommunityChestJailCard = function(){
    this.communityChestJailCard++;
};

Player.prototype.addChanceJailCard = function(){
    this.chanceJailCard++;
};



Player.prototype.land = function (square){

    game.log(this.name+' landed on '+square.title);

    // check for the type of square
    // unsaleable, card or saleable

    if(square instanceof UtilitySquare || square instanceof LocomotiveSquare || square instanceof BuildingSquare){

        // for saleable.. check if square is owned or not
        if(square.owned()){
            // if owned by someone else then pay rent
            // if owned by this user do nothing
            if(square.owner != this){
                this.rentSquare(square);
            }
            game.showEndTurnOption();
        }else{
            // if not owned by anyone, show option to user for buying or auctioning this square
            var html = jQuery('<div />').append(jQuery('#'+square.domID + ' .information-tooltip').clone());

            var buttons = '<div class="square-actions">';
            if(square.price < this.money){
                buttons += '<input type="button" class="btn btn-success buy-asset" data-square="'+square.index+'" value="BUY for '+gameConfig.currency+square.price+'" />';
            }
            buttons += '<input type="button" class="btn btn-primary auction-asset" data-square="'+square.index+'" value="AUCTION" /></div>';


            html.find('.tooltip-content').after(buttons);

            BootstrapDialog.custom(html.html(),'message-box');
        }

    } else if(square instanceof ChanceCardSquare || square instanceof CommunityCardSquare){
        // for card squares.. check for chance or community
        // draw a random card from the array of respective cards
        // call action attached to that card.
        //console.log(square);
        events.emit('playerLandedOnCardSquare',{player:this, square:square});

    } else if(square instanceof UnsaleableSquare){
        // for unsaleable square, perform the "action" method.
        switch(square.index){
            // Go
            case 0:
                this.collectMoney(200);
                game.showEndTurnOption();
            break;

            // Income Tax
            case 4:
                this.payMoney(200);
                game.showEndTurnOption();
            break;

            // Just Visiting
            case 10:
            case 20:
                game.showEndTurnOption();
            break;

            // Go to Jail
            case 30:
                this.moveToJail();
                game.showEndTurnOption();
            break;

            // Luxury Tax
            case 38:
                this.payMoney(100);
                game.showEndTurnOption();
            break;

        }

    }

};


/*---- Jail Related Methods -----------------------*/

Player.prototype.jailedPlayerSelectedToRollDice = function (){
    $("#jail-dice-rolling-area").html(game.jailDice.html());
    $('.jail-actions').hide();
    $("#jailModal .modal-footer").slideDown();
};


Player.prototype.useJailCard = function (){
    if(this.communityChestJailCard > 0){
        this.communityChestJailCard--;
        this.releaseFromJail();
        events.emit('playerUsedCommunityChestJailCard',{player:this});
    }else if(this.chanceJailCard > 0){
        this.chanceJailCard--;
        this.inJail = false;
        events.emit('playerUsedChanceJailCard',{player:this});
    }
};

Player.prototype.payJailFine = function (){
    if(this.money >= gameConfig.jailFee){
        this.money -= gameConfig.jailFee;
        this.releaseFromJail();
        events.emit('playerPayedJailFine',this);
    }else{
        BootstrapDialog.alert('Insufficient Funds','You do not have enough funds to get out of jail');
        events.emit('playerInsufficientFund',this);
    }

};

Player.prototype.releaseFromJail = function (pos){
    this.inJail = false;
    if(pos != null ){
        this.updatePosition(pos);
    }else {
        this.position = 10;
    }
    this.turnsWhileInJail = 0;
    events.emit('playerReleasedFromJail',this);
};


Player.prototype.getDataForTemplate = function (template_id){
    var data = {'currency':gameConfig.currency};
    var _this = this;
    Object.keys(this).forEach(function(key) {
        data[key] = _this[key];
    });

    var relatedSquares = [];
    switch(template_id){
        case 'mortgage-template':
            for(var i=0;i<this.squaresOwned.length;i++){
                var this_square = this.squaresOwned[i];
                if(!this_square.isMortgaged){
                    var groupSquaresHaveProperties = false;
                    for(var j=0;j<this_square.group.squares.length;j++){
                        if(this_square.group.squares[i].haveBuildings()){
                            groupSquaresHaveProperties = true;
                            break;
                        }
                    }
                    if(!groupSquaresHaveProperties){
                        relatedSquares.push(this_square);
                    }
                }
            }
        break;

        case 'unmortgage-template':
            for(var i=0;i<this.squaresOwned.length;i++){
                var this_square = this.squaresOwned[i];
                if(this_square.isMortgaged){
                    relatedSquares.push(this_square);
                }
            }
        break;

        case 'sale-template':
            for(var i=0;i<this.squaresOwned.length;i++){
                var this_square = this.squaresOwned[i];
                if(this_square.isBuildingSquare()){
                    if(this_square.haveBuildings()){
                        relatedSquares.push(this_square);
                    }
                }
            }
        break;

        case 'build-template':
            for(var i=0;i<this.squaresOwned.length;i++){
                var this_square = this.squaresOwned[i];
                if(this_square.isBuildingSquare()){
                    var issue = {'statement': ''};
                    if(this_square.canBuildMore(issue)){
                        relatedSquares.push(this_square);
                    }
                }
            }
        break;

        case 'trade-template':
            for(var i=0;i<this.squaresOwned.length;i++){
                var this_square = this.squaresOwned[i];
                if(this_square.isBuildingSquare()){
                    if(!this_square.haveBuildings(issue)){
                        relatedSquares.push(this_square);
                    }
                }else{
                    relatedSquares.push(this_square);
                }
            }

            var playersCount = game.getPlayersCount();
            if(playersCount > 2){
                data['showPlayers'] = true;
                var players = [];
                for(var i=0;i<playersCount;i++){
                    if(i != this.index){
                        players.push( game.getPlayer(i) );
                    }
                }
                data['players'] = players;
            }else{
                data['showPlayers'] = false;
            }
        break;
    }


    data['relatedSquares'] = relatedSquares;
    data['displayControls'] = relatedSquares.length > 0;


    return data;
};


/* ------- Players button actions ------------------------------------- */



/**
 * list of events emitted by Player
 * diceRolled
 * passedThroughGo
 * playerPositionUpdated
 * playerJailed
 * playerMoneyUpdated
 * playerPropertyUpdated
 * playerLandedOnCardSquare
 * playerInsufficientFund
 * playerPaidRent
 * playerReleasedFromJail
 *
 */