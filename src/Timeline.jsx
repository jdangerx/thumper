import React from 'react';

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

export default Timeline;
