document.addEventListener("DOMContentLoaded", () => {
    // === ⏳ COUNTDOWN EN TIEMPO REAL ===
    const countdown = () => {
        const now = new Date();
        const eventDate = new Date("2025-12-06T00:00:00");
        const total = eventDate - now;

        if (total <= 0) {
            document.querySelector(".countdown").textContent = "¡Hoy es el gran día!";
            return;
        }

        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const seconds = Math.floor((total / 1000) % 60);

        document.getElementById("days").textContent = String(days).padStart(2, '0');
        document.getElementById("hours").textContent = String(hours).padStart(2, '0');
        document.getElementById("minutes").textContent = String(minutes).padStart(2, '0');
        document.getElementById("seconds").textContent = String(seconds).padStart(2, '0');
    };

    countdown();
    setInterval(countdown, 1000);

    // === 📸 FOTOS DE LA HISTORIA - ANIMACIÓN REVERSIBLE ===
    const grid = document.querySelector('.photo-grid');
    const imgs = document.querySelectorAll('.photo-grid img');

    const gridObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                grid.style.opacity = 1;
                grid.style.transform = 'scale(1)';
                imgs.forEach((img, i) => {
                    img.style.transitionDelay = `${i * 100}ms`;
                    img.style.transform = `rotate(${(i % 2 === 0 ? '-' : '') + (10 + i * 2)}deg) translate(${i * 5}px, ${i * 5}px)`;
                });
            } else {
                grid.style.opacity = 0;
                grid.style.transform = 'scale(0.8)';
                imgs.forEach(img => {
                    img.style.transitionDelay = '0ms';
                    img.style.transform = 'none';
                });
            }
        });
    }, { threshold: 0.3 });

    gridObserver.observe(grid);

    // === 🃏 MOSAICO REVERSIBLE: CARTAS → GRID CENTRADO ===
    const cards = document.querySelectorAll('.mosaic .card');
    const mosaicContainer = document.querySelector('.mosaic-container');

    const cardWidth = 250;
    const spacing = 20;
    const columns = 3;

    const mosaicObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Paso 1: apilar estilo cartas centrado dentro del contenedor
                const baseTop = 80;
                const baseLeft = (mosaicContainer.offsetWidth - cardWidth) / 2;

                cards.forEach((card, i) => {
                    card.style.transition = 'all 0.6s ease';
                    card.style.transitionDelay = `${i * 200}ms`;
                    card.style.opacity = 1;
                    card.style.position = 'absolute';
                    card.style.left = `${baseLeft}px`;
                    card.style.top = `${baseTop + i * 5}px`;
                    card.style.transform = `scale(1) rotate(${(i - 3) * 8}deg)`;
                    card.style.zIndex = i;
                });

                // Paso 2: después, reordenar en grid centrado
                setTimeout(() => {
                    const containerWidth = mosaicContainer.offsetWidth;
                    const totalGridWidth = columns * (cardWidth + spacing) - spacing;
                    const startX = (containerWidth - totalGridWidth) / 2;

                    cards.forEach((card, i) => {
                        const row = Math.floor(i / columns);
                        const col = i % columns;
                        const x = startX + col * (cardWidth + spacing);
                        const y = row * (cardWidth + spacing);

                        card.style.transition = 'all 0.8s ease';
                        card.style.left = `${x}px`;
                        card.style.top = `${y}px`;
                        card.style.transform = 'scale(1) rotate(0deg)';
                        card.style.zIndex = 0;
                    });
                }, cards.length * 200 + 300);
            } else {
                // Reset al salir del viewport
                cards.forEach((card, i) => {
                    card.style.transition = 'all 0.4s ease';
                    card.style.transitionDelay = '0ms';
                    card.style.opacity = 0;
                    card.style.left = '50%';
                    card.style.top = '50%';
                    card.style.transform = 'translate(-50%, -50%) scale(0.5) rotate(0deg)';
                    card.style.zIndex = 0;
                });
            }
        });
    }, { threshold: 0.3 });

    mosaicObserver.observe(mosaicContainer);

    // === 📩 FORMULARIO CON GOOGLE SHEETS ===
    const form = document.getElementById("rsvp-form");
    const asistencia = document.getElementById("asistencia");
    const grupoNinos = document.getElementById("grupo-ninos");
    const ninos = document.getElementById("ninos");
    const grupoCantidad = document.getElementById("grupo-cantidad");
    const cantidadNinos = document.getElementById("cantidad-ninos");
    const status = document.getElementById("form-status");
    const grupoAlergias = document.getElementById("grupo-alergias");

    // Mostrar/Ocultar "alergenos" y ¿Vienes con niños? según asistencia
    asistencia.addEventListener("change", () => {
        if (asistencia.value === "Sí") {
            grupoNinos.style.display = "block";
            grupoAlergias.style.display = "block";
        } else {
            grupoNinos.style.display = "none";
            grupoCantidad.style.display = "none";
            grupoAlergias.style.display = "none";
            ninos.value = "";
            cantidadNinos.value = "";
        }
    });

    // Mostrar/Ocultar "Cantidad de niños" según respuesta
    ninos.addEventListener("change", () => {
        if (ninos.value === "Sí") {
            grupoCantidad.style.display = "block";
            cantidadNinos.required = true;
        } else {
            grupoCantidad.style.display = "none";
            cantidadNinos.required = false;
            cantidadNinos.value = "";
        }
    });

    // Envío a Google Sheets
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = new FormData(form);
        const url = "https://script.google.com/macros/s/AKfycbzZ93MJo51Je_cfS2LxJg3Dp2_38p5x6JbFbEGTEEFRNZdhq4GqKRhTPGIUOv56P77hww/exec";

        try {
            const res = await fetch(url, {
                method: "POST",
                body: data,
            });

            if (res.ok) {
                status.textContent = "✅ ¡Gracias por confirmar!";
                form.reset();
                grupoNinos.style.display = "none";
                grupoCantidad.style.display = "none";
            } else {
                status.textContent = "⚠️ Error al enviar. Inténtalo de nuevo.";
            }
        } catch (err) {
            status.textContent = "❌ Error de red. Revisa tu conexión.";
        }
    });

});


