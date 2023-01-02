The code implements object oriented and event driven approach to develop game of monopoly.

Following are the main class implemented in the game.

Game
Square 
	| UnsaleableSquare (squares that are not to be sold)
	| CardSquare 
		| CommunityCardSquare
		| ChanceCardSquare
	| SaleableSquare
		| LocomotiveSquare
		| UtilitySquare
		| BuildingSquare 
Player
Card
Dice
Trade


The Game class contains arrays of squares, players and cards. The properties of squares and cards are assigned using a game config file. 
Game renders the gameboard by rendering the squares. When a user joins a game, a new player object is added to players array of the game.