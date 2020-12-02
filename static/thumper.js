function init(stream) {
  let recordButton = document.querySelector('.record');
  let stopButton = document.querySelector('.stop');

  let recorder = new MediaRecorder(stream);
  recordButton.onclick = () => {
    recorder.start();
    console.log(recorder.state);
    recordButton.style.background = "red";
  };

  stopButton.onclick = () => {
    recorder.stop();
    console.log(recorder.state);
    recordButton.style.background = "";
  };
}

navigator.mediaDevices.getUserMedia({audio: true})
  .then((stream) => init(stream));

