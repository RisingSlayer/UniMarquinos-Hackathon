const sectionDegradado = document.querySelector('section');
const sizeDegradado = 25;
sectionDegradado.addEventListener('mousemove', (event) =>{
    const x = event.clientX
    const y = event.clientY
    sectionDegradado.style.background = `radial-gradient(circle at ${x}px ${y}px, #111F43 0%,#0F172A ${sizeDegradado}%)`
})