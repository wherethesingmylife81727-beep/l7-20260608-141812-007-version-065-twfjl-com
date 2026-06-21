(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMobileMenu() {
        var button = document.querySelector('.mobile-menu-button');
        var nav = document.querySelector('#mobileNav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var isOpen = nav.classList.toggle('is-open');
            button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    function initBackToTop() {
        var button = document.querySelector('.back-to-top');
        if (!button) {
            return;
        }
        window.addEventListener('scroll', function () {
            button.classList.toggle('is-visible', window.scrollY > 500);
        }, { passive: true });
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function initImageFallbacks() {
        selectAll('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('image-missing');
                image.setAttribute('aria-label', image.getAttribute('alt') || '影片封面');
            }, { once: true });
        });
    }

    function getCardText(card) {
        return normalize([
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.type,
            card.dataset.category,
            card.dataset.tags,
            card.textContent
        ].join(' '));
    }

    function sortCards(cards, mode) {
        if (mode === 'default') {
            return cards;
        }
        return cards.slice().sort(function (a, b) {
            if (mode === 'year-desc' || mode === 'year-asc') {
                var ay = parseInt(a.dataset.year, 10) || 0;
                var by = parseInt(b.dataset.year, 10) || 0;
                return mode === 'year-desc' ? by - ay : ay - by;
            }
            if (mode === 'title-asc') {
                return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
            }
            return 0;
        });
    }

    function initLocalFilters() {
        selectAll('[data-filter-panel]').forEach(function (panel) {
            var input = panel.querySelector('[data-local-filter]');
            var select = panel.querySelector('[data-sort-select]');
            var count = panel.querySelector('[data-filter-count]');
            var list = document.querySelector('[data-card-list]');
            if (!input || !list) {
                return;
            }
            var cards = selectAll('[data-movie-card]', list);

            function update() {
                var keyword = normalize(input.value);
                var visible = 0;
                sortCards(cards, select ? select.value : 'default').forEach(function (card) {
                    if (card.parentElement === list) {
                        list.appendChild(card);
                    }
                    var matched = !keyword || getCardText(card).indexOf(keyword) !== -1;
                    card.classList.toggle('is-hidden-by-filter', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = '当前显示 ' + visible + ' 条，共 ' + cards.length + ' 条';
                }
            }

            input.addEventListener('input', update);
            if (select) {
                select.addEventListener('change', update);
            }
            update();
        });
    }

    function uniqueValues(items, key) {
        var seen = Object.create(null);
        items.forEach(function (item) {
            var value = item[key];
            if (value) {
                seen[value] = true;
            }
        });
        return Object.keys(seen).sort(function (a, b) {
            return a.localeCompare(b, 'zh-Hans-CN');
        });
    }

    function buildSearchCard(item) {
        var article = document.createElement('article');
        article.className = 'movie-card';
        article.innerHTML = [
            '<a class="movie-poster" href="' + item.url + '" aria-label="观看' + escapeHtml(item.title) + '">',
            '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '    <span class="play-mark" aria-hidden="true">▶</span>',
            '    <span class="year-badge">' + escapeHtml(item.year) + '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '    <a class="movie-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>',
            '    <p class="movie-desc">' + escapeHtml(item.oneLine) + '</p>',
            '    <div class="movie-meta">',
            '        <a href="' + item.categoryUrl + '">' + escapeHtml(item.category) + '</a>',
            '        <span>' + escapeHtml(item.region) + '</span>',
            '        <span>' + escapeHtml(item.type) + '</span>',
            '    </div>',
            '    <div class="tag-row">' + item.tags.slice(0, 4).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
            '</div>'
        ].join('');
        return article;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initGlobalSearch() {
        var data = window.MOVIE_SEARCH_DATA;
        var input = document.querySelector('#globalSearchInput');
        var typeSelect = document.querySelector('#globalTypeSelect');
        var categorySelect = document.querySelector('#globalCategorySelect');
        var results = document.querySelector('#globalSearchResults');
        var count = document.querySelector('#globalSearchCount');
        if (!data || !input || !typeSelect || !categorySelect || !results) {
            return;
        }

        uniqueValues(data, 'type').forEach(function (type) {
            var option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            typeSelect.appendChild(option);
        });

        uniqueValues(data, 'category').forEach(function (category) {
            var option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        function update() {
            var keyword = normalize(input.value);
            var type = typeSelect.value;
            var category = categorySelect.value;
            var matched = data.filter(function (item) {
                var haystack = normalize([
                    item.title,
                    item.year,
                    item.region,
                    item.type,
                    item.category,
                    item.genre,
                    item.tags.join(' '),
                    item.oneLine
                ].join(' '));
                return (!keyword || haystack.indexOf(keyword) !== -1) &&
                    (!type || item.type === type) &&
                    (!category || item.category === category);
            }).slice(0, 80);

            results.innerHTML = '';
            matched.forEach(function (item) {
                results.appendChild(buildSearchCard(item));
            });
            initImageFallbacks();
            if (count) {
                count.textContent = '当前显示 ' + matched.length + ' 条搜索结果，最多展示前 80 条。';
            }
        }

        input.addEventListener('input', update);
        typeSelect.addEventListener('change', update);
        categorySelect.addEventListener('change', update);
        update();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initBackToTop();
        initImageFallbacks();
        initLocalFilters();
        initGlobalSearch();
    });
}());
