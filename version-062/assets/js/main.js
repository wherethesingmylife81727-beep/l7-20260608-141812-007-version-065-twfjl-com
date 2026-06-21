(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMenu() {
        var button = qs('[data-menu-toggle]');
        var menu = qs('[data-mobile-nav]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        if (slides.length < 2) {
            return;
        }
        var active = 0;
        var timer = null;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initCatalogFilter() {
        var panel = qs('[data-catalog-filter]');
        var grid = qs('[data-catalog-grid]');
        if (!panel || !grid) {
            return;
        }
        var input = qs('[data-filter-input]', panel);
        var sort = qs('[data-filter-sort]', panel);
        var cards = qsa('.movie-card', grid);
        function applyFilter() {
            var keyword = normalize(input ? input.value : '');
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                card.style.display = !keyword || haystack.indexOf(keyword) !== -1 ? '' : 'none';
            });
        }
        function applySort() {
            if (!sort) {
                return;
            }
            var value = sort.value;
            var sorted = cards.slice().sort(function (a, b) {
                if (value === 'year-desc') {
                    return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
                }
                if (value === 'year-asc') {
                    return Number(a.getAttribute('data-year') || 0) - Number(b.getAttribute('data-year') || 0);
                }
                if (value === 'title') {
                    return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-CN');
                }
                return Number(a.getAttribute('data-order') || 0) - Number(b.getAttribute('data-order') || 0);
            });
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }
        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (sort) {
            sort.addEventListener('change', function () {
                applySort();
                applyFilter();
            });
        }
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span class="tag-pill">' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card">',
            '<a class="poster-link" href="' + escapeHtml(movie.url) + '">',
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">',
            '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
            '</a>',
            '<div class="card-body">',
            '<a href="' + escapeHtml(movie.url) + '"><h2 class="card-title">' + escapeHtml(movie.title) + '</h2></a>',
            '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
            '<p class="card-line">' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="card-tags">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function initSearchPage() {
        var page = qs('[data-search-page]');
        if (!page || !window.movieIndex) {
            return;
        }
        var input = qs('[data-search-input]', page);
        var results = qs('[data-search-results]', page);
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (input) {
            input.value = initial;
        }
        function render() {
            var keyword = normalize(input ? input.value : '');
            var movies = window.movieIndex.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(' '),
                    movie.oneLine
                ].join(' '));
                return !keyword || haystack.indexOf(keyword) !== -1;
            }).slice(0, 120);
            if (!movies.length) {
                results.innerHTML = '<div class="search-results-empty">没有找到相关影片</div>';
                return;
            }
            results.innerHTML = movies.map(movieCard).join('');
        }
        if (input) {
            input.addEventListener('input', render);
        }
        render();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initCatalogFilter();
        initSearchPage();
    });
})();
