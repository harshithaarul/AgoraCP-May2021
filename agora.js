let handlefail = function(err) {
    console.log(err);
}

let appId = "1e45a301170e46239ad8c61e9a76b601";
let globalStream;
var isAudioMuted = false;
var isVideoMuted = false;

let client = AgoraRTC.createClient({
    mode: "live",
    codec: "h264"
})

// var localStream = AgoraRTC.createStream({
//     video: true,
//     audio: true
// })

client.init(appId, () => console.log("Client Connected."), handlefail)

function removeMyVideo() {
    globalStream.stop();
}

function removeVideoStream(evt) {
    console.log(" Event to remove: ", evt);
    let stream = evt.stream;
    stream.stop();
    let remDiv = document.getElementById(stream.getId());
    remDiv.parentNode.removeChild(remDiv);
}

function addVideoStream(streamId) {
    console.log("Stream to be added is: ", streamId);
    let remoteContainer = document.getElementById("remoteStream");
    let streamDiv = document.createElement("div");
    streamDiv.id = streamId;
    streamDiv.style.height = "250px";
    remoteContainer.appendChild(streamDiv);

}

function join(channelName) {
    // channelName = document.getElementById("channelName").value;
    let username = Math.random().toString(36);
    console.log(username, channelName);
    client.join(null, channelName, username, () => {
        var localStream = AgoraRTC.createStream({
            video: true,
            audio: true
        })
        localStream.init(function() {
            localStream.play("SelfStream");
            client.publish(localStream);
        })
        globalStream = localStream;
    })

    client.on("stream-added",
        function(evt) {
            console.log("Stream added.");
            client.subscribe(evt.stream, handlefail)
        })

    client.on("stream-subscribed",
        function(evt) {
            console.log("Stream subscribed.");
            let stream = evt.stream;
            addVideoStream(stream.getId());
            stream.play(stream.getId());
        });

    client.on("peer-leave",
        function(evt) {
            console.log("Peer has left stream");
            removeVideoStream(evt);
        });
}


// document.getElementById("leave").onclick = async function() {

//     var child;
//     while (child = document.getElementById("SelfStream").firstChild)
//         document.getElementById("SelfStream").removeChild(child)
//     await client.leave();
// }

async function leaveCall() {
    // Destroy the local audio and video tracks.
    rtc.localAudioTrack.close();
    rtc.localVideoTrack.close();

    // Traverse all remote users.
    rtc.client.remoteUsers.forEach(user => {
        // Destroy the dynamically created DIV container.
        const playerContainer = document.getElementById(user.uid);
        playerContainer && playerContainer.remove();
    });

    // Leave the channel.
    await rtc.client.leave();
}

document.getElementById("video-mute").onclick = function() {
    if (!isVideoMuted) {
        globalStream.muteVideo();
        isVideoMuted = true;
    } else {
        globalStream.unmuteVideo();
        isVideoMuted = false;
    }
}

// document.getElementById("leave").onclick = function() {
//     client.leave(function() {
//         console.log("User left!");
//     }, handlefail)
//     removeMyVideoStream();
// }

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const roomid = urlParams.get("roomid");
join(roomid);