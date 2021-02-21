import React from 'react';

import PCMVis from './PCMVis';

class Track extends React.Component {
  constructor(props) {
    super(props);
    this.onclick = this.onclick.bind(this);
  }

  onclick() {
    this.props.armTrack(this.props.num);
  }

  render() {
    const yellow_50 = "#FFFBEB";
    const gray_50 = "#F9FAFB";
    const yellow_400 = "#FCD34D";
    const gray_400 = "#D1D5DB";
    const light = this.props.armed ? yellow_50 : gray_50;
    const dark = this.props.armed ? yellow_400 : gray_400;
    const {clips, scale} = this.props;
    const style = {
      background: `repeating-linear-gradient(to right, ${dark}, ${dark} 1px, ${light} 1px, ${light} ${scale}px)`
    }
    return <div
      className="h-32 bg-opacity-5" 
      style={style}
      onClick={this.onclick}
    >
      {this.props.clipIds.map((clipId) => (
        <PCMVis
          pos={clips[clipId].pos}
          audioBuf={clips[clipId].audioBuf}
          scale={scale}
          height={150}
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
