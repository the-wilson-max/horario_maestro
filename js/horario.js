// ----- CONFIGURACIÓN -----
const HORAS_MANANA = [
  "07:30 - 08:15",
  "08:15 - 09:00",
  "09:00 - 09:45",
  "09:45 - 10:15", // recreo
  "10:15 - 11:00",
  "11:00 - 11:45",
  "11:45 - 12:30",
];
const HORAS_TARDE = [
  "13:00 - 13:45",
  "13:45 - 14:30",
  "14:30 - 15:15",
  "15:15 - 15:45", // recreo
  "15:45 - 16:30",
  "16:30 - 17:15",
  "17:15 - 18:00",
];
const BLOQUE_RECREO = 3;
const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const CURSOS_SECUNDARIA = [
  "Matemática",
  "Comunicación",
  "Ciencia y Tecnología",
  "Inglés",
  "Historia",
  "Arte",
  "Educación Física",
  "Religión",
  "Computación",
  "Educación Cívica",
  "Tutoría",
];
// Relación curso-color para CSS
const CURSO_COLOR_CLASE = {
  matemática: "celda-curso-matematica",
  comunicación: "celda-curso-comunicacion",
  "ciencia y tecnología": "celda-curso-cyt",
  inglés: "celda-curso-ingles",
  historia: "celda-curso-historia",
  arte: "celda-curso-arte",
  "educación física": "celda-curso-ef",
  religión: "celda-curso-religion",
  computación: "celda-curso-computacion",
  "educación cívica": "celda-curso-civica",
  tutoría: "celda-curso-tutoria",
};

// ----- VARIABLES ELEM DOM -----
const turnoSelect = document.getElementById("turnoSelect");
const horarioBody = document.getElementById("horarioBody");
const tablaHorario = document.getElementById("tablaHorario");
const exportBtn = document.getElementById("exportPDF");

let usuarios = [];
let horarioData = {}; // {dia: {hora: {profesor, curso, estados...}}}

// ----- CARGAR USUARIOS -----
async function cargarUsuarios() {
  if (typeof supabase === "undefined") return [];
  let { data, error } = await supabase
    .from("usuarios")
    .select("id, nombre, apellido");
  if (error || !data) return [];
  return data.map((u) => ({
    id: u.id,
    nombre: (u.nombre || "") + " " + (u.apellido || ""),
  }));
}

// ----- CREAR TABLA -----
function crearHorario(turno = "mañana") {
  let horas = turno === "mañana" ? HORAS_MANANA : HORAS_TARDE;
  horarioBody.innerHTML = "";
  horarioData = {};
  horas.forEach((hora, i) => {
    let row = document.createElement("tr");
    let celdaHora = document.createElement("td");
    celdaHora.textContent = hora;
    row.appendChild(celdaHora);

    DIAS.forEach((dia) => {
      let celda = document.createElement("td");
      celda.dataset.dia = dia;
      celda.dataset.hora = hora;

      // Bloque recreo por default
      if (i === BLOQUE_RECREO) {
        celda.className = "celda-recreo";
        celda.innerHTML = `<span>RECREO</span>
          <div class="celda-estado">
            <label><input type="checkbox" class="feriadoCheck"> Feriado</label>
          </div>`;
      } else {
        // Select de profesor
        let selectProf = document.createElement("select");
        selectProf.innerHTML =
          `<option value="">(Profesor)</option>` +
          usuarios
            .map((u) => `<option value="${u.id}">${u.nombre}</option>`)
            .join("");
        selectProf.className = "profesorSelect";

        // Select de curso
        let selectCurso = document.createElement("select");
        selectCurso.innerHTML =
          `<option value="">(Curso)</option>` +
          CURSOS_SECUNDARIA.map(
            (c) => `<option value="${c}">${c}</option>`
          ).join("");
        selectCurso.className = "cursoSelect";

        // Estados: ausente, feriado
        let estadoDiv = document.createElement("div");
        estadoDiv.className = "celda-estado";
        estadoDiv.innerHTML = `
          <label><input type="checkbox" class="ausenteCheck"> Ausente</label>
          <label><input type="checkbox" class="feriadoCheck"> Feriado</label>
        `;

        celda.appendChild(selectProf);
        celda.appendChild(selectCurso);
        celda.appendChild(estadoDiv);

        // Animación y color al seleccionar curso
        selectCurso.addEventListener("change", function () {
          // Quitar color de curso anterior
          Object.values(CURSO_COLOR_CLASE).forEach((clase) =>
            celda.classList.remove(clase)
          );
          let curso = (this.value || "").trim().toLowerCase();
          if (CURSO_COLOR_CLASE[curso]) {
            celda.classList.add(CURSO_COLOR_CLASE[curso]);
          }
        });

        // Estado feriado/ausente
        estadoDiv
          .querySelector(".feriadoCheck")
          .addEventListener("change", function () {
            celda.classList.toggle("celda-feriado", this.checked);
          });
        estadoDiv
          .querySelector(".ausenteCheck")
          .addEventListener("change", function () {
            celda.classList.toggle("celda-ausente", this.checked);
          });
      }

      row.appendChild(celda);
    });
    horarioBody.appendChild(row);
  });
}

// ----- EVENTOS -----
turnoSelect.addEventListener("change", () => {
  crearHorario(turnoSelect.value);
});

// Exportar a PDF con nombre de colegio (solo eso)
exportBtn.addEventListener("click", () => {
  let tabla = tablaHorario;
  const nombreColegio = "I.E. JOSE DE LA TORRE UGARTE-ICA";
  const turnoActual =
    turnoSelect.value.charAt(0).toUpperCase() + turnoSelect.value.slice(1);

  html2canvas(tabla, { backgroundColor: "#23283b" }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new window.jspdf.jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    let y = 30;

    // Título del colegio
    pdf.setFontSize(16);
    pdf.text(nombreColegio, pageWidth / 2, y, { align: "center" });
    y += 24;
    pdf.setFontSize(12);
    pdf.text(`Turno: ${turnoActual}`, pageWidth / 2, y, { align: "center" });

    // Imagen de la tabla debajo del título
    const ratio = pageWidth / canvas.width;
    const imgHeight = canvas.height * ratio;
    pdf.addImage(imgData, "PNG", 0, y + 20, pageWidth, imgHeight);

    pdf.save("horario-profesores.pdf");
  });
});

// ----- INICIALIZACIÓN -----
(async function initHorario() {
  usuarios = await cargarUsuarios();
  crearHorario(turnoSelect.value);
})();
