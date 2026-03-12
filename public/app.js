const uploadForm = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const spinner = document.getElementById("spinner");
const cloudGallery = document.getElementById("cloudGallery");

let selectedFiles = [];

function updatePreview() {
  preview.innerHTML = "";
  selectedFiles.forEach((file, index) => {
    const div = document.createElement("div");
    div.classList.add("file-preview");

    const name = document.createElement("span");
    name.textContent = file.name;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";
    removeBtn.classList.add("removeBtn");
    removeBtn.addEventListener("click", () => {
      selectedFiles.splice(index, 1);
      updatePreview();
    });

    div.appendChild(name);
    div.appendChild(removeBtn);
    preview.appendChild(div);
  });
}

fileInput.addEventListener("change", () => {
  const files = Array.from(fileInput.files);

  if (selectedFiles.length + files.length > 9) {
    alert("Hai selezionato troppi file, massimo 9");
    return;
  }

  selectedFiles = selectedFiles.concat(files);
  updatePreview();
});

window.addEventListener("DOMContentLoaded", async () => {
  const cosenzaGallery = document.getElementById("cosenzaGallery");

  for (let i = 1; i < 86; i++) {
    const a = document.createElement("a");
    a.href = `img/cosenza/img-${i}.jpg`;
    a.setAttribute("data-gallery", "cosenzaGallery");

    const img = document.createElement("img");
    img.src = `img/cosenza/img-${i}.jpg`;
    img.loading = "lazy";

    a.appendChild(img);
    cosenzaGallery.appendChild(a);
  }
  try {
    const res = await fetch("/api/list");
    const data = await res.json();

    data.files.forEach((url) => {
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("data-gallery", "cloudGallery");

      const img = document.createElement("img");
      img.src = url;
      img.style.width = "100%";
      img.style.aspectRatio = "1/1";
      img.style.objectFit = "cover";
      img.style.borderRadius = "6px";

      a.appendChild(img);
      cloudGallery.appendChild(a);
    });

    const lightbox = GLightbox({
      selector: "a[data-gallery]",
      loop: true,
      zoomable: true,
      draggable: true,
    });
  } catch (err) {
    console.error("Errore caricamento gallery persistente:", err);
  }
});

let lastScroll = 0;
window.addEventListener("scroll", function () {
  const headerScroll = document.getElementById("header-scroll");
  const header = document.getElementById("header");
  const headerBox = document.querySelector(".header-box");

  const currentScroll = window.scrollY;
  const headerBoxBottom = headerBox.offsetHeight;

  if (currentScroll > headerBoxBottom) {
    header.classList.add("inactive");
    if (currentScroll < lastScroll) {
      headerScroll.classList.add("active");
    } else {
      headerScroll.classList.remove("active");
    }
  } else {
    header.classList.remove("inactive");
    headerScroll.classList.remove("active");
  }

  lastScroll = currentScroll;
});
async function compressImage(file, maxWidth = 1200, quality = 0.7) {
  if (file.size < 8 * 1024 * 1024) {
    return file;
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob], file.name, {
            type: blob.type,
          });
          resolve(compressedFile);
        },
        file.type === "image/png" ? "image/png" : "image/jpeg",
        quality,
      );
    };
    img.src = URL.createObjectURL(file);
  });
}
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (selectedFiles.length === 0) return alert("Seleziona almeno un file");

  spinner.style.display = "block";

  const formData = new FormData();

  for (let file of selectedFiles) {
    const compressedFile = await compressImage(file, 1200, 0.7);
    formData.append("gallery", compressedFile);
  }

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Errore caricamento");

    data.files.forEach((url) => {
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("data-gallery", "cloudGallery");

      const img = document.createElement("img");
      img.src = url;
      img.style.width = "100%";
      img.style.aspectRatio = "1/1";
      img.style.objectFit = "cover";
      img.style.borderRadius = "6px";

      a.appendChild(img);
      cloudGallery.appendChild(a);
    });

    selectedFiles = [];
    preview.innerHTML = "";
    fileInput.value = "";
    const lightbox = GLightbox({
      selector: 'a[data-gallery="cloudGallery"]',
      loop: true,
      zoomable: true,
      draggable: true,
    });
  } catch (err) {
    alert(err.message);
  } finally {
    spinner.style.display = "none";
  }
});
