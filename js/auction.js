"use strict";

var Auction = function (data){

    this.square = null;
    this.players = [];
    this.currentBidderIndex = 0;
    this.highestBidder = null;
    this.highestBid = 0;

    this.roundData = [[]];
    this.roundNumber = 0;

    this.initiator = null;
    this.endAuction = false;
    this.newRoundStarted = false;

    var _this = this;
    Object.keys(data).forEach(function(key) {
        _this[key] = data[key];
    });

    var i=0;
    for(i=0;i<this.players.length;i++){
        if(this.players[i] == this.initiator){
            break;
        }
    }
    this.players.removeElement(i);
    this.players.push(this.initiator);

    this.template = jQuery('#auction-template').html();

    return this;
};

Auction.prototype.showDialog = function (){

    //ToDo: Uncomment the following line when making game multi-machine compatible
    //if(game.clientPlayer == this.players[this.currentBidderIndex])
    {
        var data = {'currency': gameConfig.currency};
        var _this = this;
        Object.keys(this).forEach(function (key) {
            data[key] = _this[key];
        });
        data['currentBidder'] = this.players[ this.currentBidderIndex ];

        var html = Mustache.render(this.template, data);

        BootstrapDialog.custom(html, 'auction-box');
    }
};


Auction.prototype.bid = function (amount){
    if(amount > this.highestBid){
        this.highestBid = amount;
        this.highestBidder = this.players[this.currentBidderIndex];
    }

    this.roundData[ this.roundNumber ].push({player: this.players[this.currentBidderIndex], amount: amount});
};

Auction.prototype.updateCurrentBidder = function (){
    var lastIndex = this.players.length - 1;

    console.log("players.length: "+this.players.length);
    console.log("lastIndex: "+lastIndex);

    if(lastIndex < 0 ) {
        this.endAuction = true;
        return;
    }
    this.currentBidderIndex++;
    console.log("currentBidderIndex: "+this.currentBidderIndex);
    this.newRoundStarted = false;
    if (this.currentBidderIndex > lastIndex) {
        this.currentBidderIndex = 0;
        this.roundNumber++;
        this.newRoundStarted = true;
        this.roundData[this.roundNumber] = [];
        console.log("newRoundStarted: "+this.newRoundStarted);
        console.log("roundNumber: "+this.roundNumber);
    }

};

Auction.prototype.startNewRound = function (){
    if(this.players.length < 1 ){
        this.endAuction = true;
    }

    var lastRoundValidBids = this.lastRoundValidBidsCount();
    console.log("lastRoundValidBids: "+ lastRoundValidBids);
    if(!this.endAuction) {
        if (lastRoundValidBids < 1) {
            //if all players passed in previous round
            for (var j = this.roundNumber - 2; j >= 0; j--) {
                var nonZeroBids = [];
                this.previousRoundNonZeroBids(j, nonZeroBids);
                if (nonZeroBids.length == 1) {
                    // if only 1
                    this.endAuction = true;
                    this.finalize(nonZeroBids[0].player, nonZeroBids[0].amount);
                }
                if (nonZeroBids.length > 1) {
                    break;
                }
            }
        }
    }

    if(!this.endAuction) {
        // if only one player placed bid in last round, that player is winner
        if (lastRoundValidBids == 1) {
            // get player's bid amount
            var amount = 0;
            var player = null;

            for (var j = this.roundNumber - 1; j >= 0; j--) {
                console.log("checking round "+j+ " data" );
                console.log(this.roundData[j]);
                for(var k=0; k<this.roundData[j].length; k++) {
                    if (this.roundData[j][k].amount > 0) {
                        amount = this.roundData[j][k].amount;
                        player = this.roundData[j][k].player;
                        break;
                    }
                }
                if(amount > 0) break;
            }
            if (amount > 0) {
                this.endAuction = true;
                this.finalize(player, amount);
            } else {
                this.endAuction = true;
            }
        }
    }

    if(!this.endAuction) {
        // if at the start of new round, there's only one player left..
        // that player is winner
        if (this.players.length == 1) {
            // get player's bid amount
            var amount = 0;
            for (var j = this.roundNumber - 1; j >= 0; j--) {
                for(var k=0; k<this.roundData[j].length;k++) {
                    if (this.roundData[j][k].player == this.players[0] && this.roundData[j][k].amount > 0) {
                        amount = this.roundData[j][k].amount;
                        break;
                    }
                }
                if(amount > 0) break;
            }
            if (amount > 0) {
                this.endAuction = true;
                this.finalize(this.players[0], amount);
            } else {
                this.endAuction = true;
            }
        }
    }

    if(this.endAuction){
        game.showEndTurnOption();
        return false;
    }else{
        return true;
    }
};


