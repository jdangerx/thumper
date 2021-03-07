import React from 'react';

class Transport extends React.Component {
  constructor(props) {
    super(props);
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.stop = this.stop.bind(this);
    this.record = this.record.bind(this);
  }

  async play() {
    await this.props.initializeAudioCtx();
    this.props.play();
  }

  async pause() {
    await this.props.initializeAudioCtx();
    this.props.pause();
  }

  async stop() {
    await this.props.initializeAudioCtx();
    this.props.stop();
  }

  async record() {
    await this.props.initializeAudioCtx();
    this.props.record();
  }

  render() {
    return <div className="block text-xl text-gray-600 py-1" onClick={this.props.initializeAudioCtx}>
      <div className="flex flex-row">
        <span className="flex-1 text-yellow-800 font-black inline text-left">thumper</span>
        <div className="flex-1 text-center">
          <button
            className="w-8 hover:text-blue-400 text-center"
            onClick={this.props.playing ? this.pause : this.play}>
            {this.props.playing ? "⏸" : "▶"}
          </button>
          <button
            onClick={this.stop}
            className="w-8 hover:text-blue-400"
          >⏹</button>
          <button
            onClick={this.record}
            className={`w-8 hover:text-blue-400 ${this.props.recording ? "text-red-500" : "text-gray-600"}`}
          >⏺</button>
          <button
            onClick={this.props.export}
            className="w-8 hover:text-blue-400"
          >🡇</button>
        </div>

        <div className="flex-1 text-right">
          <button
            onClick={this.props.toggleHelp}
            className="w-8 hover:text-blue-400 flex-1"
          >?</button>
        </div>
      </div>
    </div>
  }
}

export default Transport;
