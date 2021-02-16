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
    return <div style={style} onClick={this.onclick}>
      {this.props.clips.map((clip, index) => (
        <PCMVis
          start={clip.start}
          audioBuf={clip.audioBuf}
          scale={this.props.scale}
          height={150}
          key={index}
        />
      ))}
    </div>
  }
}

export default Track;
