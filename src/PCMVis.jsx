import React from 'react';

class PCMVis extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.dragFocus = this.dragFocus.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    this.updateCanvas();
  }

  onClick(e) {
    e.stopPropagation();
    if (e.ctrlKey && e.shiftKey) {
      this.props.deleteClip(this.props.clipId);
    }
  }

  dragFocus(e) {
    e.stopPropagation();
    this.props.focus(this.props.clipId);
  }

  updateCanvas() {
    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext('2d');
    const data = this.props.audioBuf.getChannelData(0);
    const stepSize = Math.floor(this.props.audioBuf.length / canvas.width);
    const heightScale = canvas.height/2;
    ctx.fillStyle = "rgba(209, 213, 219, 0.5)"; // gray-300
    ctx.fillRect(0, 0, canvas.width, canvas.height-1);
    ctx.fillStyle = "rgba(17, 24, 39, 0.8)"; // gray-900
    for (let x = 0; x < canvas.width; x++) {
      const index = Math.min(x * stepSize, data.length-1);
      const amp = data[index];
      ctx.fillRect(x, heightScale * (1 - amp), 1, heightScale * amp * 2);
    }
  }

  render() {
    const width = this.props.audioBuf.duration * this.props.scale;
    const style = {width, left: this.props.pos * this.props.scale};
    return <canvas
      ref={this.canvasRef}
      className="absolute h-32"
      style ={style}
      onMouseDown={this.dragFocus}
      onClick={this.onClick}
    />
  }
}

export default PCMVis;
