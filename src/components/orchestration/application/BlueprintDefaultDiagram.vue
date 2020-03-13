<template lang="pug">
    OrchestrateDiagram.full-container(
        slot="content"
        ref="diagram"
        v-loading="loading"
        element-loading-text="拓扑图加载中"
        element-loading-spinner-category="config"
        :blueprintId="serviceCode"
        :checkedNode.sync="checkedNode"
        :showConfig.sync="showConfig"
        :defaultResources.sync="diagramDefaultNodes"
        :defaultLinks.sync="diagramLinks"
        :groupsConfigs="defaultGroups"
        :rootId="rootId"
        :canNestNodeRule="canNestNodeRule"
        :configs.sync="diagramConfigs"
        :editDisabled="editDisabled"
        :treeObj="defaultBpResources"
        @nodeClick="nodeClick"
        @getDiagramObj="getDiagramObj"
        @getViewportDom="getViewportDom"
        :linkConfigs="linkConfigs"
    )
        IconButton.canvas-btn(
            slot="moreCanvasBtns"
            v-for="(oper, index) in operations"
            :key="oper.type"
            :class="['canvas-btn-' + oper.type, !index ? 'margin-left' : '']"
            :type="oper.icon"
            :text="oper.title"
            @iconClick="handleOper(oper.type)"
        )
</template>
<script>
import GetBlueprintDiagram from '@mixins/blueprintDiagram.mixin'

export default {
    mixins: [GetBlueprintDiagram],
    props: {
        defaultBpResources: {
            type: Object,
            default: () => {}
        },
        serviceCode: {
            type: String,
            default: ''
        },
        defaultResources: {
            type: Array,
            default: []
        },
        defaultLinks: {
            type: Array,
            default: []
        },
        configs: {
            type: Object,
            default: () => {}
        }
    },
    data () {
        return {}
    },

    methods: {
        nodeClick (d) {
            this.$emit('nodeClick', d)
        }
    },

    computed: {
        diagramDefaultNodes: {
            get () {
                return this.defaultResources
            },
            set (resources) {
                this.$emit('update:defaultResources', resources)
            }
        },

        diagramConfigs: {
            get () {
                return this.configs
            },
            set (configs) {
                this.$emit('update:configs', configs)
            }
        },

        diagramLinks: {
            get () {
                return this.defaultLinks
            },
            set (links) {
                this.$emit('update:defaultLinks', links)
            }
        }
    },

    created () {
        this.rootId = 'null'
        // 获取编排分层信息
        this.getBlueprintGroups()
    }
}
</script>

<style lang="scss" scoped>

</style>
