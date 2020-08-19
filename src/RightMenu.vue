<template>
  <div v-if="show" class="menu-style" :style="{ top: y + 'px', left: x + 'px' }">
    <ul>
      <li
        @click="
          () => {
            $emit('copy')
          }
        "
      >
        <span class="copy-button" type="link">复制</span>
      </li>
      <li
        @click="
          () => {
            $emit('add')
          }
        "
      >
        <span class="copy-button" type="link">添加节点</span>
      </li>
      <!-- <li
        @click="
          () => {
            $emit('add-jump')
          }
        "
      >
        <span class="copy-button" type="link">添加跳转节点</span>
      </li> -->
      <li
        @click="
          () => {
            $emit('paste-node')
          }
        "
      >
        <span class="copy-button" type="link">粘贴子节点</span>
      </li>
      <li
        @click="
          () => {
            $emit('del')
          }
        "
      >
        <span class="copy-button" type="link">删除</span>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'RightMenu',
  props: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    showMenu: {
      type: Boolean,
      default: false
    },
    node: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      show: false
    }
  },
  methods: {
    closeMenu(e) {
      this.show = false
      this.$emit('close', false)
    }
  },
  watch: {
    // 监听，保持显示状态与父元素一致
    showMenu(val) {
      this.show = val
    }
  }
}
</script>
<style scoped>
.menu-style {
  z-index: 100;
  position: absolute;
  width: 116px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 2px 2px 14px #d0d0d0;
}
.menu-style ul {
  margin: 0;
  padding: 0;
}
.menu-style ul li {
  list-style: none;
  cursor: pointer;
  line-height: 32px;
  height: 32px;
  padding-left: 14px;
  border-bottom: 1px dashed #f0f0f0;
}
.menu-style ul li .copy-button {
  font-size: 12px;
  text-align: left;
  width: 100%;
  color: #409eff;
}
.menu-style ul li:hover {
  background: #e0eeff;
}
</style>
