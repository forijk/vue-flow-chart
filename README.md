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
// main.js
import FlowChart from 'vue-flow-chart-better'
Vue.use(FlowChart)
```

```html
<template>
  <div class="content">
      <div class="button" @click="handleClick">点击更改 flowData 示例</div>
      <FlowChart :flowData="flowData" :nodeWidth="320" :nodeHeight="180" :showFooter="true" :showContextmenu="true">
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
      <p><a href="https://github.com/forijk/vue-flow-chart" target="_blank">README</a></p>
      <p><strong>vue-flow-chart-better</strong> by forijk</p>
    </div>
</template>
```

```javascript
export default {
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
    handleClick() {
      // 操作 flowData 示例
      if (this.flowData.length === 3 && this.flowData[2].length > 1) {
        this.flowData[2].splice(this.flowData[2].length - 1, 1)
        this.flowData[1][1].node_relations.relations.splice(this.flowData[1][1].node_relations.relations.length - 1, 1)
      }
    }
  }
};
```

```css
.content {
  height: 700px;
  width: 1200px;
}
.button {
  cursor: pointer;
  color: #409EFF;
  margin-bottom: 20px;
}
.operator {
  display: inline-block;
  margin-left: 4px;
  cursor: pointer;
}
```

For more detailed examples see the demo folder.

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
