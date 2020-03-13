<template lang="pug">
    div.container-flud(ref="container")
        el-row.breadcrumb-container
            el-breadcrumb(separator-class="el-icon-arrow-right")
                el-breadcrumb-item(to="/") {{sysName}}
                el-breadcrumb-item(v-for="(item, index) in breadcrumbItems" :key="item.prop" :to="{ path: item.prop }") {{item.label}}
        div.cloud-provider-edit-content
            div.full-container(slot="content")
                div.cloud-provider-content
                    SelectCloudProvider(v-if="cloudProvider.cur_step === 1")
                    Configaration(v-if="cloudProvider.cur_step === 2")
                    //- SourcePool(v-if="cloudProvider.cur_step === 3")
</template>
<script>
import cloudProvider from '@mixins/cloudProvider.mixin'
import SelectCloudProvider from './editCloudProviderForm/SelectCloudProvider'
import Configaration from './editCloudProviderForm/Configaration'
import SourcePool from './editCloudProviderForm/SourcePool'
import { mapGetters } from 'vuex'

export default {
    name: 'EditCloudProvider',
    mixins: [cloudProvider],
    data () {
        return {
            breadcrumbItems: [
                {prop: '/cloud-provider', label: '云厂商'},
                {prop: '', label: '添加云厂商'}
            ],
            steps: [
                {
                    prop: 'cloud',
                    label: '选择云厂商'
                },
                {
                    prop: 'config',
                    label: '输入API配置凭证'
                }
                // {
                //     prop: 'source',
                //     label: '同步云资源池'
                // }
            ]
        }
    },
    methods: {
        init () {
            if (this.$route.params.id === 'add')
                this.setCloudProvider({cur_step: 1, type: ''})
            else {
                this.breadcrumbItems = [
                    {prop: '/cloud-provider', label: '云厂商'},
                    {prop: '', label: '编辑云厂商'}
                ]
            }
        }
    },
    created () {
        this.init()
    },
    computed: {
        ...mapGetters([
            'sysName'
        ])
    },
    components: {
        SourcePool,
        Configaration,
        SelectCloudProvider
    }
}
</script>
<style lang="scss" scoped>
.cloud-provider-edit-content {
    height: calc(100% - 50px);
    overflow: hidden;
}
.cloud-provider-content {
    padding: 0 16px;
    height: calc(100% - 60px);
}
</style>


