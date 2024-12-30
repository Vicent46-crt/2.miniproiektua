// Al cargar la página, obtén referencias a los elementos
const enviarNombreBtn = document.getElementById("enviarNombre");
const nombreUsuarioInput = document.getElementById("nombreUsuario");
const mensajeParrafo = document.getElementById("mensaje");
const startButton = document.getElementById("startButton");

// Escucha el click en el botón "enviarNombre"
enviarNombreBtn.addEventListener("click", () => {
  const nombre = nombreUsuarioInput.value.trim();
  if (nombre) {
    const mensaje = "Kaixo, " + nombre + "! Zurekin ezagutzea pozgarria da.";
    mensajeParrafo.textContent = mensaje;

    // Guarda el nombre en localStorage
    localStorage.setItem("nombreUsuario", nombre);
  } else {
    mensajeParrafo.textContent = "Por favor, escribe un nombre válido.";
  }
});

// Escucha el click en el botón START
startButton.addEventListener("click", () => {
  const nombre = localStorage.getItem("nombreUsuario");
  if (nombre) {
    alert("¡El juego comienza, " + nombre + "!");
  } else {
    alert("¡El juego comienza!");
  }
  window.location.href = "../mutrik_1/mutri_1.html"
});