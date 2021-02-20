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
    const light = this.props.armed ? "#FED" : "#EEE";
    const dark = this.props.armed ? "#DCB" : "#CCC";
    const {clips, scale} = this.props;
    const style = {
      height: "150px",
      background: `repeating-linear-gradient(to right, ${light}, ${light} ${scale-1}px, ${dark} ${scale-1}px, ${dark} ${scale}px)`,
      boxSizing: "border-box",
      borderTop: "1px solid #888",
      borderBottom: "1px solid #888"
    }
    return <div style={style} onClick={this.onclick}>
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
