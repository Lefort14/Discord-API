const { ArrayNavigator } = require('./navigator')

class State {
    constructor() {
        this.player = null
        this.isPlaying = false
        this.currentTrack = null
        this.queue = new ArrayNavigator()
        this.nextTrack = null
        this.connection = null
        this.lastMessage = null
    }
}

module.exports = { State }