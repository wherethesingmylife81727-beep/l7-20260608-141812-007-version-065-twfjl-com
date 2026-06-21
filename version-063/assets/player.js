(function () {
    function setStatus(video, message) {
        var shell = video.closest('.player-shell');
        var status = shell ? shell.querySelector('[data-player-status]') : null;
        if (status) {
            status.textContent = message;
        }
    }

    function prepareVideo(video) {
        var source = video.dataset.src;
        if (!source) {
            setStatus(video, '未找到播放源');
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            setStatus(video, '播放源已就绪，可直接播放');
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                setStatus(video, '高清播放源已加载完成');
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus(video, '播放源加载失败，请稍后重试');
                    hls.destroy();
                }
            });
            video._hlsInstance = hls;
            return;
        }

        setStatus(video, '当前浏览器不支持 HLS 播放');
    }

    function initPlayers() {
        var videos = Array.prototype.slice.call(document.querySelectorAll('.js-hls-player'));
        videos.forEach(function (video) {
            prepareVideo(video);
            var shell = video.closest('.player-shell');
            var button = shell ? shell.querySelector('.player-play-button') : null;
            if (button) {
                button.addEventListener('click', function () {
                    var promise = video.play();
                    if (promise && typeof promise.catch === 'function') {
                        promise.catch(function () {
                            setStatus(video, '浏览器阻止自动播放，请使用播放器控制栏播放');
                        });
                    }
                });
            }
            video.addEventListener('play', function () {
                if (shell) {
                    shell.classList.add('is-playing');
                }
                setStatus(video, '正在播放');
            });
            video.addEventListener('pause', function () {
                setStatus(video, '已暂停');
            });
        });
    }

    document.addEventListener('DOMContentLoaded', initPlayers);
}());
