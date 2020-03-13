<template lang="pug">
    div.cloud-source-pool
        div.source-pool-container
            div.full-height
                div.title 同步资源池
                div.source-pool-content
                    span.control-label 同步资源池结束后，后续可在系统配置中进行同步策略设置，也可手动重新同步！
                    el-progress(type="circle" :percentage="25")
                    span.status 同步中...
        div.cloud-provider-bottom
            el-button(type="primary" size="small" @click="close") 完成
</template>
<script>
import cloudProvider from '@mixins/cloudProvider.mixin'
export default {
    name: 'SourcePool',
    mixins: [cloudProvider],
    data () {
        return {
        }
    },
    methods: {
        /**
         * @description 关闭操作
         */
        close () {
            this.$router.push('/cloud-provider')
        }
    },
    created () {
    }
}
</script>
<style lang="scss" scoped>

</style>


