<template lang="pug">
    div
        el-form(label-position="right" label-width="80px" size="small" v-model="bundleForm" :inline="true")
            el-form-item(label="名称" )
                el-input(v-model="bundleForm.name")
            el-form-item(label="IP地址" )
                el-input(v-model="bundleForm.ipAddr")

            el-form-item(label="标签键" size="small")
                el-select(v-model="bundleForm.tagCatalog")
                    el-option(v-for="item in optionsTagCatalog" :key="item.id" :label="item.tagKey" :value="item.id")
            el-form-item(label="标签值" size="small")
                el-select(v-model="bundleForm.tagValue")
                    el-option(label="全部" value="0")
            el-form-item(label="组织机构" size="small")
                el-select(v-model="bundleForm.org")
                    el-option(v-for="item in optionsOrgs" :key="item.id" :label="item.orgName" :value="item.id")
            el-form-item(label="应用系统" size="small")
                el-select(v-model="bundleForm.app")
                    el-option(v-for="item in optionsApps" :key="item.id" :label="item.appName" :value="item.id")
        el-button.default-button(type="primary" size="small") 查询

        el-table.panel-table.inner-table(:data="ecsTableData" highlight-current-row @current-change="ecsCurrentChange" border)
            el-table-column(:prop="column.prop" v-for="column in columnsEcs" :key="column.prop" :label="column.label" :width="column.width")
            el-table-column(label="IP地址")
                div(slot-scope="scope")
                    p {{getInnerIP(scope)}}
                    p {{getOuterIP(scope)}}
        el-pagination(
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="pagination.index"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.size"
        layout="sizes, prev, pager, next"
        :page-count="pagination.count"
        )


</template>

<script>
    import ApplicationMock from '@mock/subnet/application.mock'
    import OrgsMock from '@mock/subnet/orgs.mock'
    import TagCatalogMock from '@mock/subnet/tagCatalog.mock'
    import CloudEcsMock from '@mock/subnet/cloud_ecs.mock'

    /**
     * @description 绑定云主机
     */
    export default {
        name: 'bindCloudHost',
        data () {
            return {
                pagination: {
                    index: 1,
                    count: 1,
                    size: 20
                },

                columnsEcs: [
                    {prop: 'instanceName', label: '名称'},
                    {prop: 'mongoUuid', label: '主机名称'},
                    {prop: 'instanceId', label: 'ID'},
                    {prop: 'providerName', label: '云厂商'}
                ],
                ecsTableData: CloudEcsMock.dataTable,
                bundleForm: {},
                optionsTagCatalog: TagCatalogMock.options,
                optionsApps: ApplicationMock.options,
                optionsOrgs: OrgsMock.options
            }
        },
        methods: {
            /**
             * @description 默认每页查询条数发生变化
             */
            handleSizeChange () {

            },
            handleCurrentChange () {

            },
            ecsCurrentChange (row) {
                console.log(row)
            },
            getInnerIP (scope) {
                if (scope.row.instanceSummary && scope.row.instanceSummary.privateAddress)
                    return '(内)' + scope.row.instanceSummary.privateAddress
                return ''
            },
            getOuterIP (scope) {
                if (scope.row.instanceSummary && scope.row.instanceSummary.networks)
                    return '(外)' + scope.row.instanceSummary.networks[0].ip
                return ''
            }
        }
    }
</script>

<style lang="scss" scoped>
    .inner-table {
        height: 320px;
    }
</style>
