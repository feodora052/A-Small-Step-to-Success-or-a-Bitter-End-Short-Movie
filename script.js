
const videoPlayer = document.getElementById('video-player');
const hotspotOverlay = document.getElementById('hotspot-overlay');
const playPauseBtn = document.getElementById('play-pause');
const timelineSlider = document.getElementById('timeline-slider');
const timestampDisplay = document.getElementById('timestamp-display');

const videoList = ["videos/Start Scene.mp4","videos/Scene 1.mp4","videos/Scene 2.mp4","videos/Scene 3.mp4","videos/Scene 4.mp4","videos/Scene 5.1.mp4","videos/Scene 5.2.mp4","videos/Continue Scene 5.1.mp4","videos/Continue Scene 5.2.mp4","videos/Scene 5.mp4"];
const hotspotsByVideo = {"videos/Start Scene.mp4":[{"x":1379.310291068698,"y":190.57471869653088,"width":450.57469508244117,"height":110.34482567477974,"text":"Interact 1","externalLink":"","videoLink":"videos/Scene 1.mp4","time":11.713917,"startTime":7,"endTime":11}],"videos/Scene 1.mp4":[{"x":1219.9233241007596,"y":457.2413807439152,"width":496.5517047847311,"height":101.14942353521474,"text":"Interact 2","externalLink":"","videoLink":"videos/Scene 2.mp4","time":6.56497,"startTime":6,"endTime":7}],"videos/Scene 2.mp4":[{"x":1363.9846211679346,"y":641.1494235352147,"width":508.812240705342,"height":119.54022781434469,"text":"Interact 2","externalLink":"","videoLink":"","time":8.383958,"startTime":6,"endTime":7}],"videos/Scene 3.mp4":[{"x":1373.1800231083926,"y":871.0344770243391,"width":490.4214368244259,"height":147.12643423303962,"text":"Interact 4","externalLink":"","videoLink":"videos/Scene 4.mp4","time":19.409821,"startTime":19,"endTime":21}],"videos/Scene 4.mp4":[{"x":1400.7662289297666,"y":877.1647451173824,"width":438.3141591618305,"height":140.99616613999638,"text":"Interact 5","externalLink":"","videoLink":"videos/Scene 5.mp4","time":8.570555,"startTime":8,"endTime":10}],"videos/Scene 5.1.mp4":[{"x":692.7202795145016,"y":300.9195443713106,"width":962.452069767936,"height":579.3103347925935,"text":"","externalLink":"","videoLink":"videos/Continue Scene 5.1.mp4","time":14.805292,"startTime":12,"endTime":14}],"videos/Scene 5.2.mp4":[{"x":1290.4214056442706,"y":800.536393954341,"width":487.3563028442734,"height":119.54022781434469,"text":"Next","externalLink":"","videoLink":"videos/Continue Scene 5.2.mp4","time":14.093,"startTime":14,"endTime":16}],"videos/Continue Scene 5.1.mp4":[],"videos/Continue Scene 5.2.mp4":[],"videos/Scene 5.mp4":[{"x":147.12643104732777,"y":460.30651479043684,"width":539.4635805068685,"height":147.12643423303962,"text":"Good End","externalLink":"","videoLink":"videos/Scene 5.1.mp4","time":4.522584,"startTime":4,"endTime":5},{"x":1222.988458080912,"y":460.30651479043684,"width":487.3563028442734,"height":153.25670232608297,"text":"Bad End","externalLink":"","videoLink":"videos/Scene 5.2.mp4","time":5.9333,"startTime":5,"endTime":5}]};
const videoOptions = {"videos/Start Scene.mp4":{"playNext":"","loop":false,"autoplay":false},"videos/Scene 1.mp4":{"playNext":null,"loop":false,"autoplay":false},"videos/Scene 2.mp4":{"playNext":null,"loop":false,"autoplay":false},"videos/Scene 3.mp4":{"playNext":null,"loop":false,"autoplay":false},"videos/Scene 4.mp4":{"playNext":null,"loop":false,"autoplay":false},"videos/Scene 5.mp4":{"playNext":null,"loop":true,"autoplay":false},"videos/Scene 5.1.mp4":{"playNext":null,"loop":false,"autoplay":false}};

let currentVideoPath = null;
let originalVideoWidth = 0;
let originalVideoHeight = 0;

function initializePlayer() {
    currentVideoPath = videoList[0];
    loadVideo(currentVideoPath);
    updateControls();
    window.addEventListener('resize', handleResize);
}

