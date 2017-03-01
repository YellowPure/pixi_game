/**
 * @author h.love.pure@gmail.com
 * rule  蛇头不能咬到蛇身,咬到则游戏结束.
 *       蛇撞到墙壁会死,撞到则游戏结束.
 *       蛇只能朝三个方向移动,不能直接调头.
 *       蛇吃掉食物后蛇身会变长.
 *       蛇身随着蛇头的轨迹进行移动.
 * 
 */

var app = new PIXI.Application(window.innerWidth, window.innerHeight, { backgroundColor: 0x000000 });
document.body.appendChild(app.view);

const sizeWidth = 20, sizeHeight = 27;

// blockWidth
const blockWidth = app.renderer.width / sizeWidth;

const Direction = {
    up: 1,
    down: -1,
    right: 2,
    left: -2
}

// levelInterval
const levelInterval = 5;

// internal
let internal = 500;

// class Controller
function Controller() {
    PIXI.Container.call(this);
    const ARROW_W = 4;
    let self = this;
    let up_arrow = new PIXI.Graphics();
    up_arrow.beginFill(0xff7700);
    up_arrow.drawPolygon([new PIXI.Point(5 * ARROW_W, 0), new PIXI.Point(10 * ARROW_W, 6 * ARROW_W), new PIXI.Point(0, 6 * ARROW_W)]);
    up_arrow.drawRect(2.5 * ARROW_W, 4 * ARROW_W, 5 * ARROW_W, 5 * ARROW_W);
    up_arrow.endFill();
    up_arrow.on('pointerdown', function () {
        this.alpha = .5;
        self.onUpHandler && self.onUpHandler();
    })
        .on('pointerup', this.onEnd)
        .on('pointerupoutside', this.onEnd);

    up_arrow.interactive = true;

    let down_arrow = new PIXI.Graphics();
    down_arrow.beginFill(0xff7700);
    down_arrow.drawPolygon([new PIXI.Point(0, 4 * ARROW_W), new PIXI.Point(10 * ARROW_W, 4 * ARROW_W), new PIXI.Point(5 * ARROW_W, 10 * ARROW_W)]);
    down_arrow.drawRect(2.5 * ARROW_W, 0, 5 * ARROW_W, 5 * ARROW_W);
    down_arrow.endFill();
    down_arrow.interactive = true;
    down_arrow.on('pointerdown', function () {
        this.alpha = .5;
        self.onDownHandler && self.onDownHandler();
    })
        .on('pointerup', this.onEnd)
        .on('pointerupoutside', this.onEnd);

    let left_arrow = new PIXI.Graphics();
    left_arrow.beginFill(0xff7700);
    left_arrow.drawPolygon([new PIXI.Point(0, 5 * ARROW_W), new PIXI.Point(4 * ARROW_W, 0), new PIXI.Point(4 * ARROW_W, 10 * ARROW_W)]);
    left_arrow.drawRect(4 * ARROW_W, 2.5 * ARROW_W, 5 * ARROW_W, 5 * ARROW_W);
    left_arrow.endFill();
    left_arrow.interactive = true;
    left_arrow.on('pointerdown', function () {
        this.alpha = .5;
        self.onLeftHandler && self.onLeftHandler();
    })
        .on('pointerup', this.onEnd)
        .on('pointerupoutside', this.onEnd);

    let right_arrow = new PIXI.Graphics();
    right_arrow.beginFill(0xff7700);
    right_arrow.drawPolygon([new PIXI.Point(5 * ARROW_W, 0), new PIXI.Point(9 * ARROW_W, 5 * ARROW_W), new PIXI.Point(5 * ARROW_W, 10 * ARROW_W)]);
    right_arrow.drawRect(0, 2.5 * ARROW_W, 5 * ARROW_W, 5 * ARROW_W);
    right_arrow.endFill();
    right_arrow.interactive = true;
    right_arrow.on('pointerdown', function () {
        this.alpha = .5;
        self.onRightHandler && self.onRightHandler();
    })
        .on('pointerup', this.onEnd)
        .on('pointerupoutside', this.onEnd);

    let container = new PIXI.Container();
    up_arrow.x = 50;
    down_arrow.x = 50;
    down_arrow.y = 100;

    left_arrow.x = 0;
    left_arrow.y = right_arrow.y = 50;
    right_arrow.x = 100;

    this.up_arrow = up_arrow;
    this.down_arrow = down_arrow;
    this.left_arrow = left_arrow;
    this.right_arrow = right_arrow;
    this.addChild(up_arrow);
    this.addChild(down_arrow);
    this.addChild(left_arrow);
    this.addChild(right_arrow);
}
Controller.prototype.constructor = Controller;
Controller.prototype = Object.create(PIXI.Container.prototype);
Controller.prototype.onEnd = function (event) {
    if (event.target) {

        event.target.alpha = 1;
    }
}

