var gameConfig = {

  currency: '$',
  jailFee: 50,
  maxHouseCount: 4,

  groups: {
    'alpha': { name: 'alpha', constructionCost: 50 },
    'beta': { name: 'beta', constructionCost: 50 },
    'gamma': { name: 'gamma', constructionCost: 100 },
    'delta': { name: 'delta', constructionCost: 100 },
    'epsilon': { name: 'epsilon', constructionCost: 150 },
    'zeta': { name: 'zeta', constructionCost: 150 },
    'eta': { name: 'eta', constructionCost: 200 },
    'theta': { name: 'theta', constructionCost: 200 }
    //'iota': { name: 'iota', constructionCost: 0 },
    //'kappa': { name: 'kappa', constructionCost: 0 }
  },
  squares: {
    'UtilitySquare': [
        { index: 12, title: 'Electric Company', price: 150 },
        { index: 28, title: 'Water Works', price: 150 }

    ],
    'LocomotiveSquare':[
        { index: 5, title: 'Reading Railroad', price: 200, rent : 25 },
        { index: 15, title: 'Pennsylvania Railroad', price: 200, rent : 25 },
        { index: 25, title: 'B&O Railroad', price: 200, rent : 25 },
        { index: 35, title: 'Short Line', price: 200, rent : 25 }
    ],
    'BuildingSquare': [

        { index: 1, title: 'Mediteranean Avenue', group: 'alpha', price: 60, rent : 2, oneHouseRent: 10, twoHousesRent: 30, threeHousesRent: 90, fourHousesRent: 160, hotelRent: 250 },
        { index: 3, title: 'Baltic Avenue', group: 'alpha', price: 60, rent : 4, oneHouseRent: 20, twoHousesRent: 60, threeHousesRent: 180, fourHousesRent: 320, hotelRent: 450  },
        { index: 6, title: 'Oriental Avenue', group: 'beta', price: 100, rent : 6, oneHouseRent: 30, twoHousesRent: 90, threeHousesRent: 270, fourHousesRent: 400, hotelRent: 550 },
        { index: 8, title: 'Vermont Avenue', group: 'beta', price: 100, rent : 6, oneHouseRent: 30, twoHousesRent: 90, threeHousesRent: 270, fourHousesRent: 400, hotelRent: 550 },
        { index: 9, title: 'Connecticut Avenue', group: 'beta', price: 120, rent : 8, oneHouseRent: 40, twoHousesRent: 100, threeHousesRent: 300, fourHousesRent: 450, hotelRent: 600 },
        { index: 11, title: 'St. Charles Place', group: 'gamma', price: 140, rent : 10, oneHouseRent: 50, twoHousesRent: 150, threeHousesRent: 450, fourHousesRent: 625, hotelRent: 750 },
        { index: 13, title: 'States Avenue', group: 'gamma', price: 140, rent: 10 , oneHouseRent: 50, twoHousesRent: 150, threeHousesRent: 450, fourHousesRent: 625, hotelRent: 750 },
        { index: 14, title: 'Virginia Avenue', group: 'gamma', price: 160, rent : 12, oneHouseRent: 60, twoHousesRent: 180, threeHousesRent: 500, fourHousesRent: 700, hotelRent: 900 },
        { index: 16, title: 'St. James Place', group: 'delta', price: 180, rent : 14, oneHouseRent: 70, twoHousesRent: 200, threeHousesRent: 550, fourHousesRent: 750, hotelRent: 950 },
        { index: 18, title: 'Tennessee Avenue', group: 'delta', price: 180, rent : 14, oneHouseRent: 70, twoHousesRent: 200, threeHousesRent: 550, fourHousesRent: 750, hotelRent: 950 },
        { index: 19, title: 'New York Avenue', group: 'delta', price: 200, rent : 16, oneHouseRent: 80, twoHousesRent: 220, threeHousesRent: 600, fourHousesRent: 800, hotelRent: 1000 },
        { index: 21, title: 'Kentucky Avenue', group: 'epsilon', price: 220, rent : 18, oneHouseRent: 90, twoHousesRent: 250, threeHousesRent: 700, fourHousesRent: 875, hotelRent: 1050 },
        { index: 23, title: 'Indiana Avenue', group: 'epsilon', price: 220, rent : 18, oneHouseRent: 90, twoHousesRent: 250, threeHousesRent: 700, fourHousesRent: 875, hotelRent: 1050 },
        { index: 24, title: 'Illinois Avenue', group: 'epsilon', price: 240, rent : 20, oneHouseRent: 100, twoHousesRent: 300, threeHousesRent: 750, fourHousesRent: 925, hotelRent: 1100 },
        { index: 26, title: 'Atlantic Avenue', group: 'zeta', price: 260, rent : 22, oneHouseRent: 110, twoHousesRent: 330, threeHousesRent: 800, fourHousesRent: 975, hotelRent: 1150 },
        { index: 27, title: 'Ventnor Avenue', group: 'zeta', price: 260, rent : 22, oneHouseRent: 110, twoHousesRent: 330, threeHousesRent: 800, fourHousesRent: 975, hotelRent: 1150 },
        { index: 29, title: 'Marvin Gardens', group: 'zeta', price: 280, rent : 24, oneHouseRent: 120, twoHousesRent: 360, threeHousesRent: 850, fourHousesRent: 1025, hotelRent: 1200 },
        { index: 31, title: 'Pacific Avenue', group: 'eta', price: 300, rent : 26, oneHouseRent: 130, twoHousesRent: 390, threeHousesRent: 900, fourHousesRent: 1100, hotelRent: 1275 },
        { index: 32, title: 'North Carolina Avenue', group: 'eta', price: 300, rent : 26, oneHouseRent: 130, twoHousesRent: 390, threeHousesRent: 900, fourHousesRent: 1100, hotelRent: 1275 },
        { index: 34, title: 'Pennsylvania Avenue', group: 'eta', price: 320, rent : 28, oneHouseRent: 150, twoHousesRent: 450, threeHousesRent: 1000, fourHousesRent: 1200, hotelRent: 1400 },
        { index: 37, title: 'Park Place', group: 'theta', price: 350, rent : 35, oneHouseRent: 175, twoHousesRent: 500, threeHousesRent: 1100, fourHousesRent: 1300, hotelRent: 1500 },
        { index: 39, title: 'Boardwalk', group: 'theta', price: 400, rent : 50, oneBuildingRent: 200, twoHousesRent: 600, threeHousesRent: 1400, fourHousesRent: 1700, hotelRent: 2000 }
    ],
    'UnsaleableSquare': [
        { index: 0, title: 'Go', instructions: 'Collect 200 as you pass' },
        { index: 4, title: 'Income Tax', instructions: 'Pay 200' },
        { index: 10, title: 'Just Visiting' },
        { index: 20, title: 'Free Parking' },
        { index: 30, title: 'Go to Jail' },
        { index: 38, title: 'Luxury Tax', 'instructions': 'Pay 100' }
    ],
    'CommunityCardSquare': [
        { index: 2, title: 'Community Chest', instructions: 'Follow instructions on top of card' },
        { index: 17, title: 'Community Chest', instructions: 'Follow instructions on top of card' },
        { index: 33, title: 'Community Chest', instructions: 'Follow instructions on top of card' },
    ],
    'ChanceCardSquare': [
        { index: 7, title: 'Chance', instructions: 'Follow instructions on top of card' },
        { index: 22, title: 'Chance', instructions: 'Follow instructions on top of card'},
        { index: 36, title: 'Chance', instructions: 'Follow instructions on top of card' }
    ]
  },
  communityCard:[
      {text: 'Get out of Jail, Free. This card may be kept until needed or sold.', action:function (player){game.giveJailCardToPlayer(player,'CommunityCard')}},
      {text: 'You have won second prize in a beauty contest. Collect $10.', action:function (player){game.payToPlayer(player, 10)}},
      {text: 'From sale of stock, you get $50.', action:function (player){game.payToPlayer(player, 50)}},
      {text: 'Life insurance matures. Collect $100.', action:function (player){game.payToPlayer(player, 100)}},
      {text: 'Income tax refund. Collect $20.', action:function (player){game.payToPlayer(player, 20)}},
      {text: 'Holiday fund matures. Receive $100.', action:function (player){game.payToPlayer(player, 100)}},
      {text: 'You inherit $100.', action:function (player){game.payToPlayer(player, 100)}},
      {text: 'Receive $25 consultancy fee.', action:function (player){game.payToPlayer(player, 25)}},
      {text: 'Pay hospital fees of $100.', action:function (player){game.collectFromPlayer(player, 100)}},
      {text: 'Bank error in your favor. Collect $200.', action:function (player){game.payToPlayer(player, 200)}},
      {text: 'Pay school fees of $50.', action:function (player){game.collectFromPlayer(player, 50)}},
      {text: 'Doctor\'s fee. Pay $50.', action:function (player){game.collectFromPlayer(player, 50)}},
      {text: 'It is your birthday. Collect $10 from every player.', action:function (player){game.payFromOtherPlayers(player,10)}},
      {text: 'Advance to "GO" (Collect $200).', action:function (player){game.movePlayer(player, 0)}},
      {text: 'You are assessed for street repairs. $40 per house. $115 per hotel.', action:function (player){game.chargePlayerForRepairs(player, 40,115)}},
      {text: 'Go to Jail. Go directly to Jail. Do not pass \"GO\". Do not collect $200.', action:function (player){game.movePlayerToJail(player)}}

  ],
  chanceCards: [
      {text: 'GET OUT OF JAIL FREE. This card may be kept until needed or traded.', action:function (player){game.giveJailCardToPlayer(player,'ChanceCard')}},
      {text: 'Make General Repairs on All Your Property. For each house pay $25. For each hotel $100.', action:function (player){game.chargePlayerForRepairs(player, 25,100)}},
      {text: 'Speeding fine $15.', action:function (player){game.collectFromPlayer(player,15)}},
      {text: 'You have been elected chairman of the board. Pay each player $50.', action:function (player){game.payOtherPlayers(player,50)}},
      {text: 'Go back three spaces.', action:function (player){game.changePlayerPositionRelatively(player,-3)}},
      {text: 'ADVANCE TO THE NEAREST UTILITY. IF UNOWNED, you may buy it from the Bank. IF OWNED, pay owner a total ten times the numbers on dice thrown.', action:function (player){game.movePlayerToNearestUtility(player,[5,12,15,25,28,35])}},
      {text: 'Bank pays you dividend of $50.', action:function (player){game.payToPlayer(player,50)}},
      {text: 'ADVANCE TO THE NEAREST RAILROAD. If UNOWNED, you may buy it from the Bank. If OWNED, pay owner twice the rental to which they are otherwise entitled.', action:function (player){game.movePlayerToNearestRailRoad(player,[5,15,25],2)}},
      {text: 'Pay poor tax of $15.', action:function (player){game.collectFromPlayer(player,15)}},
      {text: 'Take a trip to Reading Rail Road. If you pass \"GO\" collect $200.', action:function (player){game.movePlayer(player, 5)}},
      {text: 'ADVANCE to Boardwalk.', action:function (player){game.movePlayer(player, 39)}},
      {text: 'ADVANCE to Illinois Avenue. If you pass \"GO\" collect $200.', action:function (player){game.movePlayer(player, 24)}},
      {text: 'Your building loan matures. Collect $150.', action:function (player){game.payToPlayer(player,150)}},
      {text: 'ADVANCE TO THE NEAREST RAILROAD. If UNOWNED, you may buy it from the Bank. If OWNED, pay owner twice the rental to which they are otherwise entitled.', action:function (player){game.movePlayerToNearestRailRoad(player,[5,15,25],2)}},
      {text: 'ADVANCE to St. Charles Place. If you pass \"GO\" collect $200.', action:function (player){game.movePlayer(player, 11)}},
      {text: 'Go to Jail. Go Directly to Jail. Do not pass \"GO\". Do not collect $200.', action:function (player){game.movePlayerToJail(player)}}
  ],
  colors:['red','blue','green','yellow','brown','orange','purple','grey']
};