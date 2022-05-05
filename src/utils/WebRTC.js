import AWS from 'aws-sdk'
import { SignalingClient } from 'amazon-kinesis-video-streams-webrtc'
import { BitRateInfo } from './Common'

export class WebRTC {
  constructor(config) {
    this.config = config
    this.viewer = {}
    this.USE_STUN = true
    this.USE_TURN = true
    this.USE_TRICKLE_ICE = true
  }
  async init(player, rtcCallback, isCreateKVS) {
    this.viewer.player = player
    if (isCreateKVS) {
      await this.updateRTCInfo()
    }
    console.log('--------KinesisVideoSignalingChannels------')
    const kinesisVideoSignalingChannelsClient =
      new AWS.KinesisVideoSignalingChannels({
        region: this.config.region,
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
        sessionToken: this.config.sessionToken,
        endpoint: this.config.signalingEndpoints.HTTPS,
      })

    // Get ICE server configuration
    const getIceServerConfigResponse = await kinesisVideoSignalingChannelsClient
      .getIceServerConfig({
        ChannelARN: this.config.channelARN,
      })
      .promise()
    const iceServers = []

    // STUN
    if (this.USE_STUN) {
      iceServers.push({
        urls: `stun:stun.kinesisvideo.${this.config.region}.amazonaws.com:443`,
      })
      iceServers.push({
        urls: 'stun:stun.l.google.com:19302',
      })
    }

    // TURN
    if (this.USE_TURN) {
      getIceServerConfigResponse.IceServerList.forEach((iceServer) => {
        iceServers.push({
          urls: iceServer.Uris,
          username: iceServer.Username,
          credential: iceServer.Password,
        })
      })
    }

    // Create Signaling Client
    this.viewer.signalingClient = new SignalingClient({
      channelARN: this.config.channelARN,
      channelEndpoint: this.config.signalingEndpoints.WSS,
      clientId: this.config.clientId,
      role: 'VIEWER',
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
        sessionToken: this.config.sessionToken,
      },
    })
    const configuration = {
      iceServers,
      iceTransportPolicy: 'all',
    }
    this.viewer.peerConnection = new RTCPeerConnection(configuration)
    this.viewer.dataChannel =
      this.viewer.peerConnection.createDataChannel('kvsDataChannel')

    this.viewer.dataChannel.onopen = () => {
      try {
        this.viewer.dataChannel.send(this.config.bitstream)
      } catch (e) {
        console.error('Send DataChannel: ', e.toString())
      }
    }
    this.viewer.peerConnection.ondatachannel = (event) => {
      // TODO update time
      event.channel.onmessage = (event) => {
        let obj = { type: 'ondatachannel', event: event }
        rtcCallback(obj)
      }
    }

    this.viewer.signalingClient.on('open', async () => {
      // Create an SDP offer to send to the master
      await this.viewer.peerConnection.setLocalDescription(
        await this.viewer.peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        })
      )

