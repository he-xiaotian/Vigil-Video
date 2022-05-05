<template>
  <div class="webrtc-wrapper">
    <video
      ref="videoPlayer"
      class="video-js vjs-default-skin vjs-layout-medium"
      v-bind:id="options.webrtcConfig.serialNumber"
    ></video>
  </div>
</template>

<script>
import videojs from 'video.js'
import { WebRTC } from '@/utils/WebRTC.js'
import { createGuid } from '@/utils/Common'
export default {
  name: 'WebRTCVideo',
  components: {},
  props: {
    options: {
      type: Object,
      require: false,
    },
  },
  data() {
    return {
      player: null,
      webrtc: null,
      config: null,
      notConnected: 0,
    }
  },
  computed: {},
  watch: {},
  methods: {
    init() {
      this.initVideo()
    },
    initVideo() {
      let _this = this
      let options = {
        aspectRatio: '16:9',
        autoplay: true,
        controls: false,
        preload: 'auto',
        muted: true,
        fluid: true,
        liveui: true,
        playsinline: true,
        notSupportedMessage:
          'There is an error in the video player Please try again.',
      }

      this.player = videojs(
        this.$refs.videoPlayer,
        options,
        function onPlayerReady() {
          _this.showLoading()
          _this.initWebRTC()
          console.log('onPlayerReady_______________________', this)
        }
      )
    },
    async initWebRTC(isCreateKVS = false) {
      this.showLoading()
      const config = this.options.webrtcConfig
      this.config = {
        region: config.region || 'us-east-2',
        channel: config.serialNumber,
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
        sessionToken: config.sessionToken,
        clientId: createGuid(),
        channelARN: config.channelARN,
        signalingEndpoints: {},
        bitstream: config.bitstream || 'mainstream',
      }
      config.signalingEndpoints.forEach((endpoint) => {
        let key = endpoint.key || endpoint.Key
        let value = endpoint.value || endpoint.Value
        this.config.signalingEndpoints[key] = value
      })
      this.webrtc = new WebRTC(this.config)
      this.webrtc.init(this.player, this.rtcCallback, isCreateKVS)
    },
    reconnectWebRTC() {
      this.destroyWebRTC()
      this.initWebRTC(true)
    },
    webrtcRetry() {
      this.notConnected = 0
      this.destroyWebRTC()
      this.initWebRTC()
    },
    showLoading() {
      this.player.addClass('vjs-waiting')
    },
    hideLoading() {
      this.player.removeClass('vjs-waiting')
    },
    rtcCallback(e) {
      console.log(`___________rtcCallback_____________${e.type}`, e)
      switch (e.type) {
        case 'monitor':
          this.startMonitoring(e.peerConnection)
          break
      }
    },
    startMonitoring(pc) {
      if (!navigator.onLine) {
        console.log(
          `[${this.config.channel}] Detected no internet, suppressing checks`
        )
        this.showLoading()
        return
      }

      if (pc.connectionState == 'connected') {
        this.notConnected = 0
        return
      }
      this.notConnected++
      if (this.notConnected == 3) {
        console.log('The connectionState is not connected over 3, reconnect')
        this.reconnectWebRTC()
      } else if (this.notConnected == 6) {
        console.log('The connectionState is not connected over 6, restart')
        this.restartWebRTC()
      } else if (this.notConnected == 7) {
        console.log('The connectionState is not connected over 7, reconnect')
        this.reconnectWebRTC()
      } else if (this.notConnected == 10) {
        this.notConnected = 0
        console.log('The connectionState is not connected over 10, stop')
        this.destroyWebRTC()
        this.$emit('videoError', {
          type: 'retry',
          title: this.liveLoadingTimeoutText,
        })
      }
    },
    destroyWebRTC() {
      if (this.webrtc && this.webrtc.stop) {
        console.log('--------destroyWebRTC-----------', this.webrtc)
        this.webrtc.stop()
        this.webrtc = null
      }
    },
  },
  mounted() {
    this.init()
    let _this = this
    setTimeout(() => {
      _this.$emit('videoError', {
        type: 'retry',
        title: _this.liveLoadingTimeoutText,
      })
    }, 10000)
  },
  destroyed() {
    console.log('-------destroyed--------')
    this.destroyWebRTC()
    if (this.player) {
      this.player.dispose()
      this.player = null
    }
  },
  beforeDestroy() {
    console.log('-------beforeDestroy--------')
    this.destroyWebRTC()
    if (this.player) {
      this.player.dispose()
      this.player = null
    }
  },
}
</script>
<style lang="scss">
.webrtc-wrapper {
  width: 100%;
  height: 100%;
  .video-js {
    width: 100% !important;
    height: 100% !important;
    // margin: 0;
    // padding: 0;
    // div,
    // button {
    //   display: none;
    // }
  }
}
</style>
