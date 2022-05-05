<template>
  <div class="stream-wrapper">
    <video
      ref="videoPlayer"
      class="video-js vjs-default-skin vjs-layout-medium vjs-big-play-centered"
    ></video>
  </div>
</template>

<script>
import videojs from 'video.js'
export default {
  name: 'StreamVideo',
  components: {},
  props: {
    options: {
      type: Object,
      require: true,
    },
  },
  data() {
    return {
      player: null,
    }
  },
  computed: {},
  watch: {},
  methods: {
    init() {
      //    aspectRatio: '16:9',
      // fill: true,
      // fluid: true,
      // controlBar: {
      //   captionsButton: false,
      //   subsCapsButton: false,
      // },
      // html5: {
      //   vhs: {
      //     overrideNative: !videojs.browser.IS_SAFARI,
      //   },
      //   nativeAudioTracks: false,
      //   nativeVideoTracks: false,
      // },
      let options = {
        aspectRatio: '16:9',
        controls: true,
        muted: true,
        fill: true,
        fluid: true,
        notSupportedMessage:
          'There is an error in the video player Please try again.',
        sources: [
          {
            src: this.options.sources.src,
            type: this.options.sources.type,
          },
        ],
      }
      Object.assign(options, this.options.videoConfig)
      let _this = this
      this.player = videojs(
        this.$refs.videoPlayer,
        options,
        function onPlayerReady() {
          _this.showLoading()
          console.log('onPlayerReady', this)
        }
      )
    },
    showLoading() {
      this.player.addClass('vjs-waiting')
    },
    destroyStream() {
      console.log('--------destroyStream--------')
      if (this.player) {
        this.player.dispose()
      }
    },
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    console.log('--------beforeDestroy--------')
    this.destroyStream()
  },
}
</script>
<style lang="scss">
.stream-wrapper {
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
