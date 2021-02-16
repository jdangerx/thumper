import React from 'react';

class Timeline extends React.Component {
  render() {
    const currentSeconds = this.props.time;
    let loopStartHandle, loopEndHandle;
    if (this.props.loopStart !== null) {
      loopStartHandle = <LoopStart
        time={this.props.loopStart}
        scale={this.props.scale}
        setPos={this.props.setLoopStart}
      />
    }

    if (this.props.loopEnd !== null) {
      loopEndHandle = <LoopEnd time={this.props.loopEnd} scale={this.props.scale} />
    }
    return (<div style={{background: '#CCC'}} width={this.props.width}>
      <VerticalLine color={"red"} time={this.props.time} scale={this.props.scale} />
      {loopStartHandle}
      {loopEndHandle}
    </div>);
  }
}

class VerticalLine extends React.Component {
  render() {
    const style = {
      position: "absolute",
      left: this.props.time * this.props.scale,
      borderLeft: `1px solid ${this.props.color}`,
      height: "600px",
      zIndex: 1000,
    }
    return <div style={style}></div>;
  }
}

class LoopStart extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const style = {
      position: "absolute",
      left: this.props.time * this.props.scale,
      borderLeft: "1px solid blue",
      background: "rgba(0, 0, 255, 0.1)",
      width: "10px",
      height: "600px",
      zIndex: 1000,
    }
    return <div style={style}></div>;
  }
}

class LoopEnd extends React.Component {
  render() {
    const style = {
      position: "absolute",
      left: this.props.time * this.props.scale - 10,
      borderRight: "1px solid blue",
      background: "rgba(0, 0, 255, 0.1)",
      width: "10px",
      height: "600px",
      zIndex: 1000,
    }
    return <div style={style}></div>;
  }
}

export default Timeline;
