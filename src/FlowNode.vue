<template>
  <div class="node-wrapper" @contextmenu.prevent="rightClick">
    <header ref="header">
      <div class="node-wrapper-name">
        <slot name="node-name" :node="node"><span>name: {{ node.node_info.node_name }}</span></slot>
      </div>
      <div class="node-wrapper-operator">
        <slot name="top-right" :node="node">Top-right: 😁</slot>
      </div>
    </header>
    <div class="node-content" ref="content">
      <slot name="node-content" :node="node">content: {{ node.node_info.node_name }}</slot>
    </div>
    <footer v-if="showFooter" ref="footer">
      <div style="float: left;">
        <slot name="bottom-left" :node="node">Bottom-left: 😊</slot>
      </div>
      <div style="float: right;">
        <slot name="bottom-right" :node="node">Bottom-right: 😊</slot>
      </div>
    </footer>
    <right-menu
      :x="xIndex"
      :y="yIndex"
      :showMenu="showMenu"
      :node="node"
      @close="closeMenu"
      @copy="copyNode"
      @del="delNode"
      @add="addNormal"
      @add-jump="addJump"
      @paste-node="pasteNode"
    ></right-menu>
  </div>
</template>
<script>
import RightMenu from './RightMenu.vue'
import { v4 as uuidv4 } from 'uuid'
import store from './store'
import mutation from './store/mutation'

export default {
  props: {
    node: {
      type: Object,
      required: true
    },
    levelOfFlow: {
      type: Number,
      required: true
    },
    indexOfLevelNode: {
      type: Number,
      required: true
    },
    childRelations: {
      type: Array,
      required: true
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
  components: {
    RightMenu
  },
  data() {
    return {
      store,
      mutation,
      xIndex: 0,
      yIndex: 0
    }
  },
  computed: {
    showMenu() {
      return this.store.showMenu[this.node.node_info.node_uuid]
    },
    currentCopy() {
      const node = this.store.copyData
      return node.node_info && node.node_info.node_name
    }
  },
  mounted() {
    if (!this.$refs.footer) {
      this.$refs.content.style.height = 'calc(100% - 52px)'
    } else {
      this.$refs.content.style.height = 'calc(100% - 80px)'
    }
  },
  methods: {
    rightClick(e) {
      if (this.showContextmenu) {
        const clientWidth = document.body.clientWidth
        const menuWidth = 116
        const clickClientX = e.clientX + menuWidth
        if (clickClientX > clientWidth) {
          this.xIndex = e.offsetX - menuWidth - 20
        } else {
          this.xIndex = e.offsetX + 20
        }
        this.yIndex = e.offsetY
        this.mutation.SET_SHOW_MENU(this.store, { [this.node.node_info.node_uuid]: true })
      }
    },
    closeMenu(state) {
      this.mutation.SET_SHOW_MENU(this.store)
    },
    copyNode() {
      const payload = {
        id: uuidv4(),
        copyData: this.node
      }
      this.mutation.SET_COPY_DATA(this.store, payload)
    },
    delNode() {
      if (this.node.node_relations.relations && this.node.node_relations.relations.length > 0) {
        console.log('含子节点的节点不能删除')
        return
      }
      const payload = this.childRelations.filter(item => item.uuid === this.node.node_info.node_uuid)[0]
      this.mutation.DEL_NODE(this.store, payload)
    },
    addNormal() {
      const payload = {
        levelOfFlow: this.levelOfFlow,
        indexOfLevelNode: this.indexOfLevelNode,
        id: uuidv4()
      }
      this.mutation.ADD_NORMAL_NODE(this.store, payload)
    },
    addJump() {
      const payload = {
        levelOfFlow: this.levelOfFlow,
        indexOfLevelNode: this.indexOfLevelNode,
        id: uuidv4()
      }
      this.mutation.ADD_JUMP_NODE(this.store, payload)
    },
    pasteNode() {
      if (!this.currentCopy) {
        console.log('暂未复制节点，请先复制')
        return
      }
      const payload = {
        levelOfFlow: this.levelOfFlow,
        indexOfLevelNode: this.indexOfLevelNode,
        id: uuidv4()
      }
      this.mutation.PASTE_NODE(this.store, payload)
    }
  }
}
</script>
<style soped>
.node-wrapper:hover {
  top: -2px;
  transition: all 0.3s;
  box-shadow: 0 0 8px #9b9a9a;
}
.node-wrapper {
  box-sizing: border-box;
  width: 100%;
  padding: 12px;
  background-color: white;
  border-radius: 8px;
  top: 0;
  box-shadow: 0 0 4px #c5c4c4;
}
.node-wrapper-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: 500;
  color: #363636;
  font-size: 16px;
  float: left;
  max-width: 52%;
}
.node-wrapper-operator {
  float: right;
}
.node-wrapper header {
  box-sizing: border-box;
  border-bottom: 1px solid #dddada;
  width: calc(100% - 24px);
  height: 40px;
  line-height: 40px;
  position: absolute;
  top: 0;
}
.node-wrapper header button {
  padding: 4px;
}
.node-wrapper .node-content {
  box-sizing: border-box;
  padding: 4px 0;
  width: calc(100% - 24px);
  /* height: calc(100% - 80px); */
  position: absolute;
  top: 40px;
  overflow-y: auto;
  overflow-x: hidden;
  bottom: 40px;
}
.node-wrapper footer {
  box-sizing: border-box;
  border-top: 1px solid #dddada;
  width: calc(100% - 24px);
  height: 40px;
  line-height: 40px;
  position: absolute;
  bottom: 0;
}
</style>
