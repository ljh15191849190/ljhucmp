<template lang="pug">
    div.full-container.full-height(v-loading="loading")
        IframeContainer.full-height(v-if="tarUrl" :url="tarUrl")
        EmptyPage(v-else)
            span(slot="content") 无相关监控信息
</template>

<script>
    import { IframeContainer } from '@leaptocloud/standard-ui'
    import EmptyPage from '../../common/EmptyPage'
    import Api from '@api'

    export default {
        data () {
            return {
                ip: '',
                tarUrl: '',
                loading: false
            }
        },
        created () {
            let params = {}
            if (this.$route.name === 'InstanceDetailHardwareMonitor') { //硬件监控
                let bareId = sessionStorage.getItem('checkedBaremetalBareId')
                params.server_code = 'ipmi'
                params.id = bareId
            } else if (this.$route.name === 'InstanceDetailHardwareMonitorY') { //云架构物理机监控
                params.server_code = 'ipmi'
                params.id = this.$route.params.id
            } else if (this.$route.name === 'InstanceDetailGpuMonitor') {
                params.server_code = 'nvidia-gpu'
                params.id = this.$route.params.id
            } else {
                params.server_code = this.$route.params.code === 'ecs' ? 'ecs0' : this.$route.params.code
                params.id = this.$route.params.id
            }
            this.loading = true
            Api.get('monitor_dashboard_path_api', params, true).then(res => {
                this.loading = false
                if (res) {
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
                }
            }, () => {
                this.loading = false
            })
        },
        components: {IframeContainer, EmptyPage}
    }
</script>
<style lang="scss" scoped>
</style>


