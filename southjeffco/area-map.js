/* South Jeffco area map.
 * Red = current high school, blue = current middle school, purple = next projected school.
 * To add or move a school, edit SCHOOLS below.
 */
(function () {
  var SCHOOLS = [
    { name: "Green Mountain High School", type: "hs",     lat: 39.69284, lng: -105.14724, address: "13175 W Green Mountain Dr, Lakewood, CO 80228" },
    { name: "Chatfield High School",      type: "hs",     lat: 39.58710, lng: -105.13160, address: "7227 S Simms St, Littleton, CO 80127" },
    { name: "Columbine High School",      type: "hs",     lat: 39.60880, lng: -105.07263, address: "6201 S Pierce St, Littleton, CO 80123" },
    { name: "Bradford Middle School",     type: "ms",     lat: 39.58320, lng: -105.16780, address: "2 Woodruff, Littleton, CO 80127" },
    { name: "Deer Creek Middle School",   type: "ms",     lat: 39.58670, lng: -105.10210, address: "9201 W Columbine Dr, Littleton, CO 80128" },
    { name: "Ken Caryl Middle School",    type: "ms",     lat: 39.58160, lng: -105.06965, address: "6509 W Ken Caryl Ave, Littleton, CO 80128" },
    { name: "Falcon Bluffs Middle School",type: "ms",     lat: 39.56336, lng: -105.10265, address: "8449 S Garrison St, Littleton, CO 80128" },
    { name: "Dunstan Middle School",      type: "future", lat: 39.68437, lng: -105.13873, address: "1855 S Wright St, Lakewood, CO 80228" },
    { name: "Dakota Ridge High School",   type: "future", lat: 39.60417, lng: -105.14972, address: "13399 W Coal Mine Ave, Littleton, CO 80127" }
  ];
  var TYPES = {
    hs:     { label: "Current High Schools",    short: "Current high school",    color: "#d92d20" },
    ms:     { label: "Current Middle Schools",  short: "Current middle school",  color: "#1f5fbf" },
    future: { label: "Next Projected Schools",  short: "Next projected school",  color: "#7a3fb8" }
  };

  var el = document.getElementById("area-map");
  if (!el || typeof L === "undefined") return;

  function pin(color) {
    return L.divIcon({
      className: "sj-pin",
      iconSize: [28, 40], iconAnchor: [14, 39], popupAnchor: [0, -34], tooltipAnchor: [0, -34],
      html: '<svg viewBox="0 0 28 40" width="28" height="40" aria-hidden="true">' +
            '<path d="M14 1C6.8 1 1 6.7 1 13.8 1 23.5 14 39 14 39s13-15.5 13-25.2C27 6.7 21.2 1 14 1z" fill="' + color + '" stroke="#fff" stroke-width="2"/>' +
            '<circle cx="14" cy="14" r="5" fill="#fff"/></svg>'
    });
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var map = L.map(el, { scrollWheelZoom: false, zoomControl: true });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var markers = [];
  SCHOOLS.forEach(function (s) {
    var t = TYPES[s.type];
    var dir = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(s.name + ", " + s.address);
    var m = L.marker([s.lat, s.lng], { icon: pin(t.color), title: s.name, alt: s.name, riseOnHover: true })
      .bindTooltip(esc(s.name), { direction: "top" })
      .bindPopup('<strong>' + esc(s.name) + '</strong><br><span class="sj-pop-type" style="color:' + t.color + '">' + t.short + '</span><br>' +
                 esc(s.address) + '<br><a href="' + dir + '" target="_blank" rel="noopener">Directions &rarr;</a>')
      .addTo(map);
    markers.push(m);
    s.marker = m;
  });

  var bounds = L.latLngBounds(SCHOOLS.map(function (s) { return [s.lat, s.lng]; }));
  function fit() { map.fitBounds(bounds, { padding: [36, 36] }); }
  fit();

  // Enable scroll-zoom only after the user clicks into the map (prevents page-scroll hijack).
  map.on("click", function () { map.scrollWheelZoom.enable(); });
  map.on("mouseout", function () { map.scrollWheelZoom.disable(); });

  // Legend / school list
  var list = document.getElementById("area-map-list");
  if (list) {
    var html = "";
    ["hs", "ms", "future"].forEach(function (k) {
      var t = TYPES[k];
      html += '<div class="sj-group"><h4><span class="sj-dot" style="background:' + t.color + '"></span>' + t.label + '</h4><ul>';
      SCHOOLS.forEach(function (s, i) {
        if (s.type === k) html += '<li><button type="button" data-i="' + i + '">' + esc(s.name) + '</button></li>';
      });
      html += "</ul></div>";
    });
    html += '<button type="button" class="sj-reset">Show all schools</button>';
    list.innerHTML = html;
    list.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.classList.contains("sj-reset")) { map.closePopup(); fit(); return; }
      var s = SCHOOLS[+b.getAttribute("data-i")];
      map.setView([s.lat, s.lng], 15);
      s.marker.openPopup();
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }
})();
