import Vue from 'vue'
import wrap from '@vue/web-component-wrapper'
import MyVideo from './components/video/MyVideo.vue'

const VigilVideo = wrap(Vue, MyVideo)
window.customElements.define('my-vigil-video', VigilVideo)

export default VigilVideo
