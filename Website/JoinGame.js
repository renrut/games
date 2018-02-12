'use strict'
var Player = require('./Player')
var Game = require('./Game');
var GameDao = require('./GameDao')
var gameDao = new GameDao()
//get room record
//add player to the game
//put game back in

exports.handler = (event, context, callback) => {
    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    let requestBody = typeof event.body == "string" ? JSON.parse(event.body) : event.body;
    requestBody.ip = requestBody.ip ? requestBody.ip : event.requestContext.identity.ip;
    var player = new Player(requestBody);
    var game = new Game(requestBody);
    joinGame(player, game, done);
};

var joinGame = function(player, game, done) {
    gameDao.retrieveGame(game)
        .then((newGame) => {
            return addPlayerToGame(player, newGame)
        })
        .then((newGame) => {
            done(null, newGame);
        })
        .catch((err) => {
            console.log(err);
            done(err, null)
        })
}

var addPlayerToGame = function(player, game) {
    return new Promise((resolve, reject) => {
        game.addPlayer(player);
        gameDao.updateGame(game)
            .then((game) => {
                console.log(game);
                resolve(game);
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });
    })

}
