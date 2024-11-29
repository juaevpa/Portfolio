async function loadWebsite() {
  let url = document.getElementById("websiteUrl").value.trim();

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  if (!isValidUrl(url)) {
    alert("Por favor, introduce una URL válida");
    return;
  }

  try {
    setLoadingState(true);

    const devices = [
      { id: "desktopImage", width: 1200, height: 800, device: "desktop" },
      { id: "tabletImage", width: 768, height: 1024, device: "tablet" },
      { id: "mobileImage", width: 375, height: 667, device: "mobile" },
    ];

    for (const device of devices) {
      const img = document.getElementById(device.id);
      img.style.display = "none";

      const response = await fetch(
        `/screenshot?url=${encodeURIComponent(url)}&width=${
          device.width
        }&height=${device.height}&device=${device.device}&t=${Date.now()}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cargar la página");
      }

      const blob = await response.blob();
      img.src = URL.createObjectURL(blob);
      img.onload = () => {
        img.style.display = "block";
        const container = document.querySelector(`.device.${device.device}`);
        container.classList.remove("loading");
        container.classList.add("loaded");
      };
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
    console.error("Error:", error);
  } finally {
    setLoadingState(false);
  }
}

function setLoadingState(isLoading) {
  const devices = ["desktop", "tablet", "mobile"];
  devices.forEach((device) => {
    const container = document.querySelector(`.device.${device}`);
    if (isLoading) {
      container.classList.add("loading");
      container.classList.remove("loaded");
    }
  });
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

document
  .getElementById("websiteUrl")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      loadWebsite();
    }
  });

// Al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  // Asegurarse de que ningún dispositivo tenga fondo inicialmente
  const devices = document.querySelectorAll(".device");
  devices.forEach((device) => {
    device.classList.remove("loaded");
  });
});
