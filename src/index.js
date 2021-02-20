import React from 'react';
import ReactDOM from 'react-dom';

import { makeName } from './utils';

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
      loopStart: null,
      draggingFocus: null,
      loopEnd: null,
      playbackPosition: 0,
      pausedPosition: 0,
      scale: 50,
      armedTrack: 0,
      clips: {}, // {some-id: {node: AudioBufSourceNode, audioBuf: AudioBuf, pos: ms}}
      tracks: [[], [], [], []], // TODO: make a track just a list of clip IDs
      chunks: [],
    };

    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.stop = this.stop.bind(this);
    this.record = this.record.bind(this);
    this.tick = this.tick.bind(this);
    this.armTrack = this.armTrack.bind(this);
    this.setLoopStart = this.setLoopStart.bind(this);
    this.setLoopEnd = this.setLoopEnd.bind(this);
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
    const audioBuf = await this.makeAudioBuf(this.state.chunks);
    const {clips, tracks} = this.state;
    let {loopStart, loopEnd} = this.state;
    const clipName = makeName(3);
    if (loopStart === null || loopEnd === null) {
      loopStart = this.state.startedRecording;
      loopEnd = loopStart + audioBuf.duration;
    }
    const clip = {audioBuf, pos: this.state.startedRecording};
    clips[clipName] = clip
    const armedTrack = tracks[this.state.armedTrack];
    armedTrack.push(clip);
    this.setState({clips, tracks, loopStart, loopEnd, chunks: [], startedRecording: null, armedTrack: null});
  }

  dragFocus(element) {
    // if element is not loopStart, loopEnd, or a clip ID, don't focus it!
  }

  dragMove() {
    // figure out how much the drag has moved.
    // then change state based on if it's a clip or the loop start/end indicators.
    // i forget about how JS does aliasing - might need to change `tracks` to a list of clip ids.
  }

  armTrack(armedTrack) {
    this.setState({armedTrack});
  }

  setLoopStart(loopStart) {
    this.setState({loopStart});
  }

  setLoopEnd(loopEnd) {
    this.setState({loopEnd});
  }

  async tick() {
    const now = this.audioCtx.currentTime;
    const {playedAt, pausedPosition, loopStart, loopEnd, playing} = this.state;
    if (playing) {
      const playbackPosition = (now - playedAt) + pausedPosition;
      if (loopEnd !== null && loopStart !== null && playbackPosition > loopEnd) {
        await this.setState({playbackPosition: loopStart, pausedPosition: loopStart});
        this.stopAudio();
        this.play();
      } else {
        this.setState({playbackPosition});
      }
    }
    window.requestAnimationFrame(this.tick);
  }

  play() {
    const playedAt = this.audioCtx.currentTime;
    this.playAudio();
    this.setState({playedAt, playing: true});
  }

  playAudio() {
    const clips = this.state.clips;

    // TODO: just make a bunch of nodes ready to play, then return those
    // later do a quick loop through to set the different timeouts
    Object.entries(clips).forEach(([id, clip]) => {
      const node = this.audioCtx.createBufferSource();
      node.buffer = clip.audioBuf;
      node.connect(this.audioCtx.destination);
      clips[id].node = node;
      const delay = clip.pos - this.state.playbackPosition;
      if (delay >= 0) {
        node.start(this.audioCtx.currentTime + delay);
        clips[id].started = true;
      } else if (-delay <= clip.audioBuf.duration) {
        node.start(this.audioCtx.currentTime, -delay);
        clips[id].started = true;
      }
    });
    this.setState(clips);
  }

  pause() {
    this.stopAudio();
    this.setState({playing: false, pausedPosition: this.state.playbackPosition});
  }

  stopAudio() {
    const clips = this.state.clips;
    Object.entries(clips).forEach(([id, clip]) => {
      if (clip.node && clip.started) {
        clip.node.stop();
        clip.started = false;
      }
    });
    this.setState(clips);
  }

  stopPlaybackTimer() {
    this.setState({playing: false, playbackPosition: 0, pausedPosition: 0});
  }

  stop() {
    this.stopAudio();
    this.stopPlaybackTimer();
    if (this.state.recording) {
      this.stopRecording();
    }
  }

  async makeAudioBuf(chunks) {
    const blob = new Blob(chunks, {'type' : 'audio/ogg; codecs=opus'});
    const arrayBuf = await blob.arrayBuffer();
    return await this.audioCtx.decodeAudioData(arrayBuf);
  }

  stopRecording() {
    this.state.recorder.stop();
    this.pause()
    this.setState({recording: false});
  }

  startRecording() {
    if (this.state.armedTrack === null) {
      return;
    }
    if (this.state.playing) {
      this.pause();
    }
    this.play();
    this.state.recorder.start();
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
      <div style={{position: "relative"}}>
        <div>
          loop start: <input onChange={(e) => this.setLoopStart(parseFloat(e.target.value))} />
        </div>
        <div>
          loop end: <input onChange={(e) => this.setLoopEnd(parseFloat(e.target.value))} />
        </div>
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
          loopStart={this.state.loopStart}
          loopEnd={this.state.loopEnd}
          setLoopStart={this.setLoopStart}
          setLoopEnd={this.setLoopEnd}
        />
        <TrackList
          tracks={this.state.tracks}
          scale={this.state.scale}
          armTrack={this.armTrack}
          armedTrack={this.state.armedTrack}
        />
      </div>
    );
  }
}

ReactDOM.render(<Thumper />, document.getElementById('root'));
