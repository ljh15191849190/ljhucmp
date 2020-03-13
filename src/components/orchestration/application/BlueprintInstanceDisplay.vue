<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        OrchestrateDiagram.full-container(
            slot="content"
            ref="diagram"
            v-loading="loading"
            element-loading-text="拓扑图加载中"
            element-loading-spinner-category="config"
            :blueprintId="$route.params._service_code"
            :checkedNode.sync="checkedNode"
            :showConfig.sync="showConfig"
            :defaultResources.sync="defaultResources"
            :defaultLinks.sync="defaultLinks"
            :groupsConfigs="defaultGroups"
            :rootId="rootId"
            :canNestNodeRule="canNestNodeRule"
            :configs.sync="configs"
            :editDisabled="editDisabled"
            :treeObj="defaultBpTreeObjData"
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
import Api from '@api'
import MetadataUtils from '@server/metadata.utils'
import GetBlueprintDiagram from '@mixins/blueprintDiagram.mixin'

export default {
    mixins: [GetBlueprintDiagram],
    data () {
        return {
            defaultBpTreeObjData: {},
            defaultResources: [],
            configs: {},
            defaultLinks: []
        }
    },

    methods: {
        getBpInstanceData () {
            let params = {}
            params.service = this.$route.params._service_code
            params.instanceId = this.$route.params._id
            Api.get('serviceInstanceDetail', params, true).then(
                res => {
                    if (res && res.template)
                        this.defaultBpTreeObjData = res.template
                }
            )
        },

        initBpDetail () {
            this.checkedMetadata = MetadataUtils.getCheckedMeta(this.metadata, this.$route.params._service_code)
            this.getBpInstanceData()
        },

        nodeClick (d) {
            if (d.data.info.group !== 'blueprint')
                this.$router.push('/' + d.data.info.service_code + '/instanceDetail/' + d.data.id)
            else
                this.$router.push('/' + d.data.info.service_code + '/bp_detail/' + d.data.id)
        }
    },

    computed: {
        breadcrumbItems () {
            // bug UCMP-1634【应用服务】点击到蓝图实例详情页面，然后切换到系统管理再切换回企业通用云管理平台，蓝图实例详情页面的面包屑显示为“undefined”，点击跳转报错
            this.checkedMetadata.name === undefined && (this.checkedMetadata = MetadataUtils.getCheckedMeta(this.metadata, this.$route.params._service_code))
            let blueprint_name = this.$route.query.name
            return [
                { prop: '/serviceInstance/blueprint', label: '应用服务' },
                { label: this.checkedMetadata.name + '管理', prop: '/serviceInstance/' + this.checkedMetadata.service_code, query: {type: 'blueprint'} },
                { prop: this.checkedMetadata.service_code + '_detail', label: blueprint_name + '详情' }
            ]
        }
    },

    watch: {
        '$route.params._service_code' () {
            this.initBpDetail()
        },

        '$route.params._id' () {
            this.initBpDetail()
        }
    },

    created () {
        this.rootId = 'null'
        this.initBpDetail()
        // 获取编排分层信息
        this.getBlueprintGroups()
    }
}
</script>

<style lang="scss" scoped>

</style>
