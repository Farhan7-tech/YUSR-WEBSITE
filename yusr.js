/* YUSR INBOX · shared behaviors */
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mobile nav */
  var burger = document.querySelector(".nav-burger");
  var links = document.querySelector(".nav-links");
  if (burger && links) {
    burger.addEventListener("click", function () {
      links.classList.toggle("open");
      burger.setAttribute("aria-expanded", links.classList.contains("open"));
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") links.classList.remove("open");
    });
  }

  /* reveal on scroll */
  var rv = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add("in"); });
  }

  /* count-up numbers: <span data-count="2487" data-suffix="%"> */
  var counters = document.querySelectorAll("[data-count]");
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
    if (reduced) { el.textContent = target.toLocaleString("en-IN", { minimumFractionDigits: decimals }) + suffix; return; }
    var start = null, dur = 1100;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = val.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* bar chart: .bar elements with data-h (0 to 1) */
  var bars = document.querySelectorAll(".bar[data-h]");
  bars.forEach(function (b) { b.style.transform = "scaleY(0.02)"; b.style.height = "100%"; });
  if (bars.length && "IntersectionObserver" in window && !reduced) {
    var bio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          setTimeout(function () { el.style.transform = "scaleY(" + el.getAttribute("data-h") + ")"; },
            Array.prototype.indexOf.call(bars, el) * 70);
          bio.unobserve(el);
        }
      });
    }, { threshold: 0.3 });
    bars.forEach(function (b) { bio.observe(b); });
  } else {
    bars.forEach(function (b) { b.style.transform = "scaleY(" + b.getAttribute("data-h") + ")"; });
  }

  /* receipt tape printer: container .tape-lines[data-tape] prints lines forever */
  var tape = document.querySelector(".tape-lines[data-tape]");
  if (tape) {
    var LINES = [
      ["09:41", "AI replied · price + stock", "2.1s", "ok"],
      ["09:41", "Order #2231 confirmed · COD", "✓✓", "ok"],
      ["09:42", "Broadcast · EOSS sale", "1,204 sent", "ok"],
      ["09:43", "Tagged hot lead · Priya S.", "STAMP", "hot"],
      ["09:44", "Handed to Ayesha · exchange query", "HUMAN", "hot"],
      ["09:46", "Catalog synced · 289 products", "✓✓", "ok"],
      ["09:47", "AI replied in customer's language", "1.8s", "ok"],
      ["09:48", "QR scan · counter poster", "+1 lead", "hot"],
      ["09:50", "Delivery update sent · #2226", "✓✓", "ok"],
      ["09:52", "Follow up queued · 4h window", "AUTO", "ok"]
    ];
    var i = 0, MAX = 7;
    var tapeCount = document.querySelector("[data-tape-count]");
    var printed = 0;
    function addLine() {
      var L = LINES[i % LINES.length]; i++;
      var div = document.createElement("div");
      div.className = "tape-line fresh";
      div.innerHTML = '<span class="t">' + L[0] + "</span><span>" + L[1] +
        '</span><span class="' + L[3] + '">' + L[2] + "</span>";
      tape.appendChild(div);
      while (tape.children.length > MAX) tape.removeChild(tape.firstChild);
      if (!reduced) setTimeout(function (el) { return function () { el.classList.remove("fresh"); }; }(div), 650);
      printed++;
      if (tapeCount) {
        tapeCount.textContent = printed.toLocaleString("en-IN");
        tapeCount.classList.remove("pulse");
        void tapeCount.offsetWidth;
        tapeCount.classList.add("pulse");
      }
    }
    for (var k = 0; k < 5; k++) addLine();
    if (!reduced) {
      (function loop() {
        setTimeout(function () { addLine(); loop(); }, 1700 + Math.random() * 1200);
      })();
    }
  }

  /* ── generic chat/message thread player: any [data-msgs][data-autoplay] ──
     opt-in via data-autoplay so pages with their own hand-built thread logic
     (index.html's Floor / AI Memory preview, which juggle multiple contacts)
     are untouched — this is for the simple single-conversation demos. */
  function animateTick(msgEl) {
    var tick = msgEl.querySelector(".tick");
    if (!tick || reduced) return;
    tick.textContent = "✓"; tick.className = "tick tick-sent";
    setTimeout(function () { tick.textContent = "✓✓"; tick.className = "tick tick-delivered"; }, 450);
    setTimeout(function () { tick.className = "tick tick-read"; }, 1100);
  }
  function playThread(container) {
    if (!container) return 0;
    var kids = Array.prototype.slice.call(container.children);
    kids.forEach(function (el) { el.classList.remove("show"); });
    if (reduced) { kids.forEach(function (el) { el.classList.add("show"); }); return 0; }
    var d = 260;
    kids.forEach(function (el) {
      if (el.hasAttribute("data-t")) {
        (function (el, at) { setTimeout(function () { el.classList.add("show"); }, at); })(el, d);
        d += 900;
        (function (el, at) { setTimeout(function () { el.classList.remove("show"); }, at); })(el, d);
      } else {
        (function (el, at) {
          setTimeout(function () {
            el.classList.add("show");
            if (el.classList.contains("out")) animateTick(el);
          }, at);
        })(el, d);
        d += 560;
      }
    });
    return d;
  }
  var autoThreads = document.querySelectorAll("[data-msgs][data-autoplay]");
  autoThreads.forEach(function (container) {
    var timer = null;
    function loop() {
      clearTimeout(timer);
      var dur = playThread(container);
      timer = setTimeout(loop, (dur || 3200) + 2600);
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) loop(); else clearTimeout(timer); });
      }, { threshold: 0.3 }).observe(container);
    } else {
      loop();
    }
  });

  /* ── ledger that tallies live: rows flag in sequence, a meter counts up ──
     markup: <div class="ledger" data-live-meter data-meter-start="4820">
       ...<div class="ledger-row" data-row>...
       <span data-meter></span><i data-meter-pop></i> */
  document.querySelectorAll(".ledger[data-live-meter]").forEach(function (ledger) {
    var rows = Array.prototype.slice.call(ledger.querySelectorAll("[data-row]"));
    var meter = ledger.querySelector("[data-meter]");
    var meterPop = ledger.querySelector("[data-meter-pop]");
    var started = false;
    function start() {
      if (started) return; started = true;
      ledger.classList.add("in-view");
      if (!reduced && rows.length) {
        var idx = 0;
        setInterval(function () {
          rows.forEach(function (r) { r.classList.remove("flag"); });
          rows[idx % rows.length].classList.add("flag");
          idx++;
        }, 1600);
      }
      if (meter) {
        var amount = parseInt(ledger.getAttribute("data-meter-start"), 10) || 0;
        var prefix = ledger.getAttribute("data-meter-prefix") || "";
        meter.textContent = prefix + amount.toLocaleString("en-IN");
        if (!reduced) {
          setInterval(function () {
            var bump = Math.floor(Math.random() * 60) + 15;
            amount += bump;
            meter.textContent = prefix + amount.toLocaleString("en-IN");
            if (meterPop) {
              meterPop.textContent = "+" + prefix + bump;
              meterPop.classList.remove("pop");
              void meterPop.offsetWidth;
              meterPop.classList.add("pop");
            }
          }, 2400);
        }
      }
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) start(); }); }, { threshold: 0.3 }).observe(ledger);
    } else { start(); }
  });

  /* ── ledger rows that cycle sent → delivered → read, counters creep up ──
     markup: <div class="ledger" data-cycle-status>
       <div class="ledger-row" data-crow data-state="sent"><span data-status></span></div>
       ...<b data-count="2487">0</b> */
  document.querySelectorAll(".ledger[data-cycle-status]").forEach(function (ledger) {
    var bNext = { sent: "delivered", delivered: "read", read: "read" };
    function render(el, s) {
      if (!el) return;
      if (s === "read") el.innerHTML = '<span class="chip green">read</span>';
      else if (s === "delivered") el.innerHTML = '<span class="tick">✓✓</span>';
      else el.innerHTML = '<span class="tick" style="color:var(--stone-2);">✓</span>';
    }
    var rows = Array.prototype.slice.call(ledger.querySelectorAll("[data-crow]"));
    rows.forEach(function (r) { render(r.querySelector("[data-status]"), r.getAttribute("data-state")); });
    var counters = Array.prototype.slice.call(ledger.querySelectorAll("[data-count]"));
    var started = false;
    function start() {
      if (started || reduced) return; started = true;
      setInterval(function () {
        var advancing = rows.filter(function (r) { return r.getAttribute("data-state") !== "read"; });
        if (!advancing.length) {
          rows.forEach(function (r) { r.setAttribute("data-state", "sent"); render(r.querySelector("[data-status]"), "sent"); });
          return;
        }
        var r = advancing[Math.floor(Math.random() * advancing.length)];
        var ns = bNext[r.getAttribute("data-state")];
        r.setAttribute("data-state", ns);
        render(r.querySelector("[data-status]"), ns);
      }, 1900);
      setTimeout(function () {
        setInterval(function () {
          counters.forEach(function (c) {
            var v = parseInt((c.textContent || "0").replace(/,/g, ""), 10) || 0;
            c.textContent = (v + Math.floor(Math.random() * 3) + 1).toLocaleString("en-IN");
          });
        }, 3200);
      }, 2200);
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) start(); }); }, { threshold: 0.3 }).observe(ledger);
    } else { start(); }
  });

  /* ── card footer: a rotating one-line live status + cursor spotlight ──
     markup: <div class="card-live"><span class="cdot"></span>
       <span class="txt" data-live data-lines="line one|line two|line three"></span></div> */
  document.querySelectorAll(".card-live [data-live]").forEach(function (el, i) {
    var lines = (el.getAttribute("data-lines") || "").split("|").filter(Boolean);
    if (!lines.length) return;
    var idx = 0;
    el.textContent = lines[0];
    if (!reduced) {
      setInterval(function () {
        idx = (idx + 1) % lines.length;
        el.style.opacity = "0";
        setTimeout(function () { el.textContent = lines[idx]; el.style.opacity = "1"; }, 220);
      }, 2600 + i * 260);
    }
  });
  if (window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".card.lift").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty("--mx", (e.clientX - r.left) + "px");
        c.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ── stat-pair rows that creep upward, with a % recomputed live ──
     markup: <div data-live-scans>...<span class="mono">
       <b data-n1>412</b> · <b data-n2>289</b> · <b data-pct>70%</b></span> */
  document.querySelectorAll("[data-live-scans]").forEach(function (wrap) {
    var n1s = Array.prototype.slice.call(wrap.querySelectorAll("[data-n1]"));
    var started = false;
    function start() {
      if (started || reduced) return; started = true;
      setInterval(function () {
        var n1El = n1s[Math.floor(Math.random() * n1s.length)];
        var row = n1El.closest(".ledger-row") || n1El.parentElement;
        var n2El = row.querySelector("[data-n2]");
        var pctEl = row.querySelector("[data-pct]");
        var n1 = (parseInt(n1El.textContent.replace(/,/g, ""), 10) || 0) + 1;
        n1El.textContent = n1.toLocaleString("en-IN");
        var n2 = n2El ? (parseInt(n2El.textContent.replace(/,/g, ""), 10) || 0) : 0;
        if (n2El && Math.random() > 0.4) { n2 += 1; n2El.textContent = n2.toLocaleString("en-IN"); }
        if (pctEl && n1) { pctEl.textContent = Math.round((n2 / n1) * 100) + "%"; }
      }, 2600);
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) start(); }); }, { threshold: 0.3 }).observe(wrap);
    } else { start(); }
  });

  /* ── "currently processing this row" highlight, cycling through a table ──
     markup: <table data-row-cycle>...<tr data-trow>...</tr></table> */
  document.querySelectorAll("[data-row-cycle]").forEach(function (table) {
    var rows = Array.prototype.slice.call(table.querySelectorAll("[data-trow]"));
    if (!rows.length) return;
    var started = false;
    function start() {
      if (started || reduced) return; started = true;
      var idx = 0;
      setInterval(function () {
        rows.forEach(function (r) { r.style.background = ""; });
        rows[idx % rows.length].style.background = "var(--orange-soft)";
        idx++;
      }, 1500);
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) start(); }); }, { threshold: 0.3 }).observe(table);
    } else { start(); }
  });

  /* ── a card that cycles through example Q/A pairs (test-query demos) ──
     markup: <div data-query-cycle='[{"q":"...","a":"...","src":"..."}]'>
       <div data-q></div><div data-a></div><span data-src></span> */
  document.querySelectorAll("[data-query-cycle]").forEach(function (card) {
    var items;
    try { items = JSON.parse(card.getAttribute("data-query-cycle")); } catch (e) { return; }
    if (!items || !items.length) return;
    var qEl = card.querySelector("[data-q]"), aEl = card.querySelector("[data-a]"), srcEl = card.querySelector("[data-src]");
    var idx = 0;
    function render(i) {
      if (qEl) qEl.textContent = items[i].q;
      if (aEl) aEl.textContent = items[i].a;
      if (srcEl) srcEl.textContent = items[i].src;
    }
    render(0);
    if (!reduced && items.length > 1) {
      setInterval(function () {
        idx = (idx + 1) % items.length;
        [qEl, aEl].forEach(function (el) { if (el) el.style.opacity = "0"; });
        setTimeout(function () {
          render(idx);
          [qEl, aEl].forEach(function (el) { if (el) el.style.opacity = "1"; });
        }, 260);
      }, 3400);
    }
  });

  /* ── smooth open/close for <details class="faq"><summary>...</summary><div class="faq-a"><p>...</p></div></details>
     progressive enhancement over native instant toggle; falls through untouched if WAAPI/reduced-motion */
  if (!reduced && "animate" in Element.prototype) {
    document.querySelectorAll("details.faq").forEach(function (details) {
      var summary = details.querySelector(":scope > summary");
      var body = details.querySelector(":scope > .faq-a");
      if (!summary || !body) return;
      var busy = false;
      summary.addEventListener("click", function (e) {
        if (busy) { e.preventDefault(); return; }
        e.preventDefault();
        busy = true;
        if (details.hasAttribute("open")) {
          var startH = body.offsetHeight;
          body.style.overflow = "hidden";
          var closeAnim = body.animate(
            [{ height: startH + "px", opacity: 1 }, { height: "0px", opacity: 0 }],
            { duration: 220, easing: "cubic-bezier(.4,0,.2,1)" }
          );
          closeAnim.onfinish = function () {
            details.removeAttribute("open");
            body.style.overflow = ""; body.style.height = "";
            busy = false;
          };
        } else {
          details.setAttribute("open", "");
          var endH = body.offsetHeight;
          body.style.overflow = "hidden";
          var openAnim = body.animate(
            [{ height: "0px", opacity: 0 }, { height: endH + "px", opacity: 1 }],
            { duration: 260, easing: "cubic-bezier(.16,1,.3,1)" }
          );
          openAnim.onfinish = function () {
            body.style.overflow = ""; body.style.height = "";
            busy = false;
          };
        }
      });
    });
  }

  /* ── stat numbers that gently creep upward after their initial count-up ──
     markup: <div class="stat-row" data-creep>...<span data-count="3412">0</span> */
  document.querySelectorAll("[data-creep]").forEach(function (wrap) {
    var nums = Array.prototype.slice.call(wrap.querySelectorAll("[data-count]"));
    if (!nums.length) return;
    var started = false;
    function start() {
      if (started || reduced) return; started = true;
      setTimeout(function () {
        setInterval(function () {
          var el = nums[Math.floor(Math.random() * nums.length)];
          var isPct = el.nextElementSibling && el.nextElementSibling.tagName === "SMALL";
          if (isPct) return; /* percentages don't creep, only raw counts do */
          var v = parseInt(el.textContent.replace(/[^\d]/g, ""), 10) || 0;
          el.textContent = (v + Math.floor(Math.random() * 3) + 1).toLocaleString("en-IN");
        }, 3000);
      }, 2000);
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) start(); }); }, { threshold: 0.3 }).observe(wrap);
    } else { start(); }
  });

  /* ── a sequential highlight pulse across a row of chips ──
     markup: <div data-tag-cycle><span class="chip">...</span>...</div> */
  document.querySelectorAll("[data-tag-cycle]").forEach(function (wrap) {
    var chips = Array.prototype.slice.call(wrap.querySelectorAll(".chip"));
    if (!chips.length || reduced) return;
    var started = false;
    function start() {
      if (started) return; started = true;
      var idx = 0;
      setInterval(function () {
        chips.forEach(function (c) { c.style.boxShadow = ""; c.style.borderColor = ""; });
        var c = chips[idx % chips.length];
        c.style.boxShadow = "3px 3px 0 var(--orange)";
        c.style.borderColor = "var(--ink)";
        idx++;
      }, 1100);
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) start(); }); }, { threshold: 0.3 }).observe(wrap);
    } else { start(); }
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   EVENT TRACKING · Google Analytics 4
   ───────────────────────────────────────────────────────────────────
   Cloudflare Web Analytics already records pageviews. This adds the
   part it cannot do: which CTAs people actually click.

   The Measurement ID below is the live yusr.co.in web stream
   (Google Analytics → Admin → Data streams). It is not a secret:
   it ships in public client side code on every GA4 site. If it is
   ever blanked or replaced with a placeholder, GA4 stops loading
   entirely rather than beaconing to a property that does not exist.

   There is no gtag snippet in the HTML on purpose. This loader
   covers all 11 pages from one place, so the ID lives in exactly
   one file.

   GA4 sets _ga cookies, which privacy.html discloses under Cookies.
   If you ever switch back to a cookieless provider, revert that
   section too. Plausible and Umami are still supported below, and
   take priority if either is present.

   Debug locally with:  localStorage.yusrDebug = 1
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var GA4_MEASUREMENT_ID = "G-J6MG0JWZMH";

  // The placeholder is all X, which would pass a naive [A-Z0-9] test, so it
  // is excluded explicitly. Otherwise GA4 loads and beacons to nothing.
  var GA4_READY = /^G-[A-Z0-9]{6,}$/.test(GA4_MEASUREMENT_ID) &&
                  GA4_MEASUREMENT_ID.indexOf("XXXX") === -1;

  /* ── Consent ──────────────────────────────────────────────────────
     Visitors come from everywhere, so this is built for the strictest
     rule that applies (GDPR/ePrivacy), not the loosest:
       · Google's script is NOT loaded until someone actively accepts.
         Declining means zero requests to Google, not just no cookies.
       · Consent Mode v2 defaults are set to denied first regardless,
         so anything loaded later still starts locked down.
       · Accept and Decline are one click each, same size. No dark
         pattern, no pre ticked boxes, no "legitimate interest" toggle.
       · Global Privacy Control is honoured automatically.
       · The choice is reversible from the footer on every page.
     Cloudflare Web Analytics is unaffected: it is cookieless and sets
     no identifiers, so it needs no consent gate.
     ───────────────────────────────────────────────────────────────── */
  var CONSENT_KEY = "yusr_consent";

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  // Denied by default, before any Google code exists on the page.
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500
  });

  function readConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function writeConsent(v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) { /* private mode */ }
  }

  var gaLoaded = false;
  function loadGA() {
    if (gaLoaded || !GA4_READY) return;
    gaLoaded = true;
    window.gtag("consent", "update", { analytics_storage: "granted" });
    window.gtag("js", new Date());
    window.gtag("config", GA4_MEASUREMENT_ID, { anonymize_ip: true });

    var g = document.createElement("script");
    g.async = true;
    g.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4_MEASUREMENT_ID;
    document.head.appendChild(g);
  }

  function consentGranted() { return readConsent() === "granted"; }

  // Clear any cookies GA already set, for someone who accepts then declines.
  function dropGaCookies() {
    var host = location.hostname.replace(/^www\./, "");
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (name.indexOf("_ga") !== 0) return;
      ["/", location.pathname].forEach(function (path) {
        [host, "." + host, ""].forEach(function (d) {
          document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=" + path +
            (d ? "; domain=" + d : "");
        });
      });
    });
  }

  function applyConsent(choice) {
    writeConsent(choice);
    if (choice === "granted") {
      loadGA();
    } else {
      window.gtag("consent", "update", { analytics_storage: "denied" });
      dropGaCookies();
    }
  }

  function send(name, props) {
    try {
      if (window.localStorage && localStorage.yusrDebug) {
        console.log("[yusr:track]", name, props);
      }
      if (typeof window.plausible === "function") {
        window.plausible(name, { props: props });
      } else if (window.umami && typeof window.umami.track === "function") {
        window.umami.track(name, props);
      } else if (GA4_READY && gaLoaded && consentGranted() && typeof window.gtag === "function") {
        // GA4 event names must be snake_case: "Start trial click" → start_trial_click
        window.gtag("event", name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""), props);
      }
    } catch (e) { /* analytics must never break the page */ }
  }

  // Exposed so any page can fire a custom event: yusrTrack('Name', {a:1})
  window.yusrTrack = send;

  var page = location.pathname.replace(/\.html$/, "") || "/";

  /* ── Consent banner UI ────────────────────────────────────────────
     Injected from here so all 11 pages stay in sync and there is no
     markup to keep updated by hand. */
  function buildBanner() {
    var el = document.createElement("div");
    el.className = "consent";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-label", "Cookie choices");
    el.innerHTML =
      '<div class="consent-inner">' +
        '<p class="consent-copy"><b>We would like to measure how this site is used.</b> ' +
        'Google Analytics would set cookies to count visits and see which pages and buttons people actually use. ' +
        'Nothing is loaded until you choose, and we run no advertising cookies either way. ' +
        'Details in our <a href="/privacy">privacy policy</a>.</p>' +
        '<div class="consent-btns">' +
          '<button class="btn btn-ghost btn-sm" type="button" data-consent="denied">Decline</button>' +
          '<button class="btn btn-ink btn-sm" type="button" data-consent="granted">Accept</button>' +
        '</div>' +
      '</div>';

    el.addEventListener("click", function (ev) {
      var b = ev.target.closest ? ev.target.closest("[data-consent]") : null;
      if (!b) return;
      var choice = b.getAttribute("data-consent");
      applyConsent(choice);
      el.remove();
      send("consent_choice", { page: page, choice: choice });
    });
    return el;
  }

  function showBanner() {
    if (document.querySelector(".consent")) return;
    var run = function () { document.body.appendChild(buildBanner()); };
    if (document.body) run();
    else document.addEventListener("DOMContentLoaded", run);
  }

  // Let anyone reopen the choice later from the footer link.
  window.yusrConsent = function () {
    try { localStorage.removeItem(CONSENT_KEY); } catch (e) {}
    showBanner();
  };

  document.addEventListener("click", function (ev) {
    var t = ev.target && ev.target.closest ? ev.target.closest('[data-cta="cookie-settings"]') : null;
    if (!t) return;
    ev.preventDefault();
    window.yusrConsent();
  });

  var stored = readConsent();
  if (stored === "granted") {
    loadGA();
  } else if (stored === "denied") {
    /* respected, nothing loads */
  } else if (navigator.globalPrivacyControl === true) {
    // A GPC header is a legally recognised opt out. Honour it silently
    // rather than nagging someone who has already answered in general.
    applyConsent("denied");
  } else {
    showBanner();
  }

  function label(el) {
    // Card sized links wrap a whole block, so prefer an explicit data-cta,
    // then the card's own heading, before falling back to raw text.
    var t = el.getAttribute("data-cta");
    if (!t) {
      var h = el.querySelector("h1, h2, h3, h4");
      t = (h ? h.textContent : el.textContent) || "";
    }
    t = t.replace(/\s+/g, " ").trim();
    return t.slice(0, 60) || "(no label)";
  }

  // ── Link clicks, classified by destination ────────────────────────
  document.addEventListener("click", function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
    if (!a) return;

    var href = a.getAttribute("href") || "";
    var props = { page: page, label: label(a) };

    if (href.indexOf("https://wa.me/") === 0) {
      send("WhatsApp click", props);
    } else if (href.indexOf("/pricing#trial") === 0 || /#trial$/.test(href)) {
      send("Start trial click", props);
    } else if (href.indexOf("/book-demo") === 0) {
      send("Book demo click", props);
    } else if (href.indexOf("#contact") !== -1) {
      send("Contact click", props);
    } else if (/^https?:\/\//.test(href) && href.indexOf(location.host) === -1) {
      props.href = href.slice(0, 120);
      send("Outbound click", props);
    } else if (href.charAt(0) === "/") {
      props.to = href;
      send("Internal nav", props);
    }
  }, true);

  // ── Demo form submit ──────────────────────────────────────────────
  var demo = document.getElementById("demo-form");
  if (demo) {
    demo.addEventListener("submit", function () {
      send("Demo form submit", { page: page });
    });
  }

  // ── Scroll depth, one event per milestone per pageview ────────────
  (function () {
    var marks = [25, 50, 75, 100];
    var fired = {};
    var last = 0;

    function check() {
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      var pct = ((window.pageYOffset || doc.scrollTop) / scrollable) * 100;
      for (var i = 0; i < marks.length; i++) {
        var m = marks[i];
        if (pct >= m && !fired[m]) {
          fired[m] = true;
          send("Scroll depth", { page: page, depth: m + "%" });
        }
      }
    }

    // Time throttled rather than rAF based: rAF is paused in background or
    // hidden tabs, which would silently drop the milestone entirely.
    window.addEventListener("scroll", function () {
      var now = Date.now();
      if (now - last < 150) return;
      last = now;
      check();
    }, { passive: true });
  })();
})();
