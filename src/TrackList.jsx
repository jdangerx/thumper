import React from 'react';

import Track from './Track';

class TrackList extends React.Component {
  render() {
    return <div>
      {this.props.tracks.map((track) => (
        <Track clips={track} scale={this.props.scale}/>
      ))}
    </div>;
  }
}

export default TrackList;
