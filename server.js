const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "blob:", "https://res.cloudinary.com"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      },
    },
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

app.use(express.static("public"));
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
});
app.use("/api/upload", uploadLimiter);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 65 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    file.mimetype.startsWith("image/")
      ? cb(null, true)
      : cb(new Error("Solo immagini consentite"));
  },
});
const uploadMiddleware = upload.array("gallery", 9);

function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    stream.end(buffer);
  });
}

app.post("/api/upload", uploadMiddleware, async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "Nessuna foto caricata" });
  }

  try {
    const urls = [];

    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, {
        folder: "architettura-del-riscatto",
        transformation: [{ width: 1200, crop: "limit" }],
      });

      urls.push(result.secure_url);
    }

    res.status(201).json({ message: "Upload completato", files: urls });
  } catch (err) {
    next(err);
  }
});
app.get("/api/list", async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "architettura-del-riscatto",
      max_results: 100,
      direction: "desc",
    });

    const urls = result.resources.map((r) => r.secure_url);
    res.json({ files: urls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port);
