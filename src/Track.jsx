import React from 'react';

import PCMVis from './PCMVis';

class Track extends React.Component {
  constructor(props) {
    super(props);
    this.onclick = this.onclick.bind(this);
  }

  onclick(event) {
    if (!(event.ctrlKey || event.shiftKey)) {
      this.props.armTrack(this.props.num);
    }
  }

  render() {
    const yellow_light = "rgba(180, 83, 9, 0.05)"; // yellow-700
    const yellow_dark = "rgba(180, 83, 9, 0.3)";
    const gray_light = "rgba(249, 250, 251, 0.8)";
    const gray_dark = "rgba(55, 65, 81, 0.2)";
    const light = this.props.armed ? yellow_light : gray_light;
    const dark = this.props.armed ? yellow_dark : gray_dark;
    const {clips, scale} = this.props;
    const style = {
      background: `repeating-linear-gradient(to right, ${dark}, ${dark} 1px, ${light} 1px, ${light} ${scale}px)`
    }
    return <div
      className="h-32 bg-opacity-5 relative border-b"
      style={style}
      onClick={this.onclick}
    >
      {this.props.clipIds.map((clipId) => (
        <PCMVis
          pos={clips[clipId].pos}
          audioBuf={clips[clipId].audioBuf}
          scale={scale}
          key={clipId}
          focus={this.props.focus}
          deleteClip={this.props.deleteClip}
          clipId={clipId}
        />
      ))}
    </div>
  }
}

export default Track;