// Scroll automático del carrusel
document.addEventListener("DOMContentLoaded", function () {
    const carousel = document.getElementById("mosaic-carousel");
    let scrollAmount = 0;

    function autoScroll() {
        if (!carousel) return;
        scrollAmount += 1;
        if (scrollAmount >= carousel.scrollWidth - carousel.clientWidth) {
            scrollAmount = 0;
        }
        carousel.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }

    setInterval(autoScroll, 30); // Ajusta la velocidad aquí
});


// === Updated auto-scroll speed ===
document.addEventListener("DOMContentLoaded", function () {
    const carousel = document.getElementById("mosaic-carousel");
    let scrollAmount = 0;

    function autoScroll() {
        if (!carousel) return;
        scrollAmount += 2; // Aumentado para mayor velocidad
        if (scrollAmount >= carousel.scrollWidth - carousel.clientWidth) {
            scrollAmount = 0;
        }
        carousel.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }

    setInterval(autoScroll, 20); // Menor intervalo = más rápido
});


// === Fluido Scroll Automático con requestAnimationFrame ===
document.addEventListener("DOMContentLoaded", function () {
    const carousel = document.getElementById("mosaic-carousel");
    let scrollAmount = 0;
    const speed = 0.5; // Menor = más suave

    function smoothScroll() {
        if (!carousel) return;
        scrollAmount += speed;
        if (scrollAmount >= carousel.scrollWidth - carousel.clientWidth) {
            scrollAmount = 0;
        }
        carousel.scrollLeft = scrollAmount;
        requestAnimationFrame(smoothScroll);
    }

    requestAnimationFrame(smoothScroll);
});

// === Slider automático con efecto fade ===
document.addEventListener("DOMContentLoaded", function () {
    const slides = document.getElementsByClassName("mySlides");
    let slideIndex = 0;

    function showSlides() {
        for (let s of slides) {
            s.style.display = "none";
        }
        slideIndex = (slideIndex + 1) % slides.length;
        slides[slideIndex].style.display = "block";
    }

    showSlides();
    setInterval(showSlides, 3000); // cada 3 segundos
});

// === Slider automático de 2 en 2 ===
document.addEventListener("DOMContentLoaded", function () {
    const slider = document.getElementById("multi-slider");
    const slides = document.querySelectorAll(".multi-slide");
    let index = 0;

    function moveSlider() {
        index = (index + 1) % slides.length;
        slider.style.transform = `translateX(-${index * 100}%)`;
    }

    setInterval(moveSlider, 3000); // cada 3 segundos
});

// === Lógica del formulario ===
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("rsvp-form");
    const status = document.getElementById("form-status");
    const asistencia = document.getElementById("asistencia");
    const grupoAlergias = document.getElementById("grupo-alergias");

    asistencia.addEventListener("change", () => {
        const val = asistencia.value;
        if (val === "Sí") {
            grupoAlergias.style.display = "block";
        } else {
            grupoAlergias.style.display = "none";
        }
    });

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        status.textContent = "Enviando...";
        status.style.color = "#444";

        const formData = new FormData(form);
        fetch("https://script.google.com/macros/s/AKfycbzZ93MJo51Je_cfS2LxJg3Dp2_38p5x6JbFbEGTEEFRNZdhq4GqKRhTPGIUOv56P77hww/exec", {
            method: "POST",
            body: formData
        })
        .then(res => {
            if (res.ok) {
                status.textContent = "✅ Formulario enviado correctamente";
                status.style.color = "green";
                form.reset();
                grupoNinos.style.display = "none";
                grupoCantidad.style.display = "none";
                grupoAlergias.style.display = "none";
            } else {
                throw new Error("Error de envío");
            }
        })
        .catch(err => {
            status.textContent = "❌ Error al enviar. Inténtalo de nuevo.";
            status.style.color = "red";
            console.error(err);
        });
    });
});
