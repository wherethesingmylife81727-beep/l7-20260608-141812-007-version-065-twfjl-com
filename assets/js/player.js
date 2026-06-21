(function () {
    var video = document.querySelector('[data-movie-video]');
    var trigger = document.querySelector('[data-play-trigger]');
    var stream = window.__movieStream;
    var loaded = false;
    var hlsInstance = null;

    function loadStream() {
        if (!video || !stream || loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = stream;
    }

    function start() {
        if (!video) {
            return;
        }

        loadStream();

        if (trigger) {
            trigger.hidden = true;
        }

        video.controls = true;
        var playRequest = video.play();

        if (playRequest && typeof playRequest.catch === 'function') {
            playRequest.catch(function () {
                video.controls = true;
            });
        }
    }

    if (trigger) {
        trigger.addEventListener('click', start);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
