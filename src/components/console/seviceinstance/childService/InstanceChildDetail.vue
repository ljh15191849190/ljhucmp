<template lang="pug">
    div.full-container
        InstanceChildSnapshotDetail(
            v-if="checkedMetadata && checkedMetadata.service_code === 'ecs_snapshot'"
            :checkedMetadata="checkedMetadata"
            :originData="tableData"
            :columns="columns"
            @updateChildServiceInstances="getChildServiceInstances"
        )
        UcmpTableContainer(
            :advance="advanceSwitch"
            :noResizeSync="noResizeSync"
            v-else-if="checkedMetadata && (!checkedMetadata.related_service || checkedMetadata.related_service && !checkedMetadata.related_service.length)"
        )
            el-table.f5-calc-height.margin-top(
                slot="tableContainer"
                :data="tableData"
                v-loading="isLoading"
                element-loading-spinner="ucmp-icon-loading"
                @selection-change="handleSelectionChange"
                border
            )
                //- bug UCMP-1659【Pass数据库】关系型数据库，详情中，数据库配置页面，仅仅是展示配置，不需要勾选框。
                el-table-column(type="selection" width="45" v-if="hasSelection")
                el-table-column(
                    resizable
                    :prop="column.prop"
                    v-for="column in columns"
                    :key="column.prop"
                    :label="column.label"
                    :width="column.width"
                )
        InstanceChildAndRelatedDetail(
            v-else
            :checkedMetadata="checkedMetadata"
            :metadata="metadata"
            :checkedInstanceId="checkedInstanceId"
            :checkedProviderId="checkedProviderId"
            :tableData="tableData"
            :columns="columns"
            @updateChildServiceInstances="getChildServiceInstances"
        )
</template>
<script>
import Api from '@api'
import MetadataUtils from '@server/metadata.utils'
import InstanceChildAndRelatedDetail from './InstanceChildAndRelatedDetail'
import InstanceChildSnapshotDetail from './InstanceChildSnapshotDetail'

export default {
    props: ['checkedMetadata', 'metadata', 'checkedInstanceId', 'checkedProviderId', 'hasSelection'],
    data () {
        return {
            isLoading: false,
            noResizeSync: false,
            advanceSwitch: true,
            
            columns: [],
            tableData: []
        }
    },

    methods: {
        initData () {
            this.getChildServiceColumns()
            this.getChildServiceInstances()
        },

        getChildServiceInstances () {
            if (!this.checkedMetadata.normal_actions || !this.checkedMetadata.normal_actions.query || !this.checkedMetadata.normal_actions.query.endpoint || !this.checkedMetadata.normal_actions.query.endpoint.url)
                return
            let params = this.getEndpointParams(this.checkedMetadata.normal_actions.query.endpoint.url, this)

            let method = this.checkedMetadata.normal_actions.query.endpoint.method ? this.checkedMetadata.normal_actions.query.endpoint.method : 'get'

            Api[method](this.checkedMetadata.normal_actions.query.endpoint.url, params, true).then(
                res => {
                    if (!this.checkedMetadata.normal_actions.query.result_key)
                        this.tableData = res
                    else this.tableData = res[this.checkedMetadata.normal_actions.query.result_key]
                }
            )
        },

        getEndpointParams (url, _params) {
            let regex = /\/\:[\w\-]+\//g
            let matched = url.match(regex)
            if (matched && Array.isArray(matched) && matched.length) {
                let params = {}
                matched.forEach(
                    item => {
                        let _key = item.replace(/[\:\/]/g, '')
                        params[_key] = _params[_key]
                    }
                )
                return params
            } else return {}
        },

        getChildServiceColumns () {
            this.columns = MetadataUtils.getColumns(this.checkedMetadata, {}, this.metadata)
        },

        handleSelectionChange () {}

    },
    created () {
        this.initData()
    },

    components: {
        InstanceChildAndRelatedDetail,
        InstanceChildSnapshotDetail
    }
}
</script>
<style lang="scss" scoped>

</style>
