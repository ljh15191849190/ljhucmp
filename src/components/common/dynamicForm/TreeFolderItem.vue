<template lang="pug">
div.input-tree(v-clickoutside="handleClickOutSide")
	div.input-folder(@click="inputClick")
		el-input.folder-input(placeholder="请选择"
			size="small"
			readonly
			v-model="selectedLabel"
            :suffix-icon="selectedLabel ? 'el-icon-circle-close' : 'el-icon-arrow-down'"
            clearable
            :disabled="disabled"
		)
	div.filter-container(v-if="isShowTree")
		el-tree.filter-tree(
			:data="list"
			:props="configTree.defaultProps"
			:render-content="renderContent"
			:highlight-current="isHighlight"
			:node-key="configTree.nodeKey"
			@node-click="treeNodeClick"
			ref="configTree"
			:expand-on-click-node="false"
			:default-expand-all="configTree.expandAll"
			:current-node-key="currentNodeKey"
            :default-expanded-keys="defaultExpandKeys"
		)
</template>

<script>
import clickoutside from 'element-ui/lib/utils/clickoutside'
export default {
    props: {
        value: {
            type: Array,
            default: () => []
        },
        uniqueKey: {
            type: String,
            default: () => 'key'
        },
        display: {
            type: String,
            default: () => ''
        },
        formItem: {
            type: Object,
            default: function () {
                return {}
            }
        },
        list: {
            type: Array,
            default: () => []
        },
        disabled: {
            type: Boolean,
            default: () => false
        }
    },
    data () {
        return {
            isShowTree: false,
            // 选中后高亮
            isHighlight: true,
            selectedLabel: '',
            defaultExpandKeys: [],
            parent: null,
            // 树配置
            configTree: {
                defaultProps: {
                    children: 'children',
                    label: 'label'
                },
                nodeKey: 'id',
                parentKey: 'parent_id'
            }
        }
    },
    created () {
        this.init()
    },
    methods: {
        /**
         * 初始化操作
         */
        init () {
            // 初始化树配置
            if (this.formItem.configTree) 
                this.configTree = this.formItem.configTree
            // 如果有nodeId, 获取选中的名称
            this.getSelectNode(this.list)
        },
        /**
         * 递归找选中的节点
         */
        getSelectNode (list) {
            if (!this.value || !list || !list.length) return 
            for (let index = 0; index < list.length; index++) {
                const node = list[index]
                if (node[this.configTree.defaultProps.children].length) {
                    this.parent = node
                    this.getSelectNode(node[this.configTree.defaultProps.children])
                }
                if (node[this.configTree.nodeKey] === this.value[0]) {
                    this.defaultExpandKeys = []
                    if (node[this.configTree.parentKey] && this.parent) {
                        this.defaultExpandKeys.push(this.parent[this.configTree.nodeKey])
                        this.parent = null
                    }
                    this.selectedLabel = node[this.configTree.defaultProps.label]
                    break
                }
            }
        },
        /**
         * @description 输入框点击事件
         */
        inputClick (e) {
            if (this.disabled) return
            if (e.target.tagName === 'I') {
                // 清除
                this.clear()
                return
            }
            this.isShowTree = !this.isShowTree
        },
        /**
         * @description 点击外部元素事件
         */
        handleClickOutSide () {
            this.isShowTree = false
        },
        // 树渲染特殊处理
        renderContent (h, {node}) {
            let spanLabel = <i class="ucmp-icon-quota-close-file"/>
            if (node.expanded)
                spanLabel = <i class="ucmp-icon-quota-open-file"/>

            return (
                <span>
                    {spanLabel}
                    <span class="range-margin-left"> {node.label}</span>
                </span>
            )
        },
        // 树节点点击时处理(保存选择树的id和类型)
        treeNodeClick (node, data) {
            data = data.data
            this.selectedLabel = data[this.configTree.defaultProps.label]
            this.$emit('update:value', [data[this.configTree.nodeKey]])
            this.$emit('update:display', this.selectedLabel)
            this.getSelectNode(this.list)
        },
        clear () {
            this.selectedLabel = ''
            this.$emit('update:value', null)
            this.$emit('update:display', this.selectedLabel)
        }
    },
    directives: {clickoutside},
    computed: {
        currentNodeKey () {
            return (this.value && this.value[0]) || ''
        }
    },
    watch: {
        list: {
            deep: true,
            handler (newObj, oldObj) {
                this.getSelectNode(this.list)
            }
        },
        value: {
            deep: true,
            handler (newObj, oldObj) {
                if (newObj)
                    this.getSelectNode(this.list) 
                else
                    this.clear()
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.filter-container {
    width: 100%;
    max-width: 480px;
}
.folder-input {
    .el-icon-circle-close {
        display: none;
    }
    &:hover {
        .el-icon-arrow-down {
            display: none;
        }
        .el-input__icon {
            cursor: pointer;
        }
    }
}
</style>