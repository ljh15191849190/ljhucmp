<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems" bgEmpty="true" v-loading="!loadApplyForInstance")
        ApplyForInstance(
            slot="content"
            v-if="loadApplyForInstance"
            :serviceCode="serviceCode"
            v-loading="isLoading"
            @hideLoading="hideLoading"
        )
</template>
<script>
import ApplyForInstance from './ApplyForInstance'
import MetadataUtls from '@server/metadata.utils'
import { mapGetters, mapActions } from 'vuex'
import Api from '@api'

export default {
    data () {
        return {
            checkedMeta: {},
            isLoading: true,
            loadApplyForInstance: false,
            privilegePromise: null // UCMP3-5763 获取服务属性申请权限promise
        }
    },

    methods: {
        ...mapActions([
            'updateMetaData',
            'setMetadataApplyPrivileges'
        ]),

        /**
         * @description 当前服务不在基础metadata列表中，懒加载对应信息并更新元数据metadata
         */
        lazyUpdateMetaData () {
            if (this.metadataCodes.indexOf(this.serviceCode) === -1) {
                Api.get('getMetadata', { _code: 'blueprint/' + this.serviceCode }, true).then(res => {
                    if (!res || !res.metadata)
                        return
                    
                    this.updateMetaData(res.metadata)
                    this.checkedMeta = res.metadata
                    // UCMP3-5718 更新当前蓝图的元数据后再加载子组件
                    this.loadApplyForInstance = true
                })
            } else {
                this.checkedMeta = MetadataUtls.getCheckedMeta(this.metadata, this.$route.params.code)
                this.loadApplyForInstance = true
            }
        },

        hideLoading () {
            this.isLoading = false
        },

        // UCMP3-5763 初始化函数
        _initialize () {
            this.privilegePromise = Api.get('getAllServiceAttributeByRolePrivilege', {}, true).then(
                res => {
                    this.setMetadataApplyPrivileges(res)
                }
            )
            let promiseArr = [this.privilegePromise]
            // UCMP3-5763 Navar组件获取metadata的promise如果存在，加入栈
            if (this.menuMetadataPromise)
                promiseArr.push(this.menuMetadataPromise)

            Promise.all(promiseArr).then(
                res => this.lazyUpdateMetaData()
            )
        }
    },

    computed: {
        ...mapGetters([
            'metadata',
            'menuMetadataPromise'
        ]),

        // UCMP3-5718 基础元数据的code集合(非蓝图)
        metadataCodes () {
            return this.metadata.filter(meta => meta.hasOwnProperty('attribute')).map(
                meta => { return meta.service_code }
            )
        },

        breadcrumbItems () {
            let breadcrumbItems = []
            // 该页面进入方式为 【编排管理】 && 【服务申请】，分场景对其父路由进行配置
            if (this.$route.query.type === 'blueprint-deploy')
                breadcrumbItems = [{ prop: '/blueprint', label: '编排管理' }]
            else
                breadcrumbItems = [{ prop: '/service-catalog', label: '服务目录' }]
            return [ ...breadcrumbItems, { prop: '/catalog/' + this.checkedMeta.service_code, label: '申请' + this.checkedMeta.name } ]
        },

        serviceCode () {
            return this.$route.params.code
        }
    },

    created () {
        this._initialize()
    },

    components: {
        ApplyForInstance
    }
}
</script>
