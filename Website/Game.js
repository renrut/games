function Game(args) {
    this.roomCode = args.roomCode;
    this.gameName = args.gameName;
    this.players = args.players;
    this.state = args.state;
}

Game.prototype.addPlayer = function(player) {
    if (!this.players){
        this.players = {};
    }
    this.players[player.getPlayerName()] = player;
}

Game.prototype.getGameName = function() {
    return this.gameName;
}

Game.prototype.getRoomCode = function() {
    return this.roomCode;
}

module.exports = Game;
