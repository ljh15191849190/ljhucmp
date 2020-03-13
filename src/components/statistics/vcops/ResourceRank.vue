<template lang="pug">
    div.vm-trend.vcops-item
        div.vcops-item__panel.position-relative.margin-bottom
            //el-tooltip(content="导出" placement="bottom")
                el-button.oper-icon-btn(
                size="small"
                icon="ucmp-icon-download"
                @click="exportReport")

            div.vcops-item__filter-panel
                label.margin-right 数据中心
                el-select(size="small" v-model="dataCenter" placeholder="请选择数据中心")
                    el-option(v-for="item in dataCenters" :value="item.resource_id" :key="item.resource_id" :label="item.resource_name")

                el-button.filter-btn(type="primary" size="small" @click="getRank") 查询
        div.vcops__cards
            el-card(v-for="(cardItem, index) in cards" :header="cardItem.header" :key="index" shadow="hover" :body-style="cardStyle")
                el-table(:data="cardItem.data")
                    el-table-column(prop="rate" label="利用率索引")
                        template(slot-scope="scope")
                            el-progress(:percentage="scope.row.rate" :show-text="false")
                            div.vcops_rate-text {{scope.row.value}}
                    el-table-column(prop="name" label="对象")
</template>

<script>
    import Api from '@api'

    /**
     * 资源争用排名
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'ResourceRank',
        data () {
            return {
                cardStyle: {
                    padding: '6px',
                    height: '500px'
                },
                cards: [
                    // data rate和name两个索引
                    {
                        header: '出现CPU争用的排名前15虚拟机',
                        data: []
                    },
                    {header: '出现内存争用的排名前15虚拟机', data: []},
                    {header: '出现磁盘延迟(ms)的排名前15虚拟机', data: []}
                ],
                dataCenter: '',
                dataCenters: []
            }
        },
        computed: {},
        methods: {
            exportReport () {

            },

            getDataCenters () {
                Api.get('vcops_data_centers', {}, true).then(res => {
                    this.dataCenters = res || []
                    if (this.dataCenters.length) {
                        this.dataCenter = this.dataCenters[0].resource_id
                        this.getRank()
                    }
                })
            },

            getRank () {
                let params = {datacenterId: this.dataCenter}
                Api.get('vcops_resource_topn', params, true).then(res => {
                    if (res) {
                        // 以首项为100%计算
                        let maxCpuPercent = res.cpu[0] ? res.cpu[0].statsValue : 0
                        this.cards[0].data = (res.cpu || []).map(item => {
                            return {
                                name: item.resourceName,
                                rate: maxCpuPercent ? parseFloat((item.statsValue * 100 / maxCpuPercent).toFixed(3)) : 100,
                                value: parseFloat(item.statsValue.toFixed(3))
                            }
                        })

                        let maxMemPercent = res.mem[0] ? res.mem[0].statsValue : 0
                        this.cards[1].data = (res.mem || []).map(item => {
                            return {
                                name: item.resourceName,
                                rate: maxMemPercent ? parseFloat((item.statsValue * 100 / maxMemPercent).toFixed(3)) : 100,
                                value: parseFloat(item.statsValue.toFixed(3))
                            }
                        })

                        let maxDiskPercent = res.disk[0] ? res.disk[0].statsValue : 0
                        this.cards[2].data = (res.disk || []).map(item => {
                            return {
                                name: item.resourceName,
                                rate: maxDiskPercent ? parseFloat((item.statsValue * 100 / maxDiskPercent).toFixed(3)) : 100,
                                value: parseFloat(item.statsValue.toFixed(3))
                            }
                        })
                    }
                })
            }
        },
        created () {
            this.getDataCenters()
        }
    }
</script>

<style lang="scss" scoped>
    .vcops__cards {
        height: calc(100% - 42px);
        overflow-y: auto;
    }

    .el-progress {
        width: calc(100% - 70px);
        display: inline-block;
    }

    .vcops_rate-text {
        display: inline-block;
        margin-left: 5px;
    }
</style>
<style lang="scss">
    .vm-trend .el-progress-bar {
        margin-right: 0px;
        padding-right: 0px;
    }
</style>
