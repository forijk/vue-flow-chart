import Vue from 'vue'

const mutation = {
  SET_SHOW_MENU: (state, obj = {}) => {
    state.showMenu = obj
  },
  SET_COPY_DATA: (state, payload) => {
    state.copyData = JSON.parse(JSON.stringify(payload.copyData))
    state.copyData.node_info.node_uuid = payload.id
  },
  DEL_NODE: (state, payload) => {
    state.flowData[payload.levelOfFlow - 1][payload.parentLevelIndex].node_relations.relations.forEach(
      (item, index, arr) => {
        if (item === payload.uuid) {
          arr.splice(index, 1)
        }
      }
    )
    state.flowData[payload.levelOfFlow].splice(payload.indexOfLevelNode, 1)
  },
  ADD_NORMAL_NODE: (state, payload) => {
    // 赋值唯一 ID
    state.normalNode.node_info.node_uuid = payload.id
    state.normalNode.node_relations.node_uuid = payload.id

    const normalNode = JSON.parse(JSON.stringify(state.normalNode))
    state.normalCount++
    normalNode.node_info.node_name = '添加普通节点' + state.normalCount
    normalNode.node_relations.node_name = '添加普通节点' + state.normalCount
    // 插入节点 优化插入位置
    if (state.flowData[payload.levelOfFlow + 1]) {
      const ccurrentLevelFlowData = JSON.parse(JSON.stringify(state.flowData[payload.levelOfFlow]))
      const nextLevelFlowData = JSON.parse(JSON.stringify(state.flowData[payload.levelOfFlow + 1]))
      const newArr = []
      ccurrentLevelFlowData.forEach(item => {
        newArr.push(nextLevelFlowData.splice(0, item.node_relations.relations.length))
      })
      newArr.forEach((item, index) => {
        if (index === payload.indexOfLevelNode) {
          item.push(normalNode)
        }
      })
      state.flowData[payload.levelOfFlow + 1].splice(0, state.flowData[payload.levelOfFlow + 1].length)
      const tempArr = []
      newArr.forEach(item => {
        item.forEach(one => {
          tempArr.push(one)
        })
      })
      tempArr.forEach(item => {
        state.flowData[payload.levelOfFlow + 1].push(item)
      })
    } else {
      state.flowData.push([])
      state.flowData[payload.levelOfFlow + 1].push(normalNode)
    }
    // 先插入位置，再插入关系，否则关系数组的length会影响到插入位置
    // 插入节点关系
    const nodeRelations = state.flowData[payload.levelOfFlow][payload.indexOfLevelNode].node_relations
    if (nodeRelations.relations) {
      nodeRelations.relations.push(payload.id)
    } else {
      nodeRelations.relations = []
      nodeRelations.relations.push(payload.id)
    }
  },
  ADD_JUMP_NODE: (state, payload) => {
    // 赋值唯一 ID
    state.jumpNode.node_info.node_uuid = payload.id
    state.jumpNode.node_relations.node_uuid = payload.id

    const jumpNode = JSON.parse(JSON.stringify(state.jumpNode))
    state.jumpCount++
    jumpNode.node_info.node_name = '添加跳转节点' + state.jumpCount
    jumpNode.node_relations.node_name = '添加跳转节点' + state.jumpCount
    // jumpNode.node_info.node_name = '跳转节点'
    // jumpNode.node_relations.node_name = '跳转节点'
    // 插入节点 优化插入位置
    if (state.flowData[payload.levelOfFlow + 1]) {
      const ccurrentLevelFlowData = JSON.parse(JSON.stringify(state.flowData[payload.levelOfFlow]))
      const nextLevelFlowData = JSON.parse(JSON.stringify(state.flowData[payload.levelOfFlow + 1]))
      const newArr = []
      ccurrentLevelFlowData.forEach(item => {
        newArr.push(nextLevelFlowData.splice(0, item.node_relations.relations.length))
      })
      newArr.forEach((item, index) => {
        if (index === payload.indexOfLevelNode) {
          item.push(jumpNode)
        }
      })
      state.flowData[payload.levelOfFlow + 1].splice(0, state.flowData[payload.levelOfFlow + 1].length)
      const tempArr = []
      newArr.forEach(item => {
        item.forEach(one => {
          tempArr.push(one)
        })
      })
      tempArr.forEach(item => {
        state.flowData[payload.levelOfFlow + 1].push(item)
      })
    } else {
      state.flowData.push([])
      state.flowData[payload.levelOfFlow + 1].push(jumpNode)
    }
    // 先插入位置，再插入关系，否则关系数组的length会影响到插入位置
    // 插入节点关系
    const nodeRelations = state.flowData[payload.levelOfFlow][payload.indexOfLevelNode].node_relations
    if (nodeRelations.relations) {
      nodeRelations.relations.push(payload.id)
    } else {
      nodeRelations.relations = []
      nodeRelations.relations.push(payload.id)
    }
  },
  PASTE_NODE: (state, payload) => {
    // 赋值唯一 ID
    state.copyData.node_info.id = null
    state.copyData.node_info.node_id = null
    state.copyData.node_relations.node_id = null
    state.copyData.node_info.node_uuid = payload.id
    state.copyData.node_relations.node_uuid = payload.id
    // 清空自身的子节点关系
    state.copyData.node_relations.relations = []
    const copyData = JSON.parse(JSON.stringify(state.copyData))
    if (copyData.node_info.node_type === 'TRANSFER') {
      copyData.node_info.node_name = '跳转节点'
      copyData.node_relations.node_name = '跳转节点'
    } else {
      state.pasteCount++
      copyData.node_info.node_name = '复制节点' + state.pasteCount
      copyData.node_relations.node_name = '复制节点' + state.pasteCount
    }
    // 插入节点 优化插入位置
    if (state.flowData[payload.levelOfFlow + 1]) {
      const ccurrentLevelFlowData = JSON.parse(JSON.stringify(state.flowData[payload.levelOfFlow]))
      const nextLevelFlowData = JSON.parse(JSON.stringify(state.flowData[payload.levelOfFlow + 1]))
      const newArr = []
      ccurrentLevelFlowData.forEach(item => {
        newArr.push(nextLevelFlowData.splice(0, item.node_relations.relations.length))
      })

      newArr.forEach((item, index) => {
        if (index === payload.indexOfLevelNode) {
          item.push(copyData)
        }
      })
      state.flowData[payload.levelOfFlow + 1].splice(0, state.flowData[payload.levelOfFlow + 1].length)
      const tempArr = []
      newArr.forEach(item => {
        item.forEach(one => {
          tempArr.push(one)
        })
      })
      tempArr.forEach(item => {
        state.flowData[payload.levelOfFlow + 1].push(item)
      })
    } else {
      state.flowData.push([])
      state.flowData[payload.levelOfFlow + 1].push(copyData)
    }
    // 先插入位置，再插入关系，否则关系数组的length会影响到插入位置
    // 插入节点关系
    const nodeRelations = state.flowData[payload.levelOfFlow][payload.indexOfLevelNode].node_relations
    if (nodeRelations.relations) {
      nodeRelations.relations.push(payload.id)
    } else {
      nodeRelations.relations = []
      nodeRelations.relations.push(payload.id)
    }
  }
}

export default Vue.observable(mutation)
