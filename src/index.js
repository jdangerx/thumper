import React from 'react';
import ReactDOM from 'react-dom';


class Thumper extends React.Component {
  constructor(props) {
    super(props);
    this.audioCtx = new AudioContext();
    this.state = {
      isRecording: false,
      isPlaying: false,
      playbackPosition: 0,
      scale: 20,
      armedTrack: 0,
      clips: [],
      tracks: [[], [], [], []],
      chunks: [],
    };
  }

  async componentDidMount() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = e => this.state.chunks.push(e.data);
      recorder.onstop = () => this.stageClip();
      this.setState({stream, recorder});
    }
  }

  componentWillUnmount() {
    if (this.state.stream) {
      this.state.stream.getTracks().forEach(track => track.stop());
    }
  }

  async stageClip() {
    const audioBuf = await this.makeAudioBuffer(this.state.chunks);
    const {clips, tracks} = this.state;
    clips.push(audioBuf);
    const armedTrack = tracks[this.state.armedTrack];
    armedTrack.push({start: this.state.startedRecording, audioBuf});
    console.log(tracks);
    this.setState({clips, tracks, chunks: [], startedRecording: null});
  }

  startPlaybackTimer() {
    const lastPlayed = new Date();

    const updateTime = () => {
      const now = new Date();
      const playbackPosition = (now - this.state.lastPlayed) / 1000;
      this.setState({playbackPosition});
      if (this.state.isPlaying) {
        window.requestAnimationFrame(updateTime);
      }
    }
    const callbackId = window.requestAnimationFrame(updateTime);
    this.setState({lastPlayed, isPlaying: true});
  }

  play() {
    // start playing audio, also
    this.startPlaybackTimer();
  }

  stopPlaybackTimer() {
    this.setState({isPlaying: false, playbackPosition: 0});
  }

  stop() {
    // stop playing audio, also
    this.stopPlaybackTimer();
    if (this.state.isRecording) {
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
    this.setState({isRecording: false});
  }

  startRecording() {
    if (!this.state.isPlaying) {
      this.startPlaybackTimer();
    }
    this.state.recorder.start();
    this.setState({isRecording: true, startedRecording: this.state.playbackPosition});
  }

  record() {
    if (!this.state.stream) {
      console.log("no stream");
      return;
    }
    if (this.state.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  render() {
    return (
      <div>
        <Transport
          play = {() => this.play()}
          stop = {() => this.stop()}
          record = {() => this.record()}
        />
        <Timeline
          width = {800}
          time = {this.state.playbackPosition}
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

class Transport extends React.Component {
  render() {
    return <div>
      <button onClick = {this.props.play}>play</button>
      <button onClick = {this.props.stop}>stop</button>
      <button onClick = {this.props.record}>record</button>
    </div>
  }
}

class Timeline extends React.Component {
  render() {
    const currentSeconds = this.props.time;
    const indicatorStyle = {
      position: "absolute",
      left: currentSeconds * this.props.scale,
      borderLeft: "1px solid red",
      height: "600px",
      zIndex: 1000,
    }
    return <div style={{background: '#CCC'}} width={this.props.width}>
      <div style={indicatorStyle}></div>
    </div>
  }
}

class TrackList extends React.Component {
  render() {
    return <div>
      {this.props.tracks.map((track) => (
        <Track clips={track} scale={this.props.scale}/>
      ))}
    </div>;
  }
}

class Track extends React.Component {
  render() {
    return <div>
      {this.props.clips.map((clip) => (
        <PCMVis
          start = {clip.start}
          buffer = {clip.audioBuf}
          scale = {this.props.scale}
          height = { 150 }
        />
      ))}
    </div>
  }
}

class PCMVis extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    this.updateCanvas();
  }

  updateCanvas() {
    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext('2d');
    const data = this.props.buffer.getChannelData(0);
    const stepSize = Math.floor(this.props.buffer.length / canvas.width);
    const heightScale = canvas.height/2;
    ctx.fillStyle = "#CCC";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#333";
    console.log()
    for (let x = 0; x < canvas.width; x++) {
      const index = Math.min(x * stepSize, data.length-1);
      const amp = data[index];
      ctx.fillRect(x, heightScale * (1 - amp), 1, heightScale * amp * 2);
    }
  }

  render() {
    const style = {position: "absolute", left: this.props.start * this.props.scale};
    const width = this.props.buffer.duration * this.props.scale;
    return <canvas
      ref={this.canvasRef}
      width={width}
      height={this.props.height}
      style ={style}
    />
  }
}

ReactDOM.render(<Thumper />, document.getElementById('root'));
