<template lang="pug">
    div.full-container(slot="content")
        div.d-flex.full-height
            div.margin-top.content-padding
                el-form(label-width="385px" size="small" label-position="left")
                    el-form-item(label="资源所属")
                        el-radio-group(
                            :disabled="disabled"
                            v-model="modeltype" 
                            @change="ownerTypeChange"
                        )
                            //- el-radio(label="app") 应用
                            el-radio(label="project") {{selectedBusinessLabel}}
                            el-radio(label="org") 组织机构
                            el-radio(label="resource_pool") {{systemConfig.configure_template}}
                    el-form-item.rw-input(:label="`${selectedBusinessLabel}`" v-if="modeltype==='project'")
                        el-select(
                            :disabled="disabled"
                            v-model="project"
                            filterable 
                            clearable
                            value-key="id"
                            :placeholder="`请输入${selectedBusinessLabel}名称搜索`"
                            @change='changeProject'
                        )
                            el-option(
                                v-for="item in projectList" :key="item.id" :value="item.id" :label="`${item.name}`"
                            )
                    el-form-item.rw-input(label="应用" v-if="modeltype==='project'")
                        el-select(
                            :disabled="disabled"
                            v-model="app"
                            filterable 
                            clearable
                            value-key="id"
                            placeholder="请输入应用名称搜索"
                            @change='changeApp'
                        )
                            el-option(
                                v-for="item in appList" :key="item.id" :value="item.id" :label="`${item.name}`"
                            )
                    el-form-item.rw-input(label="组织机构" v-if="modeltype==='org'")
                        Input-Tree.form-width(
                            :disabled="disabled"
                            v-model="org"
                            placeholder="请选择组织机构"
                            name="org"
                            key="org"
                            :value="org"
                            :defaultProps="orgDefaultProps"
                            :treeData="orgList"
                            @nodeClick="nodeClick"
                        )
                    el-form-item.rw-input(:label="systemConfig.configure_template" v-if="modeltype==='resource_pool'")
                        el-select(
                            :disabled="disabled"
                            v-model="resource_pool"
                            filterable 
                            clearable
                            value-key="id"
                            :placeholder="`请输入${systemConfig.configure_template}名称`"
                            @change='changeResource'
                        )
                            el-option(
                                v-for="item in resourcePollList" :key="item.template_id" :value="item.template_id" :label="`${item.template_name}`"
                            )
                div(v-for="(attr, index) in quotaData" :key="index")
                    div.quota-first.clearfix
                        span.textlable {{attr.name}}
                    div.flex-InputNum
                        div.d-flex.align-items-center.padBottom(v-for="(item, index) in attr.quota_conf" :key="index")
                            div.quota-name
                                span {{item.quotaLabel}}
                            el-input-number.marginleft(
                                v-model="item.value"
                                controls-position="right"
                                :min="0"
                                :max="9999999"
                                :precision="0" 
                            )
                            div.input-group-append.tips-type(v-if="item.unit")
                                div.input-unit-text {{item.unit}}
                                el-tooltip(v-if="item.tips" :content="item.tips" placement="right")
                                    i.ucmp-icon-question.theme-color.Bigfont
                            div.quota-name.marginleft50.w-300(v-if="item.key !== 'snapshot'")
                                span 剩余量/总量：
                                span {{`${item.overage}/${item.quota} ${item.unit}`}}
                            //- 兼容页面样式
                            div.quota-name.marginleft50.w-300(v-if="item.key === 'snapshot'")
                            //- div.quota-data
                            //-     el-progress.progress-adjust.marginleft(:text-inside="true" :stroke-width="20" :percentage="50")
                div.btn-save.d-flex.justify-content-center(v-if="!owner_type && Array.isArray(quotaData) && quotaData.length")
                    el-button(type="warning" size="small" @click="saveQuota") 立即申请

</template>

<script>
/**
 * @description 配额管理
 */

import Api from '@api'
import InputTree from '@common/InputTree'
import DataBar from '@common/DataBar'
import _groupby from 'lodash.groupby' 
import { mapGetters } from 'vuex'

