let handlefail = function(err) {
    console.log(err);
}

let appId = "1e45a301170e46239ad8c61e9a76b601";
let globalStream;
let username;
let otherUser;
let globalStreamScreen;
var isAudioMuted = false;
var isVideoMuted = false;
var isScreenMuted = false;

let client = AgoraRTC.createClient({
    mode: "live",
    codec: "h264"
})

let clientScreen = AgoraRTC.createClient({
    mode: "live",
    codec: "h264"
})

// var localStream = AgoraRTC.createStream({
//     video: true,
//     audio: true
// })

client.init(appId, () => console.log("Client Connected."), handlefail)
clientScreen.init(appId, () => console.log("Client Connected."), handlefail)


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

function addScreenStream(streamId) {
    console.log("Stream to be added is: ", streamId);
    let remoteContainer = document.getElementById("remoteScreen");
    let streamDiv = document.createElement("div");
    streamDiv.id = streamId;
    streamDiv.style.height = "250px";
    remoteContainer.appendChild(streamDiv);
}

function join(channelName, name) {
    // channelName = document.getElementById("channelName").value;
    // username = Math.random().toString(36);
    username = name;
    console.log(username, channelName);
    client.join(appId, channelName, username, () => {
        console.log("HERE");
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
    console.log("starting screen")
    clientScreen.join(appId, channelName, (username + "_screen"), () => {
        console.log("starting screen")
        var localStream = AgoraRTC.createStream({
            video: false,
            audio: false,
            screen: true
        })
        localStream.init(function() {
            localStream.play("SelfScreen");
            clientScreen.publish(localStream);
        })
        globalStreamScreen = localStream;
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
            if (!stream.getId().includes(username)) {

                if (stream.getId().includes("_screen")) {
                    document.getElementById("abss").innerHTML = otherUser + "'s screen";
                    addScreenStream(stream.getId())
                } else {
                    otherUser = stream.getId();
                    document.getElementById("abvid").innerHTML = otherUser + "'s video";
                    addVideoStream(stream.getId());
                }
                stream.play(stream.getId());
            }
        });

    client.on("peer-leave",
        function(evt) {
            console.log("Peer has left stream");
            removeVideoStream(evt);
        });

    clientScreen.on("peer-leave",
        function(evt) {
            console.log("Peer has left stream");
            removeVideoStream(evt);
        });
}


document.getElementById("leaveButton").onclick = async function() {

    var child;
    while (child = document.getElementById("SelfStream").firstChild)
        document.getElementById("SelfStream").removeChild(child)
    while (child = document.getElementById("SelfScreen").firstChild)
        document.getElementById("SelfScreen").removeChild(child)
    await client.leave();
    await clientScreen.leave();
}

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

document.getElementById("audio-mute").onclick = function() {
    if (!isAudioMuted) {
        globalStream.muteAudio();
        isAudioMuted = true;
    } else {
        globalStream.unmuteAudio();
        isAudioMuted = false;
    }
}

document.getElementById("screenshare-mute").onclick = function() {
    if (!isScreenMuted) {
        globalStreamScreen.muteVideo();
        isScreenMuted = true;
    } else {
        globalStreamScreen.unmuteVideo();
        isScreenMuted = false;
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
const name = urlParams.get("name");
join(roomid, name);