/**
 * class Block
 */
function Block() {
    PIXI.Container.call(this);
    let graphics = new PIXI.Graphics();
    graphics.beginFill(0xff7700);
    graphics.lineStyle(1, 0xffffff);
    graphics.drawRect(0, 0, blockWidth - 1, blockWidth - 1);
    graphics.endFill();
    this.addChild(graphics);
}
Block.prototype.constructor = Block;
Block.prototype = Object.create(PIXI.Container.prototype);

/**
 * class Snake
 */
function Snake() {
    PIXI.Container.apply(this);
    let self = this;

    function Head(x = 9, y = 9) {
        this.x = x;
        this.y = y;
        this.direction = undefined;
    }

    Head.prototype.eat = function (food) {
        // console.log(food.ix, food.iy, this.x, this.y);
        if (food.ix == this.x && food.iy == this.y) {
            return true;
        } else {
            return false;
        }
    }
    Head.prototype.move = function (direction, food) {
        if (direction + this.direction == 0) {
            direction = this.direction;
        }
        let head = this.get();
        this.direction = direction;
        switch (direction) {
            case Direction.up:
                this.y--;
                break;
            case Direction.down:
                this.y++;
                break;
            case Direction.left:
                this.x--;
                break;
            case Direction.right:
                this.x++;
                break;
        }
        if (this.eat(food)) {
            self.body.increase(head);
            food.generate(self);
            game.levelUp();
        } else if (this.hitCheck(this.x, this.y) || this.eatSelfCheck(this.x, this.y)) {
            self.die();
            game.gameOver();
            return false;
        } else {
            self.body.move(head);
        }
        return true;
    }
    Head.prototype.get = function () {
        return {
            x: this.x,
            y: this.y
        }
    }

    Head.prototype.hitCheck = function (x, y) {
        if (x < 0 || y < 0 || x >= sizeWidth || y >= sizeHeight) {
            return true;
        } else {
            return false;
        }
    }
    Head.prototype.eatSelfCheck = function (x, y) {
        let part = self.body.part;
        for (let i = part.length; i--;) {
            if (x == part[i].x && y == part[i].y) {
                return true;
            }
        }
        return false;
    }

    function Body() {
        this.part = [];
    }
    Body.prototype.move = function (head) {
        if (this.part.length > 0) {
            this.part.pop();
            this.increase(head);
        }
    }
    Body.prototype.increase = function (head) {
        this.part.unshift(head);
    }

    let head = new Head(9, 9);
    let body = new Body();
    this.head = head;
    this.body = body;

    // render head


    // render body
    for (let i = 0; i < this.body.part.length; i++) {
        let element = this.body.part[i];
        let block = new Block();
        block.x = element.x * blockWidth;
        block.y = element.y * blockWidth;
        this.addChild(block);
    }

}

Snake.prototype.constructor = Snake;
Snake.prototype = Object.create(PIXI.Container.prototype);
Snake.prototype.die = function () {
    // alert('gameOver' + this.body.part.length);
}

Snake.prototype.draw = function () {
    for (let i = this.children.length - 1; i >= 0; i--) {
        this.removeChildAt(i);
    }
    let _head = new Block();
    this.addChild(_head);
    _head.x = this.head.x * blockWidth;
    _head.y = this.head.y * blockWidth;

    for (let i = 0; i < this.body.part.length; i++) {
        let element = this.body.part[i];
        let block = new Block();
        block.x = element.x * blockWidth;
        block.y = element.y * blockWidth;
        this.addChild(block);
    }
}

/**
 * class Food
 */
function Food() {
    PIXI.Container.apply(this);
    this.ix = undefined, this.iy = undefined;

    let graphics = new PIXI.Graphics();
    graphics.beginFill(0xff0000);
    graphics.lineStyle(1, 0xffffff);
    graphics.drawRect(0, 0, blockWidth, blockWidth);
    graphics.endFill();

    this.addChild(graphics);
}
Food.prototype.constructor = Food;
Food.prototype = Object.create(PIXI.Container.prototype);