export default {
    props: {
        resources: {
            type: Object,
            default: () => {
                return {}
            }
        },
        owner_type: {
            type: String,
            default: ''
        },
        owner: {
            type: String,
            default: ''
        },
        org_id: {
            type: String,
            default: ''
        },
        org_code: {
            type: String,
            default: ''
        },
        org_name: {
            type: String,
            default: ''
        },
        project_id: {
            type: String,
            default: ''
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            project: '',
            projectList: [],
            org: '',
            orgDefaultProps: {
                id: 'id',
                parentId: 'parent_id',
                children: 'sub_orgs',
                label: 'org_name'
            },
            orgList: [],
            app: '',
            appList: [],
            resource_pool: '',
            resourcePollList: [],
            modeltype: 'project',
            breadcrumbItems: [{ 'prop': '', 'label': '配额管理' }],
            // 所有服务的配额项数据
            quotaData: [],
            // 保存参数
            saveParam: {
                'targetType': '',
                'targetId': '',
                'serviceQuotas': []
            },
            saveServiceQuotas: [],
            // 保存按钮禁用
            isSave: true,
            // 保存配额项修改的数量,大于0时才可保存
            modifyQuotaNum: 0
        }
    },
    computed: {
        ...mapGetters(['systemConfig', 'businessOrproject']),
        selectedBusinessLabel () {
            return this.businessOrproject === 'business' ? '业务' : '项目'
        }
    },
    methods: {
        async changeApp (val) {
            // 不做处理的话，如果删除选择框中的值就会出错
            if (val)
                await this.getApproveQuota('app', val)
            else
                await this.changeProject(this.project)
        },
        async changeProject (val) {
            if (val) {
                // 改变应用列表的数据
                this.app = ''
                this.appList = []
                await this.getAppListById(val)
                await this.getApproveQuota('project', val)
            } else {
                this.app = ''
                this.appList = []
                this.quotaData = []
            }
        },
        async changeResource (val) {
            await this.getApproveQuota('resource_pool', val)
        },
        async nodeClick (data) {
            await this.getApproveQuota('org', data.id)
        },
        // 新版配额
        async getApproveQuota (objectType, objectId) {
            let params = {
                objectType: objectType,
                objectId: objectId
            }
            let res = await Api.get('getApproveQuota', params)
            this._setAttr(res)
        },
        /**
         * 新版设值
         */
        _setAttr (resList) {
            let resourceQuota = resList
            resourceQuota.forEach(item => {
                let result = []
                item.quota_conf.forEach(val => {
                    let obj = {}
                    obj.key = val.attribute || val.type
                    obj.unit = val.unit
                    obj.tips = val.tips
                    obj.quotaLabel = val.label + '配额'
                    obj.usageLabel = val.label + '使用量'
                    obj.defaultValue = undefined
                    obj.value = undefined
                    obj.used = val.quota_setting.usage + val.quota_setting.child_occupation
                    obj.quota = val.quota_setting.quota
                    obj.overage = val.quota_setting.quota - val.quota_setting.usage - val.quota_setting.child_occupation
                    result.push(obj)
                })
                item.quota_conf = result
            })
            this.quotaData = resourceQuota
        },
        ownerTypeChange (val) {
            this.project = null
            this.org = null
            this.app = null
            this.resource_pool = null
            this.quotaData = []
        },
        async getProjectList () {
            let res = await Api.get('getProjectAuthor', {}, true)
            this.projectList = res.data
        },
        async getOrgList () {
            let res = await Api.get('getorgTreeAuthor', {}, true)
            this.orgList = res.data
        },
        
        // 保存配额
        saveQuota () {
            let flag = false
            this.quotaData.forEach(item => {
                let itemFlag = item.quota_conf.some(item => item.value)
                if (itemFlag)
                   flag = true 
            })
            if (!flag) {
                this.$notify.error('申请单中至少需要一项有值！')
                // 如果校验不通过则直接返回
                return
            }
            // 根据是否配额保存各服务的配置
            this.saveQuotaConfig()
            // 有配额才保存
            if (this.saveServiceQuotas.length) {
                this.quotaAttrLoading = true
                let params = []
                let obj = {}
                obj.owner_type = this.app ? 'app' : this.modeltype
                obj.owner = this.app || this.project || this.resource_pool || this.org.id
                obj.data = {service_code: 'quota', group: 'system_service', quota_resources: this.saveServiceQuotas}
                obj.count = 1
                obj.env = ''
                obj.service_item = {}
                params.push(obj)
                Api.post('SaveQuotaApprove', {order_item: params, expected_time: '', memo: '', urgency_level: 'low'}, true).then(
                    () => {
                    // The notification result
                    this.$notify({
                        title: '通知',
                        type: 'success',
                        message: '申请成功!'
                    })
                    this.quotaAttrLoading = false
                    this.$router.push('/orders')
                    },
                    () => {
                    this.quotaAttrLoading = false
                    }
                )
            }
        },
        // 生成配额
        saveQuotaConfig () {
            let serviceQuotas = []
            this.quotaData.forEach(service => {
                let quotaItemObj = {}
                quotaItemObj.service_code = service.service_code
                quotaItemObj.quota_setting = {}
                service.quota_conf.forEach(attr => {
                    quotaItemObj.quota_setting[attr.key] = attr.value
                })
                serviceQuotas.push(quotaItemObj)
            })
            this.saveServiceQuotas = serviceQuotas
        },
        // 获取配额 提供给审批时使用
        getQuotaConfig () {
            let serviceQuotas = []
            this.quotaData.forEach(service => {
                let quotaItemObj = {}
                quotaItemObj.service_code = service.service_code
                quotaItemObj.quota_setting = {}
                service.quota_conf.forEach(attr => {
                    quotaItemObj.quota_setting[attr.key] = attr.value
                })
                serviceQuotas.push(quotaItemObj)
            })
            return serviceQuotas
        },
        async initData () {
            if (this.owner_type && this.owner_type === 'app') 
                // 非创建阶段, 根据project_id来加载应用列表，用来回显数据
                await this.getAppListById(this.project_id)
            
            await this.getProjectList()
            await this.getOrgList()
            await this.getConfigTemplateList()
        },
        /**
         * 获取所有应用列表
         */
        async getAppList () {
            let res = await Api.get('getProjectAllApps', {})
            this.appList = res.data
        },
        /**
         * 根据bussiness_id获取应用列表
         */
        async getAppListById (id) {
            let params = {
                limit: 99999,
                page: 1,
                business_id: id
            }
            let res = await Api.get('getappAuthor', params)
            this.appList = res.data
        },
        /**
         * @description 获取配置模板列表
         */
        async getConfigTemplateList () {
            // let pageParam = { offset: 1, limit: 9999, template_id: 'page' }
            // let res = await Api.get('configTemplate', pageParam)
            let res = await Api.get('applyQuotaTemplates', {})
            this.resourcePollList = res
        },

        // 回显从接口请求到的值
        async _fillInit () {
            // 如果 owner_type 不存在的话，则代表新增，直接返回，不需要填充数据
            if (!this.owner_type) 
                return
            let modeltype = this.owner_type
            // app与project合并显示
            if (modeltype === 'app') 
                modeltype = 'project'

            this.modeltype = modeltype
            this.ownerTypeChange(this.modeltype)
            let params = null
            if (this.owner_type === 'app' || this.owner_type === 'project' || this.owner_type === 'resource_pool') 
                params = this.owner
            else {
                params = {
                    id: this.org_id,
                    node_id: this.org_code,
                    org_name: this.org_name
                }
            }
            await this[`_fill${this.owner_type}`](params, this.project_id)
            if (this.resources && Array.isArray(this.resources.quota_resources) && this.resources.quota_resources.length)
                this._fillResources()
        },
        _fillResources () {
            let resourcesGroup = _groupby(this.resources.quota_resources, 'service_code')
            let quotaData = JSON.parse(JSON.stringify(this.quotaData))
            quotaData.forEach(item => {
                let resourceConf = resourcesGroup[item.service_code][0].quota_setting
                item.quota_conf.forEach(confItem => {
                    confItem.value = resourceConf[confItem.key]
                })
            })
            this.quotaData = quotaData
        },
        // 填充应用
        async _fillapp (id, project_id) {
            // 因为app(应用)依赖于project(项目), 因此在填充应用的时候，也需要给项目赋值
            this.project = project_id
            this.app = id
            // 获取基础值
            await this.changeApp(id)
        },
        // 填充项目
        async _fillproject (id) {
            this.project = id
            // 获取基础值
            await this.changeProject(id)
        },
        // 填充组织
        async _fillorg (params) {
            this.org = {
                id: params.id,
                node_id: params.node_id,
                org_name: params.org_name
            }
            // 获取基础值
            await this.nodeClick(params)
        },
        // 填充资源池
        async _fillresource_pool (id) {
            this.resource_pool = id
            // 获取基础值
            await this.changeResource(id)
        }
    },
    components: {InputTree, DataBar},
    async created () {
        // 初始化
        await this.initData()

        // 如果 resources 存在的话，则使用 resources 去填充 
        this._fillInit()
    },
    watch: {
        // 检测数搜索添加变化
        searchKey (val) {
            this.$refs.quotaTree.filter(val)
        }
    }
}
</script>