function loadVideo(filePath) {
    currentVideoPath = filePath;
    videoPlayer.src = filePath;
    videoPlayer.style.display = 'block';

    videoPlayer.onloadedmetadata = function() {
        originalVideoWidth = videoPlayer.videoWidth;
        originalVideoHeight = videoPlayer.videoHeight;
        renderHotspots();
    };

    const options = videoOptions[filePath] || {};
    videoPlayer.loop = options.loop || false;

    updateTimestamp();
    videoPlayer.currentTime = 0;
    timelineSlider.value = 0;

    videoPlayer.play();
}

function renderHotspots() {
    hotspotOverlay.innerHTML = '';
    if (currentVideoPath && hotspotsByVideo[currentVideoPath]) {
        const videoRect = videoPlayer.getBoundingClientRect();
        const scaleX = videoRect.width / originalVideoWidth;
        const scaleY = videoRect.height / originalVideoHeight;

        hotspotsByVideo[currentVideoPath].forEach((hotspot, index) => {
            const hotspotElement = document.createElement('div');
            hotspotElement.className = 'hotspot';
            hotspotElement.style.left = `${hotspot.x * scaleX}px`;
            hotspotElement.style.top = `${hotspot.y * scaleY}px`;
            hotspotElement.style.width = `${hotspot.width * scaleX}px`;
            hotspotElement.style.height = `${hotspot.height * scaleY}px`;
            hotspotElement.dataset.index = index;
            hotspotElement.addEventListener('click', handleHotspotClick);
            
            hotspotOverlay.appendChild(hotspotElement);
        });
    }
    updateHotspotVisibility();
}

function handleHotspotClick(event) {
    event.stopPropagation();
    const index = parseInt(event.target.dataset.index);
    const hotspot = hotspotsByVideo[currentVideoPath][index];
    
    if (hotspot.videoLink) {
        loadVideo(hotspot.videoLink);
    } else if (hotspot.externalLink) {
        window.open(hotspot.externalLink, '_blank');
    } else {
        alert(hotspot.text);
    }
}

function updateControls() {
    playPauseBtn.addEventListener('click', togglePlayPause);
    videoPlayer.addEventListener('timeupdate', updateTimelineSlider);
    videoPlayer.addEventListener('loadedmetadata', updateTimestamp);
    timelineSlider.addEventListener('input', seekVideo);
    videoPlayer.addEventListener('ended', handleVideoEnd);
}

function togglePlayPause() {
    if (videoPlayer.paused) {
        videoPlayer.play();
    } else {
        videoPlayer.pause();
    }
}

function updateTimelineSlider() {
    const percentage = (videoPlayer.currentTime / videoPlayer.duration) * 100;
    timelineSlider.value = percentage;
    updateTimestamp();
    updateHotspotVisibility();
}

function seekVideo() {
    const time = (timelineSlider.value / 100) * videoPlayer.duration;
    videoPlayer.currentTime = time;
    updateTimestamp();
    updateHotspotVisibility();
}

function updateTimestamp() {
    const currentTime = formatTime(videoPlayer.currentTime);
    const duration = formatTime(videoPlayer.duration);
    timestampDisplay.textContent = `${currentTime} / ${duration}`;
}

function handleVideoEnd() {
    const options = videoOptions[currentVideoPath] || {};
    if (options.loop) {
        videoPlayer.currentTime = 0;
        videoPlayer.play();
    } else if (options.playNext) {
        loadVideo(options.playNext);
    }
}

function formatTime(timeInSeconds) {
    if (!timeInSeconds || isNaN(timeInSeconds)) {
        return "00:00";
    }
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function handleResize() {
    if (videoPlayer.videoWidth > 0) {
        renderHotspots();
    }
}

function updateHotspotVisibility() {
    const currentTime = videoPlayer.currentTime;
    if (currentVideoPath && hotspotsByVideo[currentVideoPath]) {
        hotspotsByVideo[currentVideoPath].forEach((hotspot, index) => {
            const hotspotElement = hotspotOverlay.querySelector(`[data-index="${index}"]`);
            if (hotspotElement) {
                const isVisible = currentTime >= hotspot.startTime && currentTime <= hotspot.endTime;
                hotspotElement.style.display = isVisible ? 'block' : 'none';
            }
        });
    }
}

videoPlayer.addEventListener('timeupdate', updateHotspotVisibility);

initializePlayer();
    