const { ArrayNavigator } = require("./arrayNavigator");

class State {
  constructor() {
    this.player = null;
    this.isPlaying = false;
    this.currentTrack = null;
    this.queue = new ArrayNavigator();
    this.nextTrack = null;
    this.connection = null;
    this.lastMessage = null;
  }
}

const playerState = new State();

module.exports = { playerState };
