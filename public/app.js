const form = document.getElementById("uploadForm");
const preview = document.getElementById("preview");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const files = form.gallery.files;
  if (files.length === 0) return alert("Seleziona almeno un file");

  const formData = new FormData();
  for (const file of files) {
    formData.append("gallery", file);
  }

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Errore caricamento");

    preview.innerHTML = "";
    data.files.forEach((url) => {
      const img = document.createElement("img");
      img.src = url;
      img.style.maxWidth = "1000px";
      img.style.margin = "5px";
      img.style.display = "block";
      preview.appendChild(img);
    });
  } catch (err) {
    alert(err.message);
  }
});

let lastScroll = 0;

window.addEventListener("scroll", function () {
  const headerScroll = document.getElementById("header-scroll");
  const header = document.getElementById("header");
  const headerBox = document.querySelector(".header-box");

  const currentScroll = window.scrollY;
  const headerBoxBottom = headerBox.offsetHeight;

  // quando usciamo dalla header originale
  if (currentScroll > headerBoxBottom) {
    header.classList.add("inactive");

    if (currentScroll < lastScroll) {
      // scroll verso l'alto
      headerScroll.classList.add("active");
    } else {
      // scroll verso il basso
      headerScroll.classList.remove("active");
    }
  } else {
    // siamo ancora nella header originale
    header.classList.remove("inactive");
    headerScroll.classList.remove("active");
  }

  lastScroll = currentScroll;
});
