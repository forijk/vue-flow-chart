# vue-flow-chart-better

`vue-flow-chart-better` is a simple and beautiful vue flow chart component that allows you to build and add custom flow chart to your sites.

Features: Custom node templates, mini map , add node, copy node, draggable node, beautiful line and so on.

**只需按照结构提供一个数组，即可拥有一个可配置的流程图**

**Just provide an array according to the structure to have a configurable flowchart**

## Demo

[vue-flow-chart-better-demo](https://forijk.github.io)

## Installation

```shell
$ yarn add vue-flow-chart-better
```

## Example

```javascript
import FlowChart from 'vue-flow-chart-better'
Vue.use(FlowChart)
```

```html
<template>
  <div>
    <FlowChart :flowData="flowData" :nodeWidth="280" :nodeHeight="174" :showFooter="true" :showContextmenu="true">
    <!-- 可自定义如下配置 -->
      <template v-slot:operator>
        <div class="operator-button">
          Click Save
        </div>
      </template>
      <template v-slot:node-name="scopedProps">
        {{ scopedProps.node.node_info.node_name }}
      </template>
      <template v-slot:node-content="scopedProps">
        {{ scopedProps.node.node_info.node_name }}
      </template>
      <template v-slot:top-right>
        <div class="operator" @click="handleEdit">编辑</div>
        <div class="operator">删除</div>
      </template>
      <template v-slot:bottom-left>
        😀
      </template>
      <template v-slot:bottom-right>
        <div class="operator">设置</div>
      </template>
    </FlowChart>
  </div>
</template>
```

```javascript
export default {
  name: "App",
  components: {
    FlowChart,
  },
  data() {
    return {
      flowData: [
        [
          {
            node_info: {
              node_name: "根节点根节点根节点根节点根节点根节点根节点根节点",
              node_uuid: "0",
            },
            node_relations: {
              relations: ["1", "2"],
            },
          },
        ],
        [
          {
            node_info: {
              node_name: "二级节点1二级节点1二级节点1二级节点1二级节点1二级节点1二级节点1二级节点1二级节点1二级节点1二级节点1二级节点1二级节点1二级节点1二级节点1二级节点1二级节点1二级节点1二级节点1二级节点1",
              node_uuid: "1",
            },
            node_relations: {
              relations: ["3"],
            },
          },
          {
            node_info: {
              node_name: "二级节点2",
              node_uuid: "2",
            },
            node_relations: {
              relations: ["4", "5"],
            },
          },
        ],
        [
          {
            node_info: {
              node_name: "三级节点1",
              node_uuid: "3",
            },
            node_relations: {
              relations: [],
            },
          },
          {
            node_info: {
              node_name: "三级节点2",
              node_uuid: "4",
            },
            node_relations: {
              relations: [],
            },
          },
          {
            node_info: {
              node_name: "三级节点3",
              node_uuid: "5",
            },
            node_relations: {
              relations: [],
            },
          },
        ],
      ],
    };
  },
  methods: {
    handleEdit() {
      console.log(this.flowData)
    },
  }
};
```

For more detailed examples see the demo folder.
