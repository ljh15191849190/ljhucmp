<template lang="pug">
    div.process-config.flex.full-height.flex-column
        div.flex.full-height.process-step
            transition(name="collapse-transition-left")
                div.summary.process-before(v-show="processFlag" :class="{'actived': processFlag}" @click="processFlag = !processFlag")
                    label.basicInfo {{'1、' + configTree.title}}
                        p.desc {{saveParam.name}}
                    label.basicInfo 2、服务
                        p.desc {{serviceName}}
                    label.basicInfo 3、操作方式
                        p.desc {{operationName}}

            transition(name="collapse-transition-left")
                div.flex.full-height.config-height.content(v-show="!processFlag" :class="{'actived': !processFlag}" v-loading="saveLoading" element-loading-text="正在保存中..." element-loading-spinner="ucmp-icon-loading")
                    div.border-right.full-height.tree-width.flex-grow-1
                        span.basicInfo {{'1、' + configTree.title}}
                        // 组织机构
                        div.Orgradio
                            el-radio-group(v-model="modeltype" @change="changemodelType")
                                el-radio(label="1") 组织机构
                                el-radio(label="2") 组织机构标识
                        div.Orgradio(v-if="modeltype==='2'")
                            div.tip-cot 组织机构标识：
                            el-radio-group.Orgradiowidth(v-model="orgtype")
                                el-radio.apptagstyle(v-for="(item, index) in appTag" :key="item.id" :label="item.name" @change="changeappTag(item)") {{ item.name }}
                        div(v-if="modeltype==='1'")
                            p.tip-cot 已选择：
                                span.tip-name {{saveParam.name || modifyParam.owner_name}}
                                span(v-if="inexistentOrg") （该组织机构已不存在）
                            el-input(v-model="searchKey" :placeholder="`请输入组织名或${selectedBusinessLabel}名搜索`" clearable size="small")
                            el-tree.margin-top.tree-height.scroll-top-shadow(
                            :data="configTree.data"
                            :props="configTree.defaultProps"
                            :render-content="renderContent"
                            :highlight-current="configTree.isHighlight"
                            :node-key="configTree.nodeKey"
                            @node-click="treeNodeClick"
                            ref="configTree"
                            v-loading="configTree.loading"
                            element-loading-spinner="ucmp-icon-loading"
                            :expand-on-click-node="false"
                            :default-expanded-keys="[saveParam.business_id]"
                            :filter-node-method="filterNode")
                    div.margin-left.padding-right.border-right.full-height.seleted-service-width.flex-grow-1
                        //- bug #UCMP-461 标题字体不一致
                        span.basicInfo 2、服务
                        p.tip-cot 已选择：
                            span.tip-name {{serviceName}}
                        el-radio-group.flex.flex-column.overflow-y-auto.scroll-top-shadow.height-with-label(
                        size="small"
                        v-model="selectedService"
                        @change="selecetServiceChange")
                            template(v-for="item in serviceDataGroups" v-if="item.metadatas && item.metadatas.length")
                                div.service-group
                                    div.service-group_name {{item.label || item.serviceGroup}}
                                    div.flex.flex-column
                                        el-radio.margin-bottom.no-margin-left.text-truncate(v-for="service in item.metadatas"
                                        :key="service.value"
                                        :label="service.value"
                                        v-title-tip="service.label") {{service.label}}
                    div.margin-left.border-right.full-height.seleted-service-width.flex-grow-1
                        label.basicInfo 3、操作方式
                        el-radio-group.flex.flex-column.overflow-y-auto.scroll-top-shadow.height-without-label(
                        size="small"
                        v-model="selectedActionType")
                            el-radio.margin-bottom.no-margin-left.text-truncate(
                            v-for="action in serviceActionsType"
                            :key="action.name"
                            :label="action.name"
                            :title="action.label") {{action.label}}
            //- bug #UCMP-522 流程配置，页面展示样式问题
            transition(name="collapse-transition-right")
                div.summary.process-after(v-show="!processFlag" :class="{'actived': !processFlag}" @click="processFlag = !processFlag")
                    label.basicInfo 4、审批流程
                        p.desc {{processName}}
            transition(name="collapse-transition-right")
                div.flex.flex-column.content.border-left.padding-left.overflow-auto(v-show="processFlag" :class="{'actived': processFlag}")
                    //- bug #UCMP-461 标题字体不一致
                    label.basicInfo 4、审批流程
                    el-radio-group.margin-left.adjust-select-process(
                    size="small"
                    v-model="selectedProcess"
                    @change="processChange")
                        el-radio.margin-bottom.no-margin-left(
                        v-for="process in processInfos"
                        :key="process.key"
                        :label="process.key") {{process.label}}
                    div.adjust-img.flex-grow-1(v-if="selectedProcess")
                        div 流程图例
                        img(:src="processImg")
        div.btn-save.border-top.flex.justify-content-end
            //- bug #UCMP-522 流程配置，页面展示样式问题
            el-button(size="small" plain @click="backConfigList") 返回
            el-button(type="warning" size="small" :disabled="saveBtnDisable" @click="saveProcessConfig") 保存