<style lang="scss" scoped>
.marginleft50{
    margin-left: 50px;
}
.textlable{
    font-size: 15px;
    line-height: 45px;
}
.align-items-flexstart{
    flex-direction: flex-start;
}
.padBottom{
    padding-bottom: 10px;
}
.flex-InputNum{
    margin-left: 200px;
}
.quota-container {
  width: calc(100% - 300px);
  height: 100%;
}
.content-padding {
  padding-left: 100px;
  padding-top: 0px;
  width: 100%;
  height: calc(100% - 55px);
  overflow-y: auto;
}
.marginleft{
    margin-left: 10px;
}
.quota-name {
  margin-right: 16px;
  width: 160px;
  font-size: 14px;
  color: #333;
  text-align: right;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.btn-save {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.progress-adjust {
  width: 150px;
  top: 25%;
}
.input-unit-text {
    width: 41px;
    padding: 7px 7px;
    margin-bottom: 0px;
    font-size: 12px;
    line-height: 2;
    color: #495057;
    text-align: center;
    white-space: nowrap;
    background-color: #e9ecef;
    border: 1px solid #ced4da;
}
.tips-type{
    position: relative;
    .Bigfont{
        position: absolute;
        left: 45px;
        top:5px;
        font-size: 16px;
    }
}
.w-300{
    width: 300px;
}
.quota-first {
    float: left;
    width: 200px;
}

</style>

