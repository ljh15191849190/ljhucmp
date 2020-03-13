<template lang="pug">
    ChartItem(:title="titleLabel")
        div.full-container(slot="chartCot")
            LineChart(:options="alarmOptions")
</template>
<script>
import ChartItem from '../CardItem'
import LineChart from '../../common/charts/LineCharts'
export default {
    components: { ChartItem, LineChart },
    data () {
        return {
            titleLabel: '告警信息',
            alarmOptions: {
                colors: [ '#ffdd00', '#ffaa00', '#e64450' ],
                legend: {
                    enabled: true,
                    verticalAlign: 'top',
                    align: 'right',
                    floating: true,
                    x: -10,
                    y: -25
                },
                tooltip: {
                    pointFormat: '{series.name}: {point.y}<br>{point.x: %m-%d}'
                },
                series: [
                    {
                        name: '严重',
                        data: [
                            [Date.UTC(new Date('2018-5-21').getDay()), 2],
                            [Date.UTC(new Date('2018-5-22').getDay()), 15],
                            [Date.UTC(new Date('2018-5-23').getDay()), 20],
                            [Date.UTC(new Date('2018-5-24').getDay()), 12]
                        ]
                    },
                    {
                        name: '警告',
                        data: [
                            [Date.UTC(new Date('2018-5-21').getDay()), 5],
                            [Date.UTC(new Date('2018-5-22').getDay()), 10],
                            [Date.UTC(new Date('2018-5-23').getDay()), 9],
                            [Date.UTC(new Date('2018-5-24').getDay()), 15]
                        ]
                    },
                    {
                        name: '提醒',
                        data: [
                            [Date.UTC(new Date('2018-5-21').getDay()), 8],
                            [Date.UTC(new Date('2018-5-22').getDay()), 5],
                            [Date.UTC(new Date('2018-5-23').getDay()), 19],
                            [Date.UTC(new Date('2018-5-24').getDay()), 11]
                        ]
                    }
                ]
            }
        }
    }
}
</script>
