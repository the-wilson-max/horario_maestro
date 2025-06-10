document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const errorDiv = document.getElementById("registerError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorDiv.textContent = "";
    errorDiv.classList.remove("visible");

    // Obtener valores
    const dni = document.getElementById("dni").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const contraseña = document.getElementById("contraseña").value;
    const telefono = document.getElementById("telefono").value.trim();
    const fecha_nacimiento = document.getElementById("fecha_nacimiento").value;
    const genero = document.getElementById("genero").value;

    // Validaciones básicas
    if (!dni || !nombre || !apellido || !contraseña || !genero) {
      errorDiv.textContent =
        "Por favor, completa todos los campos obligatorios.";
      errorDiv.classList.add("visible");
      return;
    }

    try {
      // Verificar si el DNI ya existe
      const { data: existe, error: errorExiste } = await supabase
        .from("usuarios")
        .select("dni")
        .eq("dni", dni)
        .maybeSingle();

      if (errorExiste) throw errorExiste;
      if (existe) {
        errorDiv.textContent = "Ya existe un usuario con ese DNI.";
        errorDiv.classList.add("visible");
        return;
      }

      // Insertar nuevo usuario
      const { data, error } = await supabase.from("usuarios").insert([
        {
          dni,
          nombre,
          apellido,
          contraseña,
          telefono,
          fecha_nacimiento: fecha_nacimiento || null,
          genero,
        },
      ]);

      if (error) throw error;

      // Registro exitoso
      form.reset();
      errorDiv.textContent = "¡Registro exitoso! Ahora puedes iniciar sesión.";
      errorDiv.style.color = "#4f8cff";
      errorDiv.classList.add("visible");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1800);
    } catch (err) {
      errorDiv.textContent =
        "Ocurrió un error al registrar. Intenta nuevamente.";
      errorDiv.classList.add("visible");
      errorDiv.style.color = "";
      console.error(err);
    }
  });
});
