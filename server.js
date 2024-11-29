const express = require("express");
const puppeteer = require("puppeteer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;

const app = express();
const PORT = 3000;

app.use(express.static("public"));

const deviceConfig = {
  desktop: {
    width: "55%",
    height: "50%",
    top: "21%",
    left: "22%",
    backgroundImage: "desktop.jpg",
  },
  tablet: {
    width: "33%",
    height: "65.5%",
    top: "23.5%",
    left: "45%",
    backgroundImage: "tablet.jpg",
  },
  mobile: {
    width: "26.8%",
    height: "50%",
    top: "20.7%",
    left: "36.1%",
    backgroundImage: "mobile.jpg",
  },
};

app.get("/screenshot", async (req, res) => {
  const { url, width, height, device } = req.query;

  if (!url || !device) {
    return res.status(400).send("URL and device are required");
  }

  try {
    // Tomar screenshot con Puppeteer
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: parseInt(width),
      height: parseInt(height),
    });

    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    const screenshot = await page.screenshot();
    await browser.close();

    // Cargar imagen de fondo
    const config = deviceConfig[device];
    const backgroundPath = path.join(
      __dirname,
      "public",
      "images",
      config.backgroundImage
    );
    const background = sharp(await fs.readFile(backgroundPath));
    const backgroundMetadata = await background.metadata();

    // Calcular posiciones
    const overlayLeft = Math.round(
      (parseFloat(config.left) / 100) * backgroundMetadata.width
    );
    const overlayTop = Math.round(
      (parseFloat(config.top) / 100) * backgroundMetadata.height
    );
    const overlayWidth = Math.round(
      (parseFloat(config.width) / 100) * backgroundMetadata.width
    );
    const overlayHeight = Math.round(
      (parseFloat(config.height) / 100) * backgroundMetadata.height
    );

    // Redimensionar y combinar imágenes
    const resizedScreenshot = await sharp(screenshot)
      .resize(overlayWidth, overlayHeight, {
        fit: "cover",
        position: "top", // Esto es equivalente a object-position: top center
      })
      .toBuffer();

    const finalImage = await background
      .composite([
        {
          input: resizedScreenshot,
          top: overlayTop,
          left: overlayLeft,
        },
      ])
      .toBuffer();

    res.writeHead(200, {
      "Content-Type": "image/jpeg",
      "Content-Length": finalImage.length,
    });
    res.end(finalImage);
  } catch (error) {
    console.error("Error detallado:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/test-screenshot", async (req, res) => {
  const { url, width, height, device } = req.query;

  if (!url || !device) {
    return res.status(400).send("URL and device are required");
  }

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: parseInt(width),
      height: parseInt(height),
    });

    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    const screenshot = await page.screenshot();
    await browser.close();

    // Devolver las URLs de ambas imágenes
    res.json({
      backgroundImage: deviceConfig[device].backgroundImage,
      screenshot: `data:image/png;base64,${screenshot.toString("base64")}`,
    });
  } catch (error) {
    console.error("Error detallado:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
