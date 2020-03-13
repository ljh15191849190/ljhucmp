<template lang="pug">
    div.org-tree(v-clickoutside="handleClickOutSide")
        div(@click="inputClick")
            el-input(:placeholder="placeholder" 
                size="small"
                readonly
                v-model="selectedLabel"
                :name="name"
                suffix-icon="el-icon-arrow-down"
                :class="{'is-danger': isDanger}"
                @blur="handleBlur"
            )
        div.filter-container(v-show="isShowTree")
            el-input(placeholder="请搜索组织机构" 
                size="small"
                v-model="searchLable"
                clearable
                :name="name"
            )
            el-tree.filter-tree.margin-top(
                show-checkbox
                :check-strictly="true"
                :data="nodeTreeData"
                :props="defaultProps"
                :highlight-current="isHighlight"
                :default-expanded-keys="defaultExpKeys"
                :default-checked-keys="selectNodes"
                :node-key="defaultProps.id"
                @check="nodeCheck"
                ref="orgTree"
                element-loading-spinner="ucmp-icon-loading"
                :expand-on-click-node="false"
                :filter-node-method="filterNode"
            )
                span.custom-tree-node(slot-scope="{ node, data }")
                    span.custom-tree-node(v-if="data[defaultProps.children] && data[defaultProps.children].length")
                        span
                            span
                                i.org.ucmp-icon-device-org
                            span {{node.label}}
                        span
                            el-checkbox(v-model="data.checked" @change="nodeCheckAll(data)") 全选
                    span(v-else)
                        span
                        i.org.ucmp-icon-device-org
                        span {{node.label}}
                        span.icon

</template>

<script>
/**
 * @description 通用组件：组织机构
 * @augments [placeholder] 输入对象(placeholder省略文本)
 * @augments [defaultProps] 下拉树属性配置
 * @augments [treeData] 下拉树绑定的数据
 * @author davidPan
 */
import clickoutside from 'element-ui/lib/utils/clickoutside'
export default {
    name: 'OrgTree',
    props: {
        placeholder: {
            type: String,
            default: '请选择'
        },
        selectNodes: {
            type: Array,
            default: () => []
        },
        treeData: {
            type: Array,
            default: []
        },
        isDanger: {
            type: Boolean,
            default: false
        },
        name: {
            type: String
        },
        defaultProps: {
            type: Object,
            default: () => {
                return {
                    id: 'id',
                    parentId: 'parent_id',
                    children: 'sub_orgs',
                    label: 'org_name'
                }
            }
        }
    },
    data () {
        return {
            isHighlight: true,
            defaultExpKeys: [],
            selectedLabel: '',
            isShowTree: false,
            checked: true,
            nodeTreeData: [],
            selectNodeIds: [],
            isInit: false,
            searchLable: ''
        }
    },
    methods: {
        init () {
            this.isInit = true
            this.nodeTreeData = JSON.parse(JSON.stringify(this.treeData))
            this.initNodeTree(this.nodeTreeData)
            this.defaultExpKeys = [this.nodeTreeData[0][this.defaultProps.id]]
        },
        /**
         * @description 初始化节点数据
         */
        initNodeTree (nodeTreeData) {
            for (let i = 0; i < nodeTreeData.length; i++) {
                if (nodeTreeData[i][this.defaultProps.children] && nodeTreeData[i][this.defaultProps.children].length) {
                    this.$set(nodeTreeData[i], 'checked', false)
                    this.initNodeTree(nodeTreeData[i][this.defaultProps.children])
                }
            }
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
            this.isShowTree = !this.isShowTree
        },
        /**
         * @description 点击外部元素事件
         */
        handleClickOutSide () {
            this.isShowTree = false
        },
        /**
         * @description 设置input显示
         */
        setSelectNodesDisplay (checkedNodes, isInit = false) {
            if (!checkedNodes || !checkedNodes.length)
                this.selectedLabel = ''
            else {
                this.selectedLabel = checkedNodes.reduce((result, item, idx, arr) => {
                    result += item[this.defaultProps.label]
                    if (idx !== arr.length - 1)
                        result += ', '
                    return result
                }, '')
            }
            
            this.$emit('input', this.selectedLabel)
            if (!isInit)
                this.handleBlur()
        },
        /**
         * @description 单选事件
         */
        nodeCheck (data, node) {
            this.$emit('update:selectNodes', node.checkedKeys)
        },
         /**
         * @description 全选事件
         */
        nodeCheckAll (data) {
            this.selectNodeIds = this.$refs.orgTree.getCheckedKeys()
            this.allNodeCheckEvent(data)
            this.$emit('update:selectNodes', this.selectNodeIds)
        },
        /**
         * @description 全选事件
         */
        allNodeCheckEvent (data) {
            if (!data) return
            if (data.checked === false) 
                this.removeSelectNodes(data)
            else 
                this.addSelectNodes(data)
        },
        /**
         * @description 添加选中的节点
         */
        addSelectNodes (data) {
            if (data.checked === false) data.checked = !data.checked
            let selectNodeIds = [...this.selectNodeIds, data[this.defaultProps.id]]
            this.selectNodeIds = [...new Set(selectNodeIds)]
            for (let i = 0; data[this.defaultProps.children] && i < data[this.defaultProps.children].length; i++) 
                this.addSelectNodes(data[this.defaultProps.children][i])
        },
        /**
         * @description 去除选中的节点
         */
        removeSelectNodes (data) {
            if (data.checked) data.checked = !data.checked
            let findIdIndex = this.selectNodeIds.findIndex(item => item === data[this.defaultProps.id])
            if (findIdIndex > -1)
               this.selectNodeIds.splice(findIdIndex, 1)
            
            for (let i = 0; data[this.defaultProps.children] && i < data[this.defaultProps.children].length; i++) 
                this.removeSelectNodes(data[this.defaultProps.children][i])
        },
        filterNode (value, data) {
            if (!value) 
                return true
            return data[this.defaultProps.label].indexOf(value) !== -1
        }
    },
    created () {
        this.init()
    },
    watch: {
        'selectNodes.length': {
            handler (newVal) {
                this.$nextTick(() => {
                    this.$refs.orgTree.setCheckedKeys(this.selectNodes)
                    let checkedNodes = this.$refs.orgTree.getCheckedNodes()
                    this.setSelectNodesDisplay(checkedNodes, this.isInit)
                    // UCMP3-4726【配置模板】新建配置模板，先不选择组织机构，提示“组织机构不能为空”，但再勾选了组织信息后，提示信息仍存在
                    // 问题原因：修改此处的bug代码引入
                    this.isInit = false
                })
            },
            immediate: true
        },
        searchLable (val) {
            this.$refs.orgTree.filter(val)
        }
    },
    directives: {
        clickoutside
    }
}
</script>

<style lang="scss" scoped>
</style>

