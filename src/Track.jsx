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
    const style = {
      height: "150px",
      background: this.props.armed ? "#FED" : "#EEE",
      borderTop: "1px solid #888",
      borderBottom: "1px solid #888"
    }
    const {clips, scale} = this.props;
    return <div style={style} onClick={this.onclick}>
      {this.props.clipIds.map((clipId, index) => (
        <PCMVis
          pos={clips[clipId].pos}
          audioBuf={clips[clipId].audioBuf}
          scale={scale}
          height={150}
          key={index}
          focus={this.props.focus}
          deleteClip={this.props.deleteClip}
          clipId={clipId}
        />
      ))}
    </div>
  }
}

export default Track;
