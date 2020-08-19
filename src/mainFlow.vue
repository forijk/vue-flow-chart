<template>
  <div class="wrapper" ref="wrapper" @click="handleClick" @contextmenu.prevent="contextMenu">
    <section class="drag" ref="drag" @mousedown="dragMouseDown($event, 'drag')" @mousewheel="throttledMethod($event)">
      <div class="flow-wrapper" ref="flowWrapper">
        <div class="svg-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="100%">
            <defs>
              <marker
                id="markerArrow1"
                markerWidth="4"
                markerHeight="4"
                refX="2.4"
                refY="2"
                orient="auto">
                <path d="M0,0 L0,4 L4,2 L0,0" style="fill: rgb(91, 95, 100);" />
              </marker>
              <marker
                id="markerArrow2"
                markerWidth="4"
                markerHeight="4"
                refX="3"
                refY="2"
                orient="auto">
                <path d="M0,0 L0,4 L4,2 L0,0" style="fill: red;" />
              </marker>
            </defs>
            <path
              v-for="item in connectionPoints"
              :key="item.newPath"
              :ref="`svg-${item.formName}-${item.toName}`"
              class="polyline"
              :d="item.newPath"
              style="stroke: rgba(0, 0, 0, 0.6); fill: none; stroke-opacity: 1; stroke-width: 4; stroke-linejoin: bevel; marker-end: url(#markerArrow1);"
            />
          </svg>
        </div>
        <div v-for="(level, index) in flowData" :key="index" class="flow" :style="{ height: flowNodeHeight }">
          <flow-node
            class="flow-node"
            :showContextmenu="showContextmenu"
            :showFooter="showFooter"
            :childRelations="childRelations"
            v-for="(node, nodeIndex) in level"
            :key="node.node_info.node_uuid"
            :ref="node.node_info.node_uuid"
            :node="node"
            @reflow="reflow"
            :levelOfFlow="index"
            :indexOfLevelNode="nodeIndex"
            @mouseenter.native="hoverNode(node.node_info.node_uuid, 'enter')"
            @mouseleave.native="hoverNode(node.node_info.node_uuid)"
            :style="{ height: flowNodeHeight, width: flowNodeWidth }"
          >
            <template v-slot:node-name="scopedProps">
              <slot name="node-name" :node="scopedProps.node">
              </slot>
            </template>
            <template v-slot:top-right="scopedProps">
              <slot name="top-right" :node="scopedProps.node">
              </slot>
            </template>
            <template v-slot:node-content="scopedProps">
              <slot name="node-content" :node="scopedProps.node">
              </slot>
            </template>
            <template v-slot:bottom-left="scopedProps">
              <slot name="bottom-left" :node="scopedProps.node">
              </slot>
            </template>
            <template v-slot:bottom-right="scopedProps">
              <slot name="bottom-right" :node="scopedProps.node">
              </slot>
            </template>
          </flow-node>
        </div>
      </div>
    </section>
    <div class="mini">
      <span style="font-size: 12px;">mini</span>
      <div class="mini-map" ref="miniMap" @mousedown="miniMouseDown($event, 'miniMap')"></div>
      <div class="map-wrapper"></div>
    </div>
    <div class="zoom">
      <div @click="handleClickScale(true, 'redo')">
        <span><img src="./icon/reload.svg"/></span>
      </div>
      <div @click="handleClickScale(true)">
        <span><img src="./icon/enlarge.svg"/></span>
      </div>
      <div @click="handleClickScale(false)">
        <span><img src="./icon/narrow.svg"/></span>
      </div>
    </div>
    <div class="operator">
      <slot name="operator">
        <div class="operator-button">
          Save
        </div>
      </slot>
    </div>
  </div>
</template>
<script>
import throttle from 'lodash.throttle'
import store from './store'
import mutation from './store/mutation'
import FlowNode from './FlowNode.vue'

