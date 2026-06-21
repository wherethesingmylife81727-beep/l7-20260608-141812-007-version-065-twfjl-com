(function () {
    function initSource(video, source) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return null;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return hls;
        }
        video.src = source;
        return null;
    }

    window.initMoviePlayer = function (config) {
        var video = document.getElementById(config.videoId);
        var button = document.getElementById(config.buttonId);
        var loaded = false;
        if (!video || !button || !config.source) {
            return;
        }
        function playNow() {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    window.setTimeout(function () {
                        var retry = video.play();
                        if (retry && typeof retry.catch === 'function') {
                            retry.catch(function () {
                                button.classList.remove('is-hidden');
                            });
                        }
                    }, 450);
                });
            }
        }
        function start() {
            if (!loaded) {
                initSource(video, config.source);
                loaded = true;
            }
            button.classList.add('is-hidden');
            playNow();
        }
        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                button.classList.remove('is-hidden');
            }
        });
    };
})();
