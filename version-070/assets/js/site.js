(function () {
  var mobileToggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('is-missing');
    }, { once: true });
  });

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function movieUrl(movie) {
    var path = window.location.pathname;
    var depth = path.indexOf('/movies/') !== -1 || path.indexOf('/category/') !== -1 ? '../' : '';
    return depth + movie.href;
  }

  function imageUrl(movie) {
    var path = window.location.pathname;
    var depth = path.indexOf('/movies/') !== -1 || path.indexOf('/category/') !== -1 ? '../' : '';
    return depth + movie.cover;
  }

  function renderSearch(input, panel) {
    var query = normalize(input.value);
    if (!query || !window.SITE_MOVIES) {
      panel.classList.remove('is-open');
      panel.innerHTML = '';
      return;
    }

    var results = window.SITE_MOVIES.filter(function (movie) {
      return normalize(movie.title + movie.year + movie.type + movie.region + movie.category + movie.tags).indexOf(query) !== -1;
    }).slice(0, 12);

    if (!results.length) {
      panel.classList.add('is-open');
      panel.innerHTML = '<div class="search-result-empty">没有找到匹配影片</div>';
      return;
    }

    panel.innerHTML = results.map(function (movie) {
      return '<a class="search-result-item" href="' + movieUrl(movie) + '">' +
        '<img src="' + imageUrl(movie) + '" alt="' + escapeHtml(movie.title) + '">' +
        '<span><strong>' + escapeHtml(movie.title) + '</strong><span>' + escapeHtml([movie.year, movie.type, movie.region].filter(Boolean).join(' / ')) + '</span></span>' +
        '</a>';
    }).join('');
    panel.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-missing');
      }, { once: true });
    });
    panel.classList.add('is-open');
  }

  document.querySelectorAll('[data-global-search]').forEach(function (input) {
    var scope = input.closest('.header-search') || input.closest('.mobile-search') || input.closest('.wide-search') || document;
    var panel = scope.querySelector('[data-search-results]');
    if (!panel) {
      return;
    }
    input.addEventListener('input', function () {
      renderSearch(input, panel);
    });
    input.addEventListener('focus', function () {
      renderSearch(input, panel);
    });
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.header-search') && !event.target.closest('.mobile-search') && !event.target.closest('.wide-search')) {
      document.querySelectorAll('[data-search-results]').forEach(function (panel) {
        panel.classList.remove('is-open');
      });
    }
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var list = document.querySelector('[data-card-list]');
    if (!list) {
      return;
    }

    var state = {
      type: 'all',
      year: 'all',
      keyword: ''
    };

    function applyFilters() {
      var cards = list.querySelectorAll('[data-movie-card]');
      cards.forEach(function (card) {
        var okType = state.type === 'all' || card.dataset.type === state.type;
        var okYear = state.year === 'all' || card.dataset.year === state.year;
        var haystack = normalize(card.dataset.title + card.dataset.year + card.dataset.type + card.dataset.region + card.dataset.tags);
        var okKeyword = !state.keyword || haystack.indexOf(state.keyword) !== -1;
        card.classList.toggle('is-hidden-by-filter', !(okType && okYear && okKeyword));
      });
    }

    panel.querySelectorAll('[data-filter-kind]').forEach(function (button) {
      button.addEventListener('click', function () {
        var kind = button.dataset.filterKind;
        state[kind] = button.dataset.filterValue;
        panel.querySelectorAll('[data-filter-kind="' + kind + '"]').forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilters();
      });
    });

    var localSearch = panel.querySelector('[data-local-search]');
    if (localSearch) {
      localSearch.addEventListener('input', function () {
        state.keyword = normalize(localSearch.value);
        applyFilters();
      });
    }
  });

  function startPlayer(wrapper) {
    var video = wrapper.querySelector('video');
    var cover = wrapper.querySelector('.player-cover');
    var stream = wrapper.getAttribute('data-stream');

    if (!video || !stream) {
      return;
    }

    if (!wrapper.dataset.ready) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        wrapper._hls = hls;
      } else {
        video.src = stream;
      }
      wrapper.dataset.ready = '1';
    }

    if (cover) {
      cover.classList.add('is-hidden');
    }

    var played = video.play();
    if (played && typeof played.catch === 'function') {
      played.catch(function () {});
    }
  }

  document.querySelectorAll('.movie-player').forEach(function (wrapper) {
    var button = wrapper.querySelector('.player-cover');
    var video = wrapper.querySelector('video');

    if (button) {
      button.addEventListener('click', function () {
        startPlayer(wrapper);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayer(wrapper);
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }
  });
})();
