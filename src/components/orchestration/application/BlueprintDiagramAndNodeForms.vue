<template lang="pug">
    div.bp-details-container
        div.blueprint-title
            span.padding-left {{ blueprintTitle }}
        OrchestrateDiagram.canvas(
            v-loading="loading"
            element-loading-text="拓扑图加载中"
            element-loading-spinner-category="config"
            ref="diagram"
            :blueprintId="blueprintId"
            :checkedNode.sync="checkedNode"
            :checkedLink.sync="checkedLink"
            :showConfig.sync="showConfig"
            :defaultResources.sync="defaultResources"
            :defaultLinks.sync="defaultLinks"
            :groupsConfigs="defaultGroups"
            :rootId.sync="rootId"
            :canNestNodeRule="canNestNodeRule"
            :configs.sync="configs"
            :providerInfo.sync="initProviderInfo"
            :propertiesConfig.sync="propertiesConfig"
            :linkPropertiesConfig.sync="linkPropertiesConfig"
            :backupConfigs.sync="backupConfigs"
            :linkConfigs.sync="linkConfigs"
            :editDisabled="editDisabled"
            :treeObj="defaultBpResources"
            @getDiagramObj="getDiagramObj"
            @getViewportDom="getViewportDom"
        )
            IconButton.canvas-btn(
                slot="moreCanvasBtns"
                v-for="(oper, index) in operations"
                :key="oper.type"
                :type="oper.icon"
                :text="oper.title"
                @iconClick="handleOper(oper.type)"
            )
        div.res-details(:class="{'apply-for-instance': isApplyHandle}")
            transition(name="zoom-in-bottom")
                BlueprintNodeConfigForms.config-forms(
                    ref="resourceCfgRef"
                    :showAllItems="showAllItems"
                    :node.sync="checkedNode"
                    :allBasicResources="defaultResources"
                    :externalFormData="externalFormData"
                    :showConfig.sync="showConfig"
                    :configs.sync="configs"
                    :linkConfigs.sync="linkConfigs"
                    :defaultLinks="defaultLinks"
                    :backupConfigs.sync="backupConfigs"
                    :propertiesConfig.sync="propertiesConfig"
                    :linkPropertiesConfig.sync="linkPropertiesConfig"
                    :isApplyHandle="isApplyHandle"
                    :keepValueFitDom="keepValueFitDom"
                    :providerConf="providerConf"
                    :providerConfData="providerConfData"
                    :providerCodeData="providerCodeData"
                    :initProviderInfo="initProviderInfo"
                    :nasValid="nasValid"
                    :popper_not_to_body="popper_not_to_body"
                    :blueprintId="blueprintId"
                    :invalidFormIds="hasErrorNodeIds"
                    :editPrivileges="editPrivileges"
                    :org_id="org_id"
                    :toggleSwitches.sync="toggleSwitches"
                    :ifApproveReference="ifApproveReference"
                    :ifOrderRerefence="ifOrderRerefence"
                    @defineCheckedNode="defineCheckedNode"
                    @defineCheckedLink="defineCheckedLink"
                    @getDescendants="getDescendants"
                    @startInitForm="startInitForm"
                    @endInitForm="endInitForm"
                    )
        slot.more-blueprint-detail(name="moreDetail")
</template>

<script>
/**
 * @description 编排类型的资源申请服务实例时，配置明细展示
 */
import OrchestrateDiagram from '@/components/orchestration/diagram/OrchestrateDiagram'
import BlueprintNodeConfigForms from '@/components/orchestration/form/deployConfig/BlueprintNodeForms'
import EditBlueprint from '@mixins/editBlueprint.mixin'
import OracleWithNas from '@mixins/oracleWithNas.mixin'
import GetBlueprintGroups from '@mixins/getBlueprintGroups.mixin'
import Api from '@api'

