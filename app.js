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

  /* Dashboard filters and "show more" (home page). Without JavaScript every card simply shows. */
  var track = document.querySelector(".cards");
  if (track) {
    var cards = Array.prototype.slice.call(track.querySelectorAll(".card[data-industry]"));
    var LIMIT = 3, expanded = false;
    var fbox = document.querySelector("[data-filters]"), countEl = document.querySelector("[data-count]");
    var groups = [["industry","Industry"],["theme","Focus"]], state = {industry:"All", theme:"All"};
    var moreBar = document.createElement("div"); moreBar.className = "morebar"; moreBar.hidden = true;
    var moreBtn = document.createElement("button"); moreBtn.type = "button"; moreBar.appendChild(moreBtn);
    track.parentNode.insertBefore(moreBar, track.nextSibling);
    function apply(){
      var matched = 0, shown = 0;
      cards.forEach(function(c){
        var ok = groups.every(function(g){ return state[g[0]] === "All" || c.getAttribute("data-" + g[0]).split("|").indexOf(state[g[0]]) >= 0; });
        var hide = !ok || (!expanded && matched >= LIMIT);
        if (ok) matched++;
        c.hidden = hide; if (!hide) shown++;
      });
      if (countEl) countEl.textContent = "Showing " + shown + " of " + cards.length + " dashboards";
      moreBar.hidden = matched <= LIMIT;
      moreBtn.textContent = expanded ? "Show fewer dashboards" : "Show all " + matched + " dashboards";
      moreBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
      if (fbox) fbox.querySelectorAll("button").forEach(function(b){
        b.setAttribute("aria-pressed", state[b.getAttribute("data-g")] === b.getAttribute("data-v") ? "true" : "false");
      });
    }
    moreBtn.addEventListener("click", function(){ expanded = !expanded; apply(); });
    if (fbox) {
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
      if (fbox.children.length) { fbox.hidden = false; if (countEl) countEl.hidden = false; }
    }
    apply();
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
