<template lang="pug">
	div.full-container
		Chart(:option="option" :stock="stock")
</template>
<script>
import Chart from './Charts'

export default {
    props: {
        options: {
            /**
             * @description 以下参数根据使用需求可以进行选择性使用，都为可选配置
             * @augments boolean:showLoading——[true|false]  等待loading图表
             * @augments Array:colors——[] 颜色色值信息 默认值为 ['#0081f6','#ffcc4d','#93d347','#ff8562','#16aeed','#1c6de7']
             * @augments String:bgColor——[] 图表的背景色 默认值为 transparent
             * @augments Object:title——[props:text] 折线图的title内容，设置text属性即可，默认为 ''
             * @augments Object:noData——[props:text] 图表中无数据时的显文字， 设置text属性， 默认为 '暂无数据'
             * @augments Object:legend——[props:enabled] 是否显示图例内容，设置该属性下的enabled【boolean】值--true|false
             * @augments Object:tooltip——[props:bgColor,pointFormat,color,fontSize] 鼠标移动至点上的提示文本内容及样式设置（此处可以自定义DOM结构并设置style样式）
             *    *   *   *bgColor:tip提示的背景颜色
             *    *   *   *pointFormat:tip提示内容--常用的参数有[{series.name}, {point.y}, {poiny.x}, {point.percentage}],
             *                                     {point.percentage: .1f} '.1f'表示取小数点后一位，{poiny.x: %Y-%m-%d}--时间格式为 'year-month-day'
             *    *   *   *color:tip提示内容的字体颜色
             *    *   *   *fontSize:tip提示文本字体大小
             * @augments Array:series[] 图表的数据源， 默认为空[],常见的数据格式为[{name: '名称', data: [{x1, y1}, {x2, y2}····]}] x1,x2为X轴内容， y1, y2为Y轴数据
             *    *   *   *图表是否包含多条线有series数组内的元素而定
             */
            type: Object,
            default () {
                return {}
            }
        },
        clickFn: {
            /**
             * @event 点击图表子项触发的事件
             */
            type: Function
        },
        stock: {
            // 是否用highstock构建
            type: Boolean
        }
    },
    data () {
        return {
            chart: {}
        }
    },
    methods: {
        clickItem () {
            if (this.clickFn && typeof this.clickFn === 'function')
                this.$emit('clickFn', event)
        }
    },
    computed: {
        option () {
            let _this = this
            let obj = {
                showLoading: _this.options.showLoading || false,
                colors: _this.options.colors || [
                    '#0081f6',
                    '#ffcc4d',
                    '#93d347',
                    '#ff8562',
                    '#16aeed',
                    '#1c6de7'
                ],
                chart: {
                    type: _this.options.type || 'spline',
                    zoomType: 'x',
                    borderRadius: 5,
                    backgroundColor: _this.options.bgColor || 'transparent',
                    spacing: (_this.options.legend && _this.options.legend.enabled) ? [20, 10, 10, 10] : [10, 10, 10, 10]
                },
                title: {
                    text: (_this.options.title && _this.options.title.text) || ''
                },
                lang: {
                    noData: (_this.options.noData && _this.options.noData.text) || '暂无数据'
                },
                noData: {
                    style: {
                        fontSize: '26px',
                        fontWeight: 'light'
                    }
                },
                legend: {
                    enabled: (_this.options.legend && _this.options.legend.enabled) || false,
                    verticalAlign: (_this.options.legend && _this.options.legend.verticalAlign) || 'bottom',
                    align: (_this.options.legend && _this.options.legend.align) || 'center',
                    floating: (_this.options.legend && _this.options.legend.floating) || false,
                    x: (_this.options.legend && _this.options.legend.x) || 0,
                    y: (_this.options.legend && _this.options.legend.y) || 0,
                    itemStyle: {
                        color: '#1f1f1f',
                        fontSize: '12px',
                        fontWeight: '500'
                    }
                },
                xAxis: _this.options.xAxis || {
                    type: 'datetime',
                    title: {
                        text: null
                    },
                    lineWidth: 1,
                    lineColor: '#000',
                    dateTimeLabelFormats: {
                        hour: '%H:%M',
                        day: '%m-%d',
                        week: '%m-%d',
                        month: '%Y-%m',
                        year: '%Y'
                    }
                },
                yAxis: _this.options.yAxis || {
                    allowDecimals: false,
                    title: '',
                    min: 0,
                    lineWidth: 1,
                    lineColor: '#000'
                },
                tooltip: {
                    backgroundColor: (_this.options.tooltip && _this.options.tooltip.bgColor) || '#798697',
                    borderColor: 'none',
                    shadow: false,
                    headerFormat: '',
                    pointFormat: (_this.options.tooltip && _this.options.tooltip.pointFormat) || '',
                    style: {
                        color: (_this.options.tooltip && _this.options.tooltip.color) || '#fff',
                        fontSize: (_this.options.tooltip && _this.options.tooltip.fontSize) || '13px'
                    }
                },
                plotOptions: _this.options.plotOptions || {
                    spline: {
                        marker: {
                            enabled: true
                        },
                        events: {
                            click (event) {
                                if (_this.clickFn && typeof _this.clickFn === 'function')
                                    _this.clickItem(event)
                            }
                        }
                    }
                },
                series: _this.options.series || [],
                credits: {
                    enabled: false //不显示LOGO
                }
            }

            if (this.stock) {
                obj.rangeSelector = this.options.rangeSelector || {enabled: false}
                obj.navigator = this.options.navigator || {
                    xAxis: {
                        dateTimeLabelFormats: {
                            hour: '%H:%M',
                            day: '%m-%d',
                            week: '%m-%d',
                            month: '%Y-%m',
                            year: '%Y'
                        }
                    },
                    height: 40,
                    margin: 5
                }
                obj.tooltip.headerFormat = '<span style="font-size: 10px">{point.key}</span><br/>'
                obj.tooltip.xDateFormat = '%Y-%m-%d'
            }

            return obj
        }
    },
    components: {
        Chart
    }
}
</script>
<style lang="scss" scoped>
</style>
