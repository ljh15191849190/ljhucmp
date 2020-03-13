<template lang="pug">
    div.vm-high-load.vcops-item
        div.vcops-item__panel.position-relative.margin-bottom
            //el-tooltip(content="导出" placement="bottom")
                el-button.oper-icon-btn(
                size="small"
                icon="ucmp-icon-download"
                @click="exportReport")
            div.vcops-item__filter-panel
                label.margin-right 群集名称
                el-select(size="small" v-model="cluster" placeholder="请选择群集")
                    el-option(v-for="item in clusters" :value="item.resource_id" :key="item.resource_id" :label="item.resource_name")

                el-button.filter-btn(type="primary" size="small" @click="getHighLoadData") 查询
        div.vcops__cards
            el-card(v-for="(cardItem, cardIndex) in cards" :header="cardItem.header" :key="cardIndex" shadow="hover" :body-style="cardStyle")
                el-table(:data="cardItem.data")
                    el-table-column(v-for="column in cardItem.columns" :prop="column.prop" :label="column.label" :key="column.prop")
</template>

<script>
    import Api from '@api'

    /**
     * 重负载虚拟机报告
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'VMHighLoad',
        data () {
            return {
                cardStyle: {
                    padding: '6px',
                    height: '450px'
                },
                cards: [
                    {
                        header: '哪些虚拟机在上周产生的CPU需求量最高',
                        data: [],
                        columns: [
                            {prop: 'resourceName', label: '名称'},
                            {prop: 'cpu_minutes_5', label: '最长5分钟'},
                            {prop: 'cpu_days_1', label: '最长1天'}
                        ]
                    },
                    {
                        header: '哪些虚拟机在上周产生的内存需求量最高',
                        data: [],
                        columns: [
                            {prop: 'resourceName', label: '名称'},
                            {prop: 'mem_minutes_5', label: '最长5分钟'},
                            {prop: 'mem_days_1', label: '最长1天'}
                        ]
                    },
                    {
                        header: '哪些虚拟机在上周产生的IOPS需求量最高',
                        data: [],
                        columns: [
                            {prop: 'resourceName', label: '名称'},
                            {prop: 'iops_days_1', label: '持续性高IOPS（最长1天）'},
                            {prop: 'iops_minutes_5', label: '突发性高（最长5分钟）'},
                            {prop: 'throughput_days_1', label: '吞吐量（最长1天）'},
                            {prop: 'throughput_minutes_5', label: '吞吐量（最长5分钟）'}
                        ]
                    }
                ],
                cluster: '',
                clusters: []
            }
        },
        computed: {},
        methods: {
            getCluster () {
                Api.get('vcops_data_clusters', {}, true).then(res => {
                    this.clusters = res || []
                    if (this.clusters.length) {
                        this.cluster = this.clusters[0].resource_id
                        this.getHighLoadData()
                    }
                })
            },

            getHighLoadData () {
                let params = {
                    clusterId: this.cluster
                }

                Api.get('vcops_vm_heavyload', params, true).then(res => {
                    if (res) {
                        this.cards[0].data = (res.cpu || []).map(item => {
                            return {
                                clusterId: item.clusterId,
                                resourceName: item.resourceName,
                                cpu_minutes_5: item.statsValue.cpu_minutes_5.value.toFixed(2) + (item.statsValue.cpu_minutes_5.trailingString || ''),
                                cpu_days_1: item.statsValue.cpu_days_1.value.toFixed(2) + (item.statsValue.cpu_days_1.trailingString || '')
                            }
                        })
                        this.cards[1].data = (res.mem || []).map(item => {
                            return {
                                clusterId: item.clusterId,
                                resourceName: item.resourceName,
                                mem_minutes_5: item.statsValue.mem_minutes_5.value.toFixed(2) + (item.statsValue.mem_minutes_5.trailingString || ''),
                                mem_days_1: item.statsValue.mem_days_1.value.toFixed(2) + (item.statsValue.mem_days_1.trailingString || '')
                            }
                        })
                        this.cards[2].data = (res.iops || []).map(item => {
                             return {
                                clusterId: item.clusterId,
                                resourceName: item.resourceName,
                                iops_days_1: item.statsValue.iops_days_1 ? item.statsValue.iops_days_1.value.toFixed(2) + (item.statsValue.iops_days_1.trailingString || '') : '--',
                                iops_minutes_5: item.statsValue.iops_minutes_5 ? (item.statsValue.iops_minutes_5.value.toFixed(2) + (item.statsValue.iops_minutes_5.trailingString || '')) : '--',
                                throughput_days_1: item.statsValue.throughput_days_1 ? (item.statsValue.throughput_days_1.value.toFixed(2) + (item.statsValue.throughput_days_1.trailingString || '')) : '--',
                                throughput_minutes_5: item.statsValue.throughput_minutes_5 ? (item.statsValue.throughput_minutes_5.value.toFixed(2) + (item.statsValue.throughput_minutes_5.trailingString || '')) : '--'
                            }
                        })
                    }
                })
            },

            exportReport () {

            }
        },
        created () {
            this.getCluster()
        }
    }
</script>

<style lang="scss" scoped>
    .vcops-item__panel {
        height: 30px;
    }

    .vcops__cards {
        height: calc(100% - 42px);
        overflow-y: auto;
    }
</style>