export default {
  components: {
    FlowNode
  },
  props: {
    flowData: {
      type: Array,
      default: () => []
    },
    nodeWidth: {
      type: Number,
      default: 320
    },
    nodeHeight: {
      type: Number,
      default: 200
    },
    showFooter: {
      type: Boolean,
      default: true
    },
    showContextmenu: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      store,
      mutation,
      initPoint: {},
      connectionPoints: [],
      flowNodeWidth: this.nodeWidth + 'px',
      flowNodeHeight: this.nodeHeight + 'px',
      scaleX: 0.85,
      scaleY: 0.85,
      pointLeft: [],
      childRelations: [],
      childRelationsObj: {}
    }
  },
  watch: {
    flowData: {
      immediate: true,
      handler(v) {
        if (v.length) {
          this.store.flowData = v
          this.$nextTick(() => {
            this.getAllpoints()
            this.generateConnectionPoints()
          })
        }
      }
    }
  },
  // computed: {
  //   flowData() {
  //     return this.store.flowData
  //   }
  // },
  mounted() {
    const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    const target = this.$refs.wrapper

    target.style.width = '100%'
    target.style.height = '100%'

    const currentHeight = parseInt(this._getAttr(target, 'height'))
    if (!currentHeight) {
      this.$refs.wrapper.style.height = height + 'px'
    }
  },
  methods: {
    contextMenu() {
      if (this.showContextmenu) {
        return false
      }
    },
    reflow() {
      this.getAllpoints()
      this.generateConnectionPoints()
    },
    handleClick() {
      // 关闭所有右键菜单
      this.mutation.SET_SHOW_MENU(this.store)
    },
    handleClickScale(isLarge, redo) {
      if (redo === 'redo') {
        this.toNormal()
        return
      }
      this.scaleX > 0.3 && !isLarge && this.toSmall()
      this.scaleX < 1.3 && isLarge && this.toLarge()
    },
    handleScale(e) {
      if (e.target.nodeName === 'svg' || e.target.nodeName === 'SECTION') {
        if (e.deltaY > 0 && this.scaleX > 0.3) {
          this.toSmall()
        } else if (e.deltaY < 0 && this.scaleX < 1.3) {
          this.toLarge()
        }
      }
    },
    throttledMethod: throttle(function(e) {
      this.handleScale(e)
    }, 80),
    toNormal() {
      this.$refs['flowWrapper'].style.transform = `scale(0.85, 0.85)`
      this.scaleX = 0.85
      this.scaleY = 0.85
      this.$refs['miniMap'].style.left = '37.5%'
      this.$refs['miniMap'].style.top = '37.5%'
      this.$refs['drag'].style.left = '-200.0%'
      this.$refs['drag'].style.top = '-200.0%'
    },
    toLarge() {
      this.$refs['flowWrapper'].style.transform = `scale(${this.scaleX + 0.05}, ${this.scaleY + 0.05})`
      this.scaleX += 0.05
      this.scaleY += 0.05
    },
    toSmall() {
      this.$refs['flowWrapper'].style.transform = `scale(${this.scaleX - 0.1}, ${this.scaleY - 0.1})`
      this.scaleX -= 0.05
      this.scaleY -= 0.05
    },
    hoverNode(name, flag) {
      // 处理其他节点 hover 颜色问题
      const otherNode = []
      let target = null
      this.connectionPoints.forEach(item => {
        if (item.toName === name && !item.isLastLevelNode) {
          target = this.$refs[`svg-${item.formName}-${item.toName}`][0]
        } else {
          otherNode.push(this.$refs[`svg-${item.formName}-${item.toName}`][0])
        }
      })
      if (target) {
        if (flag === 'enter') {
          otherNode.forEach(item => {
            item.style['stroke'] = 'rgba(0, 0, 0, 0.6)'
            item.style['marker-end'] = 'url(#markerArrow1)'
          })
          target.style['stroke'] = 'red'
          target.style['marker-end'] = 'url(#markerArrow2)'
        } else {
          target.style['stroke'] = 'rgba(0, 0, 0, 0.6)'
          target.style['marker-end'] = 'url(#markerArrow1)'
        }
      }
    },
    getAllpoints() {
      const lenX = parseInt(this.flowNodeWidth) / 2
      const lenY = parseInt(this.flowNodeHeight)
      // 存储节点关系
      const allRelations = []
      // 获取节点的所在层级和该层级顺序，合并到 childRelations 中
      const nodeLevelAndIndex = {}
      // 初始化 pointLeft
      this.pointLeft = []
      for (let i = 0; i < this.flowData.length; i++) {
        this.pointLeft.push({})
      }
      // 获取所有节点坐标
      this.flowData.forEach((item, level) => {
        item.forEach((every, key) => {
          const target = this.$refs[every.node_info.node_uuid][0].$el
          this.initPoint[every.node_info.node_uuid] = {
            inPointX: target.offsetLeft + lenX,
            inPointY: target.offsetTop,
            outPointX: target.offsetLeft + lenX,
            outPointY: target.offsetTop + lenY
          }
          // 分层级存储每个节点的 left 值，用以计算最佳插入点
          this.pointLeft[level][every.node_info.node_uuid] = target.offsetLeft
          // 存储节点关系
          if (every.node_relations.relations && every.node_relations.relations.length !== 0) {
            allRelations.push({
              [every.node_info.node_uuid]: every.node_relations.relations,
              parentLevelIndex: key
            })
          }
          nodeLevelAndIndex[every.node_info.node_uuid] = {
            levelOfFlow: level,
            indexOfLevelNode: key,
            name: every.node_info.node_name
          }
        })
      })
      this.childRelations = []
      // 处理一对一（子对父）
      allRelations.forEach((item, index) => {
        Object.values(item)[0].forEach((one, key) => {
          this.childRelations.push({
            uuid: one,
            name: nodeLevelAndIndex[one].name,
            parent: Object.keys(item)[0],
            left: this.initPoint[one].inPointX - lenX,
            parentLevelIndex: Object.values(item)[1],
            levelOfFlow: nodeLevelAndIndex[one].levelOfFlow,
            nodeIndexOfParentRelation: key,
            indexOfLevelNode: nodeLevelAndIndex[one].indexOfLevelNode
          })
        })
      })
      const firstUUID = this.flowData[0][0].node_info.node_uuid
      const firstName = this.flowData[0][0].node_info.node_name
      this.childRelations.push({
        uuid: firstUUID,
        name: firstName,
        parent: null,
        left: this.initPoint[firstUUID]['inPointX'] - lenX,
        parentLevelIndex: null,
        levelOfFlow: 0,
        nodeIndexOfParentRelation: null,
        indexOfLevelNode: 0
      })
      // 用于连线优化
      this.childRelations.forEach(item => {
        this.childRelationsObj[item.uuid] = item
      })
    },
    generateConnectionPoints() {
      // 重绘连线
      this.connectionPoints = []
      // 生成所有连接线以及错位计算
      try {
        this.flowData.forEach((item, key) => {
          let offsetLen = 0
          item.forEach((every, everyKey) => {
            if (every.node_relations.relations) {
              every.node_relations.relations.forEach((one, index, everyObj) => {
                const pLeft = this.childRelationsObj[this.childRelationsObj[one]['parent']]['left']
                const inPointX = this.initPoint[one].inPointX
                const initPoint = this.initPoint[every.node_info.node_uuid]
                const levelOfFlowLength = this.flowData[this.childRelationsObj[one]['levelOfFlow']].length
                const indexOfLevelNode = this.childRelationsObj[one]['indexOfLevelNode']
                offsetLen = offsetLen + 8

                const pointAX = `${initPoint.outPointX + offsetLen}`
                const pointAY = `${initPoint.outPointY - 6}`
                const pointBX = `${initPoint.outPointX + offsetLen}`
                let pointBY = `${initPoint.outPointY + 10 + offsetLen}`
                let pointCX = `${inPointX - offsetLen}`
                let pointCY = `${initPoint.outPointY + 10 + offsetLen}`
                let pointDX = `${inPointX - offsetLen}`
                const pointDY = `${initPoint.outPointY + 98}`
                const rx = 6
                let radius1 = `M${pointAX} ${pointBY - rx} A${rx} ${rx} ${0} ${0} ${1} ${pointBX - rx} ${pointBY}`
                let radius2 = `M${parseInt(pointCX) + rx} ${pointBY} A${rx} ${rx} ${0} ${0} ${0} ${pointDX} ${parseInt(
                  pointCY
                ) + rx}`
                let newPath = `M${pointAX} ${pointAY} V${pointBY - rx} ${radius1} M${pointBX -
                  rx} ${pointBY} H${parseInt(pointCX) + rx} ${radius2} M${pointDX} ${parseInt(pointCY) +
                  rx}  V${pointDY}`
                if (this.childRelationsObj[one].left === pLeft) {
                  pointCX = `${initPoint.outPointX + offsetLen}`
                  pointDX = `${initPoint.outPointX + offsetLen}`
                  newPath = `M${pointAX} ${pointAY} V${pointBY} H${pointCX} V${pointDY}`
                }
                if (this.childRelationsObj[one].left > pLeft) {
                  pointBY = `${initPoint.outPointY + 10 + (levelOfFlowLength - indexOfLevelNode) * 10}`
                  pointCY = `${initPoint.outPointY + 10 + (levelOfFlowLength - indexOfLevelNode) * 10}`
                  radius1 = `M${pointAX} ${pointBY - rx} A${rx} ${rx} ${0} ${0} ${0} ${parseInt(pointBX) +
                    rx} ${pointBY}`
                  radius2 = `M${pointCX - rx} ${pointBY} A${rx} ${rx} ${0} ${0} ${1} ${pointCX} ${parseInt(pointCY) +
                    rx}`
                  newPath = `M${pointAX} ${pointAY} V${pointBY - rx} ${radius1} M${parseInt(pointBX) +
                    rx} ${pointBY} H${pointCX - rx} ${radius2} M${pointCX} ${parseInt(pointCY) + rx} V${pointDY}`
                }
                this.connectionPoints.push({
                  isLastLevelNode: key === this.flowData.length - 1,
                  fromName: every.node_info.node_uuid,
                  toName: one,
                  paths: `${pointAX} ${pointAY}, ${pointBX} ${pointBY}, ${pointCX} ${pointCY}, ${pointDX} ${pointDY}`,
                  newPath
                })
              })
            }
          })
        })
      } catch (err) {
        console.log('节点关系中 子节点缺失 - -！')
      }
    },
    dragMouseDown(e, ref) {
      const target = this.$refs[ref]
      const flowWrapper = this.$refs['flowWrapper']
      const wrapper = this.$refs['wrapper']
      const currentX = e.clientX
      const currentY = e.clientY
      const left = parseInt(this._getAttr(target, 'left'))
      const top = parseInt(this._getAttr(target, 'top'))
      document.onmousemove = event => {
        // 鼠标移动时计算每次移动的距离，并改变拖拽元素的定位
        const disX = event.clientX - currentX
        const disY = event.clientY - currentY
        let lastX = left + disX
        let lastY = top + disY
        const lenXmin = (target.offsetWidth - flowWrapper.offsetWidth) * 0.5 + flowWrapper.offsetWidth * 0.8
        const lenXmax =
          (target.offsetWidth - flowWrapper.offsetWidth) * 0.5 - (wrapper.offsetWidth - flowWrapper.offsetWidth * 0.2)
        if (lastX < -lenXmin) {
          lastX = -lenXmin
        } else if (lastX > -lenXmax) {
          lastX = -lenXmax
        }
        const lenYmin = (target.offsetHeight - flowWrapper.offsetHeight) * 0.5 + flowWrapper.offsetHeight * 0.8
        const lenYmax =
          (target.offsetHeight - flowWrapper.offsetHeight) * 0.5 -
          (wrapper.offsetHeight - flowWrapper.offsetHeight * 0.2)
        if (lastY < -lenYmin) {
          lastY = -lenYmin
        } else if (lastY > -lenYmax) {
          lastY = -lenYmax
        }
        target.style.left = lastX + 'px'
        target.style.top = lastY + 'px'
        // 计算比例
        const wrapperW = this.$refs['wrapper'].offsetWidth
        const wrapperH = this.$refs['wrapper'].offsetHeight
        const width = parseInt(this._getAttr(target, 'width'))
        const height = parseInt(this._getAttr(target, 'height'))
        const baseW = ((width - wrapperW) / 2) * 2
        const baseH = ((height - wrapperH) / 2) * 2

        const rateX = -target.offsetLeft / baseW
        const rateY = -target.offsetTop / baseH
        this.$refs['miniMap'].style.left = rateX * (160 - 40) + 'px'
        this.$refs['miniMap'].style.top = rateY * (100 - 25) + 'px'
        return false
      }
      document.onmouseup = () => {
        document.onmousemove = null
        document.onmouseup = null
      }
    },
    miniMouseDown(e, ref) {
      const target = this.$refs[ref]
      const currentX = e.clientX
      const currentY = e.clientY
      const left = parseInt(this._getAttr(target, 'left'))
      const top = parseInt(this._getAttr(target, 'top'))
      document.onmousemove = event => {
        const disX = event.clientX - currentX
        const disY = event.clientY - currentY
        let lastX = left + disX
        let lastY = top + disY
        if (lastX > target.parentElement.offsetWidth - target.offsetWidth) {
          lastX = target.parentElement.offsetWidth - target.offsetWidth
        } else if (lastX < 0) {
          lastX = 0
        }
        if (lastY > target.parentElement.offsetHeight - target.offsetHeight) {
          lastY = target.parentElement.offsetHeight - target.offsetHeight
        } else if (lastY < 0) {
          lastY = 0
        }
        target.style.left = lastX + 'px'
        target.style.top = lastY + 'px'
        // 计算比例
        const rateX = target.offsetLeft / (target.parentElement.offsetWidth - target.offsetWidth)
        const rateY = target.offsetTop / (target.parentElement.offsetHeight - target.offsetHeight)
        this._setPosition('drag', rateX, rateY)
        return false
      }
      document.onmouseup = () => {
        document.onmousemove = null
        document.onmouseup = null
      }
    },
    _getAttr(obj, key) {
      return obj.currentStyle ? obj.currentStyle[key] : window.getComputedStyle(obj, false)[key]
    },
    _setPosition(ref, rateX, rateY) {
      const target = this.$refs[ref]
      const wrapperW = this.$refs['wrapper'].offsetWidth
      const wrapperH = this.$refs['wrapper'].offsetHeight
      const width = parseInt(this._getAttr(target, 'width'))
      const height = parseInt(this._getAttr(target, 'height'))
      const baseW = ((width - wrapperW) / 2) * 2
      const baseH = ((height - wrapperH) / 2) * 2
      target.style.left = -(baseW * rateX) + 'px'
      target.style.top = -(baseH * rateY) + 'px'
    }
  }
}
</script>
<style scoped>
.wrapper {
  background: #e7e7e9;
  background-image: linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 0),
    linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 0), linear-gradient(white 1px, transparent 0),
    linear-gradient(90deg, white 1px, transparent 0);
  background-size: 15px 15px, 15px 15px, 75px 75px, 75px 75px;
  position: relative;
  box-shadow: 0 0 8px #c9c7c7;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}
