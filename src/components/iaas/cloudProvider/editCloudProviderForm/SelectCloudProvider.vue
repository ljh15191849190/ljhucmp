<template lang="pug">
    div.select-cloud-container
        div.selectCloudProvider
            div.full-height
                div.title 选择云厂商
                div.provider-content.overflow-y-auto.padding-bottom
                    a.provider_public.margin-top(
                        v-for="item in providers"
                        @click="selectProviderType(item.code)"
                        :class="{actived_provider: cloudProviderType === item.code}"
                    )
                        div.checked_tick(v-if="cloudProviderType === item.code")
                            div.tick
                        span.full-container.bac-span
                            img.fixed-w-h(:src="getImageAsType(item.code)")
                    // 即将上线
                    div.coming-soon
                        div.title 即将上线
                        a.provider_public.margin-top(v-for="item in comingSoonProviders")
                            div.checked_tick
                                div.tick
                            span.full-container.bac-span.coming-soon_provider
                                img.fixed-w-h(:src="getImageAsType(item.code)")
        div.cloud-provider-bottom
            el-button(type="warning" size="small" @click="next" :disabled="!cloudProviderType") 下一步: API配置凭证
</template>
<script>
    import Api from '@api'
    import cloudProvider from '@mixins/cloudProvider.mixin'
    import {comingSoonProviders} from '@mock/cloudProvider/cloudProvider.conf'

    export default {
        name: 'SelectCloudProvider',
        mixins: [cloudProvider],
        data () {
            return {
                providers: [],
                comingSoonProviders: comingSoonProviders,
                cloudProviderType: ''
            }
        },
        methods: {
            /**
             * @description 获取云厂商定义
             */
            getProviderConf () {
                Api.get('providerDefine', {}, true).then(
                    res => {
                        this.providers = res
                    }
                )
            },
            /**
             * @description 选中云厂商
             * @augments [type] 云厂商类型
             */
            selectProviderType (type) {
                this.cloudProviderType = type
            },
            /**
             * @description 根据类型获取图片
             * @augments [type] 云厂商类型
             */
            getImageAsType (type) {
                // this.poolTypes = [
                //     {Iaas: 'Aliyun', openType: 'public'},
                //     {Iaas: 'Azure', openType: 'public'},
                //     {Iaas: 'QCloud', openType: 'public'},
                //     {Iaas: 'QingCloud', openType: 'public'},
                //     {Iaas: 'OpenStack', openType: 'private'},
                //     {Iaas: 'VMWare', openType: 'private'},
                //     {Iaas: 'XenServer', openType: 'private'},
                //     {Iaas: 'Scvmm', openType: 'private'}
                // ]
                // return `../../../../static/ucmp-ui/static/images/provides/provider-${type}.png`
                if (process.env.NODE_ENV !== 'development')
                    return `../../../../static/ucmp-ui/static/images/provides/provider-${type}.png`

                return `../../../../static/images/provides/provider-${type}.png`
            },
            /**
             * @description 下一步操作
             */
            next () {
                this.setCloudProvider({
                    cur_step: 2,
                    type: this.cloudProviderType,
                    providers: this.providers
                })
            }
        },
        created () {
            this.cloudProviderType = this.cloudProvider.type
            this.getProviderConf()
        }
    }
</script>
<style lang="scss" scoped>
    .coming-soon {
        margin-top: 60px;
        .coming-soon_provider img {
            filter: grayscale(1);
        }
    }
    .fixed-w-h {
        width: 244px;
        height: 87px;
    }
</style>