Food.prototype.draw = function () {
    this.x = this.ix * blockWidth;
    this.y = this.iy * blockWidth;
}

Food.prototype.generate = function (snake) {
    let head = snake.head.get(), part = snake.body.part;
    let map = [];
    for (let x = 0; x < sizeWidth; x++) {
        for (let y = 0; y < sizeHeight; y++) {
            if (x == head.x && y == head.y) {
                continue;
            }
            if (part.length > 0) {
                let pass = true;
                for (let k = 0; k < part.length; k++) {
                    if (x == part[k].x && y == part[k].y) {
                        pass = false;
                        break;
                    }
                }
                if (pass) {
                    map.push([x, y]);
                }
            } else {
                map.push([x, y]);
            }
        }
    }
    let index = Math.floor(Math.random() * map.length);
    this.ix = map[index][0];
    this.iy = map[index][1];
    this.draw();
}


/**
 * class Game
 */
function Game() {

    this.init();

}

Game.prototype.init = function () {
    this.score = 0;
    this.partIncrease = 0;
    this.level = 1;

    this.initSnake();
    this.initController();
    this.initFood();

    const line = new PIXI.Graphics();
    line.beginFill(0xffffff);
    line.drawRect(0, app.renderer.height - 160, app.renderer.width, 2);
    line.endFill();
    app.stage.addChild(line);



    this.timeId = null;
    this.direction = Direction.right;
    this.tick();

    let txt = new PIXI.Text('score: ' + this.score.toString(), { fill: '#ffffff' });
    txt.x = app.renderer.width - 220;
    txt.y = app.renderer.height - 100;
    this.scoreTxt = txt;
    app.stage.addChild(this.scoreTxt);

    txt = new PIXI.Text('level: ' + this.level.toString(), { fill: '#ffffff' });
    txt.x = app.renderer.width - 90;
    txt.y = app.renderer.height - 100;
    this.levelTxt = txt;
    app.stage.addChild(this.levelTxt);
}

Game.prototype.initFood = function () {
    this.food = new Food();
    this.food.generate(this.snake);
    app.stage.addChild(this.food);
}

Game.prototype.initSnake = function () {
    let snake = new Snake(this.levelUp, null,  this.gameOver);
    app.stage.addChild(snake);
    snake.draw();
    this.snake = snake;
}
Game.prototype.initController = function () {
    let controller = new Controller();
    controller.y = app.renderer.height - 150;

    controller.onDownHandler = this.onDownHandler.bind(this);
    controller.onUpHandler = this.onUpHandler.bind(this);
    controller.onRightHandler = this.onRightHandler.bind(this);
    controller.onLeftHandler = this.onLeftHandler.bind(this);
    this.controller = controller;

    app.stage.addChild(controller);
}

Game.prototype.onDownHandler = function () {
    this.direction = Direction.down;
}

Game.prototype.onUpHandler = function () {
    this.direction = Direction.up;
}

Game.prototype.onRightHandler = function () {
    this.direction = Direction.right;
}

Game.prototype.onLeftHandler = function () {
    this.direction = Direction.left;
}

Game.prototype.gameOver = function () {
    console.log('over');
    app.stop();
    this.timeId && clearTimeout(this.timeId);
    this.tick = null;
}

Game.prototype.levelUp = function () {
    // check increase
    this.partIncrease++;
    this.score ++;
    this.scoreTxt.text = 'score:' + (this.score * 100).toString();
    this.levelTxt.text = 'level:' + this.level.toString();
    if (this.partIncrease >= levelInterval) {
        this.level++;
        this.partIncrease = 0;
        if (this.level == 2) {
            internal = 200;
        } else if (this.level == 3) {
            internal = 100;
        } else if (this.level == 4) {
            internal = 50;
        }
    }
}

Game.prototype.tick = function () {
    if (this.snake.head.move(this.direction, this.food)) {
        this.snake.draw();
    }
    if (this.tick) {
        this.timeId && clearTimeout(this.timeId);
        this.timeId = setTimeout(this.tick.bind(this), internal);
    }
}


var game = new Game();

// let timeId = null;
// function tick() {
//     game.snake.x += blockWidth;

//     game.checkOverStage();


//     timeId && clearTimeout(timeId);
//     timeId = setTimeout(tick, 500);
// }
// tick();