</template>

<script>
    /**
     * @description 配置管理
     */

    import Api from '@api'
    import {mapGetters, mapActions} from 'vuex'
    import MetadataUtls from '@server/metadata.utils'
    import Config from '@mock/metadata/metadata.config'
    import {
        serviceGroupMap,
        businessContains,
        serviceCodeInBusiness
    } from '@mock/catalog/catalogType.mock'

    export default {
        /**
         * @description Property description passed by the parent component
         * @prop {Function} backConfigList Back to process config list Function
         * @prop {Object} modifyParam Parameters when modify process config
         */
        props: {
            'backConfigList': {
                type: Function
            },
            'modifyParam': {
                type: Object,
                default: () => {
                    return {}
                }
            }
        },
        data () {
            return {
                modeltype: '1',
                orgtype: '',
                orgtypeId: '',
                appTag: [],
                processFlag: false,
                serviceGroupMap: serviceGroupMap,
                // 搜索树的key值
                searchKey: '',
                // 树配置
                configTree: {
                    title: '配置对象',
                    data: [],
                    defaultProps: {
                        children: 'children',
                        label: 'label'
                    },
                    loading: false,
                    // 选中后高亮
                    isHighlight: true,
                    nodeKey: 'id'
                },
                // 所有服务的配置项数据
                servicesData: [],
                // 保存参数
                saveParam: {
                    type: '',
                    business_id: '',
                    name: ''
                },
                processInfos: [],
                selectedService: '',
                selectedProcess: '',
                processImg: '',
                // 保存loading
                saveLoading: false,
                // Selected service action type
                selectedActionType: '',
                inexistentOrg: false
            }
        },
        methods: {
            ...mapActions([
                'updateMetaData'
            ]),
            //查询组织机构标识
            changemodelType () {
                if (this.modeltype === '2')
                    this.searchTag()
            },
            changeappTag (value) {
                this.orgtypeId = value.id
            },
            searchTag () {
                Api.get('getOrgTagList', {}, true).then(res => {
                    if (res)
                        this.appTag = res.data.tags
                })
            },
            init () {
                // 获取配置对象树
                this.getConfigTree()
                // 获取所有的应用服务
                this.getAllBpResources()
                // 获取服务
                return this.getServiceData()
            },
            // 获取配置对象树数据
            getConfigTree () {
                this.configTree.loading = true
                // 获取组织机构
                // UCMP3-4724 ie获取不到数据
                Api.get('orgTreeWithBusiness', {}, true).then(
                    res => {
                        // 处理数据
                        this.configTree.data = this.handleConfigTreeData(res.data)
                        this.configTree.loading = false
                        if (this.configTree.data.length && this.modifyParam.config_type !== 'tag') {
                            this.$nextTick(() => {
                                // Set existing value when modify
                                if (this.modifyParam.owner) {
                                    let node = this.$refs.configTree.getNode(this.modifyParam.owner)
                                    // UCMP-576 修改配置信息是默认进入页面新增默认选中项
                                    if (node && node.data) {
                                        this.treeNodeClick(node.data)
                                        this.$refs.configTree.setCurrentNode(node.data)
                                    } else {
                                        // 该组织机构已不存在树结构中（已被删除）
                                        this.saveParam.business_id = ''
                                        this.inexistentOrg = true
                                    }
                                } else {
                                    // 设置默认保存配置的参数
                                    this.treeNodeClick(this.configTree.data[0])
                                    this.$refs.configTree.setCurrentNode(this.configTree.data[0])
                                }
                            })
                        }
                    },
                    () => {
                        this.configTree.loading = false
                    }
                )
            },
            //  获取服务中应用服务的数据
            getAllBpResources () {
                Api.get('getBlueorintDetail', {}).then(
                    res => {
                        if (res) {
                            let existBps = this.servicesData.filter(item => item.group === 'blueprint').map(resource => resource.service_code)
                            res.forEach(item_bp => {
                                if (!existBps.includes(item_bp.serviceCode)) {
                                    this.servicesData.push({
                                        value: item_bp.serviceCode,
                                        service_code: item_bp.serviceCode,
                                        label: item_bp.blueprintName,
                                        group: 'blueprint'
                                    })
                                }
                            })
                        }
                    }
                )
            },
            // 获取服务
            getServiceData () {
                let metaItems = []
                return Api.get('f5HandleBtns', {}, true).then(res => {
                            res.forEach(service => {
                                let meta = {}
                                meta.value = service.service_code
                                meta.service_code = service.service_code
                                meta.label = service.name
                                meta.group = service.group
                                meta.actions = service.actions
                                metaItems.push(meta)
                            })
                        }).then(() => {
                            // 一部分应用服务从getAllBpResource函数中获取
                            this.servicesData = [...this.servicesData, ...metaItems]

                            // Set default value when modify process config
                            if (this.modifyParam.service_code) this.selectedService = this.modifyParam.service_code
                            else metaItems.length && (this.selectedService = metaItems[0].value)
                        })
            },
            // 处理配置树的数据
            handleConfigTreeData (data) {
                // 数据格式为组织、业务(应用)、人
                // 配置只涉及组织和业务，过滤数据
                data && data.forEach(item => {
                    item.label = item.org_name
                    item.type = 'org'
                    item.children = item.sub_orgs
                    if (item.business && item.business.length) {
                        item.business.forEach(business => {
                            business.id = business.business_id
                            business.label = business.business_name
                            business.type = 'business'
                        })
                        item.children = item.sub_orgs.concat(item.business)
                    }

                    if (item.sub_orgs && item.sub_orgs.length) {
                        // 递归处理子组织
                        this.handleConfigTreeData(item.sub_orgs)
                    }
                })
                return data
            },
            // 树节点点击时处理(保存选择树的id和类型)
            treeNodeClick (node) {
                this.inexistentOrg = false
                // 切换节点时及时处理对象的类型和id
                this.saveParam.type = node.type
                this.saveParam.business_id = node.id
                this.saveParam.name = node.org_name || node.business_name
                // 刷新配置
                this.getProcessInfos()
            },
            // 保存流程配置
            saveProcessConfig () {
                // 保存
                let param = {}
                param.service_code = this.selectedService
                param.config_type = 'org'
                // UCMP-524 问题修改 --start--
                // 获取服务名称
                param.name = this.serviceName

                // 获取组织机构名称
                param.owner_type = this.saveParam.type
                param.owner_name = this.saveParam.name
                param.owner = this.saveParam.business_id

                // 获取流程名称
                param.proc_def_name = this.processName
                param.key = this.selectedProcess

                // UCMP-524 问题修改 --end--
                param.operation_type = this.selectedActionType
                param.operation_name = this.operationName

                // 是否存在id表示是新增还是修改
                let method = 'post'
                if (this.modifyParam.id) {
                    param.id = this.modifyParam.id
                    method = 'put'
                }
                //选择标识没有selectedService、business_id 导致不能保存--此处有保存按钮的过滤
                let hasParam = this.selectedService && this.selectedProcess
                // let hasParam = this.selectedService && this.saveParam.type && this.saveParam.business_id && this.selectedProcess
                if (hasParam) {
                    this.saveLoading = true
                    if (this.modeltype === '2') {
                        var obj = {
                            id: this.modifyParam.id,
                            service_code: this.selectedService,
                            name: this.serviceName,
                            config_type: 'tag',
                            owner_type: 'tag', //tag
                            owner_name: this.orgtype, //选择机构标识（名称）
                            owner: this.orgtypeId || this.modifyParam.owner, // 标识id
                            proc_def_name: this.processName,
                            key: this.selectedProcess,
                            operation_type: this.selectedActionType,
                            operation_name: this.operationName
                        }
                        Api[method]('processConfig', obj, true).then(() => {
                            this.$notify.success('保存成功')
                            this.backConfigList()
                            this.saveLoading = false
                        }, () => {
                            this.saveLoading = false
                        })
                    } else {
                        Api[method]('processConfig', param, true).then(() => {
                            this.$notify.success('保存成功')
                            this.backConfigList()
                            this.saveLoading = false
                        }, () => {
                            this.saveLoading = false
                        })
                    }
                }
            },
            // 树渲染特殊处理
            renderContent (h, {node}) {
                let spanLabel = ''
                if (!node.isLeaf) {
                    spanLabel = <i class="ucmp-icon-quota-close-file"/>
                    if (node.expanded)
                        spanLabel = <i class="ucmp-icon-quota-open-file"/>
                } else {
                    if (node.data.type === 'org')
                        spanLabel = <i class="ucmp-icon-device-org"/>
                    else spanLabel = <i class="ucmp-icon-quota-text"/>
                }
                return (
                    <span>
                        {spanLabel}
                        <span class="range-margin-left"> {node.label}</span>
                    </span>
                )
            },
            hasApproveAction (data) {
                let normal_actions = []
                data.normal_actions && Object.keys(data.normal_actions).forEach(normal => {
                    // UCMP3-3404【流程定义】流程配置界面，服务里没有应用
                    normal_actions.push(data.normal_actions[normal])
                })
                let actions = data.actions.concat(normal_actions)
                let hasApprove = actions.find(item => item.is_approve)

                return !!hasApprove
            },
            // 获取流程信息
            getProcessInfos () {
                let param = {}
                param.business_id = this.saveParam.business_id
                param.type = this.saveParam.type
                param.service_code = this.selectedService
                param.limit = 99999
                if (param.service_code) {
                    Api.get('processList', param, true).then(res => {
                        if (res) {
                            let result = []
                            res.list.forEach(item => {
                                let info = {}
                                info.label = item.name
                                info.value = item.id
                                info.key = item.key
                                info.id = item.id
                                result.push(info)
                            })
                            this.processInfos = result
                            // 设置默认流程
                            if (this.modifyParam.key) {
                                this.selectedProcess = this.modifyParam.key
                                this.getProcessImage()
                            }
                        }
                    })
                }
            },
            // 获取流程图片
            getProcessImage () {
                let param = {}
                param.processDefinitionId = this.processInfos.find(item => this.selectedProcess === item.key).id
                param.resourceType = 'image'
                Api.get('getProcessImg', param, true).then(res => {
                    res && (this.processImg = `data:image/png;base64,${res.img}`)
                })
            },
            // 流程切换
            processChange () {
                // 获取对应的流程图片
                this.processImg = ''
                this.getProcessImage()
            },
            // 前台过滤树
            filterNode (value, data) {
                if (!value) return true
                return data.label.indexOf(value) !== -1
            },
            // Clear selectedActionType when selceted service has changed
            selecetServiceChange () {
                this.selectedActionType = ''
            },
            // 获取当前点击对象的元数据（仅编排资源）
            getCurrentBpService (currentService) {
                Api.get('getMetadata', { _code: `${currentService.group}/${currentService.service_code}` }, true).then(res => {
                    this.updateMetaData(res.metadata)
                })
            }
        },
        computed: {
            ...mapGetters([
                'metadata', 'businessOrproject'
            ]),
            selectedBusinessLabel () {
                return this.businessOrproject === 'business' ? '业务' : '项目'
            },
            saveBtnDisable () {
                if (this.modifyParam.config_type && this.modifyParam.config_type === 'tag')
                    return this.selectedProcess && this.selectedActionType ? false : true
                else
                    return this.selectedService && this.selectedProcess && this.selectedActionType && this.saveParam.business_id ? false : true
                },
            // Exchange service generate action type
            serviceActionsType () {
                // 根据选中的服务来获取服务下的操作
                let metaItem = this.servicesData.find(item => item.service_code === this.selectedService)
                if (metaItem && metaItem.actions)
                    return metaItem.actions
                let metaItemBluePrint = this.metadata.find(item => item.service_code === this.selectedService)

                // UCMP3-5813【流程定义】从应用编排页面切换到流程配置页面后，蓝图的操作方式都不显示
                // 应用编排填充了metadata,但是只有name, service_code, group: 'blueprint',用attribute判断是否拿到真实的metadata
                if (!metaItemBluePrint || metaItemBluePrint.attribute === undefined) {
                    let currentService = this.servicesData.find(item_ser => item_ser.service_code === this.selectedService) || {}
                    currentService.group === 'blueprint' && this.getCurrentBpService(currentService)
                }

                return MetadataUtls.getServiceActionsType(metaItemBluePrint, Config.actions)
            },
            serviceDataGroups () {
                let metaItems = []
                let groupKeys = []
                // UCMP3-1128【服务目录】将某蓝图置顶，会影响导航的排序
                for (let key of Object.keys(this.serviceGroupMap)) {
                    let item = {
                        serviceGroup: key,
                        label: this.serviceGroupMap[key].label,
                        order: this.serviceGroupMap[key].order,
                        metadatas: []
                    }
                    groupKeys.push(key)
                    metaItems.push(item)
                }

                this.servicesData.forEach(service => {
                    if (service.group) {
                        let index = (businessContains.indexOf(service.group) > -1 || serviceCodeInBusiness.indexOf(service.service_code) > -1) ? groupKeys.indexOf('business') : groupKeys.indexOf(service.group)
                        if (index !== -1) {
                            if (businessContains.indexOf(service.group) > -1 || serviceCodeInBusiness.indexOf(service.service_code) > -1)
                                service.group = 'business'
                            metaItems[index].metadatas.push(service)
                        } else {
                            groupKeys.push(service.group)
                            metaItems.push({
                                serviceGroup: service.group,
                                order: 88,
                                metadatas: []
                            })
                            metaItems[metaItems.length - 1].metadatas.push(service)
                        }
                    }
                })
                metaItems.sort((a, b) => a.order - b.order)

                return metaItems
            },
            serviceName () {
                if (!this.selectedService) return ''

                let service = this.servicesData.find(item => {
                    return item.service_code === this.selectedService
                })

                return service ? service.label : ''
            },
            operationName () {
                if (!this.selectedActionType) return ''

                let operation = this.serviceActionsType.find(action => action.name === this.selectedActionType)

                return operation ? operation.label : ''
            },
            processName () {
                if (!this.selectedProcess) return ''

                let selectedProcess = this.processInfos.find(item => {
                    return item.key === this.selectedProcess
                })

                return selectedProcess ? selectedProcess.label : ''
            }
        },
        created () {
            // 初始化
            this.init()
            .then(() => {
                  // getProcessInfos依赖this.selectedService, this.selectedService会在this.getServiceData中设置
                  this.getProcessInfos()
            })
            // Set default value when modify process config
            if (Object.keys(this.modifyParam).length) {
                this.selectedService = this.modifyParam.service_code
                this.selectedProcess = this.modifyParam.key
                this.selectedActionType = this.modifyParam.operation_type
                if (this.modifyParam.config_type && this.modifyParam.config_type === 'tag') {
                    this.searchTag()
                    this.modeltype = '2'
                    this.orgtype = this.modifyParam.owner_name
                }
            }
        },
        watch: {
            // 检测树搜索条件变化
            searchKey (val) {
                this.$refs.configTree.filter(val)
            },

            selectedActionType (val) {
                if (val && this.saveParam.name && this.selectedService) this.processFlag = true
            }
        }
    }
