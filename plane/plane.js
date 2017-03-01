var app = new PIXI.Application(window.innerWidth, window.innerHeight, { backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

app.stop();

PIXI.loader
    .add('spritesheet', 'res/1945.json')
    .load(onAssertsLoaded);

// 主角飞机
let plane;
// 敌人缓存池
let enemys = new Array();
// 显示敌人集合
let v_enemys = new Array();
// 子弹
let bullets = new Array();
// 显示子弹
let v_bullets = new Array();
// 敌机速度
const speed = 1.5;
// 计分
let score = 0;
let scoreText;
// explosion
blow_textures = [];

function onAssertsLoaded() {
    // add player
    const texture = PIXI.Texture.fromFrame('plane');
    plane = new PIXI.Sprite(texture);

    plane.anchor.set(0.5);

    plane.x = app.renderer.width / 2;
    plane.y = app.renderer.height / 2;

    plane.interactive = true;

    // add enemys
    const e_texture = PIXI.Texture.fromFrame('enemy');
    for (let i = 0; i < 10; i++) {
        let enemy = new PIXI.Sprite(e_texture);
        // enemy.anchor.set(0.5);
        enemy.y = -100;
        enemy.x = 0;
        enemy.anchor.set(0.5);
        enemy.visible = false;
        app.stage.addChild(enemy);
        enemys.push(enemy);
    }

    // add bullets
    const b_texture = PIXI.Texture.fromFrame('bullet');
    for (let i = 0; i < 15; i++) {
        let bullet = new PIXI.Sprite(b_texture);
        bullet.x = plane.x;
        bullet.y = plane.y - plane.height / 2;
        bullet.anchor.set(0.5);
        bullet.visible = false;
        app.stage.addChild(bullet);
        bullets.push(bullet);
    }

    // add scoreText
    scoreText = new PIXI.Text('score: ' + score.toString(), { fill: '#ffffff' });
    app.stage.addChild(scoreText);

    // add explosion
    for (let i = 1; i < 7; i++) {
        let texture = PIXI.Texture.fromFrame('blow' + i);
        blow_textures.push(texture);
    }
    plane
        .on('pointerdown', onDragStart)
        .on('pointerup', onDragEnd)
        .on('pointerupoutside', onDragEnd)
        .on('pointermove', onDragMove);

    app.stage.addChild(plane);
    app.start();
}

function onDragStart(event) {
    this.dragging = true;
    this.data = event.data;
}

function onDragMove() {
    if (this.dragging) {
        var pos = this.data.getLocalPosition(this.parent);
        if (pos.x < 0) {
            pos.x = 0;
        }
        if (pos.x > app.renderer.width) {
            pos.x = app.renderer.width;
        }
        if (pos.y < 0) {
            pos.y = 0;
        }
        if (pos.y > app.renderer.height) {
            pos.y = app.renderer.height;
        }
        this.x = pos.x;
        this.y = pos.y;
    }
}

function onDragEnd() {
    this.dragging = false;
    this.data = null;
}

// create a new Sprite from an image path
// var bunny = PIXI.Sprite.fromImage('./res/1945.png');

// center the sprite's anchor point
// bunny.anchor.set(0.5);

// move the sprite to the center of the screen
// bunny.x = app.renderer.width / 2;
// bunny.y = app.renderer.height / 2;

// app.stage.addChild(bunny);



function addEnemys() {
    let rd = parseInt(Math.random() * 2);
    for (let i = 0; i < rd; i++) {
        if (enemys.length > 0) {
            let item = enemys.shift();
            item.visible = true;
            item.y = 0;
            item.x = Math.random() * (app.renderer.width - item.width);
            v_enemys.push(item);
        }
    }
}

function moveEnemys() {
    if (v_enemys.length > 0) {
        for (let i = 0; i < v_enemys.length; i++) {
            let item = v_enemys[i];
            item.y += 2;
        }
    }
}

function collectEnemys() {
    const len = v_enemys.length;
    for (let i = 0; i < len; i++) {
        let item = v_enemys[i];
        if (item && item.y > app.renderer.height) {
            item.visible = false;
            item.y = -100;
            enemys.push(item);
            v_enemys.splice(i, 1);
        }
    }
}

function addBullets() {
    if (bullets.length > 0) {
        let item = bullets.shift();
        item.visible = true;
        item.y = plane.y - plane.height / 2;
        item.x = plane.x;
        v_bullets.push(item);
    }
}

function moveBullects() {
    for (let i = 0; i < v_bullets.length; i++) {
        let item = v_bullets[i];
        item.y += -2;
    }
}

function collectBullets() {
    const len = v_bullets.length;
    for (let i = 0; i < len; i++) {
        let item = v_bullets[i];
        if (item && item.y < 0) {
            item.visible = false;
            // item.y = -100;
            bullets.push(item);
            v_bullets.splice(i, 1);
        }
    }
}

// add enemys
let enemyTime = setInterval(function () {
    addEnemys();
}, 1000);
// add bullects
let bulletTime = setInterval(function () {
    addBullets();
}, 500);

function addScore() {
    score += 100;
    scoreText.text = 'score: ' + score.toString();
}
// 爆炸效果
function addBlow(point) {
    let explosion = new PIXI.extras.AnimatedSprite(blow_textures);
    explosion.x = point.x - explosion.width / 2;
    explosion.y = point.y - explosion.height / 2;
    explosion.animationSpeed = 0.2;
    app.stage.addChild(explosion);
    explosion.loop = false;
    explosion.onComplete = function () {
        this.destroy();
    }
    explosion.play();
}

function hit() {
    let b_len = v_bullets.length, e_len = v_enemys.length;
    for (let i = 0; i < b_len; i++) {
        let bullet = v_bullets[i];
        for (let j = 0; j < e_len; j++) {
            let enemy = v_enemys[j];
            if (bullet && enemy) {
                if (bullet.collision(enemy) == true) {
                    bullet.visible = false;
                    bullets.push(bullet);
                    v_bullets.splice(i, 1);
                    enemy.visible = false;
                    enemys.push(enemy);
                    v_enemys.splice(j, 1);

                    addBlow(new PIXI.Point(bullet.x, bullet.y));

                    addScore();
                }
            }
        }
    }
}

function checkDead() {
    let len = v_enemys.length;
    for (let i = 0; i < len; i++) {
        let enemy = v_enemys[i];
        if (enemy && plane) {
            if (plane.collision(enemy) === true) {
                enemy.visible = false;
                enemys.push(enemy);
                v_enemys.splice(i, 1);

                plane.destroy();
                gameOver();
            }
        }
    }
}

function gameOver() {
    app.stop();
    bulletTime && clearInterval(bulletTime);
    enemyTime && clearInterval(enemyTime);
    alert('game over');
}

// Listen for animate update
app.ticker.add(function (delta) {
    moveEnemys();
    collectEnemys();

    moveBullects();
    collectBullets();

    hit();

    checkDead();
});