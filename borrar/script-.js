async function loadWebsite() {
  // Obtener la URL ingresada
  const url = document.getElementById("websiteUrl").value;

  // Validar que la URL sea válida
  if (!isValidUrl(url)) {
    alert("Por favor, introduce una URL válida");
    return;
  }

  // Tu clave API de Web Shrinker
  const apiKey = "TU_CLAVE_API_AQUI";
  const apiSecret = "TU_CLAVE_SECRETA_AQUI";

  // URLs para las capturas de pantalla
  const desktopImageUrl = await getScreenshot(
    url,
    "1200x800",
    apiKey,
    apiSecret
  );
  const tabletImageUrl = await getScreenshot(
    url,
    "768x1024",
    apiKey,
    apiSecret
  );
  const mobileImageUrl = await getScreenshot(url, "375x667", apiKey, apiSecret);

  // Cargar las imágenes en cada elemento img
  document.getElementById("desktopImage").src = desktopImageUrl;
  document.getElementById("tabletImage").src = tabletImageUrl;
  document.getElementById("mobileImage").src = mobileImageUrl;
}

async function getScreenshot(url, resolution, apiKey, apiSecret) {
  const apiUrl = `https://api.webshrinker.com/v2/screenshot?key=${apiKey}&hash=${apiSecret}&url=${encodeURIComponent(
    url
  )}&size=${resolution}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data.data.image;
  } catch (error) {
    console.error("Error al obtener la captura de pantalla:", error);
    return "https://via.placeholder.com/150?text=Error";
  }
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Evento para manejar el envío con la tecla Enter
document
  .getElementById("websiteUrl")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      loadWebsite();
    }
  });
