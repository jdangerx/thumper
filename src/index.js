import React from 'react';
import ReactDOM from 'react-dom';


class Thumper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isRecording: false,
      clips: [],
      chunks: []
    };
  }

  async componentDidMount() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = e => this.state.chunks.push(e.data);
      recorder.onstop = () => {
        const clip = <Clip audio={this.makeAudio(this.state.chunks)} />;
        const clips = [...this.state.clips];
        clips.push(clip);
        this.setState({clips, chunks: []})
      }
      this.setState({stream, recorder});
    }
  }

  makeAudio(chunks) {
    const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
    const audioURL = window.URL.createObjectURL(blob);
    const audio = new Audio();
    audio.src = audioURL;
    audio.loop = true;
    return audio;
  }

  componentWillUnmount() {
    if (this.state.stream) {
      this.state.stream.getTracks().forEach(track => track.stop());
    }
  }

  handleStop() {
    console.log("stopping recording");
    this.state.recorder.stop();
    this.setState({isRecording: false});
  }

  handleStart() {
    console.log("starting recording");
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
  render() {
    console.log(this.props.audio);
    return <div>
      <button onClick={() => this.props.audio.play()}>play</button>
      <button onClick={() => this.props.audio.load()}>stop</button>
    </div>
  }
}

ReactDOM.render(<Thumper />, document.getElementById('root'));
