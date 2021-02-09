import React from 'react';

class Transport extends React.Component {
  render() {
    return <div>
      <button
        onClick={this.props.playing ? this.props.pause : this.props.play}>
        {this.props.playing ? "⏸" : "▶"}
      </button>
      <button onClick={this.props.stop}>⏹</button>
      <button
        onClick={this.props.record}
        style={{color: this.props.recording ? "red" : "black"}}
      >⏺</button>
    </div>
  }
}

export default Transport;
