<template lang="pug">
    CardItem(:title="titleLabel" enlargeable)
        BarChart(slot="chartCot" :options="chartOption")
        BarChart(slot="chartCotDialog" :options="chartOption")
</template>
<script>
import BarChart from '../../common/charts/BarCharts'
// mock 数据
import AlarmTop2 from '@mock/homeCharts/alarmTop2'
import CardItem from '../CardItem'

const buildChartOption = function (data, toolTip) {
    let _data2 = []
    data.map(item => {
        _data2.push({ name: item.instancename, y: item.usage / 100 })
    })
    let option = {
        series: [
            {
                data: _data2,
                name: toolTip,
                dataLabels: {
                    enabled: true,
                    align: 'center',
                    x: 0,
                    y: -10,
                    style: {
                        fontSize: '13px',
                        color: '#1f1f1f'
                    }
                }
            }
        ]
    }

    return option
}
export default {
    data () {
        return {
            titleLabel: 'TOP-10 内存使用率',
            chartOption: null
        }
    },
    created () {
        this.chartOption = buildChartOption(AlarmTop2, '内存')
    },
    components: { BarChart, CardItem }
}
</script>
<style lang="scss" scoped>
</style>
