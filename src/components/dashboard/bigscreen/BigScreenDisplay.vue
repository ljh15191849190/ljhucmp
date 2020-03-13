<template lang="pug">
    div.big-screen.full-container(ref="bigScreen")
        IframeContainer(v-if="bigScreenDefine" :url="bigScreenDefine" :noLoading="noLoading")
        div.full-container.default-content(v-else)
            div.top-label.text-center.position-relative
                div.top-bg
                div.item-bg.ab-left
                div.middle-bg 云管监控中心
                div.item-bg.ab-right
            div.time-title {{dateTime.year}}年{{dateTime.month}}月{{dateTime.date}}日 {{dateTime.week}} {{dateTime.time}}
            div.bot-chart
                el-row.full-height
                    el-col.col-box(:span="5")
                        div.left-top
                            div.box-header 容量占用
                            div.resource-box
                                div.resource-bar
                                    div
                                        span.resource-name CPU
                                        span.resource-detail 已用{{(+resourceCount.used_cpu_ghz).toFixed(2) || 0}}GHZ，剩余{{(+resourceCount.free_cpu_ghz).toFixed(2) || 0}}GHZ
                                    div.progress-bar
                                        el-progress(:text-inside="true" :stroke-width="processStrokeWidth"
                                                    :color="handleColor(resourceCount.cpu_usage_rate * 100 || 0)"
                                                    :show-text="showText"
                                                    :percentage="+(((resourceCount.cpu_usage_rate > 1 ? 1 : resourceCount.cpu_usage_rate) * 100 || 0).toFixed(2))")
                                div.resource-bar
                                    div
                                        span.resource-name 内存
                                        span.resource-detail 已用{{(+resourceCount.used_memory_gb).toFixed(2) || 0}}GB，剩余{{(+resourceCount.free_memory_gb).toFixed(2) || 0}}GB
                                    div.progress-bar
                                        el-progress(:text-inside="true" :stroke-width="processStrokeWidth"
                                                    :color="handleColor(resourceCount.mem_usage_rate * 100 || 0)"
                                                    :show-text="showText"
                                                    :percentage="+(((resourceCount.mem_usage_rate > 1 ? 1 : resourceCount.mem_usage_rate) * 100 || 0).toFixed(2))")
                                div.resource-bar
                                    div
                                        span.resource-name 存储
                                        span.resource-detail 已用{{(+resourceCount.used_disk_gb).toFixed(2) || 0}}GB，剩余{{(+resourceCount.free_disk_gb).toFixed(2) || 0}}GB
                                    div.progress-bar
                                        el-progress(:text-inside="true" :stroke-width="processStrokeWidth"
                                                    :color="handleColor(resourceCount.disk_usage_rate * 100 || 0)"
                                                    :show-text="showText"
                                                    :percentage="+(((resourceCount.disk_usage_rate > 1 ? 1 : resourceCount.disk_usage_rate) * 100 || 0).toFixed(2))")
                            div.resource-bottom(:class="{'small-size': !showText}")
                                el-row.row-top-border.text-center
                                    el-col(:span="12")
                                        div {{resourceEcsCount}}
                                        p 主机数量
                                    el-col(:span="12")
                                        div {{resourceVolumeCount}}
                                        p 硬盘数量
                        div.left-bot
                            div.box-header 服务状态
                            div.chart-panel
                                PieChart(:options="pieOptions")
                    el-col.col-box(:span="11")
                        div.alarm-box(ref="alarmBox")
                            div.box-header 主机告警信息
                            div.clock-panel(ref="clockPanel")
                                div.clock-bg(ref="gaugeChart")
                                    GaugeChart.gauge-chart(ref="gaugeChartChild" v-if="showGauge"
                                    :value="value" :range="range" :needleVal="needleVal" :zoons="zoons" :title="title"
                                    unit="%" :labelFontSize="labelFontSize")
                            div.alarm-info.d-flex.justify-content-around(ref="alarmInfo")
                                span.alarm-item(v-for="(alarm, index) in alarmCounts" :key="alarm.prop" :class="`alarm_${alarm.prop}`")
                                    span {{alarm.count || 0}}
                                    span {{alarm.label}}
                            div.alarm-detail(ref="alarmDetail")
                                el-table.big_screen_table.full-height(:data="alarmList" @row-click="rowClick")
                                    el-table-column(
                                        v-for="column in columns"
                                        :key="column.prop"
                                        :prop="column.prop"
                                        :label="column.label"
                                        :width="column.width")
                                        template(slot-scope="scope")
                                            span(v-if="column.prop === 'severity'" :class="getAlarmClass(scope.row.severity)") {{scope.row.severity | FormatAlarmLevel}}
                                            span(v-else-if="column.prop === 'occurred-at'")
                                                span 初次：{{scope.row.create_time | FormatTime}}
                                                br
                                                span.text-danger 最后
                                                span ：{{scope.row.update_time| FormatTime}}
                                            span(v-else) {{scope.row[column.prop] || '--'}}
                    el-col.col-box(:span="8")
                        div.monitor-box
                            div.full-container.box-header 主机实时监控
                            div.container-body
                                IframeContainer(v-if="tarUrl" :url="tarUrl" :noLoading="noLoading")
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import PieChart from '../../common/charts/PieCharts'
import GaugeChart from '../../common/charts/GaugeChart'
import { IframeContainer } from '@leaptocloud/standard-ui'
import { AlarmLevel } from '@server/ConstParams'
import Api from '@api'

