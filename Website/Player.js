function Player(body) {
    this.ip = body.ip;
    this.playerName = body.playerName;
    this.host = body.host;
    this.points = body.points ? body.points : 0;
}

Player.prototype.getName = function() {
    return this.playerName;
}
Player.prototype.getPlayerName = Player.prototype.getName;

module.exports = Player;
