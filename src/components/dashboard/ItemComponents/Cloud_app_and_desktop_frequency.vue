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
    import axios from 'axios'

    /**
     * @description
     * @author jia.lu
     */
    export default {
        name: 'Cloud_app_and_desktop_frequency',
        components: {LineChart, CardItem},
        mixins: [cloudItemMixin],
        data () {
            return {
                code: 'unit_desktop',
                titleLabel: '单位云桌面与云应用使用频度',
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
                this.searchParams.dateRange = this.getDateRange(30)

                // 获取云厂商默认值
                if (this.reportProviderReady) {
                    this.searchParams.provider_id = this.reportProviderDefault
                    this.getStatics()
                }
            },
            getStatics () {
                let fromTime = this.searchParams.dateRange ? Date.parse((this.searchParams.dateRange[0] + ' 00:00:00').replace(/-/g, '/')) : ''
                let toTime = this.searchParams.dateRange ? Date.parse((this.searchParams.dateRange[1] + ' 23:59:59').replace(/-/g, '/')) : ''
                let paramsApp = {
                    provider_id: this.searchParams.provider_id,
                    type: 'Application',
                    from: fromTime,
                    to: toTime,
                    current_org: true
                }
                let paramsDesktop = {
                    provider_id: this.searchParams.provider_id,
                    type: 'Desktop',
                    from: fromTime,
                    to: toTime,
                    current_org: true
                }

                let appPromise = Api.get('daily_app_and_desktop_active_count', paramsApp, true)
                let desktopPromise = Api.get('daily_app_and_desktop_active_count', paramsDesktop, true)
                axios.all([appPromise, desktopPromise]).then(axios.spread((appRes, desktopRes) => {
                    this.originParams = JSON.parse(JSON.stringify(this.searchParams))
                    this.downloadParams = paramsApp //java无视type属性，只取from和to
                    this.setCardFilterItem({[this.code]: this.downloadParams})

                    this.chartOption.series = [{
                        type: 'spline',
                        name: '云应用',
                        data: appRes.map(item => {
                            return [Date.parse(item.date.replace(/-/g, '/')), item.count]
                        })
                    }, {
                        type: 'spline',
                        name: '云桌面',
                        data: desktopRes.map(item => {
                            return [Date.parse(item.date.replace(/-/g, '/')), item.count]
                        })
                    }]
                }))
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
