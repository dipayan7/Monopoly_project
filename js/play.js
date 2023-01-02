"use strict";

$(document).ready(function (){

    var html = '<div class=""><h1>Game Options</h1> \
                <form class="form-horizontal" id="gameOptions"> \
                    <div class="form-group"> \
                        <label class="col-sm-2 control-label">Player</label> \
                        <div class="col-sm-10"> \
                            <input type="text" class="form-control" name="playerName[]" value="Player1"> \
                        </div>\
                    </div> \
                    <div class="form-group"> \
                        <label class="col-sm-2 control-label">Player</label> \
                        <div class="col-sm-10"> \
                            <input type="text" class="form-control" name="playerName[]" value="Player2"> \
                        </div> \
                    </div> \
                    <div class="form-group"> \
                        <div class="col-sm-offset-2 col-sm-10"> \
                            <button type="button" class="btn btn-success" onClick="startGame()">Start Game</button> \
                            <button type="button" class="btn btn-primary" onClick="addMorePlayers()">Add More Player</button> \
                        </div> \
                    </div> \
                </form> </div>';


    BootstrapDialog.custom(html,'game-start');



    /*$("#dice1, #dice2").on('click', function (){
     console.log('button clicked');
     game.turnPlayer.rollDice();
     console.log('Task completed...');
     });*/

});


function startGame(){

    var input = $('input[name^=playerName]');

    for(var i=0; i< input.length;i++){
        var player = new Player({name: $(input[i]).val(), cssClass:gameConfig.colors[i] });
        game.joinGame(player);
    }

    game.play(0);
    BootstrapDialog.remove(BootstrapDialog.getCompleteId('bootstrapCustom'));
}

function addMorePlayers(){
    var player_len = $('input[name^=playerName]').length;
    if( player_len < 8) {
        var new_block = $('<div class="form-group">' + $('.form-group:first').html() + '</div>');
        new_block.insertBefore('.form-group:last');
        new_block.find('input[name^=playerName]').val("Player"+(player_len+1));
        if ( $('input[name^=playerName]').length >= 8) {
            $('button.btn-primary').hide();
        }
    }
}

