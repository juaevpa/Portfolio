const fs = require("fs");
const path = require("path");

// Crear el directorio public si no existe
if (!fs.existsSync("public")) {
  fs.mkdirSync("public");
}

// Verificar si existe el directorio src antes de comenzar
if (!fs.existsSync("src")) {
  console.error(
    "Error: El directorio 'src' no existe. Por favor, créalo primero."
  );
  process.exit(1);
}

// Copiar archivos de src a public
function copyDir(src, dest) {
  // Crear directorio destino si no existe
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Leer contenido del directorio
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Si es un directorio, copiar recursivamente
      copyDir(srcPath, destPath);
    } else {
      // Si es un archivo, copiarlo
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Iniciar el proceso de construcción
console.log("Iniciando proceso de construcción...");
copyDir("src", "public");
console.log("¡Construcción completada!");
