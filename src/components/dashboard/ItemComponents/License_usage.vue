<template lang="pug">
    CardItem(:title="titleLabel" v-loading="isLoading")
        BarChart(slot="chartCot" :options="chartOptions")
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
     * 桌面云许可证使用情况
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'License_usage',
        components: {BarChart, CardItem},
        data () {
            return {
                code: 'desktop_license',
                titleLabel: '桌面云许可证使用情况',
                isLoading: false,
                chartOptions: {
                    chart: {
                        spacing: [25, 10, 25, 10],
                        type: 'bar'
                    },
                    tooltip: {
                        pointFormat: '{series.name}：{point.y}'
                    },
                    legend: {
                        enabled: true,
                        reversed: true
                    },
                    plotOptions: {
                        series: {
                            stacking: 'normal'
                        }
                    },
                    xAxis: {
                        categories: ['']
                    },
                    colors: ['#7EB6EA', '#434348', '#93EB82', '#FDBB7A'],
                    series: []
                },
                searchParams: {
                    provider_id: ''
                },
                originParams: {},
                visible: false,
                productStr: {
                    mps: 'XenApp',
                    xdt: 'XenDesktop'
                }
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
                if (this.reportProviderReady && this.reportProviderDefault) {
                    this.searchParams.provider_id = this.reportProviderDefault
                    this.getLicenseCount()
                }
            },
            getLicenseCount () {
                let params = {provider_id: this.searchParams.provider_id}
                Api.get('license_count', params, true).then(res => {
                    this.originParams = JSON.parse(JSON.stringify(this.searchParams))
                    this.setCardFilterItem({[this.code]: params})

                    // 计算展示值
                    let count = res.data.count || 0 // 全部可用
                    let overdraft_able = res.data.over_draft || 0 // 可透支
                    let usable = count - overdraft_able // 可使用（不透支的情况下）
                    let usage = res.data.in_use_count || 0 // 已使用
                    let left = usable - usage >= 0 ? usable - usage : 0  // 剩余的
                    let overdrawn = usage - usable >= 0 ? usage - usable : 0 // 已透支
                    let overdraftLeft = overdraft_able - overdrawn || 0 // 剩余可透支

                    let data = [{
                        name: '剩余可透支',
                        data: [overdraftLeft]
                    }, {
                        name: '已透支',
                        data: [overdrawn]
                    }, {
                        name: '剩余',
                        data: [left]
                    }, {
                        name: '已使用',
                        data: [usage]
                    }]
                    this.chartOptions.series = data

                    // 展示x-label
                    let model = res.data.licensing_model === 'UserDevice' ? '用户/设备' : '并发'
                    let product = this.productStr[res.data.product_code.toLowerCase()]
                    let label = `${model}<br/>(${product})`
                    this.chartOptions.xAxis.categories = [label]
                })
            },

            search () {
                this.getLicenseCount()
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
        created () {
            this.init()
        },
        destroyed () {
            this.setCardFilterItem({[this.code]: undefined})
        },
        watch: {
            reportProviderDefault (val) {
                this.searchParams.provider_id = this.reportProviderDefault
                this.getLicenseCount()
            }
        }
    }
</script>

<style lang="scss" scoped>
</style>
