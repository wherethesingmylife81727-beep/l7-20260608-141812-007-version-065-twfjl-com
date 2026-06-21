(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var slider = document.querySelector("[data-hero-slider]");
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var prev = slider.querySelector("[data-hero-prev]");
            var next = slider.querySelector("[data-hero-next]");
            var index = 0;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
            }

            if (prev) {
                prev.addEventListener("click", function () {
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
            }, 6800);
        }

        var searchInput = document.querySelector("[data-page-search]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

        if (searchInput && cards.length) {
            searchInput.addEventListener("input", function () {
                var keyword = searchInput.value.trim().toLowerCase();

                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-genre"),
                        card.textContent
                    ].join(" ").toLowerCase();

                    card.classList.toggle("is-filtered-out", keyword && text.indexOf(keyword) === -1);
                });
            });
        }
    });
})();
