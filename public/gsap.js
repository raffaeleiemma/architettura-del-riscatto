document.addEventListener("DOMContentLoaded", function () {
  gsap.registerPlugin(ScrollTrigger);

  const grid = document.querySelector(".grid-layout");
  const gridWrapper = document.querySelector(".image-grid-wrapper");
  const umbrellaCell = grid.children[2];
  const carousel = document.querySelector(".carousel-container");

  gsap.set(carousel, { opacity: 0 });

  ScrollTrigger.create({
    trigger: gridWrapper,
    start: "center center",
    end: "+=80%",
    scrub: true,
    pin: true,
    anticipatePin: 1,

    onUpdate: (self) => {
      const progress = self.progress;

      if (progress < 0.5) {
        const p = progress / 0.5;

        const col1 = Math.max(0.01, 1 - p);
        const col2 = 1 + p * 10;
        const col3 = Math.max(0.01, 1 - p);

        const row1 = Math.max(0.01, 1 - p);
        const row2 = 1 + p * 6;
        const row3 = 1 + p * 6;
        const row4 = Math.max(0.01, 1 - p);

        gsap.set(grid, {
          gridTemplateColumns: `${col1}fr ${col2}fr ${col3}fr`,
          gridTemplateRows: `${row1}fr ${row2}fr ${row3}fr ${row4}fr`,
          opacity: 1,
        });

        gsap.set(umbrellaCell, {
          gridArea: "2 / 2 / 4 / 3",
          zIndex: 10,
        });

        grid.querySelectorAll(".grid-cell").forEach((cell) => {
          if (cell !== umbrellaCell) {
            gsap.set(cell, {
              opacity: 1 - p * 2,
              scale: 1 - p * 0.2,
            });
          } else {
            gsap.set(cell, {
              opacity: 1,
              scale: 1,
            });
          }
        });

        gsap.set(carousel, { opacity: 0 });
      } else {
        const fadeProgress = (progress - 0.5) / 0.5;

        gsap.set(grid, {
          opacity: 1 - fadeProgress,
        });

        gsap.set(carousel, {
          opacity: fadeProgress,
        });
      }
    },
  });
});

gsap.registerPlugin(ScrollTrigger);

const track = document.getElementById("track");
const images = document.querySelectorAll(".carousel-img");

window.addEventListener("load", () => {
  const totalTrackWidth = track.scrollWidth;
  const viewportWidth = window.innerWidth;
  const totalScrollDistance = totalTrackWidth - viewportWidth;

  ScrollTrigger.create({
    trigger: ".carousel-container",
    start: "top top",
    end: `+=${totalScrollDistance}`,
    scrub: true,
    pin: ".carousel-container",
    anticipatePin: 1,

    onEnter: () => {
      gsap.to("#track-gallery", { opacity: 1, duration: 1 });
    },
    onEnterBack: () => {
      gsap.to("#track-gallery", { opacity: 1, duration: 1 });
    },
    onLeaveBack: () => {
      gsap.to("#track-gallery", { opacity: 0, duration: 0.5 });
    },

    onUpdate: (self) => {
      const progress = self.progress;
      const xMove = -progress * totalScrollDistance;

      gsap.set(track, {
        x: xMove,
      });

      const pan = 100 + (progress - 0.5) * 40;
      images.forEach((img) => {
        img.style.objectPosition = `${pan}% center`;
      });
    },
  });
});
