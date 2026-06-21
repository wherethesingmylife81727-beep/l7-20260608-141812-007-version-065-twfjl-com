(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var hidden = menu.hasAttribute("hidden");
            if (hidden) {
                menu.removeAttribute("hidden");
                button.setAttribute("aria-expanded", "true");
            } else {
                menu.setAttribute("hidden", "");
                button.setAttribute("aria-expanded", "false");
            }
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        if (slides.length < 2) {
            return;
        }
        var previous = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var index = slides.findIndex(function (slide) {
            return slide.classList.contains("is-active");
        });
        if (index < 0) {
            index = 0;
            slides[0].classList.add("is-active");
        }
        function show(nextIndex) {
            slides[index].classList.remove("is-active");
            index = (nextIndex + slides.length) % slides.length;
            slides[index].classList.add("is-active");
        }
        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
            });
        }
        window.setInterval(function () {
            show(index + 1);
        }, 6000);
    }

    function setupImages() {
        Array.prototype.forEach.call(document.querySelectorAll("img.cover-img"), function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
            }, { once: true });
        });
    }

    function setupPlayer() {
        var video = document.querySelector("video[data-stream]");
        if (!video) {
            return;
        }
        var overlay = document.querySelector(".play-overlay");
        var stream = video.getAttribute("data-stream");
        var hlsInstance = null;

        function attachStream() {
            if (!stream || video.getAttribute("data-ready") === "1") {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else {
                video.src = stream;
            }
            video.setAttribute("data-ready", "1");
        }

        function startPlayback() {
            attachStream();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        attachStream();
        if (overlay) {
            overlay.addEventListener("click", startPlayback);
        }
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("ended", function () {
            if (overlay) {
                overlay.classList.remove("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    function setupSearchPage() {
        var results = document.querySelector("[data-search-results]");
        var input = document.querySelector("[data-search-input]");
        if (!results || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        if (input) {
            input.value = query;
        }
        if (!query) {
            results.innerHTML = '<div class="empty-state">输入片名、地区或类型即可搜索。</div>';
            return;
        }
        var lowerQuery = query.toLowerCase();
        var matches = window.SEARCH_INDEX.filter(function (item) {
            return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(" ").toLowerCase().indexOf(lowerQuery) !== -1;
        }).slice(0, 120);
        if (!matches.length) {
            results.innerHTML = '<div class="empty-state">未找到相关影片。</div>';
            return;
        }
        results.innerHTML = matches.map(function (item) {
            return '<article class="movie-card">' +
                '<a href="' + escapeHtml(item.href) + '" class="movie-card-media">' +
                '<img class="cover-img" src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                '<span class="play-mark">▶</span>' +
                '<span class="corner-label">' + escapeHtml(item.region) + '</span>' +
                '</a>' +
                '<div class="movie-card-content">' +
                '<h3><a href="' + escapeHtml(item.href) + '">' + escapeHtml(item.title) + '</a></h3>' +
                '<p>' + escapeHtml(item.oneLine) + '</p>' +
                '<div class="movie-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
                '</div>' +
                '</article>';
        }).join("");
        setupImages();
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupImages();
        setupPlayer();
        setupSearchPage();
    });
}());
