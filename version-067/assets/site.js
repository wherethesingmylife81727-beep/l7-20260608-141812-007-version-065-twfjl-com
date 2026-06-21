(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function initMenu() {
        var header = document.querySelector(".site-header");
        var button = document.querySelector(".menu-toggle");
        if (!header || !button) {
            return;
        }
        button.addEventListener("click", function () {
            header.classList.toggle("is-open");
        });
    }

    function initHero() {
        var root = document.querySelector(".hero-carousel");
        if (!root) {
            return;
        }
        var slides = selectAll(".hero-slide", root);
        var dots = selectAll(".hero-dot", root);
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            slides[index].classList.remove("is-active");
            dots[index].classList.remove("is-active");
            index = (nextIndex + slides.length) % slides.length;
            slides[index].classList.add("is-active");
            dots[index].classList.add("is-active");
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                stop();
                show(dotIndex);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        start();
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function initFilters() {
        selectAll("[data-filter-panel]").forEach(function (panel) {
            var grid = panel.parentElement.querySelector("[data-filter-grid]");
            var input = panel.querySelector("[data-filter-input]");
            var year = panel.querySelector("[data-filter-year]");
            var region = panel.querySelector("[data-filter-region]");
            var empty = panel.parentElement.querySelector("[data-empty-state]");
            if (!grid || !input) {
                return;
            }
            var cards = selectAll(".movie-card, .wide-item", grid);
            var urlQuery = new URLSearchParams(window.location.search).get("q");
            if (urlQuery) {
                input.value = urlQuery;
            }
            function matches(card) {
                var q = normalize(input.value);
                var y = year ? normalize(year.value) : "";
                var r = region ? normalize(region.value) : "";
                var text = normalize(card.textContent + " " + Object.keys(card.dataset).map(function (key) {
                    return card.dataset[key];
                }).join(" "));
                var okQuery = !q || text.indexOf(q) !== -1;
                var okYear = !y || normalize(card.dataset.year).indexOf(y) !== -1 || text.indexOf(y) !== -1;
                var okRegion = !r || normalize(card.dataset.region).indexOf(r) !== -1 || text.indexOf(r) !== -1;
                return okQuery && okYear && okRegion;
            }
            function apply() {
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = matches(card);
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            input.addEventListener("input", apply);
            if (year) {
                year.addEventListener("change", apply);
            }
            if (region) {
                region.addEventListener("change", apply);
            }
            apply();
        });
    }

    window.createMoviePlayer = function (mediaUrl) {
        var video = document.querySelector(".movie-video");
        var layer = document.querySelector(".play-layer");
        if (!video || !layer || !mediaUrl) {
            return;
        }
        var loaded = false;
        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = mediaUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                    hls.loadSource(mediaUrl);
                });
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }
            video.src = mediaUrl;
        }
        function play(event) {
            if (event) {
                event.preventDefault();
            }
            attach();
            layer.classList.add("is-hidden");
            video.play().catch(function () {});
        }
        layer.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
