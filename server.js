const express = require("express");
const puppeteer = require("puppeteer-core");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;

const app = express();
const PORT = process.env.PORT || 3000;

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
    width: "33.5%",
    height: "66%",
    top: "23.2%",
    left: "44.8%",
    backgroundImage: "tablet.jpg",
  },
  mobile: {
    width: "26.7%",
    height: "65%",
    top: "11.9%",
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
      executablePath: "/usr/bin/google-chrome-stable",
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
    let resizedScreenshot = await sharp(screenshot).resize(
      overlayWidth,
      overlayHeight,
      {
        fit: "cover",
        position: "top",
      }
    );

    // Aplicar border radius según el dispositivo
    if (device === "mobile") {
      resizedScreenshot = resizedScreenshot.composite([
        {
          input: Buffer.from(
            `<svg><rect x="0" y="0" width="${overlayWidth}" height="${overlayHeight}" rx="86" ry="86"/></svg>`
          ),
          blend: "dest-in",
        },
      ]);
    } else if (device === "tablet") {
      resizedScreenshot = resizedScreenshot.composite([
        {
          input: Buffer.from(
            `<svg><rect x="0" y="0" width="${overlayWidth}" height="${overlayHeight}" rx="12" ry="12"/></svg>`
          ),
          blend: "dest-in",
        },
      ]);
    }

    const resizedBuffer = await resizedScreenshot.toBuffer();

    const finalImage = await background
      .composite([
        {
          input: resizedBuffer,
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