.wrapper .drag {
  width: calc(500%);
  height: calc(500%);
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
}
.wrapper .drag .flow-wrapper {
  z-index: 10;
  transform: scale(0.85, 0.85);
  position: relative;
  border-radius: 4px;
}
.wrapper .drag .flow-wrapper .svg-wrapper {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
}
.wrapper .drag .flow-wrapper .svg-wrapper .polyline {
  position: absolute;
}
.wrapper .drag .flow-wrapper .svg-wrapper .polyline:hover {
  stroke: red !important;
}
.wrapper .drag .flow-wrapper .svg-wrapper:hover .polyline {
  stroke: rgba(0, 0, 0, 0.6) !important;
  marker-end: url(#markerArrow1) !important;
}
.wrapper .drag .flow-wrapper .flow {
  text-align: center;
  margin-bottom: 100px;
}
.wrapper .drag .flow-wrapper .flow .flow-node {
  position: relative;
  display: inline-block;
  white-space: normal;
  word-break: break-all;
  word-wrap: break-word;
  text-align: left;
  margin: 0 50px;
}
.wrapper .drag .flow-wrapper .flow .flow-node::-webkit-scrollbar {
  display: none;
}
.wrapper .zoom {
  z-index: 11;
  position: absolute;
  left: 140px;
  bottom: 12px;
}
.wrapper .zoom div {
  padding: 1px 0;
  cursor: pointer;
}
.wrapper .operator {
  opacity: 0.7;
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 11;
}
.operator-button {
  color: #fff;
  background-color: #1890ff;
  border-color: #1890ff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.12);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
  display: inline-block;
  font-weight: 400;
  text-align: center;
  border: 1px solid transparent;
  cursor: pointer;
  height: 32px;
  line-height: 32px;
  user-select: none;
  padding: 0 15px;
  font-size: 14px;
  border-radius: 4px;
}
.wrapper .bot-name {
  opacity: 0.4;
  position: absolute;
  top: 50px;
  left: 10px;
  z-index: 1;
  font-weight: 500;
  font-size: 14px;
}
.wrapper .mini {
  height: 100px;
  width: 160px;
  color: white;
  position: absolute;
  left: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 11;
}
.wrapper .mini .mini-map {
  cursor: pointer;
  position: absolute;
  box-sizing: border-box;
  height: 25px;
  width: 40px;
  border: 2px solid #f4f1f5;
}
.wrapper .mini .map-wrapper {
  width: 112px;
  height: 70px;
  position: absolute;
  box-sizing: border-box;
  z-index: -1;
  background-color: rgba(107, 157, 250, 0.45);
  box-shadow: 0px 0px 8px 1px rgba(7, 66, 121, 0.45) inset;
}
</style>
