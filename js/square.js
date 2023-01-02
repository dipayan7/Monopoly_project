"use strict";

var Square = function (data){

    var className = 'Square';
    this.title = "Generic Square";
    this.index = 0;
    this.domID = '';
    this.stayers = [];

    this.template = jQuery('#square-template').html();

    var _this = this;
    Object.keys(data).forEach(function(key) {
        _this[key] = data[key];
    });

    return this;
};

Square.prototype.setStayer = function (player){
    this.stayers.push(player);
};

Square.prototype.removeStayer = function (player){
    for(var i=0;i<this.stayers.length;i++){
        if(this.stayers[i] == player){
            this.stayers.removeElement(i);
        }
    }
};


Square.prototype.html = function (){
    var data = {'currency':gameConfig.currency};
    var _this = this;
    Object.keys(this).forEach(function(key) {
        data[key] = _this[key];
    });
    if( !(this instanceof UnsaleableSquare) ){
        data['owned'] = this.owned();
        data['tooltip'] = true;
        data['mortgageAmount'] = this.getMortgageAmount();
        if(this instanceof BuildingSquare) {
            data['constructionCost'] = this.getConstructionCost();
            data['grouped'] = true;
        }else if(this instanceof UtilitySquare){
            data['utility'] = true;
        }else if(this instanceof LocomotiveSquare){
            data['locomotive'] = true;
            data['rent2'] = this.rent*2;
            data['rent3'] = this.rent*3;
            data['rent4'] = this.rent*4;
            data['className'] = 'LocomotiveSquare';
        }
    }

    return Mustache.render(this.template, data);
};

Square.prototype.render = function(){
    var html = this.html();
    jQuery('#'+this.domID).html( jQuery(html).html()  );
};

/*----------------------------------------------------------*/
/*
* Module Definition for squares that are not to be sold
* */
var UnsaleableSquare = function (data){

    var className = 'UnsaleableSquare';
    this.action = null;

    UnsaleableSquare.super_.call(this, data || {});
    this.domID = className+"-"+this.index;

};
inherits(UnsaleableSquare, Square);


/*----------------------------------------------------------*/
/**
 * Module Definition for community and chance card squares
 **/
var CardSquare = function (data){

    var className = 'CardSquare';
    this.undrawnCards = [];
    this.drawnCards = [];

    CardSquare.super_.call(this, data || {});
    this.domID = className+"-"+this.index;
};
inherits(CardSquare, UnsaleableSquare);
CardSquare.prototype.setCards = function(cards){
  this.undrawnCards = cards;
  this.undrawnCards.shuffle();
};
CardSquare.prototype.drawCard = function(){
    var index = Math.floor(Math.random() * this.undrawnCards.length +1 ) - 1;
    var card = this.undrawnCards[index];
    this.drawnCards.push(card);
    this.undrawnCards.removeElement(index);
    if(this.undrawnCards.length == 0){
        for(var i=0;i<this.drawnCards.length;i++){
            this.undrawnCards[i] = this.drawnCards[i];
        }
        this.drawnCards = [];
        this.undrawnCards.shuffle();
    }
    //console.log(card.text);
    return card;
};

/*----------------------------------------------------------*/
var CommunityCardSquare = function (data){
    var className = 'CommunityCardSquare';
    CommunityCardSquare.super_.call(this, data || {});
    this.domID = className+"-"+this.index;
};
inherits(CommunityCardSquare, CardSquare);

/*----------------------------------------------------------*/

var ChanceCardSquare = function (data){
    var className = 'ChanceCardSquare';
    ChanceCardSquare.super_.call(this, data || {});
    this.domID = className+"-"+this.index;
};
inherits(ChanceCardSquare, CardSquare);

/*----------------------------------------------------------*/
/*
 * Module Definition for squares that can be owned by players
 **/
var SaleableSquare = function(data){

    var className = 'SaleableSquare';
    this.owner = null;
    this.price = 0;
    this.rent = 0;

    this.isMortgaged = false;

    SaleableSquare.super_.call(this, data || {});
    this.domID = className+"-"+this.index;
};
inherits(SaleableSquare, Square);

SaleableSquare.prototype.owned = function (){
    return this.owner != null;
};

SaleableSquare.prototype.getMortgageAmount = function(){
    return Math.round(this.price * 0.5);

};

SaleableSquare.prototype.getUnmortgageAmount = function(){
    return Math.round(this.price * 0.6);
};

SaleableSquare.prototype.getApplicableRent = function (player){
    return this.rent;
};

SaleableSquare.prototype.mortgage = function (){
    this.isMortgaged = true;
    events.emit('squareMortgaged',this);

    this.render();
};

SaleableSquare.prototype.unmortgage = function (){
    this.isMortgaged = false;
    events.emit('squareUnmortgaged',this);

    this.render();
};

SaleableSquare.prototype.setOwner = function (player){
    this.owner = player;
    events.emit('squareBought',this);   // not sure about that..
    this.render();
};

SaleableSquare.prototype.isBuildingSquare = function (){
    return this instanceof BuildingSquare;
};


/*----------------------------------------------------------*/

/*
 * Module Definition for squares on which buildings CANNOT be constructed
 **/

var LocomotiveSquare = function (data){
    var className = 'LocomotiveSquare';
    LocomotiveSquare.super_.call(this, data || {});
    this.domID = className+"-"+this.index;
};
inherits(LocomotiveSquare, SaleableSquare);

