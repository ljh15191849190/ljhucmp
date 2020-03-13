<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            el-row
                span 应用系统：
                el-select(v-model="system")
            el-row
                span IasS:
            el-table.app-view-table(:data="tableData" border)
                el-table-column(:prop="column.prop" v-for="column in columns" :key="column.prop" :label="column.label" :width="column.width")
                el-table-column(label="操作" width="150")
                    template(slot-scope="scope")
                        Icon-Button(v-for="operation in operations" :key="operation.prop" :type="operation.type" @iconClick="handleOperation" :args="{id: operation.prop, row: scope.row}" :text="operation.label")
</template>
<script>
/**
 * @description 应用系统管理概览
 */
export default {
    name: 'AppMgmtView',
    data () {
        return {
            system: '',
            breadcrumbItems: [
                { prop: '', label: '应用系统管理概览' }
            ],
            operations: [
                {
                    type: 'ucmp-icon-application',
                    label: '管理',
                    prop: 'edit'
                }
            ],
            columns: [
                { prop: 'instanceName', label: '服务名称' },
                { prop: 'serviceType', label: '服务类型' },
                { prop: 'createTime', label: '创建时间' }
            ],
            tableData: [
                { instanceName: 'nginx', serviceType: '云主机', createTime: 'createTime' },
                { instanceName: 'nginx', serviceType: '云主机', createTime: 'createTime' },
                { instanceName: 'nginx', serviceType: '云主机', createTime: 'createTime' },
                { instanceName: 'nginx', serviceType: '云主机', createTime: 'createTime' },
                { instanceName: 'nginx', serviceType: '云主机', createTime: 'createTime' },
                { instanceName: 'nginx', serviceType: '云主机', createTime: 'createTime' },
                { instanceName: 'nginx', serviceType: '云主机', createTime: 'createTime' },
                { instanceName: 'nginx', serviceType: '云主机', createTime: 'createTime' },
                { instanceName: 'nginx', serviceType: '云主机', createTime: 'createTime' },
                { instanceName: 'nginx', serviceType: '云主机', createTime: 'createTime' },
                { instanceName: 'nginx', serviceType: '云主机', createTime: 'createTime' },
                { instanceName: 'nginx', serviceType: '云主机', createTime: 'createTime' },
                { instanceName: 'nginx', serviceType: '云主机', createTime: 'createTime' },
                { instanceName: 'nginx', serviceType: '云主机', createTime: 'createTime' },
                { instanceName: 'nginx', serviceType: '云主机', createTime: 'createTime' }
            ]
        }
    },
    methods: {
        handleOperation () {

        }
    }
}
</script>
<style lang="scss" scoped>
.app-view-table {
    height: calc(100% - 70px);
}
</style>
