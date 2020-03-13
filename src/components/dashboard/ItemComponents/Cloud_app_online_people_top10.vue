<template lang="pug">
    CardItem(:title="titleLabel" v-loading="isLoading")
        BarChart(slot="chartCot" :options="appResourceChartOptions")
        div.other-filters(slot="otherFilters")
            el-popover.other-filters__popover(trigger="manual" title="配置" v-model="visible")
                el-form(label-width="50px" size="mini")
                    el-form-item(label="云厂商")
                        el-select(v-model="searchParams.provider_id" v-loading="!reportProviderReady")
                            el-option(v-for="item in reportProvider" :key="item.id" :value="item.id" :label="item.name")
                    el-form-item
                        el-button(@click="toggleSearchPanel") 取消
                        el-button(type="primary" @click="search") 搜索
                i.ucmp-icon-menu-collapse-btn(slot="reference" @click="toggleSearchPanel")
</template>

<script>
    import BarChart from '../../common/charts/BarCharts'
    import CardItem from '../CardItem'
    import {mapGetters, mapActions} from 'vuex'
    import Api from '@api'

    /**
     * @description
     * @author jia.lu
     */
    export default {
        name: 'Cloud_app_online_people_top10',
        components: {CardItem, BarChart},
        data () {
            return {
                code: 'app_online_top10',
                titleLabel: '云应用在线人数TOP10',
                isLoading: false,
                appResourceChartOptions: {
                    chart: {
                        spacing: [25, 10, 25, 10]
                    },
                    colors: ['#0198e4'],
                    tooltip: {
                        pointFormat: '{series.name}：{point.y}'
                    },
                    legend: {
                        enabled: true
                    },
                    plotOptions: {
                        column: {
                            pointWidth: 20
                        }
                    },
                    series: [{
                        name: '在线人数（个）',
                        data: []
                    }],
                    xAxis: {
                        type: 'linear',
                        categories: []
                    }
                },
                searchParams: {
                    provider_id: ''
                },
                originParams: {},
                visible: false
            }
        },
        computed: {
            ...mapGetters([
                'reportProvider',
                'reportProviderDefault',
                'reportProviderReady'
            ])
        },
        methods: {
            init () {
                // 获取云厂商默认值
                if (this.reportProviderReady) {
                    this.searchParams.provider_id = this.reportProviderDefault
                    this.getStatics()
                }
            },
            getStatics () {
                let params = {
                    limit: 10,
                    type: 'Application',
                    provider_id: this.searchParams.provider_id
                }
                this.isLoading = true
                Api.get('active_user_top', params).then(res => {
                    this.isLoading = false
                    this.originParams = JSON.parse(JSON.stringify(this.searchParams))
                    this.setCardFilterItem({[this.code]: params})

                    // 重名情况，需要用xAxis的 linear 来解决
                    let categories = []
                    let data = []
                    res.forEach(item => {
                        categories.push(item.name)
                        data.push(item.count)
                    })
                    this.appResourceChartOptions.xAxis.categories = categories
                    this.appResourceChartOptions.series[0].data = data
                }, () => {
                    this.isLoading = false
                })
            },

            search () {
                this.getStatics()
                this.visible = false
            },

            toggleSearchPanel () {
                this.visible = !this.visible

                // 未搜索，需要将搜索重置为前一个搜索过的搜索条件
                if (this.visible === false)
                    this.searchParams = JSON.parse(JSON.stringify(this.originParams))
            },

            ...mapActions([
                'setCardFilterItem'
            ])
        },
        mounted () {
            this.init()
        },
        destroyed () {
            this.setCardFilterItem({[this.code]: undefined})
        },
        watch: {
            reportProviderDefault (val) {
                this.searchParams.provider_id = this.reportProviderDefault
                this.getStatics()
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>