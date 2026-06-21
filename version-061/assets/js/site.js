(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector(".mobile-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function initHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide-target")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function initCardFilter() {
    var filter = document.querySelector("[data-card-filter] input");
    var list = document.querySelector("[data-filter-list]");
    if (!filter || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    filter.addEventListener("input", function () {
      var term = filter.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-category")
        ].join(" ").toLowerCase();
        card.classList.toggle("is-hidden", term && text.indexOf(term) === -1);
      });
    });
  }

  function initSearch() {
    var form = document.querySelector("[data-search-form]");
    var results = document.querySelector("[data-search-results]");
    if (!form || !results || !window.catalogItems) {
      return;
    }

    function createCard(item) {
      var title = escapeHtml(item.title);
      var meta = escapeHtml([item.region, item.year, item.genre].filter(Boolean).join(" · "));
      var desc = escapeHtml(item.description || "");
      return [
        '<a class="movie-card" href="' + escapeHtml(item.url) + '">',
        '<span class="poster-frame">',
        '<img src="' + escapeHtml(item.image) + '" alt="' + title + '" loading="lazy">',
        '<span class="poster-chip">' + escapeHtml(item.type) + '</span>',
        '</span>',
        '<span class="movie-card-body compact">',
        '<strong>' + title + '</strong>',
        '<em>' + meta + '</em>',
        '<span>' + desc + '</span>',
        '</span>',
        '</a>'
      ].join("");
    }

    function runSearch() {
      var data = new FormData(form);
      var term = String(data.get("q") || "").trim().toLowerCase();
      var category = String(data.get("category") || "");
      var filtered = window.catalogItems.filter(function (item) {
        var text = [
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.category,
          item.tags,
          item.description
        ].join(" ").toLowerCase();
        var matchTerm = !term || text.indexOf(term) !== -1;
        var matchCategory = !category || item.category === category;
        return matchTerm && matchCategory;
      }).slice(0, 160);
      results.innerHTML = filtered.length ? filtered.map(createCard).join("") : '<div class="content-card"><h2>暂无匹配影片</h2><p>可以尝试更换片名、地区、年份或类型关键词。</p></div>';
    }

    var params = new URLSearchParams(window.location.search);
    if (params.get("q")) {
      form.elements.q.value = params.get("q");
    }
    if (params.get("category")) {
      form.elements.category.value = params.get("category");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      runSearch();
    });
    form.addEventListener("input", runSearch);
    form.addEventListener("change", runSearch);
    if (window.location.search) {
      runSearch();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initPlayer() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    cards.forEach(function (card) {
      var video = card.querySelector("video");
      var trigger = card.querySelector(".play-trigger");
      if (!video || !trigger) {
        return;
      }
      trigger.addEventListener("click", function () {
        var stream = trigger.getAttribute("data-stream");
        if (!stream) {
          return;
        }
        trigger.classList.add("hidden");
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = stream;
          video.play().catch(function () {});
        }
      });
    });
  }

  ready(function () {
    initMobileNav();
    initHero();
    initCardFilter();
    initSearch();
    initPlayer();
  });
})();
