<template lang="pug">
    div.input-tree(v-clickoutside="handleClickOutSide")
        div(@click="inputClick")
            el-input(placeholder="请选择"
                :disabled="disabled"
                size="small"
                v-model="selectedLabel"
                :placeholder="placeholder"
                :name="name"
                suffix-icon="el-icon-arrow-down"
                :class="{'is-danger': isDanger}"
                clearable
                @blur="handleBlur"
                @clear.prevent="inputClear"
            )
        div.filter-container(v-show="isShowTree")
            el-tree.filter-tree(
                :disabled="disabled"
                :props="defaultProps"
                :data="treeData"
                :default-expand-all="expandAll"
                @node-click="nodeOnClick"
                :highlight-current="true"
                :render-content="renderContent"
                ref="tree"
                :filter-node-method="filterNode"
            )
</template>

<script>
/**
 * @description 通用组件：输入框-下拉树
 * @augments [inputObj] 输入对象(value值; placeholder省略文本)
 * @augments [defaultProps] 下拉树属性配置
 * @augments [treeData] 下拉树绑定的数据
 * @author davidPan
 */
import clickoutside from 'element-ui/lib/utils/clickoutside'
export default {
    name: 'InputTree',
    props: ['inputObj', 'defaultProps', 'treeData', 'isDanger', 'name', 'placeholder', 'value', 'expandAll', 'disabled'],
    data () {
        return {
            // value: '',
            selectedLabel: '',
            isShowTree: false
        }
    },
    methods: {
        /**
         * @description node节点点击事件
         */
        nodeOnClick (data, node) {
            // this.selectedLabel = this.defaultProps.label ? data[this.defaultProps.label] : data
            this.$emit('input', data)
            this.isShowTree = false
            
            // 兼容旧的赋值形式
            this.$emit('nodeClick', data)
            this.handleBlur()
        },
        handleBlur (event) {
            setTimeout(() => {
                this.$emit('blur')
            }, 50)
        },
        /**
         * @description 输入框点击事件
         */
        inputClick () {
            if (this.disabled)
                return
            this.isShowTree = !this.isShowTree
        },
        /**
         * @description 点击外部元素事件
         */
        handleClickOutSide () {
            this.isShowTree = false
        },
        /**
         * @description 渲染tree
         */
        renderContent (h, { node, data, store }) {
            let rst = null
            let children = this.defaultProps.children
            if (data[children] && data[children].length) {
                rst = (
                    <span>
                        <span>
                        <i class={'org ucmp-icon-device-org'}></i>
                        </span>
                        <span>{node.label}</span>
                    </span>
                )
            } else {
                rst = (
                    <span>
                        <span>
                        <i class={'org ucmp-icon-device-org'}></i>
                        </span>
                        <span>{node.label}</span>
                        <span class="icon">
                        </span>
                    </span>
                )
            }

            return rst
        },
        /**
         * 给组织树赋默认值
         */
        initNodeData (treeData) {
            // 如果当前treeData只有一级数据的话, 则默认选中当前数据
            if (this.getNodeCount(treeData) === 1) {
                let data = {}
                let originData = treeData[0]
                for (let key in this.defaultProps) 
                    data[this.defaultProps[key]] = originData[this.defaultProps[key]]
                
                this.$nextTick(() => {
                    this.nodeOnClick(data)
                })
            }
        },
        getNodeCount (treeData) {
            let _getNodeCount = (treeData) => {
                if (Array.isArray(treeData) && treeData.length) {
                    return treeData.reduce((acc, item) => {
                        let computedCount = acc + 1 + _getNodeCount(item[this.defaultProps.children])
                        return computedCount 
                    }, 0)
                } else
                    return 0
            }
            return _getNodeCount(treeData)
        },
        filterNode (value, data) {
            if (!value) 
                return true
            return data[this.defaultProps.label].indexOf(value) !== -1
        },
        inputClear () {
            this.$emit('input', null)
        }
    },
    watch: {
        value (newVal, oldVal) {
            if (newVal) {
                //
                this.selectedLabel = this.defaultProps.label ? newVal[this.defaultProps.label] : newVal
            } else {
                //
                this.selectedLabel = null
            }
        },
        treeData: {
            deep: true,
            handler (newVal, oldVal) {
                this.initNodeData(newVal)
            }
        },
        selectedLabel (val) {
            this.$refs.tree.filter(val)
        }
    },
    created () {
        // // 兼容旧的赋值形式
        // if (this.inputObj.value) {
        //     //
        //     this.selectedLabel = this.inputObj.value
        // } else if (this.value) {
        //     // 新的初始赋值
        //     this.selectedLabel = this.defaultProps.label ? this.value[this.defaultProps.label] : this.value
        // }
        this.initNodeData(this.treeData)
        if (this.value) 
            this.selectedLabel = this.defaultProps.label ? this.value[this.defaultProps.label] : this.value
    },
    directives: {
        clickoutside
    }
}
</script>

<style lang="scss" scoped>
</style>


