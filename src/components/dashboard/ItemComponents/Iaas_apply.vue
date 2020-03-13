<template lang="pug">
    CardItem(:title="titleLabel" :linkToMore="catalogContents.length >= 8 ? {path: '/service-catalog'}: false")
        div.d-flex.flex-wrap.position-mid.bot-top(slot="chartCot" ref="serviceBox")
            p.p-3(v-if="!catalogContents.length") 没有可申请的服务资源
            div.flex-box(v-for="(service, index) in catalogContents" :key="service.code" @click="linkToService(service)" v-if="index < 8")
                span.service-logo(:class="'resource-icon-'  + service.service_code")
                span.service-name.text-overflow-ellipsis {{service.name}}
</template>
<script>
import CardItem from '../CardItem'
import { mapGetters } from 'vuex'
export default {
    components: { CardItem },
    data () {
        return {
            titleLabel: '服务申请'
        }
    },
    methods: {
         // 点击申请服务进行对应服务页面的跳转
        linkToService (service) {
            this.$router.push('catalog/' + service.service_code)
        }
    },
    computed: {
        ...mapGetters([
            'metadata'
        ]),
        // UCMP-663 过滤服务申请目录列表
        catalogContents () {
            let metaItems = []
            this.applicableServices.forEach(
                item => {
                    let meta = {}
                    meta.name = item.name
                    meta.description = item.description
                    meta.service_code = item.service_code
                    metaItems.push(meta)
                }
            )
            return metaItems
        },
        /**
         * @description 可申请的服务列表
         */
        applicableServices () {
            return this.metadata.filter(
                service => {
                    if (service.applicable)
                        return service
                }
            )
        }
    }
}
</script>
<style lang="scss" scoped>
.position-mid{
    margin-top: 10px;
    padding: 0 20px;
    .flex-box{
        border-bottom: 1px solid #ddd;
    }
}
</style>

