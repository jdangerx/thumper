import React from 'react';

class Transport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {helpVisible: false}
    this.toggleHelp = this.toggleHelp.bind(this);
  }

  toggleHelp() {
    this.setState({helpVisible: !this.state.helpVisible});
  }

  render() {
    const help = (<div>
      To arm a track for recording, click on an unoccupied space in that track.<br/>
      Drag the blue handles to change the loop boundaries.<br/>
      Drag the clips to move them around within their track.<br/>
      Ctrl+shift-click a clip to delete it.<br/>
      Each tick mark represents one second.<br/>
    </div>);

    return <div onClick={this.props.initializeAudioCtx}>
      <button
        onClick={this.props.playing ? this.props.pause : this.props.play}>
        {this.props.playing ? "⏸" : "▶"}
      </button>
      <button onClick={this.props.stop}>⏹</button>
      <button
        onClick={this.props.record}
        style={{color: this.props.recording ? "red" : "black"}}
      >⏺</button>
      <button onClick={this.toggleHelp}>?</button>
      {this.state.helpVisible ? help : null}
    </div>
  }
}

export default Transport;
