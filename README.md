# ucmp-vue-ui

> ucmp-vue-ui

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

## Basic skills
1. vue.js、vue-router、vuex
2. ES6 module system、arrow function
3. webpack basic concept & config
4. Element UI

## 组件规范
1. 目前有 UcmpContainer、UcmpTableContainer、OperatorPanel 等基础布局组件，为保障页面布局的统一，任何新页面均应在 UcmpContainer 或 UcmpTableContainer 的组件进行开发。需要注意的是，UcmpContainer和UcmpTableContainer已经在全局引入，不需要再次引入。
2. 原则上一个组件的Dom不应超过 100行，如果超过，应该考虑创建子组件；
3. 组件模板统一使用pug

## 样式规范
1. 设计颜色的样式请在sass文件夹的内容下进行维护，不要图方便，卸载组件内部；
2. 组件内部使用的样式，不想影响其他组件，应卸载组件的style标签里，且加上scoped属性；
3. 具有通用性的样式尽量写在_component.scss里，如果具有极强的业务含义，请写在modules下面对应的scss文件中，该目录下的文件应该与ucmp最大的业务模块挂钩，如控制台是_console.scss

## 公共组件
1. InputTree(输入下拉树组件)
参数说明：inputValue 输入框显示文本; placeholder 省略文本; defaultProps 树的默认配置 
treeData 绑定数据; @nodeClick 点击子节点事件
用法实例: InputTree(:inputValue="name" :placeholder="placeHolder", :defaultProps="defaultProps" 
                   :treeData="treeData" @nodeClick="nodeClick")

2. ColorPicker(输入下拉树组件)
参数说明：selectedColor 选中的颜色; selColors 颜色数组; selectedColorEvent 选择颜色事件 
用法实例: ColorPicker(:selectedColor="selectedColor" :selColors="selColors" @selectedColorEvent="selectedColorEvent")
