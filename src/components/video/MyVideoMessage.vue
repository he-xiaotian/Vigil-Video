<template>
  <div class="video-error-message">
    <v-container class="video-error-container video-error-inside video-error">
      <v-row
        justify="center"
        align="center"
        v-if="isRetry"
        v-resize="freshScale"
        class="message-item"
        no-gutters
      >
        <v-col md="auto">
          <div class="offline-camera-info text-center">
            <v-icon x-large color="hoverGray"> $alert3Icon </v-icon>
          </div>
          <div class="text-center description">
            {{ videoErrorData.title }}
          </div>
          <div class="text-center description">Please try again.</div>
          <div class="text-center description">
            <v-btn small color="secondary" @click.stop="webrtcRetry"
              >RETRY CONNECTION <v-icon>mdi-cached</v-icon></v-btn
            >
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'MyVideoMessage',
  props: {
    videoErrorData: {
      type: Object,
      required: true,
    },
  },
  mounted() {
    this.freshScale()
  },
  computed: {
    isRetry() {
      return this.videoErrorData.type == 'retry'
    },
  },
  data() {
    return {
      scale: 1,
    }
  },
  methods: {
    webrtcRetry() {
      this.$emit('webrtcRetry')
    },
    freshScale() {
      let div = document.getElementsByClassName('video-error')[0]
      if (div.clientWidth < 600) {
        this.scale = div.clientWidth / 600
      } else {
        this.scale = 1
      }
    },
  },
}
</script>

<style lang="scss">
.video-error-message {
  .video-error {
    background: repeating-linear-gradient(
      -45deg,
      #391b21,
      #391b21 15px,
      #35191f 15px,
      #35191f 30px
    );
  }
  .video-error-inside {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    .message-item {
      width: 100%;
      height: 100%;
    }
    .offline-camera {
      height: 128px !important;
      width: 128px;
      path {
        fill: $color-hoverGray;
      }
    }
    .title {
      font-size: 20px;
      font-weight: bold;
      margin: 24px 0px 16px 0px;
    }
    .description {
      font-size: 20px;
      font-weight: lighter;
      margin: 8px 0px 8px 0px;
      .v-btn__content {
        font-size: 14px;
      }
    }
  }
}
.v-card-small {
  .offline-camera-info {
    margin-top: 2rem !important;
  }
}
</style>
