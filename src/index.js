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
      dragFocus: null,
      loopEnd: null,
      playbackPosition: 0,
      pausedPosition: 0,
      scale: 200,
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
    this.dragFocus = this.dragFocus.bind(this);
    this.clearDrag = this.clearDrag.bind(this);
    this.dragMove = this.dragMove.bind(this);
    this.deleteClip = this.deleteClip.bind(this);
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
    armedTrack.push(clipName);
    this.setState({clips, tracks, loopStart, loopEnd, chunks: [], startedRecording: null, armedTrack: null});
  }

  deleteClip(clipId) {
    const {clips, tracks} = this.state;
    const filteredTracks = tracks.map(
      track => track.filter(id => id !== clipId)
    );
    delete clips[clipId];
    this.setState({clips, tracks: filteredTracks});
  }

  dragFocus(element) {
    if (element !== "LOOP_START" && element !== "LOOP_END" && !this.state.clips[element]) {
      return;
    }
    this.setState({dragFocus: element});
  }

  clearDrag() {
    if (this.state.dragFocus) {
      this.setState({dragFocus: null});
    }
  }

  dragMove(event) {
    const {loopStart, loopEnd, scale} = this.state;
    const timeDelta = event.movementX / scale;
    switch (this.state.dragFocus) {
      case null:
        break;
      case "LOOP_START":
        const newLoopStart = Math.min(loopStart + timeDelta, loopEnd);
        this.setState({loopStart: newLoopStart});
        break;
      case "LOOP_END":
        const newLoopEnd = Math.max(loopEnd + timeDelta, loopStart);
        this.setState({loopEnd: newLoopEnd});
        break;
      default:
        const {clips, dragFocus} = this.state;
        const clip = clips[dragFocus];
        clip.pos += timeDelta;
        this.setState({clips});
    }
  }

  armTrack(armedTrack) {
    if (this.state.armedTrack === armedTrack) {
      armedTrack = null;
    }
    this.setState({armedTrack});
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
      <div style={{position: "relative"}} onMouseUp={this.clearDrag} onMouseMove={this.dragMove}>
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
          focus={this.dragFocus}
        />
        <TrackList
          clips={this.state.clips}
          tracks={this.state.tracks}
          scale={this.state.scale}
          armTrack={this.armTrack}
          armedTrack={this.state.armedTrack}
          focus={this.dragFocus}
          deleteClip={this.deleteClip}
        />
      </div>
    );
  }
}

ReactDOM.render(<Thumper />, document.getElementById('root'));
