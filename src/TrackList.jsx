import React from 'react';

import Track from './Track';

class TrackList extends React.Component {
  render() {
    return <div>
      {this.props.tracks.map((track, index) => (
        <Track clips={track} scale={this.props.scale} key={index}/>
      ))}
    </div>;
  }
}

export default TrackList;
