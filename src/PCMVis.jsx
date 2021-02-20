import React from 'react';

class PCMVis extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    this.updateCanvas();
  }

  updateCanvas() {
    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext('2d');
    const data = this.props.audioBuf.getChannelData(0);
    const stepSize = Math.floor(this.props.audioBuf.length / canvas.width);
    const heightScale = canvas.height/2;
    ctx.fillStyle = "#CCC";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#333";
    for (let x = 0; x < canvas.width; x++) {
      const index = Math.min(x * stepSize, data.length-1);
      const amp = data[index];
      ctx.fillRect(x, heightScale * (1 - amp), 1, heightScale * amp * 2);
    }
  }

  render() {
    const style = {position: "absolute", left: this.props.pos * this.props.scale};
    const width = this.props.audioBuf.duration * this.props.scale;
    return <canvas
      ref={this.canvasRef}
      width={width}
      height={this.props.height}
      style ={style}
    />
  }
}

export default PCMVis;
