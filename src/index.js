import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { makeName, b64encode } from './utils';

import Timeline from './Timeline';
import TrackList from './TrackList';
import Transport from './Transport';

class Thumper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      audioCtx: null,
      recording: false,
      playing: false,
      helpVisible: false,
      loopStart: 1,
      loopEnd: 10,
      playbackPosition: 0,
      pausedPosition: 0,
      dragFocus: null,
      scale: 50,
      armedTrack: 0,
      clips: {}, // {some-id: {node: AudioBufSourceNode, audioBuf: AudioBuf, pos: ms}}
      tracks: [[], [], [], []],
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
    this.initializeAudioCtx = this.initializeAudioCtx.bind(this);
    this.toggleHelp = this.toggleHelp.bind(this);
    this.setPlaybackPos = this.setPlaybackPos.bind(this);
    this.export = this.export.bind(this);
    this.read = this.read.bind(this);
  }

  async export() {
    const b64encoded = await Promise.all(Object.entries(this.state.clips)
      .map(async ([clipId, clip]) => {
        const rawArray = clip.audioBuf.getChannelData(0).buffer;
        const oggArray = await clip.ogg.arrayBuffer();
        clip.oggB64 = b64encode(oggArray);
        console.log(clip.oggB64.length);
        return [clipId, clip];
      }));

    const savefile = {clips: Object.fromEntries(b64encoded), tracks: this.state.tracks};
    const out = JSON.stringify(savefile);
    await this.read(out);
    return out;
  }

  async read(savefile) {
    const state = JSON.parse(savefile);
    const clips = Object.entries(state.clips);
    const decoded = clips.map(
      ([clipId, clip]) => {
        console.log(clip);
        // get b64
        // pack it into arraybuffer
        // turn it into a blob with .ogg codec
        // make an audiobuffer
      }
    );
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

  // Chrome doesn't let you initialize audioContext until after a user gesture
  async initializeAudioCtx() {
    if (!this.state.audioCtx) {
      const audioCtx = new AudioContext();
      const compressor = audioCtx.createDynamicsCompressor();
      compressor.ratio.setValueAtTime(5, audioCtx.currentTime);
      compressor.connect(audioCtx.destination);
      const aggregator = audioCtx.createGain();
      aggregator.gain.setValueAtTime(0.25, audioCtx.currentTime);
      aggregator.connect(compressor);
      await this.setState({audioCtx, aggregator});
      window.requestAnimationFrame(this.tick);
    }
  }

  async stageClip() {
    const {ogg, audioBuf} = await this.makeAudioBuf(this.state.chunks);
    const {clips, tracks} = this.state;
    let {loopStart, loopEnd} = this.state;
    const clipName = makeName(3);
    if (loopStart === null || loopEnd === null) {
      loopStart = this.state.startedRecording;
      loopEnd = loopStart + audioBuf.duration;
    }
    const clip = {audioBuf, ogg, pos: this.state.startedRecording};
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
    const {dragFocus, clips} = this.state;
    if (dragFocus) {
      if (clips[dragFocus]) {
        clips[dragFocus].started = false;
      }
      this.setState({dragFocus: null, clips});
    }
  }

  dragMove(event) {
    event.stopPropagation();
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
    if (this.state.audioCtx === null) {
      return;
    }
    const now = this.state.audioCtx.currentTime;
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
    const playedAt = this.state.audioCtx.currentTime;
    this.playAudio();
    this.setState({playedAt, playing: true});
  }

  async setPlaybackPos(pos) {
    await this.setState({playbackPosition: pos});
    this.pause();
    this.play();

  }

  playAudio() {
    const clips = this.state.clips;

    Object.entries(clips).forEach(([id, clip]) => {
      clips[id] = this.playClip(clip);
    });
    this.setState(clips);
  }

  playClip(clip) {
    const {audioCtx, aggregator, playbackPosition} = this.state;
    const node = audioCtx.createBufferSource();
    node.buffer = clip.audioBuf;
    node.connect(aggregator);
    clip.node = node;
    const delay = clip.pos - playbackPosition;
    if (delay >= 0) {
      node.start(audioCtx.currentTime + delay);
      clip.started = true;
    } else if (-delay <= clip.audioBuf.duration) {
      node.start(audioCtx.currentTime, -delay);
      clip.started = true;
    }
    return clip;
  }

  pause() {
    this.stopAudio();
    if (this.state.recording) {
      this.stopRecording();
    }
    this.setState({playing: false, pausedPosition: this.state.playbackPosition});
  }

  stopAudio() {
    const clips = this.state.clips;
    Object.entries(clips).forEach(([id, clip]) => {
      if (clip.node && clip.started) {
        try {
          clip.node.stop();
        } catch(e) {
          if (e instanceof DOMException && e.name === "InvalidStateError") {
            // this is fine
            console.log(e);
          } else {
            throw e;
          }
        }
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

  toggleHelp() {
    this.setState({helpVisible: !this.state.helpVisible});
  }

  async makeAudioBuf(chunks) {
    const blob = new Blob(chunks, {'type' : 'audio/ogg; codecs=opus'});
    const oggBuf = await blob.arrayBuffer();
    const audioBuf = await this.state.audioCtx.decodeAudioData(oggBuf);
    return {ogg: blob, audioBuf};
  }

  stopRecording() {
    this.state.recorder.stop();
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
      <div>
        <div
          className={`${this.state.helpVisible? "" : "hidden"} z-50 bg-gray-600 w-full h-full fixed flex bg-opacity-50 transition-opacity`}
          onClick={this.toggleHelp}
        >
          <div className="text-base p-8 bg-white max-w-md flex-col m-auto">
            To arm a track for recording, click on an unoccupied space in that track.<br/>
            Drag the blue handles to change the loop boundaries.<br/>
            Drag the clips to move them around within their track.<br/>
            Ctrl+shift-click a clip to delete it.<br/>
            Each tick mark represents one second.<br/>
          </div>
        </div>

        <div className="container m-auto" onMouseUp={this.clearDrag} onMouseMove={this.dragMove}>
          <div>
            <Transport
              playing={this.state.playing}
              recording={this.state.recording}
              play={this.play}
              pause={this.pause}
              stop={this.stop}
              record={this.record}
              initializeAudioCtx={this.initializeAudioCtx}
              toggleHelp={this.toggleHelp}
              export={this.export}
            />
          </div>
          <div className="relative">
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
              setPlaybackPos={this.setPlaybackPos}
            />
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Thumper />, document.getElementById('root'));
