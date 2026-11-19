// Guardamos los tiempos iniciales de cada sesión.
let tiempos = {
    trabajo: 25,
    corta: 5,
    larga: 15
};

// Guardamos el tipo de sesión que está seleccionado.
let tipoActual = "trabajo";
let tiempoRestante = tiempos.trabajo * 60;
let intervalo = null;
let sesionesCompletadas = 0;

// Obtenemos los elementos del HTML.
const reloj = document.getElementById("reloj");
const nombreSesion = document.getElementById("nombre-sesion");
const botonIniciar = document.getElementById("iniciar");
const botonReiniciar = document.getElementById("reiniciar");
const botonSiguiente = document.getElementById("siguiente");
const botonesTipo = document.querySelectorAll(".tipo");
const mensaje = document.getElementById("mensaje");
const formulario = document.getElementById("formulario");

// Convierte los segundos en minutos y segundos para mostrarlos.
function mostrarTiempo() {
    const minutos = Math.floor(tiempoRestante / 60);
    const segundos = tiempoRestante % 60;

    reloj.textContent =
        String(minutos).padStart(2, "0") + ":" +
        String(segundos).padStart(2, "0");
}

// Actualiza el texto y los colores según la sesión.
function cambiarTipo(tipo) {
    pausarTemporizador();
    tipoActual = tipo;
    tiempoRestante = tiempos[tipo] * 60;

    document.body.dataset.tipo = tipo;

    if (tipo === "trabajo") {
        nombreSesion.textContent = "Tiempo de trabajo";
        mensaje.textContent = "¡Tú puedes! Concéntrate en una tarea.";
    } else if (tipo === "corta") {
        nombreSesion.textContent = "Descanso corto";
        mensaje.textContent = "Tómate un momento para respirar.";
    } else {
        nombreSesion.textContent = "Descanso largo";
        mensaje.textContent = "Descansa un poco antes de continuar.";
    }

    botonesTipo.forEach(function(boton) {
        boton.classList.toggle("activo", boton.dataset.tipo === tipo);
        boton.setAttribute("aria-pressed", boton.dataset.tipo === tipo);
    });

    mostrarTiempo();
    botonIniciar.textContent = "Iniciar";
}

// Inicia o continúa la cuenta regresiva.
function iniciarTemporizador() {
    if (intervalo !== null) {
        pausarTemporizador();
        return;
    }

    botonIniciar.textContent = "Pausar";

    intervalo = setInterval(function() {
        tiempoRestante--;
        mostrarTiempo();

        if (tiempoRestante <= 0) {
            pausarTemporizador();
            terminarSesion();
        }
    }, 1000);
}

// Detiene el temporizador sin borrar el tiempo restante.
function pausarTemporizador() {
    clearInterval(intervalo);
    intervalo = null;
    botonIniciar.textContent = "Iniciar";
}

// Reinicia el tiempo de la sesión seleccionada.
function reiniciarTemporizador() {
    pausarTemporizador();
    tiempoRestante = tiempos[tipoActual] * 60;
    mostrarTiempo();
}

// Reproduce un sonido sencillo cuando termina una sesión.
function reproducirSonido() {
    try {
        const contexto = new (window.AudioContext || window.webkitAudioContext)();
        const oscilador = contexto.createOscillator();
        const volumen = contexto.createGain();

        oscilador.connect(volumen);
        volumen.connect(contexto.destination);
        oscilador.frequency.value = 700;
        volumen.gain.value = 0.12;
        oscilador.start();
        oscilador.stop(contexto.currentTime + 0.5);
        oscilador.onended = function() {
            contexto.close();
        };
    } catch (error) {
        console.log("No se pudo reproducir el sonido.");
    }
}

// Se ejecuta cuando el tiempo llega a cero.
function terminarSesion() {
    reproducirSonido();

    if (tipoActual === "trabajo") {
        sesionesCompletadas++;

        if (sesionesCompletadas >= 4) {
            sesionesCompletadas = 0;
            cambiarTipo("larga");
        } else {
            cambiarTipo("corta");
        }
    } else {
        cambiarTipo("trabajo");
    }

    mensaje.textContent = "¡Sesión terminada! Puedes continuar cuando quieras.";
}

// Permite pasar manualmente a la siguiente sesión.
function pasarSiguiente() {
    if (tipoActual === "trabajo") {
        if (sesionesCompletadas > 0 && sesionesCompletadas % 4 === 0) {
            cambiarTipo("larga");
        } else {
            cambiarTipo("corta");
        }
    } else {
        cambiarTipo("trabajo");
    }
}


// Escuchamos los clics de los botones.
botonIniciar.addEventListener("click", iniciarTemporizador);
botonReiniciar.addEventListener("click", reiniciarTemporizador);
botonSiguiente.addEventListener("click", pasarSiguiente);

botonesTipo.forEach(function(boton) {
    boton.addEventListener("click", function() {
        cambiarTipo(boton.dataset.tipo);
    });
});

// Guardamos los nuevos tiempos escritos por el usuario.
formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const trabajo = Number(document.getElementById("min-trabajo").value);
    const corta = Number(document.getElementById("min-corta").value);
    const larga = Number(document.getElementById("min-larga").value);

    if (trabajo < 1 || corta < 1 || larga < 1 ||
        !Number.isInteger(trabajo) ||
        !Number.isInteger(corta) ||
        !Number.isInteger(larga)) {
        document.getElementById("aviso-configuracion").textContent =
            "Escribe números enteros mayores que cero.";
        return;
    }

    tiempos.trabajo = trabajo;
    tiempos.corta = corta;
    tiempos.larga = larga;

    cambiarTipo(tipoActual);
    document.getElementById("aviso-configuracion").textContent =
        "Los tiempos se guardaron correctamente.";
});

// Dejamos la aplicación lista al abrir la página.
cambiarTipo("trabajo");
actualizarContador();
