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

window.addEventListener("scroll", function () {
  const headerScroll = document.getElementById("header-scroll");
  const header = document.getElementById("header");
  if (window.scrollY > 250) {
    headerScroll.classList.add("active");
    header.classList.add("inactive");
  } else {
    headerScroll.classList.remove("active");
    header.classList.remove("inactive");
  }
});
