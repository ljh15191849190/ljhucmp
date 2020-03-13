<template lang="pug">
    div.full-container
        EmptyPage(v-if="isEmpty")
            span(slot="content") 主机状态异常，无相关监控信息
        IframeContainer(v-else :url="tarUrl")
</template>
<script>
import { IframeContainer } from '@leaptocloud/standard-ui'
import EmptyPage from '../../common/EmptyPage'
import Api from '@api'

export default {
    props: {
        instanceId: {
            type: String,
            default: ''
        },
        instanceIds: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            tarUrl: '',
            isEmpty: false
        }
    },
    created () {
        if (this.instanceId)
            this.getCurrentUrl(this.instanceId)
        else if (this.instanceIds)
            this.getMultDashboards(this.instanceIds)
        else
            this.isEmpty = true
    },
    methods: {
        getCurrentUrl (id) {
            let params = {
                server_code: 'ecs0',
                id: id
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
                    this.tarUrl = `${res.path}?kiosk&theme=light&${query}`
                } else
                    this.isEmpty = true
            })
        },
        // 获取多主机对比时的grafana路径
        /**
         * @param id 主机id 集合
         * @param server_code grafana图表类型 ecs-tmp
         */
        getMultDashboards (instanceIds) {
            let params = {
                id: instanceIds,
                server_code: 'ecs-cmp'
            }
            Api.get('monitor_dashboard_path_api', params).then(res => {
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
                this.tarUrl = `${res.path}?kiosk&theme=light&${query}`
            })
        }
    },
    components: { IframeContainer, EmptyPage }
}
</script>
