import React from 'react';

import PCMVis from './PCMVis';

class Track extends React.Component {
  render() {
    return <div>
      {this.props.clips.map((clip) => (
        <PCMVis
          start = {clip.start}
          buffer = {clip.audioBuf}
          scale = {this.props.scale}
          height = { 150 }
        />
      ))}
    </div>
  }
}

export default Track;
