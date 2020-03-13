<template lang="pug">
div.hierarchical-digram-container
    div.left-navbar.border-right
        DiagramNodesNavbar(
            :navbars="navbars"
            :adding_node.sync="adding_node"
            :uniqueKey="uniqueKey"
            :label="label"
        )
    div.right-canvas
        HierarchicalDiagram(
            ref="diagram"
            :defaultNodes="defaultNodes"
            :defaultLinks="defaultLinks"
            :icons="icons"
            :defaultIcon="defaultIcon"
            :rootId="rootId"
            :containerKeys="containerKeys"
            :canNestNodeRule="canNestNodeRule"
            :linkReferences="linkReferences"
            :findReferencedNode="findReferencedNode"
            :findParentNode="findParentNode"
            :beforeAddLink="beforeAddLink"
            :uniqueKey="uniqueKey"
            :keyboardFire="keyboardFire"
            :label="label"
            :adding_node.sync="adding_node"
            :allowWheelZoom="allowWheelZoom"
            :groupsConfigs="groupsConfigs"
            :nodeDefaultPadding="nodeDefaultPadding"
            :gridSwitch="gridSwitch"
            :nodeDefaultSize="nodeDefaultSize"
            :enableEdit="enableEdit"
            :tipConfiguration="tipConfiguration"
            @nodeClick="nodeClick"
            @beforeClone="beforeClone"
            @afterClone="afterClone"
            @AddNodeToGroup="AddNodeToGroup"
            @groupClick="groupClick"
            @linkClick="linkClick"
            @beforeAddNode="beforeAddNode"
            @afterNested="afterNested"
            @clickCanvas="clickCanvas"
            @beforeDeleteNode="beforeDeleteNode"
            @afterDeleteNode="afterDeleteNode"
            @beforeDeleteLink="beforeDeleteLink"
            @afterDeleteLink="afterDeleteLink"
            @getDiagramObj="getDiagramObj"
            @getViewportDom="getViewportDom"
        )
            slot(name="moreCanvasBtns" slot="moreCanvasBtns")
</template>
<script>
import DiagramNodesNavbar from './DiagramNodesNavbar'
import HierarchicalDiagram from './HierarchicalDiagram'

export default {
    props: {
        // 容器节点key集合
        containerKeys: {
            type: Array,
            default: function () {
                return []
            }
        },

        // 节点唯一标志
        uniqueKey: {
            type: String,
            default: function () {
                return 'key'
            }
        },

        // 左侧资源节点集合
        navbars: {
            type: Array,
            default: function () {
                return []
            }
        },

        // 节点显示名称的key值(嵌套关系使用.代替)
        label: {
            type: String,
            default: function () {
                return 'label'
            }
        },

        // 左侧资源列表默认显示icon集合({key: icon})
        icons: {
            type: Object,
            default: function () {
                return {}
            }
        },

        // 左侧资源列表默认显示icon
        defaultIcon: {
            type: String,
            default: function () {
                return 'icon'
            }
        },

        // 画布中节点集合，双向绑定，亦做节点初始化使用 [必须]
        defaultNodes: {
        type: Array,
            default: function () {
                return []
            } 
        },

        // 画布中节点连线集合，双向绑定，亦做节点连线初始化使用 [必须]
        defaultLinks: {
            type: Array,
            default: function () {
                return []
            }
        },

        // 虚拟根节点的id
        rootId: {
            type: String
        },

        linkReferences: {
            type: Function,
            default: function () {
                return []
            }
        },

        findReferencedNode: {
            type: Function,
            default: function () {
                return false
            }
        },

        findParentNode: {
            type: Function,
            default: function () {
                return false
            }
        },

        // validate the checked node can be nested in the hovered node according to the user defined rules
        canNestNodeRule: {
            type: Function,
            default: function () {
                return false
            }
        },

        // all nodes default size
        nodeDefaultSize: {
            type: Object,
            default: function () {
                return {
                    container: {
                        width: 140,
                        height: 180
                    },
                    normal: {
                        width: 100,
                        height: 100
                    }
                }
            }
        },

        // nested container node padding size
        nodeDefaultPadding: {
            type: Array,
            default: []
        },

        // if Keyboard delete fired
        keyboardFire: {
            type: Boolean,
            default: false
        },

        beforeAddLink: {
            type: Function,
            default: function () {
                return false
            }
        },

        scaleExtent: {
            type: Array,
            default: function () {
                return [1 / 2, 4]
            }
        },

        allowWheelZoom: {
            type: Boolean
        },

        groupsConfigs: {
            type: Object,
            default: function () {
                return {}
            }
        },
        editMode: Boolean,
        tipConfiguration: Object
    },

    data () {
        return {
            adding_node: null,
            gridSwitch: true,
            enableEdit: true // UCMP3-3371 默认编辑模式
        }
    },

    methods: {
        nodeClick (d) {
            this.$emit('nodeClick', d)
        },

        beforeClone (sourceId, targetId) {
            this.$emit('beforeClone', sourceId, targetId)
        },

        afterClone (clonedNode) {
            this.$emit('afterClone', clonedNode)
        },
        
        groupClick (d) {
            this.$emit('groupClick', d)
        },

        linkClick (d) {
            this.$emit('linkClick', d)
        },

        AddNodeToGroup (node, group_id) {
            this.$emit('AddNodeToGroup', node, group_id)
        },

        beforeAddNode (adding_node, parentNode, coors, addNode) {
            this.$emit('beforeAddNode', adding_node, parentNode, coors, addNode)
        },

        afterNested (adding_node, hovered_node) {
            this.$emit('afterNested', adding_node, hovered_node)
        },

        clickCanvas () {
            this.$emit('clickCanvas')
        },

        beforeDeleteNode (checked_node, checkedNodeObj) {
            this.$emit('beforeDeleteNode', checked_node, checkedNodeObj)
        },

        afterDeleteNode (checked_node) {
            this.$emit('afterDeleteNode', checked_node)
        },
         
        beforeDeleteLink (checked_link, checkedLinkObj) {
            this.$emit('beforeDeleteLink', checked_link, checkedLinkObj)
        },

        afterDeleteLink (checked_link) {
            this.$emit('afterDeleteLink', checked_link)
        },

        getDiagramObj (vm) {
            this.$emit('getDiagramObj', vm)
        },

        getViewportDom (dom) {
            this.$emit('getViewportDom', dom)
        }
    },

    components: {
        DiagramNodesNavbar,
        HierarchicalDiagram
    }
}
</script>
<style lang="scss" scoped>

</style>
