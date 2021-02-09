import React from 'react';
import ReactDOM from 'react-dom';

import Timeline from './Timeline';
import TrackList from './TrackList';
import Transport from './Transport';

class Thumper extends React.Component {
  constructor(props) {
    super(props);
    this.audioCtx = new AudioContext();
    this.state = {
      recording: false,
      playing: false,
      playbackPosition: 0,
      pausedPosition: 0,
      scale: 0.02,
      armedTrack: 0,
      clips: [],
      tracks: [[], [], [], []],
      chunks: [],
    };

    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.stop = this.stop.bind(this);
    this.record = this.record.bind(this);
    this.tick = this.tick.bind(this);
  }

  async componentDidMount() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = e => this.state.chunks.push(e.data);
      recorder.onstop = () => this.stageClip();
      this.setState({stream, recorder});
    }
    window.requestAnimationFrame(this.tick);
  }

  componentWillUnmount() {
    if (this.state.stream) {
      this.state.stream.getTracks().forEach(track => track.stop());
    }
  }

  async stageClip() {
    const audioBuf = await this.makeAudioBuffer(this.state.chunks);
    const {clips, tracks} = this.state;
    console.log(audioBuf);
    clips.push(audioBuf);
    const armedTrack = tracks[this.state.armedTrack];
    armedTrack.push({start: this.state.startedRecording, audioBuf});
    console.log(tracks);
    this.setState({clips, tracks, chunks: [], startedRecording: null});
  }

  tick() {
    const now = new Date();
    if (this.state.playing) {
      const playbackPosition = (now - this.state.playedAt) + this.state.pausedPosition;
      this.setState({playbackPosition});
    }
    window.requestAnimationFrame(this.tick);
  }

  play() {
    // start playing audio, also
    const playedAt = new Date();
    this.setState({playedAt, playing: true});
  }

  pause() {
    this.setState({playing: false, pausedPosition: this.state.playbackPosition});
  }

  stopPlaybackTimer() {
    this.setState({playing: false, playbackPosition: 0, pausedPosition: 0});
  }

  stop() {
    // stop playing audio, also
    this.stopPlaybackTimer();
    if (this.state.recording) {
      this.stopRecording();
    }
  }

  async makeAudioBuffer(chunks) {
    const blob = new Blob(chunks, {'type' : 'audio/ogg; codecs=opus'});
    const arrayBuf = await blob.arrayBuffer();
    const audioBuf = await this.audioCtx.decodeAudioData(arrayBuf);
    return audioBuf;
  }

  stopRecording() {
    this.state.recorder.stop();
    this.pause()
    this.setState({recording: false});
  }

  startRecording() {
    this.state.recorder.start();
    if (this.state.playing) {
      this.pause();
    }
    this.play();
    this.setState({recording: true, startedRecording: this.state.playbackPosition});
  }

  record() {
    if (!this.state.stream) {
      console.log("no stream");
      return;
    }
    if (this.state.recording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  render() {
    return (
      <div>
        <div>Playback pos: {this.state.playbackPosition}</div>
        <div>Playing: {this.state.playing + ""}</div>
        <div>Recording: {this.state.recording + ""}</div>
        <Transport
          playing={this.state.playing}
          recording={this.state.recording}
          play={this.play}
          pause={this.pause}
          stop={this.stop}
          record={this.record}
        />
        <Timeline
          width={800}
          time={this.state.playbackPosition}
          scale={this.state.scale}
        />
        <TrackList tracks={this.state.tracks} scale={this.state.scale}/>
      </div>
    );
  }
}

class Clip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      node: null,
    };
  }

  play() {
    const {audioCtx, audioBuf} = this.props;
    if (this.state.node !== null) {
      this.state.node.stop();
      this.setState({node: null});
    }
    const node = audioCtx.createBufferSource();
    node.buffer = audioBuf;
    node.connect(audioCtx.destination);
    node.loop = true;
    node.start();
    this.setState({node});
  }

  stop() {
    this.state.node.stop();
    window.cancelAnimationFrame(this.state.callbackId);
  }

  render() {
    return <div>
      clip
    </div>
  }
}

ReactDOM.render(<Thumper />, document.getElementById('root'));
