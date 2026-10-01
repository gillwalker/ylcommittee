/* Shared "Get Involved" form for the South Jeffco area pages.
 * Any element with data-get-involved="<Role name>" opens the form with that
 * role pre-checked (empty value = nothing pre-checked).
 */
(function () {
  var AREA = "southjeffco";
  var AREA_NAME = "South Jeffco";
  var ROLES = ["Leader Care & Hospitality", "Prayer Team", "Events", "Resource Development"];
  // Shared sign-up Worker for all area pages.
  var ENDPOINT = "https://yl-area-signup.gill-ec1.workers.dev/";
  var CONTACT = "gill@teamrichard.com";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var roleBoxes = ROLES.map(function (r, i) {
    return '<label><input type="checkbox" name="roles" value="' + esc(r) + '" id="gi-role-' + i + '">' + esc(r) + "</label>";
  }).join("");

  var dlg = document.createElement("dialog");
  dlg.className = "gi";
  dlg.setAttribute("aria-labelledby", "gi-title");
  dlg.innerHTML =
    '<div class="gi-head"><div><h2 id="gi-title">Get Involved</h2><p>' + esc(AREA_NAME) + ' Young Life Committee</p></div>' +
    '<button type="button" class="gi-close" aria-label="Close" data-gi-close>&times;</button></div>' +
    '<form novalidate>' +
      '<div class="hp" aria-hidden="true"><label>Leave empty<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>' +
      '<div class="row">' +
        '<div class="field"><label class="lbl" for="gi-first">First name <span class="req">*</span></label><input type="text" id="gi-first" name="firstName" autocomplete="given-name" required maxlength="80"></div>' +
        '<div class="field"><label class="lbl" for="gi-last">Last name <span class="req">*</span></label><input type="text" id="gi-last" name="lastName" autocomplete="family-name" required maxlength="80"></div>' +
      '</div>' +
      '<div class="row">' +
        '<div class="field"><label class="lbl" for="gi-email">Email <span class="req">*</span></label><input type="email" id="gi-email" name="email" autocomplete="email" required maxlength="160"></div>' +
        '<div class="field"><label class="lbl" for="gi-phone">Phone</label><input type="tel" id="gi-phone" name="phone" autocomplete="tel" maxlength="40"></div>' +
      '</div>' +
      '<fieldset class="field"><legend>Roles you\'re interested in <span class="req">*</span></legend>' +
        '<div class="roles">' + roleBoxes + '</div><p class="hint">Select as many as you like.</p></fieldset>' +
      '<div class="field"><label class="lbl" for="gi-msg">Anything you\'d like us to know?</label>' +
        '<textarea id="gi-msg" name="message" maxlength="2000" placeholder="Your connection to ' + esc(AREA_NAME) + ', schools your kids attend, gifts you\'d bring&hellip;"></textarea></div>' +
      '<div class="msg" role="status" aria-live="polite"></div>' +
      '<div class="actions"><button type="button" class="btn btn-outline" data-gi-close>Cancel</button><button type="submit" class="btn btn-primary">Submit</button></div>' +
    '</form>' +
    '<div class="done" hidden><div class="check">&#x2713;</div><h3>Thank you!</h3>' +
      '<p>Your information has been sent to our area director, who will be in touch soon.</p>' +
      '<button type="button" class="btn btn-primary" data-gi-close>Close</button></div>';
  document.body.appendChild(dlg);

  var form = dlg.querySelector("form");
  var done = dlg.querySelector(".done");
  var msg = dlg.querySelector(".msg");
  var submit = form.querySelector('button[type="submit"]');
  var boxes = form.querySelectorAll('input[name="roles"]');

  function open(role) {
    form.hidden = false; done.hidden = true;
    msg.textContent = ""; msg.className = "msg";
    boxes.forEach(function (b) { b.checked = b.value === role; });
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    setTimeout(function () { document.getElementById("gi-first").focus(); }, 50);
  }
  function close() {
    if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open");
  }

  document.querySelectorAll("[data-get-involved]").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); open(el.getAttribute("data-get-involved")); });
  });
  dlg.querySelectorAll("[data-gi-close]").forEach(function (el) { el.addEventListener("click", close); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    msg.className = "msg"; msg.textContent = "";
    var roles = [];
    boxes.forEach(function (b) { if (b.checked) roles.push(b.value); });
    if (!form.checkValidity() || roles.length === 0) {
      msg.className = "msg error";
      msg.textContent = "Please add your name, a valid email, and at least one role.";
      var bad = form.querySelector(":invalid") || boxes[0];
      bad.focus();
      return;
    }
    var fd = new FormData(form);
    var data = {
      area: AREA,
      firstName: String(fd.get("firstName") || "").trim(),
      lastName: String(fd.get("lastName") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      message: String(fd.get("message") || "").trim(),
      website: String(fd.get("website") || ""),
      roles: roles,
      page: location.pathname
    };
    submit.disabled = true; submit.textContent = "Sending…";
    fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.ok) throw new Error(j.error || "failed"); });
      })
      .then(function () { form.reset(); form.hidden = true; done.hidden = false; })
      .catch(function () {
        msg.className = "msg error";
        msg.innerHTML = 'Sorry, something went wrong. Please try again, or email <a href="mailto:' + CONTACT + '">' + CONTACT + "</a>.";
      })
      .finally(function () { submit.disabled = false; submit.textContent = "Submit"; });
  });
})();
