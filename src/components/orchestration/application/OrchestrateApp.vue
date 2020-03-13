<template lang="pug">
UcmpContainer.orchestrate(:breadcrumbItems="breadcrumbItems")
    div.full-container(slot="content" v-loading="$route.params.id !== 'add' && loading" element-loading-text="拓扑图加载中" element-loading-spinner-category="config")
        div.top-button-container
            el-upload.import-btn(
                ref="upload"
                :auto-upload="false"
                :multiple="!$route.params.id"
                action="upload"
                :on-change="fileChange"
                :show-file-list="importBpFilesList"
            )
                button(slot="trigger" ref="uploadbtn") 导入编排
            // el-button(slot="trigger" size="small" type="info" icon="el-icon-download" plain @click="submitEvent('export')") 导出编排
        div.orchestrate-content
            div.bg-tips.border(v-if="!defaultResources.length")
                span.ucmp-icon-device-plus {{bg_tips.text}}
            OrchestrateDiagram.orchestrate-canvas(
                ref="editor"
                v-if="showDiagram"
                :blueprintId="$route.params.id"
                :checkedNode.sync="checkedNode"
                :checkedLink.sync="checkedLink"
                :checkedGroupId.sync="checkedGroupId"
                :groupsConfigs="defaultGroups"
                :showConfig.sync="showConfig"
                :editDisabled="editDisabled"
                :defaultResources.sync="defaultResources"
                :defaultLinks.sync="defaultLinks"
                :rootId="rootId"
                :canNestNodeRule="canNestNodeRule"
                :linkReferences="linkReferences"
                :findReferencedNode="findReferencedNode"
                :findParentNode="findParentNode"
                :configs.sync="configs"
                :propertiesConfig.sync="propertiesConfig"
                :linkPropertiesConfig.sync="linkPropertiesConfig"
                :linkConfigs.sync="linkConfigs"
                :treeObj="defaultBpTreeObjData"
                :beforeAddLink="beforeAddLink"
                @groupClick="groupClick"
                @AddNodeToGroup="AddNodeToGroup"
                @beforeAddNode="beforeAddNode"
                @beforeClone="beforeClone"
                @afterClone="afterClone"
                @afterAddLink="afterAddLink"
                @afterNested="afterNested"
                @beforeDeleteNode="beforeDeleteNode"
                @afterDeleteNode="afterDeleteNode"
                @beforeDeleteLink="beforeDeleteLink"
                @afterDeleteLink="afterDeleteLink"
                @getDiagramObj="getDiagramObj"
                @getViewportDom="getViewportDom"
            )
                IconButton.canvas-btn(
                    slot="moreCanvasBtns"
                    v-for="oper in operations"
                    :key="oper.type"
                    :class="'canvas-btn-' + oper.type"
                    :type="oper.icon"
                    :text="oper.title"
                    @iconClick="handleOper(oper.type)"
                )
            div.node-config
                transition(name="zoom-in-right")
                    BlueprintNodeConfigForms.config-forms(
                        v-show="checkedNode && showConfig"
                        ref="resourceCfgRef"
                        :node.sync="checkedNode"
                        :showConfig.sync="showConfig"
                        :showPropertiesConfig.sync="showPropertiesConfig"
                        :configs.sync="configs"
                        :linkConfigs.sync="linkConfigs"
                        :defaultLinks="defaultLinks"
                        :allBasicResources="basicResources"
                        :nasValid="nasValid"
                        :popper_not_to_body="popper_not_to_body"
                        :blueprintId="$route.params.id"
                        @defineCheckedLink="defineCheckedLink"
                    )
                transition(name="zoom-in-right")
                    BlueprintNodePropertyForms.config-forms(
                        v-show="checkedNode && showPropertiesConfig"
                        ref="resourcePropertiesRef"
                        :node.sync="checkedNode"
                        :showConfig.sync="showConfig"
                        :showPropertiesConfig.sync="showPropertiesConfig"
                        :configs.sync="propertiesConfig"
                        :allBasicResources="basicResources"
                        :defaultLinks="defaultLinks"
                        :linkConfigs.sync="linkPropertiesConfig"
                        @defineCheckedLink="defineCheckedLink"
                    )
            div.node-config
                transition(name="")
                    BlueprintGroupForms.config-forms(
                        v-if="checkedGroupId && showConfig"
                        :diagramInstance="diagramInstance"
                        :showConfig.sync="showConfig"
                        :group_id="checkedGroupId"
                        :noGroupNodes="noGroupNodes"
                        :defaultGroups="defaultGroups"
                        :hasGroupInfoNodes="hasGroupInfoNodes"
                    )
            el-dialog(title="编排信息" v-if="showBlueprintSwitch" :visible.sync="showBlueprintSwitch" width="400px")
                SaveBlueprint(
                    :resources="blueprintForm"
                    :dialogVisible.sync="showBlueprintSwitch"
                    :ifEdit="$route.params.id !== 'add'"
                    :blueInfo="defaultBlueprint"
                    @saveSuccess="saveSuccess"
                )
            el-dialog(title="导出编排" v-if="exportDialog" :visible.sync="exportDialog" width="600px")
                el-form(label-width="80px" size="small" label-position="left")
                    el-form-item(label="文件名称")
                        el-input(type="text" v-model="defaultBpFileName")
                    el-form-item
                        el-button(type="default" @click="exportDialog = false") 取消
                        el-button(type="primary" @click="exportBlueprintFile") 确定
            el-dialog(title="加入编排分层" v-if="addGroupSwitch" :visible.sync="addGroupSwitch" width="600px")
                el-form(label-width="80px" size="small" label-position="left")
                    el-form-item(label="编排分层")
                        el-select(type="text" v-model="checkedGroup" value-key="group_id")
                            el-option(
                                v-for="group in blueprintGroup"
                                :key="group.group_id"
                                :label="group.group_name"
                                :value="group"
                            )
                    el-form-item
                        el-button(type="default" @click="quitGroup") 取消
                        el-button(type="primary" :disabled="!checkedGroup" @click="importGroupToCanvas") 确定
