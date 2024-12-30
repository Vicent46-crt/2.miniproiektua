const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const grabitatea = 9.8;
const denboraPausoa = 0.016;
const energiaGaltzea = 0.5;
const marruskaduraKoef = 0.05;

let karratuak = [];
let pilota = {
    x: 100,
    y: canvas.height - 75,
    erradioa: 15,
    kolorea: 'blue',
    vx: 0,
    vy: 0,
    tiratzen: false,
    abiaraziX: null,
    abiaraziY: null
};

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    marraztu();
}

function karratua_marraztu(x, y, width, height) {
    karratuak.push({ x, y, width, height });
}

function marraztu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const zabalera = canvas.width * 0.08;
    const altuera = canvas.height * 0.3;
    const hutsunea = canvas.width * 0.18;

    karratuak = [];
    karratua_marraztu(0, canvas.height - 50, canvas.width, 50); 
    karratua_marraztu(60, canvas.height - altuera - 50, zabalera, altuera);
    karratua_marraztu(50 + hutsunea, canvas.height - altuera * 2, zabalera, altuera * 2); // Segunda plataforma (más alto)
    karratua_marraztu(50 + 2 * hutsunea, 0, zabalera, altuera * 1.5); // Tercera plataforma (techo, más alto)
    karratua_marraztu(50 + 3.5 * hutsunea, canvas.height - altuera * 2 - 50, zabalera, altuera * 2); // Cuarta plataforma (igual a segunda)
    karratua_marraztu(canvas.width - zabalera - 50, canvas.height - altuera - 50, zabalera, altuera); // Última plataforma

    ctx.fillStyle = "#996600"; 
    karratuak.forEach(square => {
        ctx.fillRect(square.x, square.y, square.width, square.height);
    });

    pilotaMarraztu();
    banderaMarraztu();
}

function pilotaMarraztu() {
    ctx.beginPath();
    ctx.arc(pilota.x, pilota.y, pilota.erradioa, 0, 2 * Math.PI);
    ctx.fillStyle = pilota.kolorea;
    ctx.fill();
    ctx.closePath();
}

function checkBanderaCollision(pelota, banderaX, banderaY) {
    // Verifica si la pelota está cerca del mástil del banderín
    return (
        pelota.x + pelota.erradioa > banderaX - 10 && // Márgen pequeño alrededor del mástil
        pelota.x - pelota.erradioa < banderaX + 10 &&
        pelota.y + pelota.erradioa > banderaY - 50 && // Altura del mástil
        pelota.y - pelota.erradioa < banderaY
    );
}

function banderaMarraztu() {
    const plataforma = karratuak[karratuak.length - 1]; // Última plataforma
    const banderaX = plataforma.x + plataforma.width / 2;
    const banderaY = plataforma.y;

    // Mástil
    ctx.beginPath();
    ctx.moveTo(banderaX, banderaY);
    ctx.lineTo(banderaX, banderaY - 50);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    // Bandera roja
    ctx.beginPath();
    ctx.moveTo(banderaX, banderaY - 50);
    ctx.lineTo(banderaX + 20, banderaY - 40);
    ctx.lineTo(banderaX, banderaY - 30);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();

    return { banderaX, banderaY };
}

function gameLoop() {
    updatePhysics();
    marraztu();

    // Verifica si la pelota toca el banderín
    const { banderaX, banderaY } = banderaMarraztu();
    if (checkBanderaCollision(pilota, banderaX, banderaY)) {
        window.location.href = '../La_luna/main.html'; // Cambia la URL al siguiente nivel
    }

    requestAnimationFrame(gameLoop);
}


function updatePhysics() {
    pilota.vy += grabitatea * denboraPausoa;
    pilota.x += pilota.vx;
    pilota.y += pilota.vy;

    if (pilota.y + pilota.erradioa > canvas.height) {
        pilota.y = canvas.height - pilota.erradioa;
        pilota.vy *= -energiaGaltzea;
        pilota.vx *= (1 - marruskaduraKoef);
    }

    if (pilota.y - pilota.erradioa < 0) {
        pilota.y = pilota.erradioa;
        pilota.vy *= -energiaGaltzea;
    }

    if (pilota.x - pilota.erradioa < 0) {
        pilota.x = pilota.erradioa;
        pilota.vx *= -energiaGaltzea;
    } else if (pilota.x + pilota.erradioa > canvas.width) {
        pilota.x = canvas.width - pilota.erradioa;
        pilota.vx *= -energiaGaltzea;
    }

    karratuak.forEach(square => {
        if (checkCollision(pilota, square)) {
            const overlapX = pilota.x - Math.max(square.x, Math.min(pilota.x, square.x + square.width));
            const overlapY = pilota.y - Math.max(square.y, Math.min(pilota.y, square.y + square.height));

            if (Math.abs(overlapY) > Math.abs(overlapX)) {
                if (overlapY > 0) {
                    pilota.y = square.y + square.height + pilota.erradioa;
                } else {
                    pilota.y = square.y - pilota.erradioa;
                    pilota.vy *= -energiaGaltzea;
                }
            } else {
                if (overlapX > 0) {
                    pilota.x = square.x + square.width + pilota.erradioa;
                } else {
                    pilota.x = square.x - pilota.erradioa;
                }
                pilota.vx *= -energiaGaltzea;
            }

            pilota.vx *= (1 - marruskaduraKoef);
            pilota.vy *= (1 - marruskaduraKoef); // Pierde velocidad con cada rebote
        }
    });
}

function checkCollision(pelota, cuadrado) {
    return (
        pelota.x + pelota.erradioa > cuadrado.x &&
        pelota.x - pelota.erradioa < cuadrado.x + cuadrado.width &&
        pelota.y + pelota.erradioa > cuadrado.y &&
        pelota.y - pelota.erradioa < cuadrado.y + cuadrado.height
    );
}

canvas.addEventListener('mousedown', (e) => {
    pilota.tiratzen = true;
    pilota.abiaraziX = e.clientX;
    pilota.abiaraziY = e.clientY;
});

canvas.addEventListener('mouseup', (e) => {
    if (pilota.tiratzen) {
        const dx = pilota.abiaraziX - e.clientX;
        const dy = pilota.abiaraziY - e.clientY;
        pilota.vx = dx * 0.1;
        pilota.vy = dy * 0.1;
        pilota.tiratzen = false;
    }
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
gameLoop();

