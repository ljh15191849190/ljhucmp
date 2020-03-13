<template lang="pug">
    div.padding.card-padding-top(v-if="orderDetail && orderDetail.data && metadata && metadata.length")
        div.position-relative(v-if="useResourceDetailCard")
            p.card-title 资源信息
            //- 基础信息
            el-row(:gutter="10")
                el-col.padding-row(:xs="24" :sm="12" :md="8" :lg="8" :xl="6" v-for="(basic_detail, index) in basicDetailColumns" :key="index" v-if="basic_detail.key !== 'bp_instance_name' && !!orderDetail[basic_detail.key] || basic_detail.key === 'bp_instance_name' && orderDetail.data.group === 'blueprint'")
                    span.col-name {{basic_detail.key === 'owner_name' ? $options.filters.TranslateOrgApp(orderDetail.owner_type) : basic_detail.label}}：
                    el-tooltip(v-if="basic_detail.key !== 'bp_instance_name'" class="item" effect="dark" :content="orderDetail[basic_detail.key]" placement="top-start")
                        span.col-value {{orderDetail[basic_detail.key]}}
                    el-tooltip(v-else class="item" effect="dark" :content="Object.values(orderDetail.data.resources)[0].attributes.name" placement="top-start")
                        span.col-value {{Object.values(orderDetail.data.resources)[0].attributes.name}}

            //- 资源详情信息
            //- 创建
            template(v-if="(orderDetail.order_type === 'create') || (orderDetail.order_type === 'clone')")
                //- 不可编辑
                //- 3种场景不可编辑
                //-// 申请单状态不是【审批中】
                //-// 这个详情展示属于申请单的详情（不走流程的申请单如果当前处理节点和当前登录用户一致的话，该表单需要可编辑）
                //-// 已审批列表中的资源详情
                template(v-if="orderDetail.read_only")
                    template(
                        v-if="orderDetail.data.group !== 'blueprint'"
                        v-for="orderDetailData in (Array.isArray(orderDetail.data) ? orderDetail.data : [orderDetail.data])")
                        ResourceItemCard(
                            v-for="(resource, index) in getAllResources(orderDetailData.resources)"
                            :key="index"
                            :metadata="metadata"
                            :resource="resource"
                            :resourceName="formatServiceName(resource.service_code)")
                    template(v-else)
                        div.blueprint-item-card
                            BlueprintResourceDetailCard(
                                v-for="(resource, index) in blueprintArrayResources"
                                :key="index"
                                :resource="resource"
                                :defaultResources="blueprintArrayResources"
                                :configs="blueprintResourceConfigs"
                                :dependencies="blueprintLinks"
                                :switches.sync="blueprintSwitches"
                                @detailMouseover="detailMouseover"
                            )
                        BlueprintDefaultDiagram.blueprint-detail-panel-diagram.hidden(
                            :serviceCode="orderDetail.data.service_code"
                            :defaultBpResources="Object.values(orderDetail.data.resources)[0]"
                            :defaultResources.sync="blueprintArrayResources"
                            :defaultLinks.sync="blueprintLinks"
                            :configs.sync="blueprintResourceConfigs"
                            @getDiagramObj="getDiagramObj"
                            @nodeClick="diagramNodeClick"
                        )
                //- 表单部分
                template(v-else)
                    //- 创建操作
                    template(v-if="orderDetail.order_type === 'create' || (orderDetail.order_type === 'clone')")
                        //- 该部分区分编排和非编排两部分
                        //-// 编排资源
                        BlueprintDiagramAndNodeForms.instance-detail.approve-blueprint-instance-form.position-relative(
                            v-if="orderDetail.data.group === 'blueprint'"
                            :blueprintId="orderDetail.data.service_code"
                            :defaultBpResources="Object.values(orderDetail.data.resources)[0]"
                            :providerConf="providerConf"
                            :owner="orderDetail.owner"
                            :ownerType="orderDetail.owner_type"
                            :org_id="orderDetail.org_id"
                            :ifApproveReference="detailBelong === 'approve'"
                            :ifOrderRerefence="detailBelong === 'order'"
                            :externalFormData="blueprintExternalFormData"
                            @startInitForm="startInitForm"
                            @endInitForm="endInitForm")
                        //-// 非编排资源（普通服务：云主机、云硬盘... etc）
                        ResourceForm.instance-detail(v-else :metadata="metadata" :order_code="orderDetail.order_code" :resources.sync="orderDetail.data"
                        :owner="orderDetail.owner" :owner_type="orderDetail.owner_type" :owner_name="orderDetail.owner_name" :org_id="orderDetail.org_id"
                        :order_type="orderDetail.order_type"
                        :ifApproveReference="detailBelong === 'approve'"
                        :ifOrderRerefence="detailBelong === 'order'"
                        )
            //- 修改操作
            template(v-if="orderDetail.order_type === 'modify' || orderDetail.order_type === 'modify_load_balancing' || orderDetail.order_type === 'modify_health_check' || orderDetail.order_type === 'modify_resource_belong' || currentOperation.asModify")
                div.instance-detail.third
                    div
                        span.service-name 修改项（修改前）
                        div.padding-row(v-for="item in originParams" :key="item.key" v-if="isShowModify(orderDetail.data.display, item.key, orderDetail.data.originParams, orderDetail.read_only)") 
                            span.col-name {{formatParamKey(orderDetail.service_code, item.key)}}：
                            span.col-value {{formattParamDisplay(item.value)}}
                        div.padding-row(v-for="item in resoleParams" :key="item.key" v-if="orderDetail.order_type === 'modify_resource_belong'") 
                            span.col-name {{item.key}}：
                            el-tooltip(class="item" effect="dark" :content="item.origin" placement="top-start")
                                span.col-value {{item.origin}}
                div.instance-detail.third
                    div
                        span.service-name 修改项（修改后）
                        //- 只读
                        template(v-if="orderDetail.read_only")
                            div.padding-row(v-for="item in displays" :key="item.key" v-if="isShowModify(orderDetail.data.display, item.key, orderDetail.data.originParams)")
                                span.col-name {{formatParamKey(orderDetail.service_code, item.key)}}：
                                span.col-value {{formattParamDisplay(item.value)}}
                            div.padding-row(v-for="item in resoleParams" :key="item.key" v-if="orderDetail.order_type === 'modify_resource_belong'")
                                span.col-name {{item.key}}：
                                el-tooltip(class="item" effect="dark" :content="item.display" placement="top-start")
                                    span.col-value {{item.display}}
                        template(v-else)
                            //- el-row(read_only ===false  为审批)
                            ResoucePoolForm.basic-form(
                                v-if="orderDetail.service_code === 'f5' && orderDetail.order_type !== 'modify_resource_belong'"
                                :formItems="formItems"
                                :formData.sync="orderDetail.data.attributes"
                                :display.sync="orderDetail.data.display"
                                :uniqueKey="defaultkey"
                                :keepValueFitDom="true"
                                :showLinkedItemKeys="showLinkedItemKeys"
                                :externalFormData="externalFormData"
                                :isNeedEcs="false"
                                :labelPosition="'left'"
                            )
                            div.basic-form(v-else-if="orderDetail.order_type === 'modify_resource_belong'")
                                div.padding-row(v-for="item in resoleParams" :key="item.key")
                                    span.col-name {{item.key}}：
                                    el-tooltip(class="item" effect="dark" :content="item.display" placement="top-start")
                                        span.col-value {{item.display}}
                            DynamicForm.basic-form(
                                v-else
                                :formItems="formItems"
                                :formData.sync="orderDetail.data.attributes"
                                :display.sync="orderDetail.data.display"
                                :externalFormData="externalFormData"
                                :keepValueFitDom="true"
                                :showLinkedItemKeys="showLinkedItemKeys"
                            )
            // 修改f5节点状态
            template(v-if="orderDetail.order_type === 'modify_node_status'")
                div.instance-detail
                    div
                        span.service-name 修改项（修改后）
                        el-table(:data="orderDetail.data.display.nodes" border)
                            el-table-column(
                            :prop="column.prop"
                            v-for="column in f5Columns"
                            :key="column.prop"
                            :label="column.label"
                            :width="column.width"
                            )
                                template(slot-scope="scope")
                                    el-switch(
                                    v-if="column.prop === 'status'"
                                    v-model="scope.row[column.prop]"
                                    active-value="enabled"
                                    inactive-value="disabled"
                                    :disabled="orderDetail.read_only"
                                    @change="changeF5NodeStatus(scope.row)"
                                    )
                                    span(v-else) {{scope.row[column.prop]}}
            template(v-if="orderDetail.service_code === 'guardian_app'")
                GuardianAppLikedPercent(ref="similarRef"
                v-if="Object.values(orderDetail.data[0].resources)[0].attributes.business_app_name" 
                :formData="Object.values(orderDetail.data[0].resources)[0].attributes")
        //- //- 配额申请单
        div.position-relative(v-else-if="orderDetail.service_code === 'quota'")
            ApplyQuota(
                :resources="orderDetail.data"
                :owner_type="orderDetail.owner_type"
                :owner="orderDetail.owner"
                :org_id="orderDetail.org_id"
                :org_code="orderDetail.org_code"
                :org_name="orderDetail.org_name"
                :project_id="orderDetail.project_id"
                :disabled="disabled"
                ref="applyQuota"
            )
        //-     ApplyQuota
        //- 停止等操作的对象是资源列表，因此，此处使用列表来呈现
        div.position-relative(v-else)
            p.card-title 资源信息
            //- p.group-name 待{{orderTypeMap[orderDetail.order_type]}}的{{orderDetail.service_name}}详情
            ResourceDetailCard(:metadata="metadata" :resources="orderDetail.data.resource")
