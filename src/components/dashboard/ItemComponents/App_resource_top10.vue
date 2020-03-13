<template lang="pug">
    CardItem(:title="titleLabel" filterType="date" :filterItems="resourceTypeMap" @changeFilterParams="changeType" v-loading="isLoading")
        BarChart(slot="chartCot" :options="appResourceChartOptions")
</template>
<script>
import BarChart from '../../common/charts/BarCharts'
import CardItem from '../CardItem'
import { mapGetters } from 'vuex'
import Api from '@api'

export default {
    data () {
        return {
            initId: 30,
            titleLabel: '应用占用TOP10',
            isLoading: false,
            appResourceChartOptions: {
                chart: {
                    spacing: [25, 10, 25, 10]
                },
                colors: ['#0198e4'],
                tooltip: {
                    pointFormat: '{series.name}：{point.y}'
                },
                plotOptions: {
                    column: {
                        pointWidth: 20
                    }
                },
                series: [{
                    name: '云主机',
                    data: []
                }]
            }
        }
    },
    created () {
        this.initChartsData('ecs', '云主机')
    },
    methods: {
        initChartsData (service_code, service_name, statistics_type = 'app') {
            let params = {
                statistics_type,
                pageNum: 1,
                pageSize: 10,
                order: 'desc',
                order_by: service_code
            }
            this.isLoading = true
            Api.get('each_role_resource_data', params).then(res => {
                this.isLoading = false
                let seriesData = []
                if (res && res.list) {
                    seriesData = res.list.map(item => {
                        return [item[statistics_type] || '--', +item[service_code]]
                    })
                }
                this.$set(this.appResourceChartOptions.series[0], 'name', service_name)
                this.$set(this.appResourceChartOptions.series[0], 'data', seriesData)
            }, () => {
                this.isLoading = false
            })
        },
        changeType (param) {
            this.initChartsData(param.key, param.title)
        }
    },
    computed: {
        ...mapGetters([
            'metadata'
        ]),
        resourceTypeMap () {
            if (this.metadata) {
                let metaList = this.metadata.filter(meta => !meta.asAttribute && !meta.implements && !meta.parent && meta.group !== 'blueprint' && meta.group !== 'tag')
                return metaList.map(resource => {
                    return {
                        key: resource.service_code,
                        title: resource.name
                    }
                })
            } else
                return []
        }
    },
    components: { CardItem, BarChart }
}
</script>
<style lang="scss" scoped>
</style>
