(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var forms = document.querySelectorAll('[data-search-form]');

    forms.forEach(function (form) {
        var input = form.querySelector('[data-search-input]');
        var year = form.querySelector('[data-year-filter]');
        var scope = form.closest('main') || document;
        var items = Array.prototype.slice.call(scope.querySelectorAll('[data-search-item]'));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : '');
            var yearValue = normalize(year ? year.value : '');

            items.forEach(function (item) {
                var haystack = normalize([
                    item.dataset.title,
                    item.dataset.year,
                    item.dataset.region,
                    item.dataset.type,
                    item.dataset.tags
                ].join(' '));
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchYear = !yearValue || normalize(item.dataset.year) === yearValue;

                item.classList.toggle('is-hidden', !(matchKeyword && matchYear));
            });
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter();
        });

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (year) {
            year.addEventListener('change', applyFilter);
        }
    });
})();
