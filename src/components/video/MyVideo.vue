<template>
  <div class="my-video">
    <WebRTCVideo
      ref="videoPlayer"
      v-if="webRTCVideo"
      :options="config"
      @videoError="videoError"
    />
    <StreamVideo
      ref="videoPlayer"
      v-if="streamVideo"
      :options="config"
      @videoError="videoError"
    />
    <!-- <MyVideoMessage
      v-if="videoErrorData != null"
      :videoErrorData="videoErrorData"
      @webrtcRetry="webrtcRetry"
    /> -->
  </div>
</template>

<script>
import WebRTCVideo from './WebRTCVideo.vue'
import StreamVideo from './StreamVideo.vue'
// import MyVideoMessage from './MyVideoMessage.vue'

export default {
  name: 'MyVideo',
  components: {
    WebRTCVideo,
    StreamVideo,
  },
  props: {
    options: {
      type: String,
      require: false,
    },
  },
  data() {
    return {
      videoErrorData: null,
    }
  },
  computed: {
    webRTCVideo() {
      return this.config && this.config.type == 'webrtc'
      // return false
    },
    streamVideo() {
      return this.config && this.config.type == 'stream'
      // return false
    },
    config() {
      if (this.options) {
        return JSON.parse(this.options)
      } else {
        return null
      }
    },
  },
  watch: {
    options() {
      console.log('-------watch-------', this.options)
    },
  },
  methods: {
    videoError(data) {
      this.videoErrorData = data
    },
    // webrtcRetry() {
    //   this.videoErrorData = null
    //   this.$refs.videoPlayer.webrtcRetry()
    // },
  },
  created() {
    console.log('------created-------', this.options)
  },
  mounted() {
    console.log('------mounted-------', this.options)
  },
  beforeUnmount() {},
}
</script>
<style lang="scss">
@import '@/scss/video-js.scss';

.my-video {
  width: 100%;
  height: 100%;
}
</style>
