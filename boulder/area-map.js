/* Boulder area map.
 *
 * Pins:  red = high school with volunteers, blue = middle school with volunteers,
 *        gray = no volunteers yet (no hover).
 *
 * Volunteer first names come live from the "Boulder Schools" Google Sheet:
 *   Row 1 = school name (e.g. "Fairview"), Row 2 = level (optional), Row 3+ = first names.
 * Edit the sheet and the page updates on the next load. The sheet must stay
 * shared as "Anyone with the link can view".
 *
 * To add a school to the map, add it to SCHOOLS below. "match" lists the
 * column headings in the sheet that belong to that school (case doesn't matter).
 */
(function () {
  var SHEET_ID = "1GWEy9B0HOQIHThT6xBYQgDfe1JALfomi7Vggj2nVyh0";

  var SCHOOLS = [
    { name: "Boulder High School",    type: "hs", match: ["boulder"],    lat: 40.01453, lng: -105.27351, address: "1604 Arapahoe Ave, Boulder, CO 80302" },
    { name: "Centaurus High School",  type: "hs", match: ["centaurus"],  lat: 39.98679, lng: -105.07472, address: "10300 South Boulder Rd, Lafayette, CO 80026" },
    { name: "Fairview High School",   type: "hs", match: ["fairview"],   lat: 39.97147, lng: -105.24576, address: "1515 Greenbriar Blvd, Boulder, CO 80305" },
    { name: "Monarch High School",    type: "hs", match: ["monarch"],    lat: 39.95071, lng: -105.14090, address: "329 Campus Dr, Louisville, CO 80027" },
    { name: "Nederland Middle-Senior High School", type: "hs", match: ["nederland"], lat: 39.95316, lng: -105.52620, address: "597 Eldora Rd, Nederland, CO 80466" },
    { name: "Angevine Middle School", type: "ms", match: ["angevine"],   lat: 39.98689, lng: -105.10532, address: "1150 W South Boulder Rd, Lafayette, CO 80026" },
    { name: "Casey Middle School",    type: "ms", match: ["casey"],      lat: 40.02252, lng: -105.28007, address: "1301 High St, Boulder, CO 80304" },
    { name: "Centennial Middle School", type: "ms", match: ["centennial"], lat: 40.04434, lng: -105.26897, address: "2205 Norwood Ave, Boulder, CO 80304" },
    { name: "Louisville Middle School", type: "ms", match: ["louisville"], lat: 39.98404, lng: -105.13225, address: "1341 Main St, Louisville, CO 80027" },
    { name: "Manhattan Middle School", type: "ms", match: ["manhattan"], lat: 39.99363, lng: -105.22970, address: "290 Manhattan Dr, Boulder, CO 80303" },
    { name: "Nevin Platt Middle School", type: "ms", match: ["nevin platt", "platt"], lat: 40.00356, lng: -105.21133, address: "6096 Baseline Rd, Boulder, CO 80303" },
    { name: "Southern Hills Middle School", type: "ms", match: ["southern hills"], lat: 39.97486, lng: -105.24590, address: "1500 Knox Dr, Boulder, CO 80305" }
  ];
  var TYPES = {
    hs: { label: "High Schools",   short: "High school",   color: "#d92d20" },
    ms: { label: "Middle Schools", short: "Middle school", color: "#1f5fbf" }
  };
  var GRAY = "#9aa3ae";
  var LEVELS = /^(middle|high|middle\s*\/\s*high|middle-senior high)(\s+school)?s?$/i;

  var el = document.getElementById("area-map");
  if (!el || typeof L === "undefined") return;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function norm(s) {
    return String(s || "").toLowerCase()
      .replace(/middle[- ]senior high school|high school|middle school|school|\bhs\b|\bms\b/g, "")
      .replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
  }
  function pin(color, empty) {
    var w = empty ? 22 : 28, h = empty ? 31 : 40;
    return L.divIcon({
      className: "sj-pin" + (empty ? " is-empty" : ""),
      iconSize: [w, h], iconAnchor: [w / 2, h - 1], popupAnchor: [0, -(h - 6)], tooltipAnchor: [0, -(h - 6)],
      html: '<svg viewBox="0 0 28 40" width="' + w + '" height="' + h + '" aria-hidden="true">' +
            '<path d="M14 1C6.8 1 1 6.7 1 13.8 1 23.5 14 39 14 39s13-15.5 13-25.2C27 6.7 21.2 1 14 1z" fill="' + color + '" stroke="#fff" stroke-width="2"/>' +
            '<circle cx="14" cy="14" r="5" fill="#fff"/></svg>'
    });
  }

  var map = L.map(el, { scrollWheelZoom: false, zoomControl: true });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var canHover = window.matchMedia && window.matchMedia("(hover: hover)").matches;
  var loadFailed = false;

  SCHOOLS.forEach(function (s) {
    s.vols = [];
    s.marker = L.marker([s.lat, s.lng], { icon: pin(GRAY, true), title: s.name, alt: s.name }).addTo(map);
  });

  function namesHtml(s) {
    return '<span class="vol-label">Volunteers</span>' + s.vols.map(esc).join(", ");
  }

  function render() {
    SCHOOLS.forEach(function (s) {
      var t = TYPES[s.type], has = s.vols.length > 0, m = s.marker;
      var dir = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(s.name + ", " + s.address);
      m.setIcon(pin(has ? t.color : GRAY, !has));
      m.setZIndexOffset(has ? 1000 : 0);
      m.unbindTooltip();
      if (has && canHover) {
        m.bindTooltip('<strong>' + esc(s.name) + '</strong>' + namesHtml(s), { direction: "top", className: "vol-tip", opacity: 1 });
      }
      m.bindPopup('<div class="vol-pop"><strong>' + esc(s.name) + '</strong>' +
        '<span class="sj-pop-type" style="color:' + (has ? t.color : "#6b7280") + '">' + t.short + (has ? "" : " &middot; no volunteers yet") + '</span>' +
        (has ? '<br>' + namesHtml(s) : "") +
        '<br>' + esc(s.address) + '<br><a href="' + dir + '" target="_blank" rel="noopener">Directions &rarr;</a></div>');
    });
    renderList();
  }

  var bounds = L.latLngBounds(SCHOOLS.map(function (s) { return [s.lat, s.lng]; }));
  function fit() { map.fitBounds(bounds, { padding: [36, 36] }); }
  fit();
  map.on("click", function () { map.scrollWheelZoom.enable(); });
  map.on("mouseout", function () { map.scrollWheelZoom.disable(); });

  var list = document.getElementById("area-map-list");
  function renderList() {
    if (!list) return;
    var html = '<div class="sj-key">' +
      '<span><span class="sj-dot" style="background:' + TYPES.hs.color + '"></span>High school with volunteers</span>' +
      '<span><span class="sj-dot" style="background:' + TYPES.ms.color + '"></span>Middle school with volunteers</span>' +
      '<span><span class="sj-dot" style="background:' + GRAY + '"></span>No volunteers yet</span></div>';
    if (loadFailed) html += '<p class="sj-note">The volunteer list couldn&rsquo;t load right now. Please refresh to try again.</p>';
    ["hs", "ms"].forEach(function (k) {
      html += '<div class="sj-group"><h4>' + TYPES[k].label + '</h4><ul>';
      SCHOOLS.forEach(function (s, i) {
        if (s.type !== k) return;
        var n = s.vols.length;
        html += '<li><button type="button" data-i="' + i + '"><span class="sj-dot" style="background:' + (n ? TYPES[k].color : GRAY) + '"></span>' +
                '<span>' + esc(s.name) + (n ? ' <span class="sj-count">(' + n + ')</span>' : "") + '</span></button></li>';
      });
      html += "</ul></div>";
    });
    html += '<button type="button" class="sj-reset">Show all schools</button>';
    list.innerHTML = html;
  }
  if (list) {
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
  render();

  // ---- Load volunteers from the Google Sheet (JSONP, so no CORS or API key needed) ----
  function applyColumns(cols) {
    SCHOOLS.forEach(function (s) { s.vols = []; });
    cols.forEach(function (col) {
      var head = norm(col[0]);
      if (!head) return;
      var school = null;
      SCHOOLS.forEach(function (s) {
        if (school) return;
        if (s.match.indexOf(head) > -1 || norm(s.name) === head) school = s;
      });
      if (!school) { if (window.console) console.warn("Boulder map: no school on the map matches sheet column \"" + col[0] + "\""); return; }
      col.slice(1).forEach(function (v) {
        v = String(v == null ? "" : v).trim();
        if (v && !LEVELS.test(v)) school.vols.push(v);
      });
    });
    render();
  }

  var cb = "ylBoulderVols" + Date.now();
  var timer = setTimeout(function () { loadFailed = true; renderList(); }, 12000);
  window[cb] = function (resp) {
    clearTimeout(timer);
    try {
      var rows = (resp && resp.table && resp.table.rows) || [];
      var width = 0;
      rows.forEach(function (r) { width = Math.max(width, (r.c || []).length); });
      var cols = [];
      for (var c = 0; c < width; c++) {
        cols.push(rows.map(function (r) { var cell = (r.c || [])[c]; return cell ? (cell.v != null ? cell.v : cell.f) : ""; }));
      }
      loadFailed = resp.status === "error";
      applyColumns(cols);
    } catch (err) { loadFailed = true; renderList(); }
    try { delete window[cb]; } catch (e) { window[cb] = undefined; }
  };
  var sc = document.createElement("script");
  sc.src = "https://docs.google.com/spreadsheets/d/" + SHEET_ID + "/gviz/tq?headers=0&tqx=out:json;responseHandler:" + cb + "&_=" + Date.now();
  sc.onerror = function () { clearTimeout(timer); loadFailed = true; renderList(); };
  document.head.appendChild(sc);
})();
