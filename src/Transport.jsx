import React from 'react';

class Transport extends React.Component {
  render() {
    return <div>
      <button onClick = {this.props.play}>play</button>
      <button onClick = {this.props.stop}>stop</button>
      <button onClick = {this.props.record}>record</button>
    </div>
  }
}

export default Transport;