Auction.prototype.nextStep = function (){
    console.log('=======================================');
	console.log(this.roundData);
    this.updateCurrentBidder();
    if (this.roundNumber > 0 && this.newRoundStarted) {
        if(this.startNewRound()){
            console.log('about to show dialog...');
            this.showDialog();
        }
    }else{

        if( this.currentBidderIndex == this.players.length - 1) {
            // last player's turn

            // if all other players have exited the auction
            if(this.players.length == 1 && this.players[0].player == this.highestBidder){
                this.finalize(this.highestBidder, this.highestBid);
                this.endAuction = true;
            }


            // if all other players have passed their turn and the one left
            // has placed highest bid in previous round
            var validBidForThisRound = this.validBidsCountForARound(this.roundNumber);
            if(validBidForThisRound == 0 && this.highestBidder == this.players[this.currentBidderIndex]){
                // if all previous players has passed their turn
                // and current player is already the highest bidder
                this.finalize(this.highestBidder, this.highestBid);
                this.endAuction = true;
            }
        }

        if(!this.endAuction){
            console.log('about to show dialog...');
            this.showDialog();
        }

    }
    console.log('=======================================');
};


Auction.prototype.lastRoundValidBidsCount = function ()
{
    var bids = 0;
    if(this.roundNumber > 0){
        var lastRound = this.roundNumber - 1;
        bids = this.validBidsCountForARound(lastRound);
    }
    return bids;
};

Auction.prototype.validBidsCountForARound = function (round_num)
{
    var bids = 0;

    console.log("Bids for round: : "+round_num);
    console.log(this.roundData[round_num]);
    for(var j=0;j<this.roundData[round_num].length;j++){
        if(this.roundData[round_num][j].amount > 0){
            bids++;
        }
    }

    return bids;
};



// returns true if specified round has all zero bids i.e. all players passed or exited
// updates the nonZeroBids array if otherwise
Auction.prototype.previousRoundNonZeroBids = function (round, nonZeroBids){
    var allZeroBids = true;
    for (var i = 0; i < this.roundData[ round ].length; i++) {
        if (this.roundData[ round ][i].amount > 0) {
            nonZeroBids.push(this.roundData[ round ][i]);
            allZeroBids = false;
        }
    }

    return allZeroBids;
};

Auction.prototype.finalize = function (player, amount){
    player.buySquare(this.square,amount);
    game.log("Auction for "+this.square.title+" won by "+player.name + " for "+gameConfig.currency+amount);
    game.showEndTurnOption();
};

Auction.prototype.removePlayer = function (){
    this.players.removeElement(this.currentBidderIndex);
    this.currentBidderIndex--;
};


jQuery(document).on('click', '#place-bid', function (){
    game.currentAuction.bid($('#txt-bid-amount').val());
    BootstrapDialog.remove(BootstrapDialog.getCompleteId('bootstrapCustom'));
    game.currentAuction.nextStep();
});


jQuery(document).on('click', '#pass-turn', function (){
    game.currentAuction.bid(0);
    BootstrapDialog.remove(BootstrapDialog.getCompleteId('bootstrapCustom'));
    game.currentAuction.nextStep();
});

jQuery(document).on('click', '#exit-auction', function (){
    game.currentAuction.removePlayer();
    BootstrapDialog.remove(BootstrapDialog.getCompleteId('bootstrapCustom'));
    game.currentAuction.nextStep();
});
