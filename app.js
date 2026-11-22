(function(){
  var key = document.body.getAttribute("data-project");

  function safeUrl(u){ return /^https:\/\/(app|msit)\.powerbi\.com\/(view|reportEmbed)\?/.test(u); }

  /* Live report */
  document.querySelectorAll("[data-live]").forEach(function(box){
    var url = (window.EMBED || {})[box.getAttribute("data-live")];
    if (!url || !safeUrl(url)) return;
    var ifr = document.createElement("iframe");
    ifr.title = box.getAttribute("data-title"); ifr.src = url; ifr.allowFullscreen = true; ifr.loading = "lazy";
    box.querySelector(".frame").appendChild(ifr);
    var a = document.createElement("a");
    a.href = url; a.target = "_blank"; a.rel = "noopener"; a.textContent = "Open full screen";
    box.querySelector(".open").appendChild(a);
    box.hidden = false;
  });

  /* Notes written by the author */
  var notes = (window.NOTES || {})[key], wrap = document.querySelector("[data-notes]");
  if (notes && wrap) {
    var any = false;
    ["problem","role"].forEach(function(k){
      var text = (notes[k] || "").trim();
      if (!text) return;
      wrap.querySelector('[data-note="' + k + '"]').textContent = text;
      wrap.querySelector('[data-note-box="' + k + '"]').hidden = false;
      any = true;
    });
    if (any) wrap.hidden = false;
  }

  /* Dashboard filters (home page). Without JavaScript every card simply shows. */
  var fbox = document.querySelector("[data-filters]");
  if (fbox) {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".card[data-industry]"));
    var groups = [["industry","Industry"],["theme","Focus"]], state = {industry:"All", theme:"All"};
    var countEl = document.querySelector("[data-count]");
    function apply(){
      var shown = 0;
      cards.forEach(function(c){
        var ok = groups.every(function(g){ return state[g[0]] === "All" || c.getAttribute("data-" + g[0]).split("|").indexOf(state[g[0]]) >= 0; });
        c.hidden = !ok; if (ok) shown++;
      });
      countEl.textContent = "Showing " + shown + " of " + cards.length + " dashboards";
      fbox.querySelectorAll("button").forEach(function(b){
        b.setAttribute("aria-pressed", state[b.getAttribute("data-g")] === b.getAttribute("data-v") ? "true" : "false");
      });
    }
    groups.forEach(function(g){
      var vals = [];
      cards.forEach(function(c){ c.getAttribute("data-" + g[0]).split("|").forEach(function(v){ if (vals.indexOf(v) < 0) vals.push(v); }); });
      if (vals.length < 2) return;
      var row = document.createElement("div"); row.className = "fgroup"; row.setAttribute("role","group"); row.setAttribute("aria-label", g[1]);
      var lab = document.createElement("span"); lab.className = "lab"; lab.textContent = g[1]; row.appendChild(lab);
      ["All"].concat(vals).forEach(function(v){
        var b = document.createElement("button"); b.type = "button"; b.textContent = v;
        b.setAttribute("data-g", g[0]); b.setAttribute("data-v", v);
        b.addEventListener("click", function(){ state[g[0]] = v; apply(); });
        row.appendChild(b);
      });
      fbox.appendChild(row);
    });
    if (fbox.children.length) { fbox.hidden = false; countEl.hidden = false; apply(); }
  }

  /* Card slider (home page) */
  var track = document.querySelector(".cards");
  if (track) {
    var nav = document.createElement("div"); nav.className = "slidernav"; nav.hidden = true;
    nav.innerHTML = '<span class="pos" aria-live="polite"></span><button type="button" aria-label="Previous dashboards">&larr;</button><button type="button" aria-label="Next dashboards">&rarr;</button>';
    track.parentNode.insertBefore(nav, track.nextSibling);
    var prevB = nav.querySelectorAll("button")[0], nextB = nav.querySelectorAll("button")[1], pos = nav.querySelector(".pos");
    function step(){ var c = track.querySelector(".card:not([hidden])"); return c ? c.getBoundingClientRect().width + 18 : track.clientWidth; }
    function sync(){
      var visible = track.querySelectorAll(".card:not([hidden])").length;
      var overflow = track.scrollWidth - track.clientWidth > 4;
      nav.hidden = !overflow;
      prevB.disabled = track.scrollLeft < 4;
      nextB.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      var first = Math.min(visible, Math.round(track.scrollLeft / step()) + 1);
      var per = Math.max(1, Math.round(track.clientWidth / step()));
      pos.textContent = visible ? first + "–" + Math.min(visible, first + per - 1) + " of " + visible : "";
    }
    prevB.addEventListener("click", function(){ track.scrollBy({left: -step() * Math.max(1, Math.round(track.clientWidth / step())), behavior: "smooth"}); setTimeout(sync, 450); });
    nextB.addEventListener("click", function(){ track.scrollBy({left: step() * Math.max(1, Math.round(track.clientWidth / step())), behavior: "smooth"}); setTimeout(sync, 450); });
    track.addEventListener("scroll", function(){ window.requestAnimationFrame(sync); });
    window.addEventListener("resize", sync);
    document.addEventListener("click", function(e){ if (e.target.closest && e.target.closest(".fgroup button")) { track.scrollLeft = 0; setTimeout(sync, 50); } });
    sync();
  }

  /* Screenshot tabs */
  document.querySelectorAll("[data-shots]").forEach(function(group){
    var img = group.querySelector("img"), link = group.querySelector(".shot a"), cap = group.querySelector("figcaption");
    var buttons = group.querySelectorAll(".tabs button");
    buttons.forEach(function(b){
      b.addEventListener("click", function(){
        buttons.forEach(function(o){ o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
        var src = b.getAttribute("data-src");
        img.src = src; link.href = src;
        img.alt = "Dashboard screenshot: " + b.textContent;
        cap.textContent = b.getAttribute("data-cap");
      });
    });
  });
})();
