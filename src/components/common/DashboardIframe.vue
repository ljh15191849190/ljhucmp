<template lang="pug">
    div.full-container(
      v-loading="isLoading"
      element-loading-text="拼命加载中"
      element-loading-spinner="ucmp-icon-loading")
        iframe#iframe(
            ref="myIframe"
            :frameborder="borderWidth"
            :width="width"
            :height="height"
            :src="url")
</template>
<script>
export default {
    props: {
        url: String,
        loadCot: {  // 等待中的显示文字
            type: String,
            default: '数据获取中，请等待····'
        },
        borderWidth: { // iframe的border宽度 默认为0
            type: Number,
            default: 0
        },
        width: { // iframe的宽度 默认为 100%
            type: [Number, String],
            default: '100%'
        },
        height: { // iframe的高度 默认为 100%
            type: [Number, String],
            default: '100%'
        },
        noLoading: {
            type: Boolean || String,
            default: false
        }
    },
    data () {
        return {
            isLoading: false,
            timer: null
        }
    },
    mounted () {
        if (this.noLoading)
            this.isLoading = false
        let _this = this
        let myIframe = document.getElementById('iframe')
        if (myIframe.attachEvent) {
            myIframe.attachEvent('onload', function () {
                if (_this.url.match(/\/bpm3\/.?/))
                    _this.setIframeStyle()
                // UCMP3-4773  【IE11兼容性】在IE11浏览器下，大屏云主机的监控数据显示重叠，告警展示不合理
                if (_this.url.match(/\/grafana\/.?/) && document.getElementById('iframe').offsetWidth < 780)
                    _this.grafanaOnLoad()
            })
        } else {
            myIframe.onload = function () {
                if (_this.url.match(/\/bpm3\/.?/))
                    _this.setIframeStyle()
                // UCMP3-4773  【IE11兼容性】在IE11浏览器下，大屏云主机的监控数据显示重叠，告警展示不合理
                if (_this.url.match(/\/grafana\/.?/) && document.getElementById('iframe').offsetWidth < 780)
                    _this.grafanaOnLoad()
            }
        }
    },
    methods: {
        // UCMP3-4688 创建模型页面，在小屏下显示不全
        setIframeStyle () {
            this.timer = setInterval(() => {
                if (document.getElementById('iframe').contentWindow &&
                    document.getElementById('iframe').contentWindow.document.getElementById('propertySection') &&
                    document.getElementById('iframe').contentWindow.document.getElementById('propertySection').children[0] &&
                    document.getElementById('iframe').contentWindow.document.getElementById('propertySection').children[0].children[1]
                  ) {
                      document.getElementById('iframe').contentWindow.document.getElementById('propertySection').children[0].children[1].style.maxHeight = '157px'
                      clearInterval(this.timer)
                }
            }, 1500)
        },
        // UCMP3-4773  【IE11兼容性】在IE11浏览器下，大屏云主机的监控数据显示重叠，告警展示不合理
        grafanaOnLoad () {
            let win = document.getElementById('iframe').contentWindow
            if (win.document.all) {
                win.style = '.react-grid-item.panel{position: static !important;}'
                win.document.createStyleSheet('javascript:style')
            } else {
                let style = document.createElement('style')
                style.type = 'text/css'
                style.innerHTML = '.react-grid-item.panel{position: static !important;}'
                win.document.getElementsByTagName('HEAD').item(0).appendChild(style)
            }
        }
    },
    destroyed () {
      clearInterval(this.timer)
    }
}
</script>
<style lang="scss" scoped>
.load{
    padding-top: 10%;
    font-size: 40px;
}
</style>
