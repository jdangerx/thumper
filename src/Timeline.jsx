import React from 'react';

class Timeline extends React.Component {
  render() {
    const currentSeconds = this.props.time;
    let loopStartHandle, loopEndHandle;
    if (this.props.loopStart !== null) {
      loopStartHandle = <LoopStart
        pos={this.props.loopStart}
        scale={this.props.scale}
        focus={this.props.focus}
      />
    }

    if (this.props.loopEnd !== null) {
      loopEndHandle = <LoopEnd
        pos={this.props.loopEnd}
        scale={this.props.scale}
        focus={this.props.focus}
      />
    }
    return (<div style={{background: '#CCC'}} width={this.props.width}>
      <VerticalLine color={"red"} pos={this.props.time} scale={this.props.scale} />
      {loopStartHandle}
      {loopEndHandle}
    </div>);
  }
}

class VerticalLine extends React.Component {
  render() {
    const style = {
      position: "absolute",
      left: this.props.pos * this.props.scale,
      borderLeft: `1px solid ${this.props.color}`,
      boxSizing: "border-box",
      height: "600px",
      zIndex: 1000,
    }
    return <div style={style}></div>;
  }
}

class LoopStart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {dragging: false};
    this.focus = this.props.focus.bind(this, "LOOP_START");
  }

  render() {
    const style = {
      position: "absolute",
      left: this.props.pos * this.props.scale - 10,
      borderRight: "1px solid blue",
      boxSizing: "border-box",
      background: "rgba(0, 0, 255, 0.1)",
      width: "10px",
      height: "600px",
      zIndex: 999,
    }
    return <div style={style} onMouseDown={this.focus}></div>;
  }
}

class LoopEnd extends React.Component {
  constructor(props) {
    super(props);
    this.state = {dragging: false};
    this.focus = this.props.focus.bind(this, "LOOP_END");
  }

  render() {
    const style = {
      position: "absolute",
      left: this.props.pos * this.props.scale,
      borderLeft: "1px solid blue",
      boxSizing: "border-box",
      background: "rgba(0, 0, 255, 0.1)",
      width: "10px",
      height: "600px",
      zIndex: 999,
    }
    return <div style={style} onMouseDown={this.focus}></div>;
  }
}


export default Timeline;
