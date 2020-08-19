import Vue from 'vue'

const flowData = [
  [
    {
      node_info: {
        node_name: '根节点',
        node_uuid: '0'
      },
      node_relations: {
        relations: ['1', '2']
      }
    }
  ],
  [
    {
      node_info: {
        node_name: '二级节点1',
        node_uuid: '1'
      },
      node_relations: {
        relations: ['3']
      }
    },
    {
      node_info: {
        node_name: '二级节点2',
        node_uuid: '2'
      },
      node_relations: {
        relations: ['4', '5']
      }
    }
  ],
  [
    {
      node_info: {
        node_name: '三级节点1',
        node_uuid: '3'
      },
      node_relations: {
        relations: []
      }
    },
    {
      node_info: {
        node_name: '三级节点2',
        node_uuid: '4'
      },
      node_relations: {
        relations: []
      }
    },
    {
      node_info: {
        node_name: '三级节点3',
        node_uuid: '5'
      },
      node_relations: {
        relations: []
      }
    }
  ]
]

const normalNode = {
  node_info: {
    node_name: '普通节点',
    node_uuid: ''
  },
  node_relations: {
    relations: []
  }
}
const jumpNode = {
  node_info: {
    node_name: '跳转节点',
    node_uuid: ''
  },
  node_relations: {
    relations: []
  }
}
const pasteCount = 0
const normalCount = 0
const jumpCount = 0
const copyData = {}
const showMenu = {}

export default Vue.observable({
  flowData,
  normalNode,
  jumpNode,
  pasteCount,
  normalCount,
  jumpCount,
  copyData,
  showMenu
})
