import React from 'react';
import ReactDOM from 'react-dom';


class Thumper extends React.Component {
  constructor(props) {
    super(props);
    this.audioCtx = new AudioContext();
    this.state = {
      isRecording: false,
      clips: [],
      chunks: [],
    };
  }

  async componentDidMount() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = e => this.state.chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBuf= await this.makeAudioBuffer(this.state.chunks);
        const clip = <Clip
          audioCtx={ this.audioCtx }
          audioBuf={ audioBuf }
        />;
        const clips = [...this.state.clips];
        clips.push(clip);
        this.setState({clips, chunks: []})
      }
      this.setState({stream, recorder});
    }
  }

  async makeAudioBuffer(chunks) {
    const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
    const arrayBuf = await blob.arrayBuffer();
    const audioBuf = await this.audioCtx.decodeAudioData(arrayBuf);
    return audioBuf;
  }

  componentWillUnmount() {
    if (this.state.stream) {
      this.state.stream.getTracks().forEach(track => track.stop());
    }
  }

  handleStop() {
    this.state.recorder.stop();
    this.setState({isRecording: false});
  }

  handleStart() {
    this.state.recorder.start();
    this.setState({isRecording: true});
  }

  toggleRecord() {
    if (!this.state.stream) {
      console.log("no stream");
      return;
    }
    if (this.state.isRecording) {
      this.handleStop();
    } else {
      this.handleStart();
    }
  }

  render() {
    return (
      <div>
        <Button
          isRecording={this.state.isRecording}
          onClick={() => this.toggleRecord()}
        />
        <ClipList clips={this.state.clips} />
      </div>
    );
  }
}

class Button extends React.Component {
  render() {
    return <button onClick={this.props.onClick}>
      {this.props.isRecording? "stop" : "record" }
    </button>;
  }
}

class ClipList extends React.Component {
  render() {
    return <ul>
      {this.props.clips.map((clip, i) => <li key={i}>{clip}</li>)}
    </ul>
  }
}

class Clip extends React.Component {
  play() {
    const {audioCtx, audioBuf} = this.props;
    const node = audioCtx.createBufferSource();
    node.buffer = audioBuf;
    node.connect(audioCtx.destination);
    node.loop = true;
    node.start();
    this.setState({node});
  }

  stop() {
    this.state.node.stop();
  }

  render() {
    return <div>
      <div>
        <PCMVis buffer={ this.props.audioBuf } width={ 800 } height={ 200 } />
      </div>
      <button onClick={ () => this.play() }>play</button>
      <button onClick={ () => this.stop() }>stop</button>
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
    const ctx = this.canvasRef.current.getContext('2d');
    const data = this.props.buffer.getChannelData(0);
    const stepSize = Math.floor(this.props.buffer.length / this.props.width);
    const heightScale = this.props.height/2;
    for (let x = 0; x < this.props.width; x++) {
      const index = Math.min(x * stepSize, data.length-1);
      const amp = data[index];
      ctx.fillRect(x, heightScale * (1 - amp), 1, heightScale * amp * 2);
    }
  }

  render() {
    return <canvas
      ref={ this.canvasRef }
      width={ this.props.width }
      height={ this.props.height }
    />
  }
}

ReactDOM.render(<Thumper />, document.getElementById('root'));
