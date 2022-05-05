<template>
  <div class="">
    <v-row>
      <v-col cols="6">
        <h3>WebRTC</h3>
        <div class="video-wrapper">
          <MyVideo :options="webrtc" />
        </div>
      </v-col>
      <v-col cols="6">
        <h3>Stream</h3>
        <div class="video-wrapper">
          <MyVideo :options="stream" />
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import MyVideo from './components/video/MyVideo.vue'
// import AWS from "aws-sdk";

export default {
  name: 'App',
  components: {
    MyVideo,
  },
  data() {
    return {
      stream: {
        type: 'stream',
        sources: {
          // src: 'https://b-54c7cb80.kinesisvideo.us-east-2.amazonaws.com/hls/v1/getHLSMasterPlaylist.m3u8?SessionToken=CiCcV-f7cD7xqV0Rs2K-T0dXYkRb0sknjALIq5hA7sOscxIQm9k03BRrE3y53qaoRJgUtBoZUM1o7HyvHynBhJfxbDByHHOIvDNZXEpopyIga9JdXzYvOhV2TGJSesgQcLTCPam8Rn1oIBcGFrK9LgQ~',
          src: 'https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8',
          type: 'application/x-mpegURL',
          // type:'video/mp4',
        },
        videoConfig: {
          autoplay: true,
        },
      },

      options: {
        type: 'webrtc',
        webrtcConfig: {
          // bitstream: 'substream',
          serialNumber: '1C8259185F37',
          channelARN:
            'arn:aws:kinesisvideo:us-east-2:465671368404:channel/1C8259185F37/1614216560225',
          signalingEndpoints: [
            {
              key: 'HTTPS',
              value: 'https://r-b0356e67.kinesisvideo.us-east-2.amazonaws.com',
            },
            {
              key: 'WSS',
              value: 'wss://v-dc297268.kinesisvideo.us-east-2.amazonaws.com',
            },
          ],
          accessKey: 'ASIAWY3BNF3KD7E74K5D',
          region: 'us-east-2',
          secretKey: 'zEHh9kryyt6aI6dTa3H6KZUOjjYx0Y94rMG78dGG',
          sessionToken:
            'IQoJb3JpZ2luX2VjEN7//////////wEaCXVzLWVhc3QtMSJHMEUCIQDyKScy6LDNuaRpvU9WI9gtxTjPww5l4FvLXOJUfUlpHwIgVdMU2VwvrIVwxOmoyuQ4fPWDEgoZQAfRk1/yi470SesqnQMIh///////////ARACGgw0NjU2NzEzNjg0MDQiDAmp+gCt1EiSascrPirxAgDY7Y+S+JVsf5fy9n+7X4aSRjsbGYgmWNyyXsyxqoiRTxe1DbgV7BJ7cdNstTGmMc36ArIjO0atZ6BfVvn1hzcZyroIuDxijoaP4Pg5k1BX+ZlnGPjlqMFnU2Cgyyte85n+zKp7GkDn6gMWQcoK+/Xe9eJ7qj5uo7V96xieqXrCwPE50quv42CFCN37VAGGojkx5w75EJO6V1/0sa5z9hiqTVEj1Wc0sYoanmts8rhHwiz4gUN/OW5RLE23g/FBdL8CR2v2hkCxuFRjQz/kO7CAJkntDcTuTe8FPnjCCfpl2LOmvgufpbyTAqA/soh6+uIs62sY4sgKS1RsFNYrl1wUHAVVLaaPMgZx0Ad4HhJNfBwBcCaSP1OqMICp2VvoXxnJG8/RxwqirOqucfTjhIL5gvFHaeGkcmHaDImaH2XEerOD7PlbRV3qy8vcicNV5KnwtaCaKgF4mcAiUhfPMQb94nLnzyAreKACsFmUTnWvzzDCjeSSBjqmAR1EOQ3xQKEWMztsoGcEE+MTFK0IwTuLqa5kvyhJdyXcJ/vhht1M4Be30n+WL1SPyu0Fbd8hgENUihaWeVb3leksdOrqJLT8o9wQVsnENXoMJEZKfNo0WQdzbsEFas9kpy1pIq2daNn80NH1ijt64e8g6x2u5yy4rQs/T1ucKgu+Z0izCQJCpPGPbw+/eSRdt5SbDpxQHhwRdvnCA/4XEi3PIl7c9Cs=',
        },
      },
    }
  },
  async created() {
    const videoToken = await this.fetchVideoToken({
      cameraSerialNumber: '1C8259185F37',
    })
    this.webrtc1.webrtcConfig.region = videoToken.Token.region || 'us-east-2'
    this.webrtc1.webrtcConfig.accessKey = videoToken.Token.accessKey
    this.webrtc1.webrtcConfig.secretKey = videoToken.Token.secretKey
    this.webrtc1.webrtcConfig.sessionToken = videoToken.Token.sessionToken
    this.webrtc = JSON.stringify(this.webrtc1)
    this.stream = JSON.stringify(this.stream1)
  },
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
