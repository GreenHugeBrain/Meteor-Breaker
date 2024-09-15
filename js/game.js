const rocket = document.querySelector('.rocketimg');
const gameScene = document.querySelector('.game-scene');
let score = 0;
let health = 100;
let level = 1;
let meteorSpeed = 1;
let bestScore = localStorage.getItem('bestScore') || 0;
document.getElementById('bestScore').textContent = bestScore;


function rocketMove() {
    document.addEventListener('mousemove', (event) => {
        const x = event.clientX;
        const y = event.clientY;

        const rocketRect = rocket.getBoundingClientRect();
        const rocketWidth = rocketRect.width;
        const rocketHeight = rocketRect.height;

        const gameSceneRect = gameScene.getBoundingClientRect();
        const gameSceneHeight = gameSceneRect.height;

        const minY = gameSceneHeight / 2 - rocketHeight / 2;
        const maxY = gameSceneHeight - rocketHeight / 2;

        const clampedY = Math.min(Math.max(y - rocketHeight / 2, minY), maxY);
        const clampedX = x - rocketWidth * 4;

        rocket.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
    });
}

rocketMove();

function createMeteors() {
    const meteor = document.createElement('img');
    meteor.src = 'assets/meteor.png';
    meteor.alt = 'meteor';
    meteor.classList.add('meteor');
    meteor.style.position = 'absolute';

    const speed = fallRandomly();
    meteor.dataset.speed = speed;

    document.querySelector('.meteors').appendChild(meteor);
    const gameSceneRect = gameScene.getBoundingClientRect();
    const gameSceneWidth = gameSceneRect.width;
    const meteorWidth = meteor.offsetWidth;
    const randomPosition = Math.floor(Math.random() * (gameSceneWidth - meteorWidth));
    meteor.style.left = `${randomPosition}px`;
}

function fallRandomly() {
    return Math.floor(Math.random() * meteorSpeed) + 1;
}

createMeteors();
createMeteors();

setInterval(() => {
    document.querySelectorAll('.meteor').forEach(meteor => {
        const speed = parseInt(meteor.dataset.speed);
        let currentTop = parseInt(meteor.style.marginTop, 10) || 0;
        meteor.style.marginTop = `${currentTop + speed}px`;
    });
    removeMeteor();
}, 10);

function removeMeteor() {
    const meteors = document.querySelectorAll('.meteor');
    const gameSceneRect = gameScene.getBoundingClientRect();

    meteors.forEach(meteor => {
        const meteorRect = meteor.getBoundingClientRect();
        const meteorBottom = meteorRect.bottom;

        if (meteorBottom > gameSceneRect.bottom) {
            meteor.remove();
            createMeteors();
            decreaseHealth(10);
        }
    });
}

function shootBlasters() {
    document.addEventListener('click', () => {
        const blaster = document.createElement('div');
        blaster.classList.add('blaster');
        const blasters = document.querySelector('.blasters');
        blasters.appendChild(blaster);

        const rocketRect = rocket.getBoundingClientRect();
        const rocketLeft = rocketRect.left;
        const rocketTop = rocketRect.top;
        blaster.style.marginLeft = rocketLeft + 'px';
        blaster.style.marginTop = rocketTop + 'px';

        setInterval(() => {
            const blasterTop = parseInt(blaster.style.marginTop);
            blaster.style.marginTop = blasterTop - 10 + 'px';
        }, 16);

        collisionDetection();
    });
}

shootBlasters();

function collisionDetection() {
    const meteors = document.querySelectorAll('.meteor');
    const blasters = document.querySelectorAll('.blaster');

    meteors.forEach(meteor => {
        blasters.forEach(blaster => {
            const meteorRect = meteor.getBoundingClientRect();
            const blasterRect = blaster.getBoundingClientRect();

            if (
                meteorRect.left < blasterRect.right &&
                meteorRect.right > blasterRect.left &&
                meteorRect.top < blasterRect.bottom &&
                meteorRect.bottom > blasterRect.top
            ) {
                meteor.remove();
                blaster.remove();

                const audio = new Audio('assets/boom.m4a');
                audio.play();

                updateScore(10);
                createMeteors();
                createMeteorParticles(meteorRect);
                console.log("Collision detected!");
            }
        });
    });
}

function createMeteorParticles(meteorRect) {
    const numParticles = 20;
    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        const offsetX = Math.random() * meteorRect.width - meteorRect.width / 2;
        const offsetY = Math.random() * meteorRect.height - meteorRect.height / 2;

        particle.style.left = `${meteorRect.left + offsetX}px`;
        particle.style.top = `${meteorRect.top + offsetY}px`;

        const randomXMovement = (Math.random() - 0.5) * 2;
        particle.style.setProperty('--x-movement', randomXMovement);

        document.body.appendChild(particle);

        particle.addEventListener('animationend', () => {
            particle.remove();
        });
    }
}

function updateScore(amount) {
    score += amount;
    document.getElementById('score').textContent = score;

    // Check level advancement
    if (score >= 100 && score < 200) {
        level = 2;
        meteorSpeed = 2; 
    } else if (score >= 200) {
        level = 3;
        meteorSpeed = 3;
    }

    document.getElementById('level').textContent = level;
}

function decreaseHealth(amount) {
    health -= amount;
    if (health <= 0) {
        gameOver();
    }
    document.getElementById('health').textContent = health;
}

function gameOver() {
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
        document.getElementById('bestScore').textContent = bestScore;
    }

    alert("Game Over!");
    document.location.reload();
}
