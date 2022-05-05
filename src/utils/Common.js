let VideoState = {
  TIMED_OUT: 0,
  DISCONNECTED: 1,
  CONNECTING: 2,
  CONNECTED: 3,
}

let WebRTCMessages = {
  STREAM_QUERY: 'stream?',
  LOWBAND_QUERY: 'lowband?',
  NO_QUERY: '',
  MAINSTREAM_COMMAND: 'mainstream',
  SUBSTREAM_COMMAND: 'substream',
}

const createGuid = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

class BitRateInfo {
  constructor(
    bitRate = Infinity,
    lastBitRate = Infinity,
    lastBytes = 0,
    decodeRate = Infinity,
    lastDecodeRate = Infinity,
    lastDecoded = 0,
    lastTimestamp = 0,
    consecutiveZeroCount = 0,
    consecutiveDecodeAbnormalCount = 0
  ) {
    this.bitRate = bitRate
    this.lastBitRate = lastBitRate
    this.lastBytes = lastBytes
    this.decodeRate = decodeRate
    this.lastDecodeRate = lastDecodeRate
    this.lastDecoded = lastDecoded
    this.lastTimestamp = lastTimestamp
    this.consecutiveZeroCount = consecutiveZeroCount
    this.consecutiveDecodeAbnormalCount = consecutiveDecodeAbnormalCount
    this.DEBUG = process.env.NODE_ENV !== 'production'
  }

  // part of report validation is done by the caller
  update(report) {
    if (!report) {
      return
    }
    try {
      this.bitRate = Math.floor(
        ((report.bytesReceived - this.lastBytes) /
          (report.timestamp - this.lastTimestamp)) *
          8
      )

      if (
        this.lastTimestamp <= 0 ||
        report.bytesReceived < this.lastBytes ||
        report.timestamp < this.lastTimestamp
      ) {
        this.bitRate = Infinity
      }

      if (this.bitRate > 0) {
        this.consecutiveZeroCount = 0
      }

      if (this.lastBitRate == 0 && this.bitRate == 0) {
        this.consecutiveZeroCount++
      }

      this.decodeRate = Math.floor(
        ((report.framesDecoded - this.lastDecoded) * 1000) /
          (report.timestamp - this.lastTimestamp)
      )
      if (
        this.lastTimestamp <= 0 ||
        report.framesDecoded < this.lastDecoded ||
        report.timestamp < this.lastTimestamp
      ) {
        this.decodeRate = Infinity
      }
      if (this.decodeRate >= 5) {
        this.consecutiveDecodeAbnormalCount = 0
      } else {
        if (this.lastDecodeRate < 5) {
          this.consecutiveDecodeAbnormalCount++
        }
      }

      this.lastBytes = report.bytesReceived
      this.lastTimestamp = report.timestamp
      this.lastBitRate = this.bitRate
      this.lastDecoded = report.framesDecoded
      this.lastDecodeRate = this.decodeRate
    } catch (err) {
      this.reset()
      if (this.DEBUG) {
        console.log(err)
      }
    }
  }

  reset() {
    this.bitRate = Infinity
    this.lastBitRate = Infinity
    this.lastBytes = 0
    this.decodeRate = Infinity
    this.lastDecodeRate = Infinity
    this.lastDecoded = 0
    this.lastTimestamp = 0
    this.consecutiveZeroCount = 0
    this.consecutiveDecodeAbnormalCount = 0
  }
}

class PlayerUI {
  constructor(player) {
    this.player = player
  }

  RemoveTracks() {
    this.player.removeTracks()
  }

  SetVideoStream(stream) {
    this.player.setSrcObject(stream)
  }

  TriggerError() {
    try {
      this.player.trigger('error')
    } catch (err) {
      console.log(err)
    }
  }

  TriggerLoading() {
    try {
      this.player.trigger('loading')
    } catch (err) {
      console.log(err)
    }
  }

  TriggerLoaded() {
    try {
      this.player.trigger('loaded')
    } catch (err) {
      console.log(err)
    }
  }

  IsPaused() {
    if (this.player && this.player.tech(true) && this.player.tech(true).el()) {
      let tracks = this.player.tech(true).el().srcObject
      let paused = this.player.paused()
      let started = this.player.hasClass('vjs-has-started')
      return tracks && paused && started
    }
    return false
  }
}

export { VideoState, WebRTCMessages, createGuid, BitRateInfo, PlayerUI }
