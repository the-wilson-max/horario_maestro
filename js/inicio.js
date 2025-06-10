document.addEventListener("DOMContentLoaded", async () => {
  const nombre = localStorage.getItem("nombre") || "Profesor";
  document.getElementById("nombreUsuario").textContent = nombre;

  // Actualizar hora cada segundo
  function actualizarHoraFecha() {
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString("es-ES");
    const fecha = ahora.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    document.getElementById("horaActual").textContent = hora;
    document.getElementById("fechaActual").textContent =
      fecha[0].toUpperCase() + fecha.slice(1);
  }
  actualizarHoraFecha();
  setInterval(actualizarHoraFecha, 1000);

  // Obtener temperatura actual (Open-Meteo API, ciudad: Lima, Perú por ejemplo)
  // Puedes cambiar lat y lon según tu ubicación.
  const lat = -12.0464; // Lima
  const lon = -77.0428;
  fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
  )
    .then((res) => res.json())
    .then((data) => {
      if (
        data.current_weather &&
        data.current_weather.temperature !== undefined
      ) {
        document.getElementById(
          "temperaturaActual"
        ).textContent = `${data.current_weather.temperature} °C`;
      } else {
        document.getElementById("temperaturaActual").textContent = "N/D";
      }
    })
    .catch(() => {
      document.getElementById("temperaturaActual").textContent = "N/D";
    });

  // Obtener porcentaje de usuarios masculinos y femeninos desde Supabase
  if (typeof supabase !== "undefined") {
    try {
      // Consulta todos los usuarios y cuenta por género
      let { data: usuarios, error } = await supabase
        .from("usuarios")
        .select("genero");

      if (error || !usuarios) throw error || "No se pudo obtener datos";

      let total = usuarios.length;
      let masculinos = usuarios.filter((u) =>
        (u.genero || "").toLowerCase().startsWith("m")
      ).length;
      let femeninos = usuarios.filter((u) =>
        (u.genero || "").toLowerCase().startsWith("f")
      ).length;

      // Calcular porcentaje masculino (puedes invertir si prefieres femenino)
      let porcentajeM = total ? Math.round((masculinos / total) * 100) : 0;
      let porcentajeF = total ? Math.round((femeninos / total) * 100) : 0;

      // Para el círculo SVG animado
      const circle = document.getElementById("generoCircle");
      const dasharray = 2 * Math.PI * 42; // 2πr, r=42
      const porcentaje = porcentajeM; // Muestra el % masculino
      const offset = dasharray - (dasharray * porcentaje) / 100;

      // Animar círculo
      circle.style.strokeDasharray = dasharray;
      circle.style.strokeDashoffset = dasharray;
      setTimeout(() => {
        circle.style.transition =
          "stroke-dashoffset 1.2s cubic-bezier(.7,1,.3,1)";
        circle.style.strokeDashoffset = offset;
      }, 150);

      // Mostrar texto
      document.getElementById(
        "generoPorcentaje"
      ).textContent = `${porcentaje}%`;
      document.getElementById(
        "generoDetalle"
      ).innerHTML = `<span style="color:#4f8cff">M: ${masculinos}</span> / <span style="color:#ff6b6b">F: ${femeninos}</span>`;
    } catch (err) {
      document.getElementById("generoPorcentaje").textContent = "--%";
      document.getElementById("generoDetalle").textContent = "N/D";
    }
  }
});
