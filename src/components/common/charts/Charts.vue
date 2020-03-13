<template lang="pug">
  div.full-container
</template>
<script>
import Highcharts from 'highcharts/highstock'
import HighchartsNoData from 'highcharts/modules/no-data-to-display'

export default {
    props: ['option', 'stock'],
    data () {
        return {
            chart: {}
        }
    },
    watch: {
        'option.series': {
            handler: function (val, oldVal) {
                // 先清空原有series数据，然后再用新值val进行重新赋值
                // 优化原有循环，使用while
                let self = this
                while (self.chart.series.length > 0)
                    self.chart.series[0].remove(true)
                if (!self.chart.series.length) {
                    val.forEach(item => {
                        self.chart.addSeries(item)
                    })
                } else {
                    self.chart.update({
                        series: val
                    }, true)
                }
            },
            deep: true
        },
        'option': {
            handler: function (option, oldVal) {
                this.chart.update(option)
            },
            deep: true
        },
        'option.showLoading': {
            handler: function (val, oldVal) {
                if (val)
                    this.chart.showLoading()
                else
                    this.chart.hideLoading()
            }
        }
    },
    mounted () {
        // eslint-disable-next-line
        Highcharts.setOptions({
            lang: {
                resetZoom: '重置'
            },
            // 设置highchart全局的时区偏移 （GMT+8）
            global: {
                timezoneOffset: -8 * 60
            }
        })
        HighchartsNoData(Highcharts)
        if (this.stock) this.chart = Highcharts.stockChart(this.$el, this.option)
        else this.chart = new Highcharts.Chart(this.$el, this.option)
    }
}
</script>
<style lang="scss" scoped>
</style>
