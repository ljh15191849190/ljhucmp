<template lang="pug">
    div.capacity-detail.vcops-item
        div.vcops-item__panel.position-relative.margin-bottom
            //el-tooltip(content="导出" placement="bottom")
                el-button.oper-icon-btn(
                size="small"
                icon="ucmp-icon-download"
                @click="exportReport")

            div.vcops-item__filter-panel
                label.margin-right 群集名称
                el-input(size="small" v-model="resourceName" placeholder="请输入群集名称查询" clearable)

                el-button.filter-btn(type="primary" size="small" @click="query") 查询

        div.capacity-detail__table
            el-table(:data="tableData")
                el-table-column(v-for="(item, index) in columns" :label="item.label" :prop="item.prop" :width="item.width" :key="item.prop" :fixed="index===0")
                    template(slot-scope="scope")
                        span(v-if="item.toFixed") {{scope.row[item.prop]!==null?scope.row[item.prop].toFixed(2):"--"}}
                        span(v-else) {{scope.row[item.prop]}}
</template>

<script>
    import Api from '@api'

    /**
     * 集群容量详细信息
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'CapacityDetail',
        data () {
            return {
                tableData: [],
                columns: [
                    {prop: 'resourceName', label: '名称'},
                    {prop: 'vmNum', label: '虚拟机'},
                    {prop: 'hostNum', label: '主机'},
                    {prop: 'datastoreNum', label: '数据存储'},
                    {prop: 'cpuCorecount', label: 'CPU内核'},
                    {prop: 'cpuCapacity', label: 'CPU总体容量(GHz)', toFixed: true},
                    {
                        prop: 'cpuProvisioned',
                        label: '已配置的CPU(GHz)',
                        toFixed: true
                    },
                    {prop: 'runningVcpusNum', label: 'vCPUs正在运行'},
                    {
                        prop: 'cpuWorkload',
                        label: '峰值CPU需求（30天）(%)',
                        toFixed: true
                    },
                    {prop: 'memCapacity', label: '内存总容量(GB)', toFixed: true},
                    {prop: 'memGranted', label: '已置备的内存(GB)', toFixed: true},
                    {
                        prop: 'memWorkload',
                        label: '峰值内存需求（30天）(%)',
                        toFixed: true
                    },
                    {prop: 'diskCapacity', label: '总磁盘(TB)', toFixed: true},
                    {
                        prop: 'diskProvisioned',
                        label: '已置备的磁盘(TB)',
                        toFixed: true
                    },
                    {prop: 'diskUsage', label: '已用磁盘（含开销）(TB)', toFixed: true}
                ],
                resourceName: ''
            }
        },
        computed: {},
        methods: {

            getCapacityDetailTable () {
                let params = {resourceName: this.resourceName}
                Api.get('vcops_cluster_capacity', params, true).then(res => {
                    this.tableData = res || []
                })
            },

            query () {
                this.getCapacityDetailTable()
            },

            // 导出报表
            exportReport () {

            }
        },
        created () {
            this.getCapacityDetailTable()
        }
    }
</script>

<style lang="scss" scoped>
    .capacity-detail {
        .capacity-detail__table {
            flex: auto;
            overflow: hidden;
        }

        .capacity-detail__pagination {
            display: flex;
            justify-content: flex-end;
        }

        .el-input {
            max-width: 250px;
        }
    }
</style>
<style lang="scss">
    .capacity-detail .el-table__body-wrapper {
        height: calc(100% - 80px);
    }
</style>
