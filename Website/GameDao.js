const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB.DocumentClient();
var Game = require('./Game')

function GameDao(){
    this.ddb = ddb;
}

GameDao.prototype.retrieveGame = function(game) {
    return new Promise((resolve, reject) => {
        buildGetItemPromise(game.getGameName(), game.getRoomCode())
        .then((result) => {
            resolve(this.unmarshall(result));
        })
        .catch((err) => {
            reject(err);
        })
    })
}

GameDao.prototype.updateGame = function(game, options) {
    return new Promise((resolve, reject) => {
        buildPutItemPromise(game.getGameName(), game.getRoomCode(), game, options)
            .then((game) => {
                console.log(game);
                resolve(game);
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            })
    });
}

GameDao.prototype.mergeGameRecords = function(mergeFirst, intoSecond) {
    for(const key of Object.keys(mergeFirst)){
        intoSecond[key] = mergeFirst[key]
    }
    return intoSecond;
}

GameDao.prototype.unmarshall = function(gameRecord) {
    console.log(gameRecord);
    let game = new Game(gameRecord.Item);
    return game;
}

GameDao.prototype.marhsall = function(game){

}

var buildGetItemPromise = function(tableName, key) {
  let keyName = buildKeyName(tableName);
  let params = {
      TableName: tableName,
      Key: {[keyName]: key},
      ConsistentRead: true
  };
  return ddb.get(params).promise();
}

var buildPutItemPromise = function(tableName, key, item, options) {
  let params = buildBasicParams(tableName, key)
  params.Item = item;
  if (options){
      for(const key of Object.keys(options)) {
          params[key] = options[key];
      }
  }
  return ddb.put(params).promise();
}

var buildBasicParams = function(tableName, key, item) {
  let params = {
      TableName: tableName,
      Key: { [buildKeyName(tableName)]: key }
  }
  params.Item = item ? item : { [buildKeyName(tableName)]: key };
  return params;
}

var buildKeyName = function(tableName) {
  return 'roomCode';
}

module.exports = GameDao;