export default {
    inject: ['$validator'],
    mixins: [EditBlueprint, OracleWithNas, GetBlueprintGroups],
    props: ['blueprintId', 'defaultBpResources', 'providerConf', 'externalFormData', 'org_id', 'ifApproveReference', 'ifOrderRerefence'],
    data () {
        return {
            name: 'blueprint',
            checkedNode: null,
            checkedLink: null,
            showConfig: true,
            defaultResources: [],
            defaultLinks: [],
            configs: {},
            propertiesConfig: {}, // 节点参数属性(只读)配置信息
            linkPropertiesConfig: {}, // 连线参数属性(只读)配置信息
            backupConfigs: {},
            linkConfigs: {},
            rootId: '',
            editDisabled: true,
            ifOrchestrate: false, // 是否为编排蓝图环节
            isApplyHandle: true, // 是否为申请资源环节（非蓝图编辑状态，包括直接申请、修改订单、审批订单）
            keepValueFitDom: true,
            operations: [
                { type: 'center', icon: 'center-canvas', title: '画布居中' }
            ],
            popper_not_to_body: false,
            showAllItems: true,
            blueprintTitle: '应用服务拓扑图',
            diagramInstance: null,
            providerConfData: {},
            providerCodeData: {},
            initProviderInfo: {}, // 初始化得到的厂商数据
            editPrivileges: [], // 蓝图实例审批环节，当前用户可修改的服务列表
            toggleSwitches: {},
            viewportDom: null,
            loading: true
        }
    },

    methods: {
        getDiagramObj (vm) {
            this.diagramInstance = vm
        },

        canNestNodeRule () {
            return true
        },

        findNodeById (id) {
            return this.diagramInstance.findNodeById(id)
        },

        setValidation (resource) {
            if (resource.validation === undefined)
                this.$set(resource, 'validation', true)
            if (this.hasErrorNodeIds.indexOf(resource.id) !== -1)
                resource.validation = false
            else
                resource.validation = true
        },

        handleOper (type) {
            if (type === 'center')
                this.centerCanvas()
        },

        centerCanvas (callback) {
            this.diagramInstance.zoomExtent(callback)
        },

        /**
         * @description 资源配置项表单控件被聚焦后，拓扑图对应资源联动高亮显示
         */
        defineCheckedNode (id) {
            this.checkedLink = null
            this.diagramInstance.checked_link = null
            this.diagramInstance.ctrlCheckedNodes.splice(0, this.diagramInstance.ctrlCheckedNodes.length)

            let node = this.findNodeById(id)
            if (!node) {
                this.checkedNode = null
                this.diagramInstance.checked_node = null
                return
            }
            // UCMP3-2062 可视化工具拖拽卡顿优化后，checked_node取值完整的hierarchical格式的node数据
            this.checkedNode = node
            this.diagramInstance.checked_node = node
        },

        /**
         * @description 连线配置项表单控件被聚焦后，拓扑图对应连线联动高亮显示
         */
        defineCheckedLink (id) {
            let link = this.defaultLinks.find(_link => {
                return _link.id === id
            })
            if (!link || !link.source || !link.source.data || !link.target || !link.target.data) {
                this.checkedLink = null
                this.diagramInstance.checked_link = null
                this.diagramInstance.ctrlCheckedNodes.splice(0, this.diagramInstance.ctrlCheckedNodes.length)
                return
            }
            this.checkedLink = link
            this.diagramInstance.checked_link = link
            this.checkedNode = link.target
            this.diagramInstance.checked_node = link.target
            this.diagramInstance.ctrlCheckedNodes.splice(0, this.diagramInstance.ctrlCheckedNodes.length)
            this.diagramInstance.ctrlCheckedNodes.push(link.source)
        },

        getDescendants (id, afterGetIdsfunc) {
            let ids = this.diagramInstance.getDescendantsById(id).map(node => { return node.id })
            afterGetIdsfunc && afterGetIdsfunc(ids)
        },
        
        getBlueprintEditPrivileges () {
            if (!this.providerConf) return
            Api.get('blueprintEditPrivileges', {}).then(
                res => {
                    this.editPrivileges = res
                }
            )
        },

        getViewportDom (dom) {
            this.viewportDom = dom
        },

        startInitForm (id) {
            this.$emit('startInitForm', id)
        },
        
        endInitForm (id) {
            this.$emit('endInitForm', id)
        }
    },

    computed: {
        verrors () {
            return this.$validator.errors
        },

        /**
         * @description 资源配置表单校验后不通过的资源id集合
         */
        hasErrorNodeIds () {
            if (!this.verrors || !this.verrors.items)
                return []
            let allIds = this.verrors.items.map(
                item => {
                    return item.field.split('@')[0]
                }
            )
            return Array.from(new Set(allIds))
        }
    },

    watch: {
        'defaultResources.length' (val) {
            // 初始化数据完成后自动选中第一个节点资源
            if (val && !this.checkedNode) {
                this.$nextTick(
                () => {
                    this.checkedNode = this.findNodeById(this.defaultResources[0].id)
                })

                // 自动居中处理画布 【画布viewport 尺寸不为 0，即视为节点绘制结束，此时可以定位画布】
                if (this.viewportDom) {
                    let interval = setInterval(() => {
                        let bbox = this.viewportDom.getBBox()
                        if (bbox.width && bbox.height) {
                            let clearLoading = () => {
                                this.loading = false
                            }
                            this.centerCanvas(clearLoading)
                            clearInterval(interval)
                        }
                    }, 100)
                }
            }

            this.defaultResources.forEach(
                resource => {
                    if (this.toggleSwitches[resource.id] === undefined)
                        this.$set(this.toggleSwitches, resource.id, true)
                }
            )
        },

        'editPrivileges.length' (val) {
            // UCMP3-3403 申请单修改页面，默认所有资源展开
            if (!val || !this.isApplyHandle || !this.ifApproveReference) return
            this.defaultResources.forEach(
                resource => {
                    if (resource.info && resource.info.service_code && this.editPrivileges.indexOf(resource.info.service_code) === -1)
                        this.$set(this.toggleSwitches, resource.id, false)
                    else if (resource.info && resource.info.service_code && this.editPrivileges.indexOf(resource.info.service_code) !== -1)
                        this.$set(this.toggleSwitches, resource.id, true)
                }
            )
        },

        hasErrorNodeIds () {
            this.defaultResources.forEach(
                item => {
                    this.setValidation(item)
                }
            )
            this.defaultLinks.forEach(
                link => {
                    this.setValidation(link)
                }
            )
            this.diagramInstance.redrawNodes()
            this.diagramInstance.redrawLinks()
        }
    },
    created () {
        this.rootId = 'null'
        this.getBlueprintGroups()
        this.getBlueprintEditPrivileges()
    },

    components: {
        OrchestrateDiagram,
        BlueprintNodeConfigForms
    }
}
</script>

<style lang="scss" scoped>
.canvas {
    width: 335px;
    height: 300px;
    position: absolute;
    right: 0;
    top: 40px;
    background: #fff;
    padding: 0;
}
.bp-details-container {
    width: 100%;
    // height: 100%;
    background: #fff;
    // &.instance-detail {
    //     background: $BgGrayColor;
    // }
    // padding: 16px;
    // position: relative;
    // min-height: 600px;
}
.blueprint-title {
  font-size: 14px;
  font-weight: bold;
  height: 40px;
  width: 335px;
  line-height: 40px;
  position: absolute;
  right: 0px;
  top: 0;
  background: #fff;
}
</style>
