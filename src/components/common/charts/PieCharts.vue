<template lang="pug">
    div.full-container
        Chart(:option="option")
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
           * @augments Object:title——[props:text,position,y,fontSize,color] 折线图的title内容，设置text属性即可，默认为 ''
           *    *   *   *text：内容
           *    *   *   *position:title位置 top|middle|bottom 默认undefined
           *    *   *   *y：内容的偏移距离
           * @augments Object:noData——[props:text] 图表中无数据时的显文字， 设置text属性， 默认为 '暂无数据'
           * @augments Object:legend——[props:enabled,layout] 是否显示图例内容，设置该属性下的enabled【boolean】值--true|false; layout为图例的显示方式 vertical|horizontal
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
           * @augments Boolean:hasClickFn 图表是否点击事件
           */
          type: Object,
          default () {
              return {

              }
          }
      }
  },
  data () {
    return {
      chart: {}
    }
  },
  methods: {
    clickItem (event) {
      if (this.options.hasClickFn)
        this.$emit('clickFn', event)
    }
  },
  computed: {
    option () {
      let _this = this
      return {
        colors: _this.options.colors || [ '#1cd4c7', '#0081f6', '#93d347', '#ffcc4d', '#93d347', '#ff8562' ],
        chart: {
          type: 'pie',
          backgroundColor: _this.options.bgColor || 'transparent',
          spacing: (_this.options.chart && _this.options.chart.spacing) || [10, 10, 10, 10]
        },
        title: {
          text: (_this.options.title && _this.options.title.text) || '',
          verticalAlign: (_this.options.title && _this.options.title.position),
          y: (_this.options.title && _this.options.title.y) || 10,
          style: {
            fontSize: (_this.options.title && _this.options.title.fontSize) || '13px',
            color: (_this.options.title && _this.options.title.color) || '#646464',
            zIndex: (_this.options.title && _this.options.title.zIndex) || 0
          },
          useHTML: (_this.options.title && _this.options.title.useHTML) || false
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
          enabled: (_this.options.legend && _this.options.legend.enabled) || true,
          layout: (_this.options.legend && _this.options.legend.layout) || 'horizontal',
          align: (_this.options.legend && _this.options.legend.align) || 'center',
          verticalAlign: 'bottom',
          itemMarginTop: (_this.options.legend && _this.options.legend.itemMarginTop) || 0,
          floating: (_this.options.legend && _this.options.legend.floating) || false,
          alignColumns: true,
          x: (_this.options.legend && _this.options.legend.x) || 0,
          y: (_this.options.legend && _this.options.legend.y) || 0,
          style: {
              fontSize: '12px'
          },
          labelFormatter: (_this.options.legend && _this.options.legend.labelFormatter) ||
            function () {
              return this.name + ':' + this.y + (this.unit || '')
            }
        },
        tooltip: {
          enabled: (_this.options.tooltip && _this.options.tooltip.enabled) || true,
          backgroundColor: (_this.options.tooltip && _this.options.tooltip.bgColor) || '#798697',
          borderColor: 'none',
          shadow: false,
          hideDelay: 100,
          headerFormat: '',
          pointFormat: (_this.options.tooltip && _this.options.tooltip.pointFormat) || '',
          footerFormat: '',
          style: {
            color: (_this.options.tooltip && _this.options.tooltip.color) || '#fff',
            fontSize: (_this.options.tooltip && _this.options.tooltip.fontSize) || '13px'
          }
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: (_this.options.plotOptions && _this.options.plotOptions.labelEnabled) || false, // 图表上是否显示信息
              distance: (_this.options.plotOptions && _this.options.plotOptions.distance) || -1,
              format: (_this.options.plotOptions && _this.options.plotOptions.labelText) || '<b>{point.name}</b>',
              filter: {
                property: 'percentage',
                operator: '>',
                value: (_this.options.plotOptions && _this.options.plotOptions.labelLimit) || 0
              },
              style: (_this.options.plotOptions && _this.options.plotOptions.fontStyle) || {
                fontSize: '13px',
                color: '#333',
                textShadow: 'none'
              }
            },
            events: {
              click (event) {
                _this.clickItem(event)
              }
            },
            showInLegend: (_this.options.plotOptions && _this.options.plotOptions.showInLegend) || false
          }
        },
        series: _this.options.series,
        credits: {
          enabled: false //不显示LOGO
        }
      }
    }
  },
  components: { Chart }
}
</script>
<style lang="scss" scoped>

</style>