</template>
<script>
/**
 * @description 资源(基础服务、蓝图)的申请单配置表单
 */
import getServiceMetadataItemParam from '@mixins/getServiceMetadataItemParam.mixin'
import MetadataUtils from '@server/metadata.utils'
import { OrderTypeMap } from '@server/ConstParams'
import ResourceDetailCard from '../itemConponents/ResourceDetailCard'
import BlueprintResourceDetailCard from '../itemConponents/BlueprintResourceDetailCard'
import DynamicForm from '@/components/common/dynamicForm/DynamicForm'
import ResourceItemCard from './ResourceItemCard'
import BlueprintDiagramAndNodeForms from '@/components/orchestration/application/BlueprintDiagramAndNodeForms'
import BlueprintDefaultDiagram from '@/components/orchestration/application/BlueprintDefaultDiagram'
import ResourceForm from './ResourceForm'
import ResoucePoolForm from './ResoucePoolForm'
import Utils from '@server/Utils'
import GuardianAppLikedPercent from '@/components/catalog/common/GuardianAppLikedPercent'
import FrontConfig from '@mock/metadata/metadata.config'
import ApplyQuota from '@/components/operationMgmt/quotaMgmt/ApplyQuota'

export default {
    inject: ['$validator'],
    components: { ResourceDetailCard, BlueprintResourceDetailCard, DynamicForm, BlueprintDiagramAndNodeForms, BlueprintDefaultDiagram, ResourceForm, ResoucePoolForm, ResourceItemCard, GuardianAppLikedPercent, ApplyQuota },
    props: [ 'orderDetail', 'metadata', 'operationType', 'detailBelong', 'currentOperation', 'disabled' ],
    mixins: [ getServiceMetadataItemParam ],
    data () {
        return {
            basicDetailColumns: [
                { key: 'service_name', label: '服务名称' },
                { key: 'owner_name', label: '' },
                { key: 'bp_instance_name', label: '编排实例名称' }
            ],
            orderTypeMap: OrderTypeMap,
            providerConf: true,
            sysForm: {
                resource_id: '',
                serviceForm: [],
                networkObj: {
                    network: [],
                    networkList: [],
                    vmF5NetworkList: [],
                    subnetList: [],
                    f5_sub_network: ''
                }
            },
            defaultkey: 'key',
            diagramInstance: null,
            hoveredBlueprintResId: null,
            blueprintArrayResources: [],
            blueprintLinks: [],
            blueprintResourceConfigs: {},
            // blueprintCheckedServices: [],
            blueprintSwitches: {},
            likedAppList: [],
            linkedKeyAttrs: [],
            f5Columns: [
                { prop: 'instance_name', label: '名称' },
                { prop: 'ip', label: '地址' },
                { prop: 'port', label: '端口' },
                { prop: 'major', label: '优先级' },
                { prop: 'status', label: '状态' }
            ]
        }
    },
    methods: {
        // 递归将资源内的依赖拉取出来
        getAllResources (resources, isIncluding) {
            let resourceArr = Object.values(resources)

            resourceArr.forEach(item => {
                if (isIncluding) {
                    this.$set(item, '_isIncluding', true)
                    this.$set(item, '_isOpening', true)
                }
                if (item.includings)
                    resourceArr = [...resourceArr, ...this.getAllResources(item.includings, true)]
                if (item.resources)
                    resourceArr = [...resourceArr, ...this.getAllResources(item.resources, true)]
            })
            let getServiceCode = (resource) => {
                return resource.service_code
            }
            resourceArr.sortAsMetadataOrder(this.basicMetadataCodes, getServiceCode)
            return resourceArr
        },

        getCurrentServiceAttributs () {
            let serviceCode = this.orderDetail.service_code
            this.linkedKeyAttrs = []
            let {attributes} = this.orderDetail.data
            let attrs = []
            let allAttrs = this.getCheckedAttribute(serviceCode)
            if (allAttrs && allAttrs.attribute) {
                attrs = allAttrs.attribute.filter(attr_item => attributes.hasOwnProperty(attr_item[this.defaultkey]))
                if (allAttrs.checkedMeta.children) {
                    allAttrs.checkedMeta.children.forEach(child_service_Code => {
                        let allChildAttrs = this.getCheckedAttribute(child_service_Code)
                        if (allChildAttrs && allChildAttrs.attribute) {
                            let childAttrs = allChildAttrs.attribute.filter(attr_item => attributes.hasOwnProperty(attr_item[this.defaultkey]))
                            attrs = [...attrs, ...childAttrs]
                        }
                    })
                }
            }

            attrs.forEach(attrItem => {
                //处理lined true
                if (attrItem.link)
                    this.linkedKeyAttrs.push(attrItem)
            })
            return attrs
        },

        formatServiceName (serviceCode) {
            let findService = this.getCheckedMeta(serviceCode)
            return findService ? findService.name : ''
        },

        /**
         * @description 封装蓝图内部资源的配置明细
         */
        blueprintResourceDetailConstructor (resource) {
            let display = {}, attributes = {}
            Object.keys(this.blueprintResourceConfigs[resource.id].display).forEach(
                key => {
                    let attributeKey = key.split('@')[1]
                    display[attributeKey] = this.blueprintResourceConfigs[resource.id].display[key]
                    attributes[attributeKey] = this.blueprintResourceConfigs[resource.id].formData[key]
                }
            )
            return {
                display,
                attributes,
                id: resource.id,
                service_code: resource.service_code
            }
        },

        isShowModify (display, key, originParams, read_only = true) {
            return (read_only && (display.hasOwnProperty(key) && originParams.hasOwnProperty(key) && display[key] !== originParams[key])) || (!read_only && originParams.hasOwnProperty(key))
        },

        formatParamKey (serviceCode, key) {
            let findService = this.getCheckedMeta(serviceCode)
            let paramName
            if (findService) {
                paramName = findService.attribute.find(attr => attr[this.defaultkey] === key)
                // 自服务解析
                if (!paramName && findService.children) {
                    findService.children.forEach(childServiceCode => {
                        let findChildService = this.getCheckedMeta(childServiceCode)
                        if (findChildService)
                            paramName = findChildService.attribute.find(attr => attr[this.defaultkey] === key)
                    }) 
                }
            }
              
            return paramName ? paramName.label : ''
        },

        /**
         * @description 修改操作格式化输出配置项
         */
        formattParamDisplay (val) {
            if (!val) return ''

            // 针对 Object、Array类型的数据，格式化显示内容
            if (typeof val === 'object')
                return JSON.stringify(val).replace(/[\{\[\"\}\]]/g, '').replace(/\,/g, ' ')
            return val + ''
        },

        startInitForm (id) {
            this.$emit('startInitForm', id)
        },

        endInitForm (id) {
            this.$emit('endInitForm', id)
        },

        getDiagramObj (vm) {
            this.diagramInstance = vm
        },

        detailMouseover (id) {
            this.hoveredBlueprintResId = id
            this.diagramInstance.checked_link = null
            this.diagramInstance.ctrlCheckedNodes.splice(0, this.diagramInstance.ctrlCheckedNodes.length)

            let node = this.diagramInstance.findNodeById(id)
            if (!node) {
                this.checkedNode = null
                this.diagramInstance.checked_node = null
                return
            }
            this.diagramInstance.checked_node = node
        },

        diagramNodeClick (node) {
            this.hoveredBlueprintResId = node.id
        },

        transformTreeToArr (treeNodes) {
            let resourceArray = []
            Utils.transformTreeToArr(treeNodes, 'includings', 'id', 'pId', resourceArray)
            return resourceArray
        },

        resetBlueprintSiwtches () {
            Object.keys(this.blueprintSwitches).forEach(
                siwtch => {
                    if (this.blueprintSwitches[siwtch]) this.blueprintSwitches[siwtch] = false
                }
            )
        },

        changeF5NodeStatus (row) {
            // 手动修改attributes中ecs的值
            this.orderDetail.data.attributes.ecs.forEach(item => {
                if (item.instance_name === row.instance_name) {
                    //
                    item.status = row.status
                }
            })
        }
    },
    computed: {
        // 仅修改的时候需要
        externalFormData () {
            return {
                instance_id: this.orderDetail.data.resource_id
            }
        },

        blueprintExternalFormData () {
            let obj = {
                owner: this.orderDetail.owner,
                owner_type: this.orderDetail.owner_type,
                owner_name: this.orderDetail.owner_name
            }

            if (obj.owner_type === 'app' && obj.owner_name) {
                let short = obj.owner_name.match(/\((.*)\)/)
                short = short ? short[1] : ''
                obj.short = short
                // obj.nas_fs_type = '' // 属于资源实例属性，在内部获取
            }

            return obj
        },

        blueprintIncludedServices () {
            let serviceCodes = this.blueprintArrayResources.map(
                resource => {
                    return resource.service_code
                }
            )
            return Array.from(new Set(serviceCodes))
        },

        blueprintIncludeMetadataObj () {
            let rst = {}
            this.blueprintIncludedServices.forEach(
                service_code => {
                    rst[service_code] = this.metadata.find(meta => meta.service_code === service_code)
                }
            )
            return rst
        },

        cloneAttribute () {
            if (this.orderDetail.order_type === 'clone' && this.metadata) {
                let checkedResourceMetadata = this.metadata.find(resource => resource.service_code === this.orderDetail.data[0].service_code)
                if (checkedResourceMetadata) {
                    let cloneAction = checkedResourceMetadata.actions.find(_action => _action.name === 'clone')
                    if (cloneAction && Array.isArray(cloneAction.attribute)) {
                        // 格式化action中的attribute数组
                        return MetadataUtils.gerenateFormItems(cloneAction.attribute)
                    }
                }
            }
            return []
        },

        basicMetadataCodes () {
            return this.metadata.filter(meta => { return meta.group !== 'blueprint' })
                .map(meta => { return meta.service_code })
        },
        formItems () {
            let serviceCode = this.orderDetail.service_code
            this.linkedKeyAttrs = []
            let {attributes} = this.orderDetail.data
            let attrs = []

            let allAttrs = this.currentOperation.attribute ? {attribute: this.currentOperation.attribute, checkedMeta: {}} : this.getCheckedAttribute(serviceCode)
            if (allAttrs && allAttrs.attribute) {
                attrs = allAttrs.attribute.filter(attr_item => attributes.hasOwnProperty(attr_item[this.defaultkey]))
                if (allAttrs.checkedMeta.children) {
                    allAttrs.checkedMeta.children.forEach(child_service_Code => {
                        let allChildAttrs = this.getCheckedAttribute(child_service_Code)
                        if (allChildAttrs && allChildAttrs.attribute) 
                            attrs = [...attrs, ...allChildAttrs.attribute]
                    })
                }
            }
            attrs.forEach(attrItem => {
                //处理lined true
                if (attrItem.link)
                    this.linkedKeyAttrs.push(attrItem)
                // UCMP3-4885【控制台】带通用流程备份服务修改，审批人审批时云主机显示空，接口已返回
                // 解决方案: 针对对ecs的接口参数进行处理
                if (attrItem.key === 'ecs') {
                    let id = allAttrs.checkedMeta.value_field || allAttrs.checkedMeta.name_field
                    if (!attrItem.data_link.params) 
                        this.$set(attrItem.data_link, 'params', {})
                    
                    let paramValue = this.orderDetail.data[id] || this.orderDetail.data['resource_id']
                    this.$set(attrItem.data_link.params, id, paramValue)
                }
            })

            if (serviceCode === 'f5') {
                let actionType = this.orderDetail.order_type
                let action = FrontConfig.actions[actionType]

                if (action && action.modify_attrs) {
                    // f5 分属性修改
                    attrs = attrs.filter(item => action.modify_attrs.includes(item.key))
                }
            }

            return attrs
        },
        showLinkedItemKeys () {
            let showLinkedKeys = []
            this.linkedKeyAttrs.forEach(linkeAttr => {
                let formItemData = this.orderDetail.data.attributes[linkeAttr.key]
                if (formItemData && linkeAttr['link']['link_' + formItemData])
                    showLinkedKeys = [...showLinkedKeys, ...linkeAttr['link']['link_' + formItemData]]
            })
            return showLinkedKeys
        },
        originParams () {
            let tagetOriginParams = []
            let originParams = this.orderDetail.data.originParams
            this.formItems.forEach(attr => {
                if (originParams[attr.key]) {
                    let paramItem = {key: attr.key, value: originParams[attr.key]}
                    tagetOriginParams.push(paramItem)
                }
            })
            return tagetOriginParams
        },
        resoleParams () {
            let originParams = this.orderDetail.data.originParams
            let displays = this.orderDetail.data.display
            let formItems = [{key: '所属名称', origin: originParams.owner_name, display: displays.owner_name}, {key: '所属类型', origin: originParams.owner_type === 'app' ? '应用' : '组织机构', display: displays.owner_type === 'app' ? '应用' : '组织机构'}]
            if (originParams.owner_type === displays.owner_type) 
                return [formItems[0]]
            else
                return formItems
        },
        displays () {
            let tagetDisplays = []
            let displays = this.orderDetail.data.display
            this.formItems.forEach(attr => {
                if (displays[attr.key]) {
                    let paramItem = {key: attr.key, value: displays[attr.key]}
                    tagetDisplays.push(paramItem)
                }
            })
            return tagetDisplays
        },
        /**
         * @description 是否使用 ResourceDetailCard(资源明细卡片组件) 组件进行展示 的判断条件
         */
        useResourceDetailCard () {
            return (this.currentOperation && this.currentOperation.asModify) || ['create', 'modify', 'clone', 'modify_load_balancing', 'modify_health_check', 'modify_resource_belong', 'modify_node_status'].includes(this.orderDetail.order_type)
        }
    },

    watch: {
        'blueprintArrayResources.length' (val) {
            if (!val) return
            let getServiceCode = (resource) => {
                return resource.info.service_code
            }
            this.blueprintArrayResources.sortAsMetadataOrder(this.basicMetadataCodes, getServiceCode)
            this.blueprintArrayResources.forEach(
                resource => {
                    if (this.blueprintSwitches[resource.id] === undefined)
                        this.$set(this.blueprintSwitches, resource.id, true)
                }
            )
        }
    }
}
</script>
<style lang="scss" scoped>
.blueprint-detail-panel-diagram {
    margin-left: 10px;
    width: 335px;
    height: calc(100% - 1rem - 52px);
    float: left;
}
.blueprint-item-card {
    // float: left;
    width: 100%;
    // height: calc(100% - 1rem - 52px);
    overflow: hidden;
    overflow-y: auto;
    background: #fff;
}
.include-services-title {
    width: 110px;
    display: inline-block;
    vertical-align: middle;
}
.include-services-checkbox {
    width: calc(100% - 110px);
    display: inline-block;
}
.provider-conf-pane {
    padding: 0;
    width: 60%;
    margin: 0 auto;
}

.group-name {
    padding-top: 14px;
    margin-bottom: 6px;
}
</style>
