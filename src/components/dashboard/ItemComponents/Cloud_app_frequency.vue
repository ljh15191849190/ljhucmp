<template lang="pug">
    CardItem(:title="titleLabel" v-loading="loading")
        LineChart(slot="chartCot" :options="chartOption" stock)
        div.other-filters(slot="otherFilters")
            el-popover.other-filters__popover(trigger="manual" title="配置" v-model="visible")
                el-form(label-width="50px" size="mini")
                    el-form-item(label="云厂商")
                        el-select(v-model="searchParams.provider_id" v-loading="!reportProviderReady")
                            el-option(v-for="item in reportProvider" :key="item.id" :value="item.id" :label="item.name")
                    el-form-item(label="时间段")
                        el-date-picker(
                        type="daterange"
                        value-format="yyyy-MM-dd"
                        v-model="searchParams.dateRange"
                        :picker-options="pickerOptions"
                        :clearable="false")
                    el-form-item
                        el-button(@click="toggleSearchPanel") 取消
                        el-button(type="primary" @click="search") 搜索
                i.ucmp-icon-menu-collapse-btn(slot="reference" @click="toggleSearchPanel")

</template>

<script>
    import LineChart from '../../common/charts/LineCharts'
    import CardItem from '../CardItem'
    import cloudItemMixin from './cloudItem.mixin'
    import {mapGetters, mapActions} from 'vuex'
    import Api from '@api'

    /**
     * 云应用使用频率
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'Cloud_app_frequency',
        components: {LineChart, CardItem},
        mixins: [cloudItemMixin],
        data () {
            return {
                code: 'daily_desktop',
                titleLabel: '云应用使用频度',
                visible: false,
                searchParams: {
                    provider_id: '',
                    dateRange: null
                },
                originParams: {},
                downloadParams: {},
                chartOption: {
                    legend: {
                        enabled: true,
                        floating: true,
                        verticalAlign: 'top',
                        align: 'right',
                        y: -25
                    },
                    tooltip: {
                        pointFormat: '{series.name}：{point.y}'
                    },
                    series: [],
                    yAxis: [{
                        opposite: false
                    }]
                },
                loading: false
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
                this.searchParams.dateRange = this.getDateRange(7)

                // 获取云厂商默认值
                if (this.reportProviderReady) {
                    this.searchParams.provider_id = this.reportProviderDefault
                    this.getStatics()
                }
            },
            getStatics () {
                let params = {
                    provider_id: this.searchParams.provider_id,
                    type: 'Application'
                }
                params.from = this.searchParams.dateRange ? Date.parse((this.searchParams.dateRange[0] + ' 00:00:00').replace(/-/g, '/')) : ''
                params.to = this.searchParams.dateRange ? Date.parse((this.searchParams.dateRange[1] + ' 23:59:59').replace(/-/g, '/')) : ''

                Api.get('daily_app_and_desktop_active_count', params, true).then(res => {
                    this.originParams = JSON.parse(JSON.stringify(this.searchParams))
                    this.downloadParams = params
                    this.setCardFilterItem({[this.code]: this.downloadParams})

                    this.chartOption.series = [{
                        type: 'spline',
                        name: '云应用',
                        data: res.map(item => {
                            return [Date.parse(item.date.replace(/-/g, '/')), item.count]
                            // return [new Date(item.date.split('-').join('/')).getTime(), item.count]
                        })
                    }]
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
