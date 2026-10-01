/* Sizes the photo column so the photo's natural height matches the intro text's height. */
(function () {
  var wrap = document.getElementById("intro-split");
  var photo = document.getElementById("intro-photo");
  var text = document.getElementById("intro-text");
  if (!wrap || !photo || !text) return;
  var img = photo.querySelector("img");
  var ratio = (+img.getAttribute("height")) / (+img.getAttribute("width")); // natural h / w

  function balance() {
    if (window.matchMedia("(max-width:900px)").matches) { photo.style.flexBasis = ""; return; }
      var best = 0.46, bestDiff = Infinity;
    wrap.style.alignItems = "flex-start";
    for (var f = 0.30; f <= 0.66; f += 0.01) {
      photo.style.flexBasis = (f * 100) + "%";
      var photoH = photo.clientWidth * ratio;
      var textH = text.offsetHeight;
      var diff = Math.abs(photoH - textH);
      if (diff < bestDiff) { bestDiff = diff; best = f; }
    }
    photo.style.flexBasis = (best * 100) + "%";
    wrap.style.alignItems = "";
  }
  balance();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(balance);
  var t; window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(balance, 120); });
})();
