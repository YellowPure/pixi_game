PIXI.Sprite.prototype.collision = function (enemy) {
    var xdist = enemy.x - this.x;
    if (xdist > -enemy.width / 2 && xdist < enemy.width / 2) {
        var ydist = enemy.y - this.y;
        if (ydist > -enemy.height / 2 && ydist < enemy.height / 2) {
            // hit
            return true;
        }
    }
    return false;
}