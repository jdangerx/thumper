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
    return (<div>
      <VerticalLine color={"red"} pos={this.props.time} scale={this.props.scale} />
      {loopStartHandle}
      {loopEndHandle}
    </div>);
  }
}

class VerticalLine extends React.Component {
  render() {
    const style = {
      left: this.props.pos * this.props.scale
    }
    return <div
      className="absolute border-l border-red-500 min-h-full z-40"
      style={style}>
    </div>;
  }
}

class LoopStart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {dragging: false, offset: 0};
    this.ref = React.createRef();
    this.focus = this.props.focus.bind(this, "LOOP_START");
  }

  componentDidMount() {
    this.setState({offset: this.ref.current.clientWidth});
  }

  render() {
    const style = {
      left: this.props.pos * this.props.scale - this.state.offset,
    }
    return <div
      ref={this.ref}
      style={style}
      className="absolute border-r border-blue-500 min-h-full z-30 w-4 bg-opacity-10 bg-blue-500"
      onMouseDown={this.focus}>
    </div>;
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
      left: this.props.pos * this.props.scale
    }
    return <div
      ref={this.ref}
      style={style}
      className="absolute border-l border-blue-500 min-h-full z-40 w-4 bg-opacity-10 bg-blue-500"
      onMouseDown={this.focus}>
    </div>;
  }
}


export default Timeline;
