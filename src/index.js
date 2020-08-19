import mainFlow from './mainFlow.vue'

const defaultComponentName = 'FlowChart'

const Plugin = {
  install (Vue, options = {}) {
    
    if (this.installed) {
      return
    }

    this.installed = true
    this.event = new Vue()
    this.dynamicContainer = null
    this.componentName = options.componentName || defaultComponentName
    /**
     * Plugin API
     */
    Vue.prototype.$flowChart = {
      _setDynamicContainer (dynamicContainer) {
        Plugin.dynamicContainer = dynamicContainer
      }
    }
    
    Vue.component(this.componentName, mainFlow)
  }
}

export default Plugin