</template>

<script>
/**
 * @description  新建编排/编辑编排组件
 */
import { mapActions } from 'vuex'
import BlueprintNodeConfigForms from '@/components/orchestration/form/deployConfig/BlueprintNodeForms'
import BlueprintNodePropertyForms from '@/components/orchestration/form/propertyConfig/BlueprintNodeForms'
import BlueprintGroupForms from '@/components/orchestration/form/groupConfig/BlueprintGroupForms'
import SaveBlueprint from '@/components/orchestration/form/features/SaveBlueprint'
import Api from '@api'
import OrchestrateDiagram from '@/components/orchestration/diagram/OrchestrateDiagram'
import FileSaver from 'file-saver'
import EditBlueprint from '@mixins/editBlueprint.mixin'
import OracleWithNas from '@mixins/oracleWithNas.mixin'
import GetBlueprintGroups from '@mixins/getBlueprintGroups.mixin'
import Utils from '@server/Utils'
import { initMetadataBeforeRouteEnter } from '@mixins/initMetadata.mixin'

export default {
    $_veeValidate: {
        validator: 'new'
    },
    beforeRouteLeave (to, from, next) {
        // 新增编排信息，离开页面校验规则
        if (this.$route.params.id === 'add' && (!this.defaultResources.length || (this.defaultResources.length && this.routerLeave))) {
            next()
            return
        }

        if (this.$route.params.id !== 'add' && (JSON.stringify(this.originFormData) === JSON.stringify(this.blueprintForm) || this.routerLeave)) {
            next()
            return
        }

        this.$confirm('您有未保存的编排任务,离开此页面后该数据将被销毁,是否继续离开?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            next()
        }).catch(() => {
            this.setActivedNavIndex('/orchestrate-app/add')
        })
    },

    mixins: [EditBlueprint, OracleWithNas, GetBlueprintGroups, initMetadataBeforeRouteEnter],

    data () {
        return {
            defaultResources: [], // 初始化资源节点数据
            defaultLinks: [], // 初始化资源依赖关系
            checkedGroup: null,
            defaultBpTreeObjData: {},
            configs: {},
            propertiesConfig: {},
            defaultGroupConfig: {
                group_name: '',
                styles: {
                    fill: null,
                    stroke: null
                }
            },
            linkConfigs: {},
            linkPropertiesConfig: {},
            submitBtns: [
                { prop: 'saveblueprint', label: '保存编排', type: 'warning', plain: true },
                { prop: 'deploy', label: '立即部署', type: 'warning', plain: false }
            ],
            parentKeys: ['ecs', 'subnet'],
            icons: {
                ecs: '\ue663',
                volume: '\ue662',
                subnet: '\ue6a4',
                oracle: '\ue693',
                mysql: '\ue692',
                tomcat: '\ue694',
                weblogic: '\ue695',
                f5: '\ue6c7',
                f5_pool: '\ue6c7',
                nas: '\ue6c8',
                oracle_rac: '\ue6f4'
            },
            operations: [
                { type: 'import', icon: 'ucmp-icon-download', title: '导入编排' },
                { type: 'export', icon: 'ucmp-icon-upload', title: '导出编排' },
                { type: 'clone', icon: 'clone-resource', title: '拷贝' },
                { type: 'addGroup', icon: 'add-to-group', title: '设置分层' },
                { type: 'saveblueprint', icon: 'ucmp-icon-save', title: '保存编排' },
                { type: 'center', icon: 'center-canvas', title: '画布居中' },
                { type: 'align-left', icon: 'ucmp-icon-align-left', title: '居左对齐' },
                { type: 'align-right', icon: 'ucmp-icon-align-right', title: '居右对齐' },
                { type: 'align-top', icon: 'ucmp-icon-align-top', title: '居上对齐' },
                { type: 'align-bottom', icon: 'ucmp-icon-align-bottom', title: '居下对齐' }
                // { type: 'help', icon: 'ucmp-icon-question', title: '帮助' }
            ],
            defaultIcon: '\ue685',
            rootId: '',
            editDisabled: false,
            showConfig: false,
            showPropertiesConfig: false,
            checkedNode: null,
            checkedLink: null,
            checkedGroupId: null,
            showBlueprintSwitch: false,
            exportDialog: false,
            addGroupSwitch: false,
            importBpFilesList: false,
            defaultBpResources: [], // 编排节点初始化数据
            defaultBlueprint: {
                service_code: '',
                name: '',
                description: ''
            },
            defaultBpFileName: '编排',
            addLinkRules: {
                ecs: ['ecs'],
                storage: ['ecs'],
                rds: ['middleware'],
                middleware: ['rds']
            },
            bg_tips: {
                text: '请先从左侧列表拖拽资源到画布'
            },
            routerLeave: false,
            originFormData: {}, // 编辑模式初始化数据缓存，离开页面校验使用
            popper_not_to_body: true,
            diagramInstance: null,
            loading: true,
            viewportDom: null,
            showDiagram: false // 渲染拓扑图标志
        }
    },

    methods: {
        ...mapActions([
            'setActivedNavIndex'
        ]),

        /**
         * @description 获取可视化图表对象
         * @author xinghua.wen
         */
        getDiagramObj (vm) {
            this.diagramInstance = vm
        },

        getViewportDom (dom) {
            this.viewportDom = dom
        },

        AddNodeToGroup (node, group_id) {
            this.addGroup(node, group_id)
        },

        handleOper (type) {
            if (type === 'export' && this.exportEvent) {
                this.exportEvent()
                return
            }
            if (type === 'import' && this.importEvent) {
                this.importEvent()
                return
            }
            if (type === 'clone') {
                this.cloneCheckedNode()
                return
            }
            if (type === 'addGroup') {
                if (!this.checkedNode) {
                    this.messageEvent('未选中资源节点，无法使用加入分层功能', '错误', 'error')
                    return
                }
                this.addGroupSwitch = true
                return
            }
            if (type === 'saveblueprint') {
                this.submitEvent('saveblueprint')
                return
            }
            if (type === 'deploy') {
                this.submitEvent('deploy')
                return
            }
            if (type === 'center') {
                this.centerCanvas()
                return
            }
            if (type === 'align-left' || type === 'align-right' || type === 'align-top' || type === 'align-bottom') {
                // UCMP3-6118 对齐功能添加提示
                this.messageEvent('对齐功能只针对未被包含的节点生效', '提示', 'info')
                this.alignNodes(type.split('-')[1])
                return
            }
            this.canvasOperator(type)
        },

        alignNodes (direction) {
            let nodes = this.diagramInstance.ctrlCheckedNodes.concat(this.diagramInstance.checked_node)
            if (!this.diagramInstance.checked_node || nodes.length < 2) {
                this.messageEvent('至少需要同时选中两个节点：请按住Ctrl键点击画布其他节点', '警告', 'warning')
                return
            }
            this.diagramInstance.alignDefinedNodes(nodes, direction)
        },

        importGroupToCanvas () {
            this.addGroup(this.checkedNode.data.info, this.checkedGroup.group_id)
            this.checkedGroup = null
            this.addGroupSwitch = false
        },

        centerCanvas () {
            this.diagramInstance.zoomExtent()
        },

        quitGroup () {
            this.checkedGroup = null
            this.addGroupSwitch = false
        },

        groupClick (d) {
            this.checkedGroupId = d
        },

        addGroup (node, group_id) {
            this.$set(node, 'group_id', group_id)
            this.messageEvent(this.checkedNode.data.info.name + '加入分层', '成功', 'success')
        },

        exportEvent () {
            this.submitEvent('export')
        },

        importEvent () {
            this.$refs.uploadbtn.click()
        },

        /**
         * @description 拷贝资源节点
         */
        cloneCheckedNode () {
            if (!this.checkedNode) {
                this.messageEvent('画布没有选中资源，无法使用拷贝功能', '成功', 'warning')
                return
            }
            this.diagramInstance.cloneNode(this.checkedNode.data)
        },

        /**
         * @description 克隆节点前钩子事件，用来提前克隆节点配置数据
         */
        beforeClone (sourceId, targetId) {
            let sourceConfig = this.configs[sourceId]
            if (!sourceConfig)
                return
            let targetConfig = JSON.parse(JSON.stringify(sourceConfig))
            let formData = targetConfig.formData
            let display = targetConfig.display
            Object.keys(formData).forEach(
                key => {
                    let targetKey = key.replace(sourceId, targetId)
                    this.$set(formData, targetKey, formData[key])
                    this.$set(display, targetKey, display[key])
                    delete formData[key]
                    delete display[key]
                }
            )
            this.$set(this.configs, targetId, targetConfig)
        },

        /**
         * @description 拷贝节点成功后的钩子事件
         */
        afterClone (cloneNode) {
            this.messageEvent('成功拷贝' + cloneNode.info.name + '及其配置', '成功', 'success')
        },

        /**
         * @description 导入编排功能
         */
        fileChange (file, fList) {
            this.$confirm('导入编排将删除画布已有资源及其配置, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.importBlueprint(file)
            }).catch(() => {

            })
        },

        importBlueprint (file) {
            let self = this
            let fileReader = new FileReader()
            fileReader.readAsText(file.raw)
            fileReader.onload = () => {
                let result = JSON.parse(fileReader.result)
                // 导入前，首先删除当前画布所有的节点以及连线
                self.defaultResources.splice(0, self.defaultResources.length)
                self.defaultLinks.splice(0, self.defaultLinks.length)
                // 待观察数据计算完成后，给画布当前的节点以及连线信息
                this.$nextTick(
                    () => {
                        this.defaultBpTreeObjData = JSON.parse(JSON.stringify(result))
                        this.messageEvent('成功导入编排', '成功', 'success')
                    }
                )
            }
        },

        saveSuccess () {
            this.showBlueprintSwitch = false
            this.routerLeave = true
            this.$router.push('/blueprint')
        },

        afterNested (node, parentNode) {
            let message = parentNode.info.name ? node.info.name + '成功关联' + parentNode.info.name : node.info.name + '被取消关联'
            this.messageEvent(message, '成功', 'success')
        },

        /**
         * @description 校验画布中的资源节点都被选中，拥有了配置表单数据
         */
        validateBasicResHasCfg () {
            let rule = this.basicResources.some(
                item => {
                    if (JSON.stringify(this.configs[item.id].formData) === '{}')
                        return true
                    // nas命名时不能重复，否则在部署资源时会失败，在此添加校验
                    // TODO
                }
            )
            if (rule) {
                this.messageEvent('画布中部分资源未添加配置信息', '错误', 'error')
                return false
            }
            return true
        },

        /**
         * @description 校验编排拓扑图信息是否完整
         */
        validateBpConfigForms () {
            if (!this.defaultResources.length) {
                this.messageEvent('请从左侧列表至少拖拽一个资源进入画布', '错误', 'error')
                return false
            }
            if (!this.validateBasicResHasCfg())
                return false

            return true
        },

        submitEvent (prop) {
            if (!this.validateBpConfigForms())
                return
            this.$validator.validate().then(result => {
                if (!result)
                    this.messageEvent('部分资源的配置信息填写不正确，请修改', '错误', 'error')
                else {
                    if (prop === 'export') {
                        this.exportDialog = true
                        return
                    }
                    this.showBlueprintSwitch = true
                }
            })
        },

        /**
         * @description 编排导出为文件
         */
        exportBlueprintFile () {
            var blob = new Blob([JSON.stringify(this.blueprintForm)], {type: 'text/plain;charset=utf-8'})
            FileSaver.saveAs(blob, this.defaultBpFileName + '_bp.json')
            this.exportDialog = false
        },

        /**
         * @description 提示事件
         */
        messageEvent (message, title, type) {
            this.$notify({
                title,
                type,
                message
            })
        },

        /**
         * @description 删除节点前的确认事件
         * @param [node] 待删除的节点信息
         * @param [deleteNode] 删除节点的事件
         */
        beforeDeleteNode (nodes, deleteNode_func) {
            if (!Array.isArray(nodes) || !nodes.length)
                return
            let nodeNames = nodes.map(
                node => {
                    return node.data.info.name
                }
            ).join(',')
            this.$confirm('删除' + nodeNames + '以及其相关配置，是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteNode_func(nodes)
            }).catch(() => {
            })
        },

        afterDeleteNode (nodes) {
            if (!Array.isArray(nodes) || !nodes.length)
                return
            let nodeNames = nodes.map(
                node => {
                    return node.data.info.name
                }
            ).join(',')
            this.messageEvent('选中的' + nodeNames + '成功从画布中删除', '成功', 'success')
            this.showConfig = false
        },

        beforeDeleteLink (link, deleteLink) {
            this.$confirm('删除选中的依赖关系，是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteLink()
            }).catch(() => {
            })
        },

        afterDeleteLink (link) {
            this.messageEvent('选中的依赖关系成功从画布中删除', '成功', 'success')
        },

        /**
         * @description 解析当前节点信息，分析出连线关联信息为指定的格式：reference_key(唯一id)、tooltip显示内容、more_info(更多内容)
         */
        linkReferences (node) {
            // 修复初始化没有info导致控制台报错，拓扑图无法画出来的问题
            if (!node || !node.data || !node.data.info) return []
            let related_services = node.data.info.related_service
            if (!related_services || !related_services.length)
                return []

            return related_services.filter(
                service => {
                    // UCMP3-6091 如果当前没有关联服务权限，不予显示
                    if (service.reference && service.reference.target && this.metadata.find(_service => _service.service_code === service.service_code))
                        return service
                }
            ).map(
                service => {
                    return {
                        reference_key: service.service_code,
                        tooltip: this.metadataAsObj[service.service_code].name + service.reference.description,
                        more_info: {
                            description: service.reference.description,
                            type: service.reference.description
                        }
                    }
                }
            )
        },

        /**
         * @description 校验当前节点是否能够与悬浮节点(node)主动连线
         */
        findReferencedNode (reference, node) {
            if (!reference || !reference.reference_key || !node || !node.info)
                return false
            if (reference.reference_key === node.info.service_code)
                return true
            return false
        },

        /**
         * @description 校验选中节点(checked_node)是否能够被当前节点(current_node)嵌套
         * @description 两种场景：1. related_service includings->true; 2. parent: ['']
         */
        findParentNode (checked_node, current_node) {
            if (!checked_node || !current_node || !checked_node.info || (!checked_node.info.related_service && !checked_node.info.parent))
                return false
            // 场景1
            let includingRst = checked_node.info.related_service && checked_node.info.related_service.filter(
                service => {
                    if (service.including && !service.including.inner)
                        return service
                }
            ).map(
                service => {
                    return service.service_code
                }
            ).indexOf(current_node.info.service_code) !== -1

            // 场景2
            let hierarchyRst = checked_node.info.parent && checked_node.info.parent === current_node.info.service_code

            return includingRst || hierarchyRst
        },

        /**
         * @description 资源节点能否嵌套的规则 白名单模式，默认不能嵌套。
         * @description 校验规则 [equal] 父节点与子节点的属性与规则设置的一致则可以校验
         * @description 校验规则 [indexOf] 子节点的group属于规则归类的一种则通过校验
         *
         */
        canNestNodeRule (node, parent) {
            // // the hovered node  which is not container node can‘t nested other nodes
            // if (this.parentKeys.indexOf(parent.info.service_code) === -1 && parent.info.service_code !== 'root') {
            //     this.messageEvent(node.info.name + '不能被' + parent.info.name + '引用', 'warning')
            //     return false
            // }
            // if (node.info.group && node.info.group === 'blueprint' && parent.info.service_code !== 'root') {
            //     this.messageEvent('编排不能被' + parent.info.name + '引用', 'warning')
            //     return false
            // }
            if (parent.info.service_code === 'root')
                return true
            if (this.hasLinkBetweenNodes(node, parent)) {
                this.messageEvent(node.info.name + '与' + parent.info.name + '已建立依赖关系，不能继续建立引用关系', '警告', 'warning')
                return false
            }

            // 校验两个节点是否关联服务
            if (parent.info.related_service && node.info.related_service) {
                let relatedCodes = parent.info.related_service.map(
                    service => {
                        return service.service_code
                    }
                )
                let index = relatedCodes.indexOf(node.info.service_code)
                // 确定两个节点是关联服务
                if (index !== -1 && parent.info.related_service[index].including && parent.info.related_service[index].including.inner) {
                    let refer_type = parent.info.related_service[index].refer_type

                    // 父节点可以包含多个该服务子节点
                    if (refer_type === 'o:m' || refer_type === 'm:m')
                        return true
                    else if (refer_type === 'o:o' || refer_type === 'm:o') { // 父节点只能包含一个该服务子节点
                        let parentNode = this.findNodeById(parent.id)
                        // 获取待选父节点当前所有直系子节点
                        let children = parentNode.children
                        if (!children)
                            return true
                        let childrenCodes = children.map(
                            child => {
                                return child.data.info.service_code
                            }
                        )

                        // 待选父节点当前所有直系子节点不包含待选子节点类型的服务节点
                        if (childrenCodes.indexOf(node.info.service_code) === -1)
                            return true
                        else {
                            this.messageEvent(parent.info.name + '只能包含一个' + node.info.name, '警告', 'warning')
                            return false
                        }
                    }
                }
            }
            if (parent.info.children && node.info.parent && parent.info.children.indexOf(node.info.service_code) !== -1 && node.info.parent === parent.info.service_code) {
                // 没有设置最大数量限制，视为无限大
                if (!node.info.max)
                    return true
                let parentNode = this.findNodeById(parent.id)
                // 获取待选父节点当前所有直系子节点
                let children = parentNode.children
                if (!children)
                    return true
                let filteredChildren = children.filter(
                    child => {
                        return child.data.info.service_code === node.info.service_code
                    }
                )
                if (!filteredChildren.length || filteredChildren.length < node.info.max)
                    return true
                else {
                    this.messageEvent(parent.info.name + '最多只能包含' + node.info.max + '个' + node.info.name, '警告', 'warning')
                    return false
                }
            }

            this.messageEvent(node.info.name + '不能被' + parent.info.name + '包含', '警告', 'warning')
            return false
        },

        findNodeById (id) {
            return this.diagramInstance.findNodeById(id)
        },

        /**
         * @description 校验相同类型的资源可以嵌套的数量 infinite表示可以无限数量地嵌套
         */
        validateMax (node, pNode, _max = 'infinite') {
            if (_max === 'infinite')
                return true

            let sameTypeChild = this.defaultResources.filter(
                item => {
                    if (item.pId === pNode.id && item.info.service_code === node.info.service_code && item.id !== node.id)
                        return item
                }
            )
            return _max > sameTypeChild.length
        },

        /**
         * @description 节点连线之前的钩子事件，需要返回值Boolean，true表示可以连线，false反之
         * @description 这个钩子事件在此处用来校验节点的连线规则 【白名单】
         */
        beforeAddLink (source, target) {
            // UCMP3-1301 蓝图编辑状态，自己不可以连接自己
            if (source.id === target.id)
                return false
            if (source.info.service_code === 'ecs' && target.info.service_code === 'ecs')
                return { description: '先后依赖', type: 'dependency' }
            if (source.info.related_service && source.info.related_service.length) {
                // 获取source节点的关联服务列表
                let related_reference_services = source.info.related_service.filter(
                    service => {
                        if (service.reference && service.reference.target)
                            return service
                    }
                )
                // 关联服务service_code列表
                if (related_reference_services.length) {
                    let reference_service_codes = related_reference_services.map(
                        service => {
                            return service.service_code
                        }
                    )
                    // 如果target的service_code在关联服务列表中，则允许连接
                    let index = reference_service_codes.indexOf(target.info.service_code)
                    if (index !== -1)
                        return { description: related_reference_services[index].reference.description, type: related_reference_services[index].reference.type }
                }
            }
            this.messageEvent(source.info.name + '不能被' + target.info.name + '依赖', '警告', 'warning')
            return false
        },

        beforeAddNode (adding_node, parentNode, coors) {
            this.autoAddChild(this.diagramInstance.addNode(coors[0], coors[1], parentNode), adding_node)
        },

        /**
         * @description 层次关系服务，当前待添加的服务为父级服务，自动添加子级服务实例
         */
        autoAddChild (parent, service_node) {
            if (!service_node.children || !Array.isArray(service_node.children))
                return

            let _parent = {}
            service_node.children.forEach(
                child_code => {
                    let childService = this.metadataAsObj[child_code]
                    if (childService.min) {
                        // 自动添加最小数量的子服务实例
                        for (let index = 0; index < childService.min; index++) {
                            this.$refs.editor.$refs.orchestrateEditor.adding_node = childService
                            this.$nextTick(
                                () => {
                                    // 画布中与childService有嵌套关系的节点高亮显示，否则不能嵌套进去
                                    this.diagramInstance.referenceFeedback({info: childService}, this.diagramInstance.findParentNode)
                                    // UCMP-1581 修复f5体积过大遮盖画布其他节点的问题
                                    _parent = this.diagramInstance.addNode(null, null, parent)
                                    this.$refs.editor.$refs.orchestrateEditor.adding_node = null
                                    // 取消上述嵌套关系节点的高亮显示效果
                                    this.diagramInstance.resetReferenceFeedback()
                                    // 递归调用，自动添加当前服务的子服务节点
                                    this.autoAddChild(_parent, childService)
                                }
                            )
                        }
                    }
                }
            )
        },

        afterAddLink (source, target) {

        },

        hasLinkBetweenNodes (node_1, node_2) {
            return this.defaultLinks.filter(
                link => {
                    if ((link.source.id === node_1.id && link.target.id === node_2.id) || (link.source.id === node_2.id && link.target.id === node_1.id))
                        return link
                }
            )[0]
        },

        confirmClose () {
            this.routerLeave = true
        },

        initOrchestrate () {
            let groupPromise = this.getBlueprintGroups()
            if (this.$route.params.id !== 'add') {
                this.defaultBlueprint.service_code = this.$route.params.id
                let EditDiagramDataPromise = Api.get('getMetadata', { _code: 'blueprint/' + this.defaultBlueprint.service_code }, true).then(
                    res => {
                        let xhrData = res.metadata
                        this.defaultBlueprint.name = xhrData.name
                        this.defaultBlueprint.icon = xhrData.icon
                        this.defaultBlueprint.description = (xhrData.description ? xhrData.description : '')
                        this.defaultBpTreeObjData = xhrData
                        let copiedXhrData = JSON.parse(JSON.stringify(xhrData))
                        this.originFormData = {
                            resources: copiedXhrData.resources,
                            dependencies: copiedXhrData.dependencies
                        }

                        // 编辑模式，初始化得到viewport后取消loading
                        let interval = setInterval(() => {
                            let bbox = this.viewportDom.getBBox()
                            if (bbox.width && bbox.height) {
                                this.loading = false
                                clearInterval(interval)
                            }
                        }, 100)
                    }
                )
                // UCMP3-5622 拿到分层列表以及拓扑图数据后再渲染拓扑图
                Promise.all([groupPromise, EditDiagramDataPromise]).then(
                    res => {
                        this.showDiagram = true
                    }
                )
            } else {
                this.defaultResources = []
                this.defaultLinks = []
                this.defaultBpTreeObjData = {}
                this.configs = {}
                this.linkConfigs = {}
                this.defaultBlueprint = {
                    service_code: '',
                    name: ''
                }
                this.originFormData = {}
                this.showDiagram = true
            }
        },

        setValidation (resource) {
            if (resource.validation === undefined)
                this.$set(resource, 'validation', true)
            if (this.hasErrorNodeIds.indexOf(resource.id) !== -1)
                resource.validation = false
            else
                resource.validation = true
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
                return
            }
            this.checkedLink = link
            this.diagramInstance.checked_link = link
        }
    },

    created () {
        this.rootId = Utils.uuid()
        this.initOrchestrate()
    },

    computed: {
        breadcrumbItems () {
            if (this.$route.params.id === 'add')
                return [{ label: '新建编排' }]
            else {
                return [
                    {
                        prop: '/blueprint', label: '编排管理'
                    },
                    {
                        label: '编排' +
                    (this.metadataAsObj && this.metadataAsObj[this.$route.params.id] && this.metadataAsObj[this.$route.params.id].name
                    ? this.metadataAsObj[this.$route.params.id].name : this.$route.params.id) + '编辑'
                    }
                ]
            }
        },

        /**
         * @description 元数据数组转为Object类型，方便初始化编排数据获取对应的元数据信息
         */
        metadataAsObj () {
            let rst = {}
            this.metadata.forEach(
                item => {
                    rst[item.service_code] = item
                }
            )
            return rst
        },

        metadataServiceCodes () {
            return this.metadata.map(
                meta => {
                    return meta.service_code
                }
            )
        },

        noGroupNodes () {
            return this.defaultResources.filter(
                node => {
                    if (!node.info.group_id)
                        return node
                }
            )
        },

        hasGroupInfoNodes () {
            return this.defaultResources.filter(
                node => {
                    if (node.info.group_id)
                        return node
                }
            )
        },

        /**
         * @description 资源配置表单校验后不通过的资源id集合
         */
        hasErrorNodeIds () {
            if (!this.errors || !this.errors.items)
                return []
            let allIds = this.errors.items.map(
                item => {
                    return item.field.split('@')[0]
                }
            )
            return Array.from(new Set(allIds))
        },

        resourceIds () {
            return this.defaultResources.map(
                resource => {
                    return resource.id
                }
            )
        },

        /**
         * get all node group set of exited in canvas
         */
        groupIds () {
            return Array.from(new Set(this.hasGroupInfoNodes.map(
                node => {
                    return node.info.group_id
                }
            )))
        },

        // 覆盖 getBlueprintGroups.mixin 的内容
        defaultGroups () {
            let rst = {}
            this.groupIds.forEach(
                group_id => {
                    let checkedGroup = this.blueprintGroup.find(group => group.group_id === group_id)
                    if (checkedGroup) {
                        rst[checkedGroup.group_id] = {
                            group_name: checkedGroup.group_name,
                            styles: checkedGroup.styles
                        }
                    } else {
                        let defaultGroupConfig = JSON.parse(JSON.stringify(this.defaultGroupConfig))
                        defaultGroupConfig.group_name = '分层' + group_id.replace(/^group/, '')
                        rst[group_id] = defaultGroupConfig
                    }
                }
            )
            return rst
        },

        linkIds () {
            return this.defaultLinks.map(
                link => {
                    return link.id
                }
            )
        }
    },

    watch: {
        /**
         * @description 元数据列表获取较晚的场景，重新给初始化的资源节点添加元数据信息
         */
        metadataAsObj () {
            if (JSON.stringify(this.metadataAsObj) !== '{}') {
                this.defaultResources.forEach(
                    item => {
                        if (!item.info)
                            this.$set(item, 'info', this.metadataAsObj[item.service_code])
                        delete item.service_code
                    }
                )
            }
        },

        basicResources () {
            this.basicResources.forEach(
                item => {
                    if (!this.configs[item.id])
                        this.$set(this.configs, item.id, JSON.parse(JSON.stringify({ formData: {}, display: {} })))
                    if (!this.propertiesConfig[item.id])
                        this.$set(this.propertiesConfig, item.id, JSON.parse(JSON.stringify({ formData: {}, display: {} })))
                }
            )
        },

        defaultLinks () {
            this.defaultLinks.forEach(
                link => {
                    if (!this.linkConfigs[link.id])
                        this.$set(this.linkConfigs, link.id, JSON.parse('{}'))
                    if (!this.linkPropertiesConfig[link.id])
                        this.$set(this.linkPropertiesConfig, link.id, JSON.parse('{}'))
                }
            )
        },

        '$route.params.id' () {
            this.initOrchestrate()
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

    components: {
        BlueprintNodeConfigForms,
        BlueprintNodePropertyForms,
        BlueprintGroupForms,
        SaveBlueprint,
        OrchestrateDiagram
    }
}
</script>
<style lang="scss" scoped>
.orchestrate-content {
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
}

.orchestrate-canvas {
    width: 100%;
    height: 100%;
}

.bottom-operations {
    width: 100%;
    height: 72px;
}

.import-btn {
    display: none;
    margin-right: 8px;
}
.bg-tips {
    position: absolute;
    right: calc(50% - 250px);
    top: 50%;
    padding: 5px 20px;
    border-style: dashed !important;
    border-radius: 5px;
    z-index: 2000;
    .ucmp-icon-device-plus {
        &:before {
            margin-right: 10px;
        }
    }
}
</style>

