const { ArrayNavigator } = require('./navigator')

module.exports = {
    player: null,
    isPlaying: false,
    currentTrack: null,
    queue: new ArrayNavigator(),
    index: null,
    nextTrack: null,
    connection: null,
}