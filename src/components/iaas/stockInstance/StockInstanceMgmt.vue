<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            div.top-button-container
                el-button.default-button(type="primary" size="small" icon="el-icon-refresh") 同步

            UcmpTableContainer(:advance="advance" :pagination="pagination" :filterItems="filterItems" @sizeChange="handleSizeChange" @currentChange="handleCurrentChange")
                div.d-flex.height-fit-content(slot="advanced-filter")
                    el-form.demo-form-inline(:inline="true" size="mini")
                        el-form-item(label="同步时间")
                            el-date-picker(v-model="advancedFilter.syncTimeArray" type="daterange" range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            unlink-panels)

                div.full-height.border-top.padding-top(slot="tableContainer")
                    div.margin-bottom
                        el-button(size="small" type="primary" disabled) 分配
                    el-table.panel-table(:data="tableData" stripe @selection-change="handleSelectionChange" border)
                        el-table-column(type="selection" width="45")
                        el-table-column(:prop="column.prop" v-for="column in columns" :key="column.prop" :label="column.label" :width="column.width")
                el-button.default-button(slot="filter-btns" type="primary" size="small" @click="handleSearch") 查询
</template>

<script>
    /**
     * @description 存量资源
     */
    export default {
        name: 'StockInstanceMgmt',
        data () {
            return {
                breadcrumbItems: [
                    {prop: '', label: '存量资源'}
                ],
                advance: true,
                pagination: {
                    index: 1,
                    count: 1,
                    size: 20
                },
                basicFilterForm: {
                    cloudProvider: '',
                    soureType: ''
                },
                advancedFilter: {},
                filterItems: [
                    {
                        label: '实例名称',
                        key: 'instanceName',
                        type: 'input'
                    },
                    {
                        label: '云厂商',
                        key: 'cloudProviderName',
                        type: 'select'
                    },
                    {
                        label: '资源类型',
                        key: 'sourceType',
                        type: 'select'
                    }
                ],
                columns: [
                    {prop: 'instanceID', label: '实例ID'},
                    {prop: 'instanceName', label: '实例名称'},
                    {prop: 'ipAddress', label: 'IP地址'},
                    {prop: 'sourceType', label: '资源类型'},
                    {prop: 'cloudProviderName', label: '云厂商'},
                    {prop: 'options', label: '配置'},
                    {prop: 'syncTime', label: '同步时间'}
                ],
                tableData: [
                    {
                        id: '100001',
                        instanceID: 'B749FE4D-ADF1-415E-BCBC-996B06B235D4/vm-3639',
                        instanceName: 'prometheus-host',
                        ipAddress: '192.168.1.9',
                        sourceType: '云主机',
                        cloudProviderName: 'Vcenter32',
                        options: '1核1G',
                        syncTime: '2018-05-07 13:40:06'
                    }, {
                        id: '100002',
                        instanceID: 'B749FE4D-ADF1-415E-BCBC-996B06B235D4/vm-3639',
                        instanceName: 'prometheus-host',
                        ipAddress: '192.168.1.9',
                        sourceType: '云主机',
                        cloudProviderName: 'Vcenter32',
                        options: '1核1G',
                        syncTime: '2018-05-07 13:40:06'
                    }, {
                        id: '100003',
                        instanceID: 'B749FE4D-ADF1-415E-BCBC-996B06B235D4/vm-3639',
                        instanceName: 'prometheus-host',
                        ipAddress: '192.168.1.9',
                        sourceType: '云主机',
                        cloudProviderName: 'Vcenter32',
                        options: '1核1G',
                        syncTime: '2018-05-07 13:40:06'
                    }, {
                        id: '100004',
                        instanceID: 'B749FE4D-ADF1-415E-BCBC-996B06B235D4/vm-3639',
                        instanceName: 'prometheus-host',
                        ipAddress: '192.168.1.9',
                        sourceType: '云主机',
                        cloudProviderName: 'Vcenter32',
                        options: '1核1G',
                        syncTime: '2018-05-07 13:40:06'
                    }, {
                        id: '100005',
                        instanceID: 'B749FE4D-ADF1-415E-BCBC-996B06B235D4/vm-3639',
                        instanceName: 'prometheus-host',
                        ipAddress: '192.168.1.9',
                        sourceType: '云主机',
                        cloudProviderName: 'Vcenter32',
                        options: '1核1G',
                        syncTime: '2018-05-07 13:40:06'
                    }, {
                        id: '100006',
                        instanceID: 'B749FE4D-ADF1-415E-BCBC-996B06B235D4/vm-3639',
                        instanceName: 'prometheus-host',
                        ipAddress: '192.168.1.9',
                        sourceType: '云主机',
                        cloudProviderName: 'Vcenter32',
                        options: '1核1G',
                        syncTime: '2018-05-07 13:40:06'
                    }, {
                        id: '100007',
                        instanceID: 'B749FE4D-ADF1-415E-BCBC-996B06B235D4/vm-3639',
                        instanceName: 'prometheus-host',
                        ipAddress: '192.168.1.9',
                        sourceType: '云主机',
                        cloudProviderName: 'Vcenter32',
                        options: '1核1G',
                        syncTime: '2018-05-07 13:40:06'
                    }, {
                        id: '100008',
                        instanceID: 'B749FE4D-ADF1-415E-BCBC-996B06B235D4/vm-3639',
                        instanceName: 'prometheus-host',
                        ipAddress: '192.168.1.9',
                        sourceType: '云主机',
                        cloudProviderName: 'Vcenter32',
                        options: '1核1G',
                        syncTime: '2018-05-07 13:40:06'
                    }, {
                        id: '100009',
                        instanceID: 'B749FE4D-ADF1-415E-BCBC-996B06B235D4/vm-3639',
                        instanceName: 'prometheus-host',
                        ipAddress: '192.168.1.9',
                        sourceType: '云主机',
                        cloudProviderName: 'Vcenter32',
                        options: '1核1G',
                        syncTime: '2018-05-07 13:40:06'
                    }, {
                        id: '100010',
                        instanceID: 'B749FE4D-ADF1-415E-BCBC-996B06B235D4/vm-3639',
                        instanceName: 'prometheus-host',
                        ipAddress: '192.168.1.9',
                        sourceType: '云主机',
                        cloudProviderName: 'Vcenter32',
                        options: '1核1G',
                        syncTime: '2018-05-07 13:40:06'
                    }, {
                        id: '100011',
                        instanceID: 'B749FE4D-ADF1-415E-BCBC-996B06B235D4/vm-3639',
                        instanceName: 'prometheus-host',
                        ipAddress: '192.168.1.9',
                        sourceType: '云主机',
                        cloudProviderName: 'Vcenter32',
                        options: '1核1G',
                        syncTime: '2018-05-07 13:40:06'
                    }
                ]
            }
        },
        methods: {
            handleSelectionChange (selectedArray) {
                console.log(selectedArray)
            },
            /**
             * 表格每页显示条数更改cb
             * @param newSize 新的每页显示条数
             */
            handleSizeChange (newSize) {
                //
                // this.defaultPagination.size = newSize || 20
            },
            /**
             * 表格页面跳转cb
             * @param newPage 跳转的页面
             */
            handleCurrentChange (newPage) {
                // this.defaultPagination.index = newPage || 1
            },
            handleSearch () {

            }
        },
        created () {

        }
    }
</script>
<style lang="scss" scoped>

</style>

