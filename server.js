// Asegúrate de que supabaseClient.js esté cargado antes que este archivo en index.html

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const dni = document.getElementById("dni").value.trim();
  const password = document.getElementById("password").value;
  const errorDiv = document.getElementById("loginError");
  errorDiv.textContent = "";
  errorDiv.classList.remove("visible");

  // Buscar usuario por dni y contraseña en Supabase
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("dni", dni)
    .eq("contraseña", password)
    .single();

  if (error || !data) {
    errorDiv.textContent = "DNI o contraseña incorrectos.";
    errorDiv.classList.add("visible");
    return;
  }

  alert("¡Bienvenido, " + data.nombre + "!");
  window.location.href = "dashboard.html"; // O tu siguiente página
});
