import Vue from 'vue'
import App from './App.vue'
import wrap from '@vue/web-component-wrapper'
import vueCustomElement from 'vue-custom-element'
import MyVideo from './components/video/MyVideo.vue'

Vue.config.productionTip = false

const CustomElement = wrap(Vue, MyVideo)

window.customElements.define('vigil-video', CustomElement)

// Vue.use(vueCustomElement)

// const options = {
//   shadow: true,
//   beforeCreateVueInstance(root) {
//     const rootNode = root.el.getRootNode()

//     if (rootNode instanceof ShadowRoot) {
//       root.shadowRoot = rootNode
//     } else {
//       root.shadowRoot = document.head
//     }

//     return root
//   },
// }

// Vue.customElement('vigil-video', MyVideo, options)

// new Vue({
//   render: (h) => h(App),
// }).$mount('#app')