LocomotiveSquare.prototype.getApplicableRent = function(){
    var player = this.owner;
    var sqCount = 0;
    for(var i=0; i<player.squaresOwned;i++ ){
        var sq = player.squaresOwned[i];
        if(sq instanceof LocomotiveSquare && sq.owner == player){
            sqCount++;
        }
    }
    return sqCount * this.rent;
};

/*----------------------------------------------------------*/
var UtilitySquare = function(data){
    var className = 'UtilitySquare';
    UtilitySquare.super_.call(this, data || {});
    this.domID = className+"-"+this.index;
};
inherits(UtilitySquare, SaleableSquare);

UtilitySquare.prototype.getApplicableRent = function(){
    var rent = 0;
    var count = 0;
    for(var i=0;i<this.owner.squaresOwned.length;i++){
        if(this.owner.squaresOwned[i] instanceof UtilitySquare){
            count++;
        }
    }
    if(count == 1){
        rent = (game.die1 + game.die2) * 4;
    }else if(count == 2){
        rent = (game.die1 + game.die2) * 10;
    }else{
        console.log('Something went wrong :s');
    }
    return rent;
};

/*----------------------------------------------------------*/
/*
 * Module Definition for squares on which buildings can be constructed
 **/
var BuildingSquare = function(data){

    var className = 'BuildingSquare';
    this.group = null;

    this.oneHouseRent = 0;
    this.twoHousesRent = 0;
    this.threeHousesRent = 0;
    this.fourHousesRent = 0;
    //this.fiveHousesRent = 0;

    this.hotelRent = 0;

    this.buildingType = '';    // house or hotel
    this.buildingCount = 0;


    BuildingSquare.super_.call(this, data || {});
    this.domID = className+"-"+this.index;
};
inherits(BuildingSquare, SaleableSquare);


BuildingSquare.prototype.getConstructionCost = function (){
    return this.group.constructionCost;
};

BuildingSquare.prototype.getBuildingSalePrice = function (){
    console.log(this);
    return this.getConstructionCost() * 0.5;
};

BuildingSquare.prototype.saleBuilding = function (){
    if(this.buildingCount > 0) {
        this.buildingCount--;
        events.emit('buildingSold', this);

        this.render();
    }
};

BuildingSquare.prototype.constructBuilding = function (){
    if(this.buildingType == '' || this.buildingType == 'House' ) {
        if (this.buildingCount < gameConfig.maxHouseCount) {    // maximum house that can be built on a plot
            this.buildingCount++;
            this.buildingType = 'House';
            events.emit('buildingConstructed', this);
        }else{
            this.buildingType = 'Hotel';
            this.buildingCount = 1;
        }
    }
    this.render();
};

BuildingSquare.prototype.getApplicableRent = function (){

    var groupOwned = true;
    for(var i=0;i<this.group.squares.length;i++){
        if(this.group.squares[i] != this.owner){
            groupOwned = false;
            break;
        }
    }

    if (!groupOwned) {
        return this.rent;
    } else {
        switch(this.buildingCount){
            case 0:
                return this.rent * 2;
            break;
            case 1:
                if(this.buildingType == 'House'){
                    return this.oneHouseRent;
                }else if(this.buildingType == 'Hotel'){
                    return this.hotelRent;
                }
            break;
            case 2:
                return this.twoHousesRent;
                break;
            case 3:
                return this.threeHousesRent;
            break;
            case 4:
                return this.fourHousesRent;
            break;
        }
    }
};

BuildingSquare.prototype.canBuildMore = function (issue){

    if(this.isMortgaged){
        issue.statement = 'Mortgaged property cannot be improved';
        return false;
    }

    // cannot improve further if already improved to Hotel
    if(this.buildingType == 'Hotel' && this.buildingCount > 0){
        issue.statement = 'Property already has a hotel on it. It cannot be improved further.';
        return false;
    }

    // if entire group is not owned by one player
    for(var i=0; i< this.group.squares.length;i++){
        if(this.group.squares[i].owner != this.owner){
            issue.statement = 'You need to own all the properties of this group before you improve this property';
            return false;
        }
    }

    // cannot build if other properties of this group is mortgaged
    for(var i=0; i< this.group.squares.length;i++){
        if(this.group.squares[i].isMortgaged){
            issue.statement = 'You must unmortgage all the properties of this group before you improve this property';
            return false;
        }
    }

    if(this.buildingCount > 0){
        // all squares of this group should have equal houses...
        for(var i=0; i< this.group.squares.length;i++){
            if(this.group.squares[i].buildingCount < this.buildingCount){
                issue.statement = 'All properties of this group should be improved equally. Please improve other properties first';
                return false;
            }
        }
    }

    // if all tests are passed...
    return true;

};

BuildingSquare.prototype.getHouseCount = function(){
    if(this.buildingType == 'House' || this.buildingType == ''){
        return this.buildingCount;
    }
};

BuildingSquare.prototype.getHotelCount = function(){
    if(this.buildingType == 'Hotel'){
        return 1;
    }
};

BuildingSquare.prototype.haveBuildings = function (){
    return this.buildingCount > 0;
};

BuildingSquare.prototype.tmplHouseCount = function (){
    var houseObj = [];
    var houseCount = this.getHouseCount();
    for(var i=0;i<houseCount;i++){
        houseObj.push(this);
    }
    return houseObj;
};

BuildingSquare.prototype.tmplHotelCount = function (){
    if(this.getHotelCount() > 0){
        return [this];
    }
};
