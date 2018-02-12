'use strict';

const AWS = require('aws-sdk');
const lambda = new AWS.Lambda({region: 'us-east-1'});
const Game = require('./Game');
const GameDao = require('./GameDao');
const gameDao = new GameDao();
const MAX_RETRIES = 5;

exports.handler = (event, context, callback) => {
  const done = (err, res) => callback(null, {
      statusCode: err ? '400' : '200',
      body: err ? err.message : JSON.stringify(res),
      headers: {
          'Content-Type': 'application/json',
      },
  });
    let requestBody = JSON.parse(event.body);
    var game = new Game(requestBody);

    createRoomCodePromise(game)
    .then((newGame) => {
        console.log('Joining game ' + newGame.getRoomCode())
        return joinRoomPromise(newGame, requestBody, event);
    }).then((data) => {
      console.log("here")
        console.log(data);
        done(null, data.Payload);
    }).catch((err) => {
      console.log("error")
        done(err, null);
    });
};


var createRoomCodePromise = function(game) {
  return new Promise((resolve, reject) => {
      tryCreateGame(game,resolve, reject, 0)
  });
}

var tryCreateGame = function(game, resolve, reject, limit) {
  game.roomCode = makeId();
  gameDao.updateGame(game, {ConditionExpression : "attribute_not_exists(roomCode)"})
  .then((anything) => {
        resolve(game)
    }).catch((err) => {
        if(limit == MAX_RETRIES) {
            reject("Too many retries. Could not create the game.");
        }
        tryCreateGame(game, resolve, reject, limit + 1);
    });
}

var makeId = function() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (var i = 0; i < 4; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

var joinRoomPromise = function(game, requestBody, event) {
    var params = { body: {
        roomCode: game.getRoomCode(),
        gameName: game.getGameName(),
        playerName: requestBody.playerName,
        host: true,
        ip: event.requestContext.identity.sourceIp
        }
    }
    return lambda.invoke({
        FunctionName: 'JoinGame',
        Payload: JSON.stringify(params)
    }).promise();
}
