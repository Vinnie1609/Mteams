const socket =io('/');
const messageContainer = document.getElementById('main__chat_window')
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');     //creating video element
myVideo.muted = true;
const peers ={}
const username = prompt("Enter your name")
appendMessage('You Joined')
socket.emit('new-user', username)
socket.on('user-connected', username => {
  appendMessage(`${username} joined`)
})
socket.on('user-disconnected', username => {
  appendMessage(`${username} got Disconnected`)
})
//creating newPeer
var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3030'
  });

let myVideoStream;
navigator.mediaDevices.getUserMedia({          //accessing video and audio
    video: true,
    audio: true
  }).then(stream => {
    myVideoStream = stream;                    //receiving stream
    addVideoStream(myVideo, stream);           //calling the function to get video
    peer.on('call', call => {
        call.answer(stream)                            //answering the call
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        })
      })

    socket.on('user-connected', (userId) => {     //listen from the server that user has connected
         console.log("user connected.......");
         setTimeout(function ()
         {
             connectToNewUser(userId,stream);
         },5000)
      })
    

      let text = $("input");
      // when press enter send message
      $('html').keydown(function (e) {
        if (e.which == 13 && text.val().length !== 0) {
          socket.emit('message', text.val());
          text.val('')
        }
      });
    // Receiving message from server
      socket.on("createMessage", (message) => {
        $("ul").append(`<li class="message"><b><font color="orangered"><br/>${message.username}</font></b>&nbsp&nbsp&nbsp<em> ${new Date().toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        })}</em><br/>&nbsp&nbsp<b>${message.message}</b></li>`);
        scrollToBottom()
    })
  })

  socket.on('user-disconnected',(userId)=>{
    if(peers[userId]) peers[userId].close()
})
  peer.on('open',id => {
    socket.emit('join-room', ROOM_ID, id);           // when opened,joins room with roomId
})  
 
  //sending myvideo to user
 const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream)         //calling the user
    const video = document.createElement('video')  //creating video element for him
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)       //sending user our stream
    })
    call.on('close', () =>{
      video.remove()
    })
    peers[userId] = call
  }

  //function to addvideo
 const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {  //adding and playing video to the event listeners
      video.play(); 
    })
    videoGrid.append(video);        //sending video to the videoGrid
  }


document.getElementById("Add-Participants").addEventListener("click", getURL);
function getURL() {
  const c_url = window.location.href;
  copyToClipboard(c_url);
  alert("Url Copied to Clipboard\nDoubleClick OK\nShare it with your Friends!\nUrl: " + c_url );
}

//copying to clipboard
function copyToClipboard(text) {
  var dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.value = text;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
}

const scrollToBottom = () => {
    var d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
  }

  //Mute audio
const Unmutemute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      UnmuteButton();
    } else {
      MuteButton();
      myVideoStream.getAudioTracks()[0].enabled = true;
    }
  }

const MuteButton = () => {
    const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
  }
  
const UnmuteButton = () => {
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
  }
  
// Mute video
const pauseplay = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      PlayVideo()
    } else {
      StopVideo()
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
  }

const StopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
  }
  
const PlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
  }

  //toggling the chat container when clicked
const ShowChat = (e) => {
    e.classList.toggle("active");
    document.body.classList.toggle("showChat");
  }

  //adding messages to container
function appendMessage(message) {
   const messageElement = document.createElement('div')
   messageElement.innerText = message
   messageContainer.append(messageElement)
  }

 