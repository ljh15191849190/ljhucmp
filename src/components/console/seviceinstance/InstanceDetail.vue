<template lang="pug">
  UcmpContainer(:breadcrumbItems="breadcrumbItems")
    div.full-container(slot="content")
        el-form.btn-group-height(v-if="allActions.iconGroup.length + allActions.moreGroup.length" label-width="120px" size="small" label-position="left")
            //- 跳转至详情页面时，因selectedInstanceInfo为null导致operatorPanel报错问题处理
            OperatorPanel(
                v-if="selectedInstanceInfo"
                ref="operatorRef"
                :basicBtns="allActions.iconGroup"
                :advancedBtns="allActions.moreGroup"
                :instances="[selectedInstanceInfo]"
                :serviceCode="serviceCode"
                :btnServiceCode="serviceCode"
                :checkedMetadata="checkedMetadata"
                @operatorSuccess="operatorSuccess"
            )
        el-tabs.margin-top.instance-calc-container(:class="{'no-full-height': !(allActions.iconGroup.length + allActions.moreGroup.length)}" @tab-click="changeTab" :value="activeTab" v-model="activeTab" v-tab-active="{target: this, valueKey: 'activeTab', activeKey: 'code', btns: tabs.privilegefilter(serviceCode, 'button_code')}")
            el-tab-pane.full-height(v-for="tab in tabs.privilegefilter(serviceCode, 'button_code')" :key="tab.code" :name="tab.code" :label="tab.label" :extend="tab.extend")
                InstanceDetailExtend(v-if="tab.extend" :extendCode="tab.name" :serviceCode="serviceCode")
                router-view(v-else-if="tab.code === activeTab")
</template>
<script>

import OperatorPanel from '@/components/console/OperatorPanel'
import MetadataUtils from '@server/metadata.utils'
import { mapGetters, mapActions } from 'vuex'
import ServiceInstanceMixin from '@mixins/serviceInstance.mixin'
import Api from '@api'
import Config from '@mock/metadata/metadata.config'
// import EditInstanceCfg from '../EditInstanceCfg'
import InstanceDetailExtend from './InstanceDetailExtend'