const handleWeek = function (week) {
    let weekList = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    return weekList[week]
}
const getColor = function (code) {
    switch (code) {
        case 'error': return '#b3323c'
        case 'running': return '#29a460'
        case 'stopped': return '#bd7d00'
        case 'unknow': return '#2d4463'
        default: break
    }
}

export default {
    components: { PieChart, IframeContainer, GaugeChart },
    data () {
        return {
            dateTime: {
                year: '',
                month: '',
                date: '',
                week: '',
                time: ''
            },
            timeInterval: null,
            refreshAlarmInterval: null,
            columns: [
                { prop: 'severity', label: '级别', width: 60 },
                { prop: 'source', label: 'IP', width: 120 },
                { prop: 'name', label: '告警策略名称' },
                { prop: 'summary', label: '内容' },
                { prop: 'occurred-at', label: '时间', width: 180 }
            ],
            alarmList: [],
            resourceCount: {},
            pieOptions: {
                tooltip: {
                    pointFormat: '{point.name}{point.percentage:.1f}%'
                },
                plotOptions: {
                    labelEnabled: true,
                    distance: 20,
                    fontStyle: {
                        color: '#6882ad',
                        textOutline: 'none',
                        fontSize: '14px'
                    }
                },
                series: [{
                    name: '云主机',
                    data: []
                }]
            },
            noLoading: true,
            value: 10,
            range: [90, 270],
            needleVal: 0,
            labelFontSize: 24,
            zoons: [
                { from: 0, to: 30, color: '#29a460' },
                { from: 30, to: 80, color: '#bd7d00' },
                { from: 80, to: 100, color: '#b3323c' }
            ],
            title: '服务异常率',
            showGauge: false,
            resourceEcsCount: 0,
            resourceVolumeCount: 0,
            fullScreen: false,
            showText: true,
            processStrokeWidth: 24,
            tarUrl: ''
        }
    },
    created () {
        this.setNavBarDisplay(false)
        window.parent.postMessage({ status: 'hideNavBar' }, '*')
        // 右上角时间刷新
        this.refreshTime()
        // 告警信息刷新
        this.refreshAlarmListAndCount(true)
        // 获取服务异常率
        this.refreshServiceAvail()

        Api.get('db_resources', {}).then(res => {
            if (res) {
                res.forEach(item => {
                    if (item.res_code === 'ecs') {
                        item.status_list.forEach(resState => {
                            this.resourceEcsCount += resState.status_count
                            this.pieOptions.series[0].data.push(
                                {
                                    name: resState.status_name,
                                    color: getColor(resState.status_code),
                                    y: resState.status_count
                                }
                            )
                        })
                    } else if (item.res_code === 'volume') {
                        item.status_list.forEach(resState => {
                            this.resourceVolumeCount += resState.status_count
                        })
                    }
                })
            }
        })
        // 获取总容量信息
        Api.get('bs_resource_total', {}).then(res => {
            if (res)
                this.resourceCount = res
        })
    },
    methods: {
        ...mapActions([
            'setNavBarDisplay'
        ]),
        // 获取服务正常率
        refreshServiceAvail () {
            Api.get('bs_instance_avail', {}).then(res => {
                if (res)
                    this.needleVal = +((100 - res.avail * 100).toFixed(2))
                else
                    this.needleVal = 0
            }, () => {
                this.needleVal = 0
            })
        },
        // 获取告警统计和告警列表
        refreshAlarmListAndCount (isFirst = false) {
            // 初始获取10条告警数据
            // 云主机的resource_type 值 ==> 1
            const ECS_TYPE = 1, PROCESS_TYPE = 0
            Api.get('alarm_unprocessed_api_each', { offset: 1, limit: 10, process: PROCESS_TYPE, resource_type: ECS_TYPE }).then(res => {
                if (res.list && Array.isArray(res.list)) {
                    // 将现有的告警列表和新获取的告警列表拼成一个新的集合
                    let nowAlarmList = [...JSON.parse(JSON.stringify(res.list)), ...this.alarmList]
                    // 去重
                    let alarmIds = [],
                        showAlarmList = []
                    nowAlarmList.forEach(item_alarm => {
                        if (alarmIds.indexOf(item_alarm['id']) === -1) {
                            alarmIds.push(item_alarm['id'])
                            showAlarmList.push(item_alarm)
                        }
                    })
                    // 告警列表最多 50 条记录
                    if (showAlarmList.length > 50)
                        this.alarmList = showAlarmList.splice(0, 50)
                    else
                        this.alarmList = showAlarmList
                    // 如果是第一次进入大屏页面，默认获取第一条告警的资源ID，获取监控grafana图形
                    if (isFirst && showAlarmList.length)
                        this.getCurrentGrafanaPath(showAlarmList[0]['instance_id'])

                    // 获取告警统计
                    this.alarmCounts.forEach(item => {
                        if (item.value === 'total')
                            this.$set(item, 'count', res.total)
                        else
                            this.$set(item, 'count', res.eachTypeCount[item.value])
                    })
                }
            })
        },

        // 获取grafana图表的加载路径
        getCurrentGrafanaPath (instanceId) {
            let params = {
                server_code: 'ecs1',
                id: instanceId
            }
            Api.get('monitor_dashboard_path_api', params, true).then(res => {
                if (res && res.path) {
                    // 参数由接口传来， params中 var- 开头的是对应传参
                    let query = []
                    if (Object.prototype.toString.call(res.params) === '[object Object]') {
                        for (let [key, value] of Object.entries(res.params)) {
                            if (/^var-/.test(key)) {
                                //
                                query.push(`${key}=${value}`)
                            }
                        }
                    }

                    query = query.join('&')
                    this.tarUrl = `${res.path}?kiosk&theme=dark&${query}`
                } else
                    this.tarUrl = ''
            })
        },
        handleColor (count) {
            if (count >= 90)
                return '#b3323c'
            else if (count >= 60)
                return '#bd7d00'
            else
                return '#29a460'
        },
        refreshTime () {
            let nowDate = new Date()
            this.dateTime.year = nowDate.getFullYear()
            this.dateTime.month = nowDate.getMonth() + 1
            this.dateTime.date = nowDate.getDate()
            this.dateTime.week = handleWeek(nowDate.getDay())
            this.dateTime.time = nowDate.toLocaleTimeString()
        },
        rowClick (row, event, column) {
            // 点击告警列表行
            this.getCurrentGrafanaPath(row['instance_id'])
        },
        resizeStyle (currentWidth) {
            if (currentWidth <= 1430) {
                this.showText = false
                this.processStrokeWidth = 5
                // 小屏幕下修改仪表盘title字体大小
                this.labelFontSize = 18
            } else {
                this.showText = true
                this.processStrokeWidth = 24
                // 小屏幕下修改仪表盘title字体大小
                this.labelFontSize = 24
            }
        },
        getAlarmClass (severity) {
            let prop = (this.alarmCounts.find(item => item.value === severity) || {}).prop
            return 'alarm_' + prop
        }
    },
    computed: {
        isLowVersionFireFox () {
            return window.document.onmozfullscreenchange !== undefined
        },
        alarmCounts () {
            let alarms = [{label: '全部', value: 'total', prop: 'total'}]
            return [...alarms, ...AlarmLevel]
        },
        ...mapGetters([
            'bigScreenDefine'
        ])
    },
    mounted () {
        let self = this
        let gaugeChart = self.$refs.gaugeChart
        let alarmDetail = self.$refs.alarmDetail
        let alarmBox = self.$refs.alarmBox
        let clockPanel = self.$refs.clockPanel
        let alarmInfo = self.$refs.alarmInfo
        if (!this.bigScreenDefine) {
            this.resizeStyle(this.$refs.bigScreen.offsetWidth)
            gaugeChart.style.height = (gaugeChart.offsetWidth / 2) + 'px'
            // UCMP3-4773  【IE11兼容性】在IE11浏览器下，大屏云主机的监控数据显示重叠，告警展示不合理
            setTimeout(() => {
                alarmDetail.style.height = alarmBox.offsetHeight - clockPanel.offsetHeight - alarmInfo.offsetHeight - 35 + 'px'
            }, 1000)
            self.showGauge = true
            self.timeInterval = setInterval(() => {
                this.refreshTime()
            }, 1000)
            self.refreshAlarmInterval = setInterval(() => {
                this.refreshServiceAvail()
                this.refreshAlarmListAndCount()
            }, 30000)
        }
        function exitFull (self) {
            if (!(document.webkitCurrentFullScreenElement || document.mozFullScreenElement || document.msfullscreenElement || document.fullscreenElement)) {
                self.setNavBarDisplay(true)
                // 给父框架发送消息，显示顶部导航栏
                window.parent.postMessage({ status: 'showNavBar' }, '*')
                self.$router.push('/dashboard')
            } else if (!self.bigScreenDefine) {
                let currentWidth = gaugeChart.offsetWidth
                let scale = currentWidth / gaugeChart.offsetWidth
                gaugeChart.style.transform = `scale(${scale})`
                gaugeChart.style.transformOrigin = (gaugeChart.offsetWidth / 2 - currentWidth / 2) + 'px'

                setTimeout(() => {
                    alarmDetail.style.height = alarmBox.offsetHeight - clockPanel.offsetHeight - alarmInfo.offsetHeight - 35 + 'px'
                }, 1000)
            }
        }
        // 当火狐浏览器为38时，浏览器全屏状态的切换状态事件为onmozfullscreenchange，其他浏览器或高版本火狐浏览器的全屏状态切换事件为onfullscreenchange
        if (this.isLowVersionFireFox) {
            window.document.onmozfullscreenchange = () => {
                exitFull(self)
            }
        } else if (window.document.onfullscreenchange !== undefined) {
            window.document.onfullscreenchange = () => {
                exitFull(self)
            }
        } else if (window.document.onwebkitfullscreenchange !== undefined) {
            // 360
            window.document.onwebkitfullscreenchange = () => {
                exitFull(self)
            }
        } else if (window.document.onmsfullscreenchange !== undefined) {
              setTimeout(() => {
                  window.document.onmsfullscreenchange = () => {
                      exitFull(self)
                  }
              }, 1000)
        }
    },
    destroyed () {
        if (!this.bigScreenDefine) {
            clearInterval(this.refreshAlarmInterval)
            clearInterval(this.timeInterval)
        }
        // if (this.isLowVersionFireFox)
        //     window.document.onmozfullscreenchange = null
        // else
        //     window.document.onfullscreenchange = null
        if (this.isLowVersionFireFox)
            window.document.onmozfullscreenchange = null
        else if (window.document.onfullscreenchange !== undefined)
            window.document.onfullscreenchange = null
        else if (window.document.onwebkitfullscreenchange !== undefined)
            // 360
            window.document.onwebkitfullscreenchange = null
        else if (window.document.onmsfullscreenchange !== undefined)
            window.document.onmsfullscreenchange = null

        window.onresize = null
    }
}
</script>
<style lang="scss" scoped>
.container-body {
    height: calc(100% - 35px);
}
.clock-bg {
    width: 90%;
    margin: 0 auto;
    margin-bottom: 20px;
    margin-top: -20px;
}
.gauge-chart {
    width: 100%;
    height: 100%;
    // margin: 10px auto;
}
</style>
