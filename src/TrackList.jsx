import React from 'react';

import Track from './Track';

class TrackList extends React.Component {
  render() {
    return <div className="divide-y-2 border mb-4">
      {this.props.tracks.map((clipIds, index) => (
        <Track
          clips={this.props.clips}
          clipIds={clipIds}
          scale={this.props.scale}
          armed={index === this.props.armedTrack}
          armTrack={this.props.armTrack}
          num={index}
          key={index}
          focus={this.props.focus}
          deleteClip={this.props.deleteClip}
        />
      ))}
    </div>;
  }
}

export default TrackList;
