var i = cc.Enum({
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
});
cc.Enum({
    pine: 20,
    balloon: 21,
    vine: 22,
    ironLineBox: 23,
    woodBox: 25,
    flower: 26,
    windmill: 27,
    stoneStatue: 28,
    colorCube: 29,
    ladybug: 37, 
    waterBubble: 38,
    rockStone: 39,
    customBlocks: 40
})
module.exports = {
    cellSize: 75,
    matrixRow: 9,
    matrixCol: 9,
    totalColors: [0, 1, 2, 3, 4],
    extraScore: 2e3,
    rType: 8,
    bType: 9,
    dType: 10,
    direction: i,
    continueCostList: [100, 250, 350, 450, 750, 1050],
    REWARD_COINS_NUM: 15,
    MAX_LIFE: 6,
    playerTooLCostList: [{
        type: 0,
        price: 150
    }, {
        type: 1,
        price: 120
    }, {
        type: 2,
        price: 100
    }, {
        type: 3,
        price: 80
    }],
    gameToolCost: 120,
    giftNumber: [{
        coins: 200,
        life: 0,
        gameTool: {
            rocket: 1,
            bomb: 1,
            disco: 1
        },
        playerTool: {
            boxing: 1,
            anvil: 1,
            hammer: 1,
            dice: 1
        }
    }, {
        coins: 500,
        life: 0,
        gameTool: {
            rocket: 1,
            bomb: 1,
            disco: 1
        },
        playerTool: {
            boxing: 1,
            anvil: 1,
            hammer: 1,
            dice: 1
        }
    }, {
        coins: 1e3,
        life: 0,
        gameTool: {
            rocket: 3,
            bomb: 3,
            disco: 3
        },
        playerTool: {
            boxing: 3,
            anvil: 3,
            hammer: 3,
            dice: 3
        }
    }, {
        coins: 2e3,
        life: 6,
        gameTool: {
            rocket: 5,
            bomb: 5,
            disco: 5
        },
        playerTool: {
            boxing: 5,
            anvil: 5,
            hammer: 5,
            dice: 5
        }
    }, {
        coins: 4e3,
        life: 12,
        gameTool: {
            rocket: 12,
            bomb: 12,
            disco: 12
        },
        playerTool: {
            boxing: 12,
            anvil: 12,
            hammer: 12,
            dice: 12
        }
    }, {
        coins: 8e3,
        life: 24,
        gameTool: {
            rocket: 25,
            bomb: 25,
            disco: 25
        },
        playerTool: {
            boxing: 25,
            anvil: 25,
            hammer: 25,
            dice: 25
        }
    }],
    coinsList: [150, 500, 1e3, 2e3, 4e3, 8e3]
}