      // When trickle ICE is enabled, send the offer now and then send ICE candidates as they are generated. Otherwise wait on the ICE candidates.
      if (this.USE_TRICKLE_ICE) {
        this.viewer.signalingClient.sendSdpOffer(
          this.viewer.peerConnection.localDescription
        )
      }
    })

    this.viewer.signalingClient.on('sdpAnswer', async (answer) => {
      // Add the SDP answer to the peer connection
      console.log('[VIEWER] Received SDP answer')
      await this.viewer.peerConnection.setRemoteDescription(answer)
    })

    this.viewer.signalingClient.on('iceCandidate', (candidate) => {
      // Add the ICE candidate received from the MASTER to the peer connection
      console.log('[VIEWER] Received ICE candidate')
      this.viewer.peerConnection.addIceCandidate(candidate)
    })

    this.viewer.signalingClient.on('close', () => {
      console.log('[VIEWER] Disconnected from signaling channel')
    })

    this.viewer.signalingClient.on('error', (error) => {
      console.error('[VIEWER] Signaling client error: ', error)
    })

    // Send any ICE candidates to the other peer
    this.viewer.peerConnection.addEventListener(
      'icecandidate',
      ({ candidate }) => {
        if (candidate) {
          console.log('[VIEWER] Generated ICE candidate')
          // When trickle ICE is enabled, send the ICE candidates as they are generated.
          if (this.USE_TRICKLE_ICE) {
            console.log('[VIEWER] Sending ICE candidate')
            this.viewer.signalingClient.sendIceCandidate(candidate)
          }
        } else {
          console.log('[VIEWER] All ICE candidates have been generated')
          // When trickle ICE is disabled, send the offer now that all the ICE candidates have ben generated.
          if (!this.USE_TRICKLE_ICE) {
            console.log('[VIEWER] Sending SDP offer')
            this.viewer.signalingClient.sendSdpOffer(
              this.viewer.peerConnection.localDescription
            )
          }
        }
      }
    )

    // As remote tracks are received, add them to the remote view
    this.viewer.peerConnection.addEventListener('track', (event) => {
      console.log('[VIEWER] Received remote track')
      if (player.tech(true).el().srcObject) {
        return
      }
      this.viewer.remoteStream = event.streams[0]
      player.tech(true).el().srcObject = this.viewer.remoteStream
      let obj = { type: 'setVideoStream' }
      rtcCallback(obj)
    })
    this.viewer.signalingClient.open()
    // Poll for connection stats
    this.viewer.monitor = setInterval(() => {
      let obj = { type: 'monitor', peerConnection: this.viewer.peerConnection }
      rtcCallback(obj)
    }, 10000)
    //this.viewer.stats = this.startStats()
    // setInterval(() => {
    //   this.viewer.peerConnection.getStats((res) => {
    //     let obj = { type: 'getStats', res: res }
    //     this.rtcCallback(obj)
    //   })
    // }, 5000)
  }

  async updateRTCInfo() {
    // Create KVS client
    console.log('--------Create KVS client------')
    const kinesisVideoClient = new AWS.KinesisVideo({
      region: this.config.region,
      accessKeyId: this.config.accessKeyId,
      secretAccessKey: this.config.secretAccessKey,
      sessionToken: this.config.sessionToken,
    })

    // Get signaling channel ARN
    const describeSignalingChannelResponse = await kinesisVideoClient
      .describeSignalingChannel({
        ChannelName: this.config.channel,
      })
      .promise()
    const channelARN = describeSignalingChannelResponse.ChannelInfo.ChannelARN
    console.log('[VIEWER] Channel ARN: ', channelARN)

    // Get signaling channel endpoints
    const getSignalingChannelEndpointResponse = await kinesisVideoClient
      .getSignalingChannelEndpoint({
        ChannelARN: channelARN,
        SingleMasterChannelEndpointConfiguration: {
          Protocols: ['WSS', 'HTTPS'],
          Role: 'VIEWER',
        },
      })
      .promise()
    const endpointsByProtocol =
      getSignalingChannelEndpointResponse.ResourceEndpointList.reduce(
        (endpoints, endpoint) => {
          endpoints[endpoint.Protocol] = endpoint.ResourceEndpoint
          return endpoints
        },
        {}
      )
    console.log('[VIEWER] Endpoints: ', endpointsByProtocol)
    this.config.channelARN = channelARN
    this.config.signalingEndpoints = endpointsByProtocol
  }

  stop() {
    console.log('[VIEWER] Stopping viewer connection')
    if (this.viewer.signalingClient) {
      this.viewer.signalingClient.close()
      this.viewer.signalingClient = null
    }
    if (this.viewer.peerConnection) {
      this.viewer.peerConnection.close()
      this.viewer.peerConnection = null
    }
    if (this.viewer.remoteStream) {
      this.viewer.remoteStream.getTracks().forEach((track) => track.stop())
      this.viewer.remoteStream = null
    }
    if (this.viewer.monitor) {
      clearInterval(this.viewer.monitor)
      this.viewer.monitor = null
    }
    if (this.viewer.stats) {
      clearInterval(this.viewer.stats)
      this.viewer.stats = null
    }
    if (this.viewer.player.tech(true).el().srcObject) {
      this.viewer.player.tech(true).el().srcObject = null
    }
    this.viewer.dataChannel = null
  }

  startStats() {
    let bitRateInfo = new BitRateInfo()
    return setInterval(() => {
      if (this.viewer.peerConnection) {
        this.viewer.peerConnection
          .getStats()
          .then((results) => {
            let selectedCandidateId = ''
            let candidates = {}
            results.forEach(async (report) => {
              if (report.type == 'inbound-rtp' && report.mediaType == 'video') {
                // update bit rate info feeding in the report
                bitRateInfo.update(report)
                console.log(
                  `[${this.config.channel}]: received/s --> ${bitRateInfo.bitRate} kbps , decoded/s --> ${bitRateInfo.decodeRate}`
                )
              }
              if (report.type == 'candidate-pair' && report.nominated) {
                selectedCandidateId = report.localCandidateId
              }
              if (report.candidateType) {
                candidates[report.id] = report
              }
            })

            let candidate = candidates[selectedCandidateId]
            if (candidate) {
              let rtcMethod =
                candidate.candidateType == 'relay' ? 'TURN' : 'STUN'
              if (this.cameraView) {
                this.cameraView.candidateType = candidate.candidateType
              }
              console.log(
                `[${this.config.channel}] ${rtcMethod} ${candidate.protocol} ${candidate.ip}:${candidate.port}`
              )
            }
            candidates = null
          })
          .catch((err) => {
            console.log(err)
          })
      }
    }, 5000)
  }
}
