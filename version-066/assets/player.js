(function () {
    function setupPlayer(shell) {
        var video = shell.querySelector(".movie-player");
        var button = shell.querySelector(".player-start");
        var source = video ? video.getAttribute("data-m3u8") : "";
        var attached = false;
        var hlsInstance = null;

        if (!video || !button || !source) {
            return;
        }

        function attachSource() {
            if (attached) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                attached = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                attached = true;
                return;
            }

            video.src = source;
            attached = true;
        }

        function startPlayback() {
            attachSource();
            button.classList.add("is-hidden");
            var playRequest = video.play();
            if (playRequest && typeof playRequest.catch === "function") {
                playRequest.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", startPlayback);

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });

        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                button.classList.remove("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    if (document.readyState !== "loading") {
        Array.prototype.forEach.call(document.querySelectorAll(".player-shell"), setupPlayer);
    } else {
        document.addEventListener("DOMContentLoaded", function () {
            Array.prototype.forEach.call(document.querySelectorAll(".player-shell"), setupPlayer);
        });
    }
})();
