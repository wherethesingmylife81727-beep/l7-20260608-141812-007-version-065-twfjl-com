(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var searchInput = document.querySelector("[data-search-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var emptyState = document.querySelector("[data-empty-state]");
        var activeFilter = "all";

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilters() {
            if (!cards.length) {
                return;
            }
            var keyword = normalize(searchInput ? searchInput.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var type = normalize(card.getAttribute("data-type"));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesFilter = activeFilter === "all" || type.indexOf(normalize(activeFilter)) !== -1 || haystack.indexOf(normalize(activeFilter)) !== -1;
                var shouldShow = matchesKeyword && matchesFilter;
                card.classList.toggle("is-hidden", !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        if (searchInput) {
            searchInput.addEventListener("input", applyFilters);
        }

        document.querySelectorAll("[data-filter-value]").forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.getAttribute("data-filter-value") || "all";
                document.querySelectorAll("[data-filter-value]").forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                applyFilters();
            });
        });
    });
}());
