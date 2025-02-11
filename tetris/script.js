document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("tetris");
    const ctx = canvas.getContext("2d");
    ctx.scale(30, 30);
    const teladoPerdeu = document.getElementById("perdeu");

    const pieces = [
        { shape: [[1, 1, 1, 1]], color: "blue" },
        { shape: [[0, 1, 1], [1, 1, 0]], color: "purple" },
        { shape: [[1, 1, 0], [0, 1, 1]], color: "green" },
        { shape: [[1, 1], [1, 1]], color: "red" },
        { shape: [[0, 1, 0], [1, 1, 1]], color: "darkpink" },
        { shape: [[1, 1, 1], [0, 0, 1]], color: "brown" },
        { shape: [[1, 1, 1], [1, 0, 0]], color: "yellow" }
    ];

    function createMatrix(w, h) {
        return Array.from({ length: h }, () => new Array(w).fill(0));
    }

    function createPlayer() {
        const piece = pieces[Math.floor(Math.random() * pieces.length)];
        return { pos: { x: 4, y: 0 }, matrix: piece.shape, color: piece.color };
    }

    const arena = createMatrix(10, 20);
    let player = createPlayer();
    let dropCounter = 0;
    let lastTime = 0;
    const dropInterval = 1000;

    function drawMatrix(matrix, offset, color) {
        ctx.fillStyle = color;
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }

    function merge(arena, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena[y + player.pos.y][x + player.pos.x] = player.color;
                }
            });
        });
    }

    function collide(arena, player) {
        return player.matrix.some((row, y) => 
            row.some((value, x) => 
                value !== 0 && (arena[y + player.pos.y]?.[x + player.pos.x] !== 0)));
    }

    function rotate(matrix) {
        return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
    }

    function clearRows() {
        for (let y = arena.length - 1; y >= 0; y--) {
            if (arena[y].every(value => value !== 0)) {
                arena.splice(y, 1);
                arena.unshift(new Array(arena[0].length).fill(0));
            }
        }
    }

    function playerDrop() {
        player.pos.y++;
        if (collide(arena, player)) {
            player.pos.y--;
            merge(arena, player);
            clearRows();
            if (player.pos.y <= 0) {
                gameOver();
                return;
            }
            player = createPlayer();
        }
    }

    function gameOver() {
        teladoPerdeu.style.display = "block";
        document.addEventListener("click", resetGame, { once: true });
    }

    function resetGame() {
        arena.forEach(row => row.fill(0));
        player = createPlayer();
        teladoPerdeu.style.display = "none";
        update();
    }

    function playerMove(dir) {
        player.pos.x += dir;
        if (collide(arena, player)) {
            player.pos.x -= dir;
        }
    }

    function playerRotate() {
        const prevMatrix = player.matrix;
        player.matrix = rotate(player.matrix);
        if (collide(arena, player)) {
            player.matrix = prevMatrix;
        }
    }

    function update(time = 0) {
        const deltaTime = time - lastTime;
        lastTime = time;
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
            dropCounter = 0;
        }
        draw();
        requestAnimationFrame(update);
    }

    function draw() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        arena.forEach((row, y) => {
            row.forEach((color, x) => {
                if (color !== 0) {
                    ctx.fillStyle = color;
                    ctx.fillRect(x, y, 1, 1);
                }
            });
        });
        drawMatrix(player.matrix, player.pos, player.color);
    }

    document.addEventListener("keydown", event => {
        if (event.key === "ArrowLeft") {
            playerMove(-1);
        } else if (event.key === "ArrowRight") {
            playerMove(1);
        } else if (event.key === "ArrowUp") {
            playerRotate();
        } else if (event.key === "ArrowDown") {
            playerDrop();
        }
        draw();
    });

    update();
});
