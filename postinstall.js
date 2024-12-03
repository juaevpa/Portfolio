const { execSync } = require("child_process");
const os = require("os");

// Solo ejecutar en Linux (Render)
if (os.platform() === "linux") {
  try {
    console.log(
      "Instalando dependencias necesarias para Puppeteer en Linux..."
    );
    execSync("apt-get update && apt-get install -y chromium chromium-common");
  } catch (error) {
    console.log(
      "No se pudieron instalar las dependencias de sistema, pero continuaremos..."
    );
  }
}

// Asegurarse de que Puppeteer instale el navegador
try {
  console.log("Instalando el navegador de Puppeteer...");
  execSync("npx puppeteer browsers install chrome");
} catch (error) {
  console.log("Error al instalar el navegador de Puppeteer:", error.message);
}

console.log("Postinstall script executed");