</script>

<style lang="scss" scoped>
    .flex {
        display: flex;
    }

    .process-step {
        /*height: 100%; // 值需要给定一个随意值，ff和chrome在初始化子元素的高度计算时应该不一样，ff不需要，chrome应该需要此属性计算，否则为元素高度*/
        flex: auto; //当 flex 取值为一个非负数字，则该数字为 flex-grow 值，flex-shrink 取 1，flex-basis 取 0%
        overflow-x: auto;
    }

    .btn-save {
        flex-shrink: 0;
    }

    .summary {
        min-width: 150px;
        background-color: #ebf5fe;
        padding: 0 16px;
        flex: 0;

        .desc {
            color: $fontContentGray;
            font-size: 14px;
            padding: 12px 0 0 16px;
            word-break: break-all;
        }
    }

    .process-before {
        cursor: w-resize;
    }

    .process-after {
        cursor: e-resize;
    }

    .content {
        flex: 1;
    }

    .service-group {
        flex: none;
        margin-bottom: 16px;

        .service-group_name {
            font-size: 14px;
            margin-bottom: 12px;
        }

        .flex {
            margin-left: 12px;
        }
    }

    .height-with-label {
        /* 100 - 标题 - 已选择 */
        height: calc(100% - 44px - 33px);
    }

    .height-without-label {
        /* 100 - 标题 */
        height: calc(100% - 44px);
    }

    .tree-width {
        min-width: 350px;
        padding-right: 20px;
    }

    .tree-height {
        height: calc(100% - 125px);
        overflow-y: auto;
    }

    .seleted-service-width {
        min-width: 200px;
    }

    .basicInfo {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 20px;
    }

    .adjust-img {
        overflow: auto;
        padding: 8px;
        margin-top: 8px;
        background: $cardPanelBgColor;
    }

    .adjust-select-process {
        overflow-y: auto;
        & .el-radio {
            margin-right: 30px;
        }
    }

    .tip-cot {
        font-size: 14px;
        color: $fontContentGray;
        margin-top: 10px;
        .tip-name {
            text-decoration: underline;
        }
    }
    .Orgradio{
        margin: 5px 10px;
    }
    .Orgradiowidth{
        width: 100px;
        margin-left: 100px;
    }
    .apptagstyle{
        padding: 5px;
    }
</style>
