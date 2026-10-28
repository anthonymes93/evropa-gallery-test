/* Independent gallery lightbox: no WordPress AJAX or remote scripts. */
(() => {
  "use strict";
  function init() {
    const links = Array.from(document.querySelectorAll("a.bwg_lightbox"));
    if (!links.length) return;
    const modal = document.createElement("div");
    modal.id = "static-gallery-lightbox";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Project photo");
    modal.hidden = true;
    modal.innerHTML = '<button type="button" class="sg-close" aria-label="Close gallery">×</button>' +
      '<button type="button" class="sg-prev" aria-label="Previous photo">‹</button>' +
      '<img class="sg-photo" alt="Project gallery photo">' +
      '<button type="button" class="sg-next" aria-label="Next photo">›</button>' +
      '<div class="sg-counter" aria-live="polite"></div>';
    const style = document.createElement("style");
    style.textContent = [
      '.bwg-container-0{visibility:visible!important;height:auto!important;overflow:visible!important}',
      '#bwg_thumbnails_mosaic_0{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(190px,1fr))!important;gap:10px!important;width:100%!important;height:auto!important;overflow:visible!important}',
      '#bwg_thumbnails_mosaic_0>a.bwg_lightbox{display:block!important;position:relative!important;top:auto!important;left:auto!important;width:100%!important;height:auto!important;visibility:visible!important;opacity:1!important}',
      '#bwg_thumbnails_mosaic_0 .bwg_mosaic_thumb_spun_0{display:block!important;position:relative!important;top:auto!important;left:auto!important;width:100%!important;height:220px!important;overflow:hidden!important;transform:none!important}',
      '#bwg_thumbnails_mosaic_0 img{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;visibility:visible!important;opacity:1!important;transform:none!important}',
      '#bwg_thumbnails_mosaic_0>a.bwg_lightbox:hover img{filter:brightness(.88)}',
      '#static-gallery-lightbox[hidden]{display:none!important}',
      '#static-gallery-lightbox{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.94);color:#fff}',
      '#static-gallery-lightbox .sg-photo{display:block;max-width:calc(100vw - 110px);max-height:calc(100vh - 90px);width:auto;height:auto;object-fit:contain}',
      '#static-gallery-lightbox button{position:absolute;z-index:2;border:0;background:rgba(30,30,30,.65);color:#fff;font-size:44px;cursor:pointer;border-radius:6px;line-height:1;min-width:48px;min-height:48px;padding:4px 12px}',
      '#static-gallery-lightbox button:hover,#static-gallery-lightbox button:focus-visible{background:#555;outline:2px solid #fff}',
      '#static-gallery-lightbox .sg-close{top:14px;right:14px}',
      '#static-gallery-lightbox .sg-prev{left:12px;top:50%;transform:translateY(-50%)}',
      '#static-gallery-lightbox .sg-next{right:12px;top:50%;transform:translateY(-50%)}',
      '#static-gallery-lightbox .sg-counter{position:absolute;bottom:12px;left:0;right:0;text-align:center;font:15px system-ui,sans-serif}',
      '@media(max-width:600px){#static-gallery-lightbox .sg-photo{max-width:calc(100vw - 75px);max-height:calc(100vh - 100px)}#static-gallery-lightbox button{font-size:32px;min-width:36px;padding:4px}}'
    ].join("");
    document.head.appendChild(style);
    document.body.appendChild(modal);
    const image = modal.querySelector(".sg-photo");
    const counter = modal.querySelector(".sg-counter");
    let selected = 0, previousFocus = null, previousOverflow = "";
    function show(index) {
      selected = (index + links.length) % links.length;
      const href = links[selected].getAttribute("href") || "";
      image.src = new URL(href, document.baseURI).href;
      image.alt = "Project gallery photo " + (selected + 1);
      counter.textContent = (selected + 1) + " / " + links.length;
      modal.hidden = false;
      document.body.style.overflow = "hidden";
    }
    function open(index) {
      previousFocus = document.activeElement;
      previousOverflow = document.body.style.overflow;
      show(index);
      modal.querySelector(".sg-close").focus();
    }
    function close() {
      modal.hidden = true;
      image.removeAttribute("src");
      document.body.style.overflow = previousOverflow;
      if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
    }
    document.addEventListener("click", (event) => {
      const anchor = event.target.closest && event.target.closest("a.bwg_lightbox");
      if (!anchor) return;
      const index = links.indexOf(anchor);
      if (index < 0) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      open(index);
    }, true);
    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest(".sg-close")) close();
      else if (event.target.closest(".sg-prev")) show(selected - 1);
      else if (event.target.closest(".sg-next")) show(selected + 1);
    });
    document.addEventListener("keydown", (event) => {
      if (modal.hidden) return;
      if (event.key === "Escape") close();
      else if (event.key === "ArrowLeft") show(selected - 1);
      else if (event.key === "ArrowRight") show(selected + 1);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
