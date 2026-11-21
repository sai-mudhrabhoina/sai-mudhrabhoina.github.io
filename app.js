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
