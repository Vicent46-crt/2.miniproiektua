const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');


const grabitatea = 1.62;
const denboraPausoa = 0.016;
const energiaGaltzea = 0.4;
const marruskaduraKoef = 0.05;

let karratuak = [];
let pilota = {
    x: 400,
    y: 350,
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

    const zabalera = canvas.width * 0.1;
    const Altuera = canvas.height * 0.3;
    const hutsunea = canvas.width * 0.15;

    karratuak = [];
    karratua_marraztu(hutsunea * 0.5,canvas.height - Altuera * 1.5, zabalera, Altuera * 1.5);
    karratua_marraztu(hutsunea * 1 + zabalera, canvas.height * 0.05 - Altuera, zabalera * 2, Altuera * 2);
    karratua_marraztu(hutsunea * 4 + zabalera * 3, canvas.height - Altuera * 2, zabalera, Altuera * 2);

    ctx.fillStyle = "grey";
    karratuak.forEach(square => {
        ctx.fillRect(square.x, square.y, square.width, square.height);
    });

    pilotaMarraztu();
}


function pilotaMarraztu() {
    ctx.beginPath();
    ctx.arc(pilota.x, pilota.y, pilota.erradioa, 0, 2 * Math.PI);
    ctx.fillStyle = pilota.kolorea;
    ctx.fill();
    ctx.closePath();

    if (pilota.tiratzen && pilota.abiaraziX !== null && pilota.abiaraziY !== null) {
        const dx = pilota.abiaraziX - pilota.x;
        const dy = pilota.abiaraziY - pilota.y;
        const distantzia = Math.min(Math.sqrt(dx * dx + dy * dy), 150);
        const angelu = Math.atan2(dy, dx);
        const moztutakoX = pilota.x + Math.cos(angelu) * distantzia;
        const moztutakoY = pilota.y + Math.sin(angelu) * distantzia;

        ctx.beginPath();
        ctx.moveTo(pilota.x, pilota.y);
        ctx.lineTo(moztutakoX, moztutakoY);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }
}

function checkCollision(pelota, cuadrado) {
    const distX = Math.abs(pelota.x - cuadrado.x - cuadrado.width / 2);
    const distY = Math.abs(pelota.y - cuadrado.y - cuadrado.height / 2);

    if (distX > (cuadrado.width / 2 + pelota.erradioa) || distY > (cuadrado.height / 2 + pelota.erradioa)) {
        return false;
    }

    if (distX <= (cuadrado.width / 2) || distY <= (cuadrado.height / 2)) {
        return true;
    }

    const dx = distX - cuadrado.width / 2;
    const dy = distY - cuadrado.height / 2;
    return (dx * dx + dy * dy <= (pelota.erradioa * pelota.erradioa));
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
        pilota.vx *= -1;
    } else if (pilota.x + pilota.erradioa > canvas.width) {
        pilota.x = canvas.width - pilota.erradioa;
        pilota.vx *= -1;
    }

    let onAnySquare = false;

    karratuak.forEach(square => {
        if (checkCollision(pilota, square)) {
            onAnySquare = true;

            const overlapX = pilota.x - Math.max(square.x, Math.min(pilota.x, square.x + square.width));
            const overlapY = pilota.y - Math.max(square.y, Math.min(pilota.y, square.y + square.height));

            if (Math.abs(overlapY) > Math.abs(overlapX)) {
                if (overlapY > 0 && pilota.vy < 0) {
                    pilota.y = square.y + square.height + pilota.erradioa;
                } else if (overlapY < 0 && pilota.vy > 0) {
                    pilota.y = square.y - pilota.erradioa;
                    pilota.vy *= -energiaGaltzea;
                }
            } else {
                if (overlapX > 0 && pilota.vx < 0) {
                    pilota.x = square.x + square.width + pilota.erradioa;
                } else if (overlapX < 0 && pilota.vx > 0) {
                    pilota.x = square.x - pilota.erradioa;
                }
                pilota.vx *= -1;
            }

            pilota.vx *= (1 - marruskaduraKoef);
        }
    });

    if (!onAnySquare && pilota.y + pilota.erradioa >= canvas.height) {
        pilota.x = karratuak[0].x + karratuak[0].width / 2;
        pilota.y = karratuak[0].y - pilota.erradioa;
        pilota.vx = 0;
        pilota.vy = 0;
    }
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
        // alert("EPAAA");
        window.location.href = '../La_antartida/main.html'; // Cambia la URL al siguiente nivel
    }

    requestAnimationFrame(gameLoop);
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

function irAOtraPagina() {
    // Cambia 'otraPagina.html' por la ruta que necesites
    window.location.href = '../Cocina/main.html';
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
gameLoop()
