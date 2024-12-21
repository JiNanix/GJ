const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player, objects, cursors, score = 0, scoreText, spawnDelay = 1000, objectSpeed = 200, maxSpeed = 1000;
let lastObjectX = null; // Для отслеживания последней позиции спавна

function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('object', 'assets/object.png');
}

function create() {
    this.add.image(400, 300, 'background');

    player = this.physics.add.sprite(400, 500, 'player');
    player.setCollideWorldBounds(true);
    player.body.setAllowGravity(false);
    player.setFlipX(false);

    objects = this.physics.add.group();

    this.physics.add.collider(player, objects, hitObject, null, this);

    cursors = this.input.keyboard.createCursorKeys();

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#ff0606', fontStyle: "bold" });

    // Таймер для спавна объектов
    this.time.addEvent({
        delay: spawnDelay, // начальная задержка
        callback: spawnObjects,
        callbackScope: this,
        loop: true
    });

    // Перезапуск игры
    this.input.keyboard.on('keydown-R', () => {
        this.scene.restart();
        score = 0;
        spawnDelay = 1000; // Сбрасываем задержку
        objectSpeed = 150; // Сбрасываем скорость
        lastObjectX = null; // Сбрасываем последнюю позицию
    });
}

function update() {
    const speed=500;
    if (cursors.left.isDown) {
        player.setVelocityX(-speed);
        player.setFlipX(true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(speed);
        player.setFlipX(false);
    } else {
        player.setVelocityX(0);
    }

    // Удаляем объекты, вышедшие за пределы экрана
    objects.children.iterate(function (child) {
        if (child && child.y > 600) { // Проверяем, что объект существует
            child.destroy(); // Удаляем объект из группы
            updateScore(10); // Добавляем очки за избежание
        } else if (child) {
            child.setY(child.y + objectSpeed * 0.016); // Передвигаем объект вниз
        }
    });

    adjustDifficulty(); // Проверяем необходимость повышения сложности
}

// Функция для спавна объектов
function spawnObjects() {
    if (objects.countActive(true) >= 5) return; // Проверка: если объектов >= 5, новые не спавнятся

    const count = Phaser.Math.Between(1, 4); // Случайное количество объектов (от 1 до 3)
    for (let i = 0; i < count; i++) {
        if (objects.countActive(true) >= 5) break; // Остановка спавна, если достигнут лимит

        let x;
        do {
            x = Phaser.Math.Between(0, 800); // Случайная позиция по X
        } while (lastObjectX !== null && Math.abs(x - lastObjectX) < 100); // Проверка расстояния

        lastObjectX = x; // Сохраняем позицию последнего объекта

        const y = Phaser.Math.Between(-100, 0); // Чуть выше верхней границы экрана
        const object = objects.create(x, y, 'object');
        object.setVelocity(0, 0); // Убираем гравитацию, задаем начальную скорость вручную
    }
}

function hitObject(player, object) {
    this.physics.pause();
    player.setTint(0xff0000);

    this.add.text(300, 250, 'Game Over\nPress R to Restart', {
        fontSize: '32px',
        fill: '#ff0606',
        align: 'center',
        fontStyle: 'bold',
    });
}

function updateScore(points) {
    score += points;
    scoreText.setText('Score: ' + score);
}

// Функция для регулировки сложности с процентным увеличением
function adjustDifficulty() {
    if (score > 0 && score % 100 === 0 && objectSpeed < maxSpeed) {

        objectSpeed += 1;
    }
}

