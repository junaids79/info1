const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/screenshot', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).send('URL missing');
  }

  try {
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      headless: "new",
      executablePath: process.env.NODE_ENV === 'production'
        ? '/usr/bin/chromium-browser' // Linux path on Vercel
        : undefined,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    const screenshot = await page.screenshot({ type: 'png' });
    await browser.close();

    res.set('Content-Type', 'image/png');
    res.send(screenshot);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error taking screenshot');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
