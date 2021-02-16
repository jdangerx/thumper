import React from 'react';

import Track from './Track';

class TrackList extends React.Component {
  render() {
    return <div>
      {this.props.tracks.map((track, index) => (
        <Track
          clips={track}
          scale={this.props.scale}
          armed={index === this.props.armedTrack}
          armTrack={this.props.armTrack}
          num={index}
          key={index}
        />
      ))}
    </div>;
  }
}

export default TrackList;
