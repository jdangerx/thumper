import React from 'react';

import Track from './Track';

class TrackList extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick(event) {
    if (event.ctrlKey) {
      event.stopPropagation();
      console.log(event);
    }
  }

  render() {
    return <div className="divide-y-2 border-t border-l border-r mb-4" onClick={this.onClick}>
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
