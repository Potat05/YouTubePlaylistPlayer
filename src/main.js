

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


let params = new URLSearchParams(location.search);

const playlistItems = document.getElementById('playlistURL');

playlistItems.addEventListener('change', (event) => {
    let playlist = event.target.value;

    if(event.target.value.includes('list=')) {
        const search = new URLSearchParams(event.target.value);

        console.log(search);
        
        if(search.has('list')) {
            playlist = search.get('list');
        } else {
            playlist = event.target.value.split('list=')[1];
        }
    }

    window.history.replaceState('', '', `?playlist=${playlist}`);
    params = new URLSearchParams(location.search);
    event.target.value = playlist;
});

if(params.get('playlist')) {
    playlistItems.value = params.get('playlist');
}

document.getElementById('refreshWindow').addEventListener('click', () => {
    if(params.get('playlist') == player.getPlaylistId()) return;
    if(params.get('playlist') == null) return;
    window.location.reload();
});




var player;
function onYouTubeIframeAPIReady() {

    player = new YT.Player('player', {
        height: '100%',
        width: '100%',

        playerVars: {
            'autoplay': 1,
            'loop': 1,
            'rel': 0,

            listType: 'playlist',
            list: params.get('playlist') ?? 'PLsLHaXkqJIBhwQRcKmxzoUACptMMkKdGU',
        },

        events: {
            'onReady': (event) => {

                setTimeout(() => {
                    event.target.setShuffle(true);

                    event.target.playVideoAt(0);

                    started = true;
                }, 500);

                // TODO: Instead of updating the dom all the time use keyframes to animate the progress.
                playerProgress = document.getElementById('playerProgress');
                setInterval(() => {
                    playerProgress.style.width = `${event.target.getCurrentTime() / event.target.getDuration() * 50}%`;
                }, 1000);

            },
            'onStateChange': (event) => {

                switch(event.data) {
                    case YT.PlayerState.UNSTARTED: {

                        // Set width & height to video width & height
                        // Gatta use this api because embeds for some reason doesn't have that information.
                        // Thank you to this https://stackoverflow.com/questions/9514635/get-youtube-video-dimensions-width-height#answer-41730155
                        const http = new XMLHttpRequest();
                        http.open('GET', `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${event.target.getVideoData().video_id}`, true);
                        http.onreadystatechange = () => {
                            if(http.readyState == 4 && http.status == 200) {
                                const data = JSON.parse(http.responseText);
                                document.getElementById('playerHolder').style.aspectRatio = `${data.width}/${data.height}`;
                            }
                        }
                        http.send();


                        event.target.playVideo();

                        break; }
                }
                
            },
            'onError': (event) => {

                event.target.nextVideo();

            }
        }
    });
}