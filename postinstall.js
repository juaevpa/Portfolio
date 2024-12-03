const { platform } = require("os");
const { execSync } = require("child_process");

// Solo ejecutar en Linux (Render)
if (platform() === "linux") {
  try {
    console.log("Instalando dependencias en Linux...");
    execSync("apt-get update && apt-get install -y chromium", {
      stdio: "inherit",
    });
  } catch (error) {
    console.error("Error instalando dependencias:", error);
    // No queremos que falle la instalación en local
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
}
