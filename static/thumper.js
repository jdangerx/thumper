function init(stream) {
  let recordButton = document.querySelector('.record');
  let stopButton = document.querySelector('.stop');

  let recorder = new MediaRecorder(stream);
  let chunks = [];
  recordButton.onclick = () => {
    recorder.start();
    console.log(recorder.state);
    recordButton.style.background = "red";
  };

  recorder.ondataavailable = e => chunks.push(e.data);

  stopButton.onclick = () => {
    recorder.stop();
    console.log(recorder);
    recordButton.style.background = "";
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, {"type": "audio/ogg; codecs=opus"});
    chunks = [];
    const audioUrl = window.URL.createObjectURL(blob);
    const audio = new Audio();
    audio.src = audioUrl;
    audio.loop = true;
    audio.play();
  };

}

navigator.mediaDevices.getUserMedia({audio: true})
  .then((stream) => init(stream));

