// dashboard.js

// Mapeo de secciones a archivos
const sectionToFile = {
  inicio: "inicio.html",
  horario: "horario.html",
  perfil: "perfil.html",
  configuracion: "configuracion.html",
};

// Cambia el iframe según la sección seleccionada
function cambiarSeccion(nuevaSeccion) {
  const iframe = document.getElementById("contenido-principal");
  iframe.src = sectionToFile[nuevaSeccion];
}

// Manejo del sidebar
document.addEventListener("DOMContentLoaded", () => {
  // Selecciona todos los ítems del sidebar excepto logout
  const navItems = document.querySelectorAll(".nav-item[data-section]");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Quita la clase 'active' a todos y la agrega al actual
      navItems.forEach((el) => el.classList.remove("active"));
      item.classList.add("active");
      // Cambia el contenido del iframe
      const seccion = item.getAttribute("data-section");
      cambiarSeccion(seccion);
    });
  });

  // Logout (puedes agregar tu lógica de logout aquí)
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // Por ejemplo: localStorage.clear(); window.location.href = "index.html";
      window.location.href = "index.html";
    });
  }
});
