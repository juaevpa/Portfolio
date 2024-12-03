const { execSync } = require("child_process");

try {
  console.log("Installing Chrome for Puppeteer...");
  execSync("npx puppeteer browsers install chrome", { stdio: "inherit" });
} catch (error) {
  console.error("Error installing Chrome:", error);
  // Continuar incluso si hay un error
}