export default {
    beforeRouteUpdate (to, from, next) {
        this.setCheckedInstanceId(to.params.id)
        sessionStorage.setItem('checkedServiceInstanceId', to.params.id)
        next()
    },
    mixins: [ServiceInstanceMixin],
    data () {
        return {
            baseTabs: [{
                code: 'basic',
                label: '资源使用',
                type: 'basic',
                details: [
                    {
                        label: '基本信息',
                        group: []
                    }
                ]
            },
            {
                code: 'bastion',
                label: '堡垒机',
                type: 'router'
            }],
            activedTab: '',
            showInstanceCfgForm: false
        }
    },
    methods: {
        // 初始化
        init () {
            this.getCheckedMetadata()
            // 存贮选择的实例id
            this.saveCheckedInstanceId()
            // 根据路由处理页签激活项(首次进入和刷新当前页面)
            this.handleActiveTab()
            // 获取当前服务实例状态信息,处理按钮
            if (!this.selectedInstanceInfo)
                this.serviceInstanceDetail()
        },
        // 存贮选择的实例id
        saveCheckedInstanceId () {
            if (sessionStorage.getItem('checkedServiceInstanceId')) {
                this.setCheckedInstanceId(sessionStorage.getItem('checkedServiceInstanceId'))
                this.setCheckedProviderId(sessionStorage.getItem('checkedServiceProviderId'))
            }
            if (this.$route.params.id) {
                this.setCheckedInstanceId(this.$route.params.id)
                sessionStorage.setItem('checkedServiceInstanceId', this.$route.params.id)
            }
            if (this.$route.query.provider_id) {
                this.setCheckedProviderId(this.$route.query.provider_id)
                sessionStorage.setItem('checkedServiceProviderId', this.$route.query.provider_id)
            }
        },
        // 处理页签激活项
        handleActiveTab () {
            let self = this
            // 当前路由的路径
            let path = self.$router.currentRoute.path || ''
            // 处理路径中包含的页签项
            let findTab = self.tabs.find((value) => path.includes(value.code))

            this.activedTab = findTab ? findTab.code : ''
        },
        serviceInstanceDetail () {
            let params = {}
            params.service = this.serviceCode
            params.instanceId = this.checkedInstanceId
            Api.get('serviceInstanceDetail', params, true).then(
                res => {
                    if (res)
                        this.setSelectedInstanceInfo(res)
                }
            )
        },
        // 切换页签
        changeTab (tab) {
            tab && tab.name && this.$router.push(tab.name)
        },
        ...mapActions([
            'setBasicDetailGroup',
            'setCheckedInstanceId',
            'setCheckedProviderId',
            'setGroupActions',
            'setOperatorSuccess',
            'setSelectedInstanceInfo'
        ]),
        /**
         * @description 从元数据列表筛选出当前服务对应的配置信息
         */
        getCheckedMetadata () {
            MetadataUtils.initMetaInfoByServiceCode(this.serviceCode, this.metadata, Config)
        },
        // After button icon operation success
        operatorSuccess (btn) {
            const toConsoleOprs = ['delete', 'release']
            // Refresh service instance detail information
            // bug UCMP-1668【控制台】在云主机、云硬盘详情中删除资源，页面仍停留在详情页面，仍可点击删除，多次删除在回收站会产生多条一样的数据
            btn && toConsoleOprs.includes(btn.name) ? this.$router.push('/serviceInstance/' + this.serviceCode) : this.serviceInstanceDetail()
            this.setOperatorSuccess(true)
        }
        
    },
    computed: {
        breadcrumbItems () {
            let instanceName = this.selectedInstanceInfo ? (this.selectedInstanceInfo.instance_name || this.selectedInstanceInfo[this.serviceCode + '_name'] || this.selectedInstanceInfo.name || this.selectedInstanceInfo.cache_name) : ''
            // UCMP3-4792 使用元数据适配，显示合适的名称
            if (this.checkedMetadata && this.checkedMetadata.text_field && this.selectedInstanceInfo && this.selectedInstanceInfo[this.checkedMetadata.text_field])
                instanceName = this.selectedInstanceInfo[this.checkedMetadata.text_field]
            
            if (this.checkedMetadata.service_code === 'netbox_ip') 
                instanceName = this.selectedInstanceInfo ? this.selectedInstanceInfo.ip : ''
            let breadcrumbArr = [{ prop: this.checkedMetadata.service_code + '_detail', label: instanceName + '详情' }]

            // UCMP3-1571【控制台】pool管理页面不应该显示出来
            if (this.checkedMetadata.service_code !== 'pool')
                breadcrumbArr.unshift({ label: (this.checkedMetadata.name || '') + '管理', prop: '/serviceInstance/' + this.checkedMetadata.service_code })
            return breadcrumbArr
        },
        serviceCode () {
            return this.$route.params.code
        },
        ...mapGetters([
            'groupActions',
            'checkedMetadata',
            'metadata',
            'instanceConfig',
            'checkedInstanceId',
            'selectedInstanceInfo'
        ]),

        allActions () {
            let groupActions = JSON.parse(JSON.stringify(this.groupActions))
            // service_code是netbox_ip(预留ip，过滤查看、绑定、解绑)
            if (this.checkedMetadata.service_code === 'netbox_ip') 
                groupActions.iconGroup = groupActions.iconGroup.filter(item => item.existInDetail !== false)
    
            return groupActions
        },

        /**
         * metadata 基础信息，Object类型
         */
        metadataObj () {
            let meta = {}
            this.metadata.forEach(
                item => {
                    meta[item.service_code] = {
                        name: item.name,
                        group: item.group,
                        attributes: item.attribute ? item.attribute : []
                    }
                }
            )
            return meta
        },
        // showTabs () {
        //      return this.getArrEqual(this.getButtons(), this.tabs)
        //     // return this.getButtons()
        // },

        tabs () {
            let tabs = []
            if (this.instanceConfig && this.instanceConfig.details && this.instanceConfig.details.length)
                tabs = this.instanceConfig.details.filter(item => item.type === 'router' || item.type === 'basic')
            else {
                tabs = this.baseTabs
                this.baseTabs[0].details[0].list = this.checkedMetadata.attribute.map(
                    item => {
                        return item.key
                    }
                )
            }
            // 若为层次服务,添加其children到tabs
            if (Array.isArray(this.checkedMetadata.children) && this.checkedMetadata.children.length) {
                let childrenCopy = JSON.parse(JSON.stringify(this.checkedMetadata.children))
                childrenCopy = childrenCopy.map(item => {
                  let tabObj = {}
                  tabObj.name = item
                  // UCMP3-4668 分析元数据生成的tab页签添加按钮权限唯一标志button_code
                  tabObj.button_code = this.metadataObj[item] && this.metadataObj[item].service_code ? this.metadataObj[item].service_code : item
                  // 优化明细子服务tab显示
                  tabObj.label = this.metadataObj[item] && this.metadataObj[item].name ? this.metadataObj[item].name : item
                  tabObj.extend = true
                  return tabObj
                })
                tabs = tabs.concat(childrenCopy)
            }
            this.setBasicDetailGroup(tabs[0].group)
            !this.activedTab && (this.activedTab = tabs[0].code)
            return tabs
        },
        
        activeTab: {
            get () {
                return this.activedTab
            },

            set (val) {
                this.activedTab = val
            }
        }
    },

    watch: {
        checkedInstanceId () {
            this.setSelectedInstanceInfo(null)
            this.getCheckedMetadata()
        },
        metadata () {
            this.getCheckedMetadata()
        },
        // bug UCMP-866【控制台】云主机详情页面，点击关联的云硬盘，进入云硬盘详情页面后进行操作，操作失败报错
        '$route.path' () {
            this.init()
        }
    },

    components: {
        OperatorPanel,
        // EditInstanceCfg,
        InstanceDetailExtend
    },
    created () {
        // UCMP3-5171 修复点击蓝图实例拓扑图后跳转页面为空的问题
        MetadataUtils.initMetaInfoByServiceCode(this.serviceCode, this.metadata, Config)
        // 初始化
        this.init()
        
        if (this.tabs.privilegefilter(this.serviceCode, 'button_code') && this.tabs.privilegefilter(this.serviceCode, 'button_code').length > 0) {
            let firstCode = this.tabs.privilegefilter(this.serviceCode, 'button_code')[0].code
            this.$router.replace(`/${this.serviceCode}/instanceDetail/${this.$route.params.id}/${firstCode}`)
        } else {
            this.$message({
                type: 'warning',
                title: '警告',
                message: '该用户暂无详情查看权限！'
            })
        }
    },
    destroyed () {
        this.setSelectedInstanceInfo(null)
    }
}
</script>
<style lang="scss" scoped>
.calc-container {
  height: calc(100% - 100px);
}
.btn-group-height {
    height: 30px;
}
.pane-height {
    height: calc(100% - 28px);
}
.instance-calc-container {
    height: calc(100% - 30px - 10px);
}
</style>
