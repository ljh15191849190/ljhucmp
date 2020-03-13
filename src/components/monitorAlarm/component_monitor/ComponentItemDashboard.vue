<template lang="pug">
    div.full-container
        EmptyPage(v-if="!showPage")
            span(slot="content") 监控对象状态异常，无相关监控信息
        IframeContainer(v-else :url="urlPath")
</template>

<script>

import { IframeContainer } from '@leaptocloud/standard-ui'
import EmptyPage from '../../common/EmptyPage'
import Api from '@api'

export default {
    components: { IframeContainer, EmptyPage },
    props: {
        serverCode: {
            type: String,
            default: ''
        },
        serverId: {
            type: String,
            default: ''
        },
        serverName: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            urlPath: '',
            showPage: false // 请求加载完成之后显示garfana组件页面
        }
    },
    created () {
        let params = {
            server_code: this.serverCode,
            id: this.serverId || ''
        }

        Api.get('monitor_dashboard_path_api', params).then(res => {
            // 由于server_id 现在为空，查询到的结果中ip 和 port 对应的字段值为空，因此 ip 和 port 先前端进行定义

            if (res && res.path) {
                this.showPage = true

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
                this.urlPath = `${res.path}?kiosk&theme=light&${query}`
            }
        }, () => { })
    }
}
</script>

