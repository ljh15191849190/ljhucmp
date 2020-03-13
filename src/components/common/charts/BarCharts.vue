<template lang="pug">
	div.full-container
		Charts(:option="option")
</template>
<script>
import Charts from './Charts'
const xAxis = {
  type: 'category',
  labels: {
    rotation: 0 // 设置轴标签旋转角度
  },
  lineWidth: 1,
  lineColor: '#000'
}
const yAxis = {
  title: {
    text: ''
  },
  lineWidth: 1,
  lineColor: '#000'
}
export default {
  props: {
    options: {
        /**
         * @description 以下参数根据使用需求可以进行选择性使用，都为可选配置
         * @augments boolean:showLoading——[true|false]  等待loading图表
         * @augments Array:colors——[] 颜色色值信息 默认值为 ['#0081f6','#ffcc4d','#93d347','#ff8562','#16aeed','#1c6de7']
         * @augments String:bgColor——[] 图表的背景色 默认值为 transparent
         * @augments Object:title——[props:text,position,y,fontSize,color] 折线图的title内容，设置text属性即可，默认为 ''
         *    *   *   *text：内容
         *    *   *   *position:title位置 top|middle|bottom 默认undefined
         *    *   *   *y：内容的偏移距离
         * @augments Object:noData——[props:text] 图表中无数据时的显文字， 设置text属性， 默认为 '暂无数据'
         * @augments Object:legend——[props:enabled,layout] 是否显示图例内容，设置该属性下的enabled【boolean】值--true|false; layout为图例的显示方式 vertical|horizontal
         * @augments Object:xAxis x轴信息（可选）
         * @augments Object:yAxis y轴信息（可选）
         * @augments Object:tooltip——[props:bgColor,pointFormat,color,fontSize] 鼠标移动至点上的提示文本内容及样式设置（此处可以自定义DOM结构并设置style样式）
         *    *   *   *bgColor:tip提示的背景颜色
         *    *   *   *pointFormat:tip提示内容--常用的参数有[{series.name}, {point.y}, {poiny.x}, {point.percentage}],
         *                                     {point.percentage: .1f} '.1f'表示取小数点后一位，{poiny.x: %Y-%m-%d}--时间格式为 'year-month-day'
         *    *   *   *color:tip提示内容的字体颜色
         *    *   *   *fontSize:tip提示文本字体大小
         * @augments Object:plotOptions——[props:labelEnabled,distance,labelText,labelLimit,fontStyle,showInLegend]
         *    *   *   *labelEnabled:是否在饼状图扇叶上显示内容
         *    *   *   *distance: 饼状图扇叶上的内容距离饼状图的距离大小
         *    *   *   *labelText: 饼状图扇叶上的内容文本， 默认为<b>{point.name}</b>
         *    *   *   *labelLimit: 当占有比例小于该值时不显示扇叶上的内容
         *    *   *   *fontStyle: 文本样式自定义 默认{color: #fff; font-size: 13px; text-shadow: 0px 1px 1px gray}
         *    *   *   *showInLegend: 是否显示饼状图的图例
         * @augments Array:series[] 图表的数据源， 默认为空[],常见的数据格式为[{name: '名称', data: []}]
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
      // UCMP3-5695使用分析页面，各个云厂商CPU、内存、存储使用排行不显示，查看接口已返回
      let plotOptionsSeries = _this.options.plotOptions && _this.options.plotOptions.series ? _this.options.plotOptions.series : {}
      return {
        showLoading: _this.options.showLoading || false,
        colors: _this.options.colors || [
          '#006699',
          '#4cabce',
          '#93d347',
          '#ff8562',
          '#16aeed'
        ],
        chart: {
          type: 'column',
          backgroundColor: 'transparent',
          spacing: [10, 10, 10, 10],
          ..._this.options.chart
        },
        title: {
          text: (_this.options.title && _this.options.title.text) || '',
          style: {
              fontSize: (_this.options.title && _this.options.title.fontSize) || '12px'
          }
        },
        xAxis: {...xAxis, ..._this.options.xAxis},
        yAxis: {...yAxis, ..._this.options.yAxis},
        legend: {
          enabled: false,
          verticalAlign: 'top',
          floating: true,
          align: 'right',
          y: -30,
          itemStyle: {
              fontWeight: 'light',
              fontSize: '12px'
          },
          ..._this.options.legend
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
        tooltip: {
          headerFormat:
            (_this.options.tooltip && _this.options.tooltip.headerFormat) ||
            '<span style="font-size:13px">{point.key}</span><br>',
          pointFormat:
            (_this.options.tooltip && _this.options.tooltip.pointFormat) ||
            '{series.name}: {point.y}',
          footerFormat: '',
          shared: false,
          useHTML: true,
          backgroundColor:
            (_this.options.tooltip && _this.options.tooltip.bgColor) ||
            '#798697',
          borderColor: 'none',
          shadow: false,
          style: {
            color:
              (_this.options.tooltip && _this.options.tooltip.color) || '#fff',
            fontSize:
              (_this.options.tooltip && _this.options.tooltip.fontSize) ||
              '13px'
          }
        },
        plotOptions: {
          series: {
            cursor: 'pointer',
            dataLabels: {
              align: 'center',
              enabled: true,
              x: 0,
              y: 0
            },
            events: {
              click (event) {
                if (_this.clickItem && typeof _this.clickItem === 'function')
                    _this.clickItem(event)
                else return false
              }
            },
            ...plotOptionsSeries
          }
        },
        series: _this.options.series || [],
        credits: {
          enabled: false //不显示LOGO
        }
      }
    }
  },
  components: { Charts }
}
</script>
<style lang="scss" scoped>
</style>
