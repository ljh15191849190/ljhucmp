<template lang="pug">
div.full-container
    HierarchicalDiagramEditor.diagram(
        ref="orchestrateEditor"
        :defaultNodes="defaultResources"
        :defaultLinks.sync="defaultLinks"
        :icons="icons"
        :defaultIcon="defaultIcon"
        :rootId="rootId"
        :containerKeys="parentKeys"
        :canNestNodeRule="canNestResRule"
        :beforeAddLink="beforeAddLink"
        :allowWheelZoom="allowWheelZoom"
        :groupsConfigs="groupsConfigs"
        :nodeDefaultPadding="nodeDefaultPadding"
        :linkReferences="linkReferences"
        :findReferencedNode="findReferencedNode"
        :findParentNode="findParentNode"
        :nodeDefaultSize="nodeDefaultSize"
        :tipConfiguration="tipConfiguration"
        @beforeAddNode="beforeAddNode"
        @AddNodeToGroup="AddNodeToGroup"
        @nodeClick="nodeClick"
        @beforeClone="beforeClone"
        @afterClone="afterClone"
        @groupClick="groupClick"
        @linkClick="linkClick"
        @afterNested="afterNested"
        @clickCanvas="clickCanvas"
        @beforeDeleteNode="beforeDeleteNode"
        @afterDeleteNode="afterDeleteNode"
        @beforeDeleteLink="beforeDeleteLink"
        @afterDeleteLink="afterDeleteLink"
        @getDiagramObj="getDiagramObj"
        @getViewportDom="getViewportDom"
        uniqueKey="service_code"
        :navbars="resourceNavs"
        :keyboardFire="!showConfig"
        label="name"
        v-if="!editDisabled"
    )
        slot(name="moreCanvasBtns" slot="moreCanvasBtns")
    HierarchicalDiagram(
        ref="orchestrateEditor"
        :defaultNodes="defaultResources"
        :nodeDefaultPadding="nodeDefaultPadding"
        :defaultLinks="defaultLinks"
        :icons="icons"
        :defaultIcon="defaultIcon"
        :rootId="rootId"
        :containerKeys="parentKeys"
        :linkReferences="linkReferences"
        :findReferencedNode="findReferencedNode"
        :findParentNode="findParentNode"
        :allowWheelZoom="allowWheelZoom"
        uniqueKey="service_code"
        :navbars="resourceNavs"
        :groupsConfigs="groupsConfigs"
        label="name"
        v-if="editDisabled"
        :enableEdit="!editDisabled"
        :nodeDefaultSize="nodeDefaultSize"
        :tipConfiguration="tipConfiguration"
        @nodeClick="nodeClick"
        @groupClick="groupClick"
        @linkClick="linkClick"
        @getDiagramObj="getDiagramObj"
        @getViewportDom="getViewportDom"
        @update:defaultLinks="updateDefaultLinks"
    )
        slot(name="moreCanvasBtns" slot="moreCanvasBtns")
</template>

<script>
/**
 * @description  应用编排拓扑图绘制，融合了应用编排业务特点以及拓扑图绘制库，是连接业务和底层绘制库的桥梁
 */
import HierarchicalDiagramEditor from '@/components/common/flowchart/HierarchicalDiagramEditor'
import HierarchicalDiagram from '@/components/common/flowchart/HierarchicalDiagram'
import { mapGetters } from 'vuex'
import Utils from '@server/Utils'
import _groupby from 'lodash.groupby'

export default {
    props: {
        editDisabled: {
            type: Boolean,
            default: () => true
        },

        blueprintId: {
            type: String,
            default: ''
        },

        checkedNode: {
            type: Object,
            default: () => null
        },

        showConfig: {
            type: Boolean,
            default: () => true
        },

        defaultResources: {
            type: Array,
            default: () => []
        },

        defaultLinks: {
            type: Array,
            default: () => []
        },

        linkReferences: {
            type: Function,
            default: () => []
        },

        findReferencedNode: {
            type: Function,
            default: () => function () {}
        },

        findParentNode: {
            type: Function,
            default: () => function () {}
        },

        canNestNodeRule: {
            type: Function,
            default: () => false
        },

        configs: {
            type: Object,
            default: () => {}
        }, 

        backupConfigs: {
            type: Object,
            default: () => {}
        },

        linkConfigs: {
            type: Object,
            default: () => {}
        },
        propertiesConfig: {
            type: Object,
            default: () => {}
        },
        linkPropertiesConfig: {
            type: Object,
            default: () => {}
        },
        rootId: {
            type: String,
            default: null
        },
        treeObj: {
            type: Object,
            default: () => {}
        },
        beforeAddLink: {
            type: Function,
            default: () => function () {}
        },
        allowWheelZoom: {
            type: Boolean,
            default: false
        },
        groupsConfigs: {
            type: Object,
            default: () => {}
        }
    },
    data () {
        return {
            breadcrumbItems: [{ label: '新建编排' }],
            hasInitCheckedNode: false,
            initConfigs: {},
            initPropertiesConfigs: {},
            initProviderInfo: {},
            submitBtns: [
                { prop: 'saveblueprint', label: '保存编排', type: 'warning', plain: true },
                { prop: 'deploy', label: '立即部署', type: 'warning', plain: false }
            ],
            icons: {
                ecs: '\ue663',
                volume: '\ue662',
                subnet: '\ue6a4',
                oracle: '\ue693',
                mysql: '\ue692',
                tomcat: '\ue694',
                weblogic: '\ue695',
                f5: '\ue6a6',
                pool: '\ue6bf',
                nas: '\ue6c8',
                oracle_rac: '\ue6f4'
            },
            nodeDefaultPadding: [40, 10, 10, 10],
            nodeDefaultSize: {
                container: {
                    width: 140,
                    height: 180
                },
                normal: {
                    width: 50,
                    height: 50
                }
            },
            defaultIcon: '\ue685',
            defaultBpResources: [], // 编排节点初始化数据
            defaultBlueprint: {
                service_code: '',
                name: ''
            },
            alreadyHasMetadata: true,
            diagramInstance: null,
            tipConfiguration: {
                rootElement: '#app .container-right-part',
                offset: [0, -190]
            }
        }
    },

    methods: {
        updateDefaultLinks (val) {
            this.$emit('update:defaultLinks', val)
        },
        afterNested (node, pNode) {
            this.$emit('afterNested', node, pNode)
        },

        beforeClone (sourceId, targetId) {
            this.$emit('beforeClone', sourceId, targetId)
        },

        afterClone (clonedNode) {
            this.$emit('afterClone', clonedNode)
        },

        beforeDeleteNode (node, pNode) {
            this.$emit('beforeDeleteNode', node, pNode)
        },

        afterDeleteNode (node) {
            this.$emit('afterDeleteNode', node)
        },

        beforeDeleteLink (link, checkedLink) {
            this.$emit('beforeDeleteLink', link, checkedLink)
        },

        afterDeleteLink (link) {
            this.$emit('afterDeleteLink', link)
        },

        AddNodeToGroup (node, group_id) {
            this.$emit('AddNodeToGroup', node, group_id)
        },

        /**
         * @description 节点点击事件
         */
        nodeClick (d) {
            this.$emit('update:checkedNode', d)
            this.$emit('update:checkedLink', null)
            this.$emit('update:checkedGroupId', null)
            this.$emit('update:showConfig', true)
            this.$emit('nodeClick', d)
        },

        groupClick (d) {
            this.$emit('update:checkedNode', null)
            this.$emit('update:checkedLink', null)
            this.$emit('groupClick', d)
        },

        /**
         * @description 连线点击事件
         */
        linkClick (d) {
            this.$emit('update:checkedLink', d)
            this.$emit('update:showConfig', true)
            this.$emit('linkClick', d)
            this.$emit('update:checkedGroupId', null)
            this.$emit('update:checkedNode', null)
        },

        beforeAddNode (adding_node, parentNode, coors, addNode) {
            this.$emit('beforeAddNode', adding_node, parentNode, coors, addNode)
        },

        clickCanvas () {
            this.$emit('update:checkedNode', null)
            this.$emit('update:checkedLink', null)
            this.$emit('update:checkedGroupId', null)
        },

        /**
         * @description 编辑编排时初始化资源配置表单数据以及显示内容，初始化节点参数属性(只读)配置信息
         */
        initResourceConfigs (resource, _properties) {
            let formData = {}, display = {}, properties = {}, providerInfo = {}
            for (let key in resource.attributes) {
                formData[resource.id + '@' + key] = resource.attributes[key]
                properties[resource.id + '#' + key] = _properties[key]
                if (!resource.display)
                    resource.display = {}
                display[resource.id + '@' + key] = resource.display[key]
                
                // 审批环节，初始化厂商信息                
                if (key === 'provider_id')
                    providerInfo[resource.id + '@provider_id'] = resource.attributes.provider_id
                // 审批环节，初始化配置模板信息
                if (key === 'provider_conf')
                    providerInfo[resource.id + '@provider_conf'] = resource.attributes.provider_conf
            }

            this.$set(this.initConfigs, resource.id, {formData, display})
            this.$set(this.initPropertiesConfigs, resource.id, {formData: properties, display: {}})
            this.$set(this.initProviderInfo, resource.id, providerInfo)
        },

        /**
         * @description 编辑编排时初始化连线表单数据以及显示内容
         */
        initLinkConfigs (links, linksProperties) {
            if (!links)
                return
            let linkConfigs = JSON.parse(JSON.stringify(this.linkConfigs))
            let linkPropertiesConfig = linksProperties ? JSON.parse(JSON.stringify(linksProperties)) : {}
            links.forEach(
                link => {
                    let linkConfig = {}, linkProperty = {}
                    if (!link.values)
                        return
                    Object.keys(link.values).forEach(
                        key => {
                            linkConfig[link.id + '@' + key] = link.values[key]
                        }
                    )
                    if (linksProperties && linksProperties.hasOwnProperty(link.id)) {
                        Object.keys(linksProperties[link.id]).forEach(
                            key => {
                                linkProperty[link.id + '#' + key] = linksProperties[link.id][key]
                            }
                        )
                    }
                    linkConfigs[link.id] = linkConfig
                    linkPropertiesConfig[link.id] = linkProperty
                }
            )
            this.$emit('update:linkConfigs', linkConfigs)
            this.$emit('update:linkPropertiesConfig', linkPropertiesConfig)
        },

        canNestResRule (node, parent) {
            return this.canNestNodeRule(node, parent)
        },

        hasLinkBetweenNodes (node_1, node_2) {
            return this.defaultLinks.filter(
                link => {
                    if ((link.source.id === node_1.id && link.target.id === node_2.id) || (link.source.id === node_2.id && link.target.id === node_1.id))
                        return link
                }
            )[0]
        },

        initAllNodesAndLinks () {
            let treeNodes = {
                id: this.rootId,
                includings: this.treeObj.resources
            }
            this.defaultBpResources = []
            Utils.transformTreeToArr(treeNodes, 'includings', 'id', 'pId', this.defaultBpResources)
            let defaultResources = this.defaultBpResources.map(
                item => {
                    // 初始化资源配置表单值以及显示内容
                    if (item.group !== 'blueprint')
                        this.initResourceConfigs(item, this.treeObj.properties ? this.treeObj.properties[item.id] : {})
                    let node = {}
                    node.id = item.id
                    node.pId = item.pId
                    node.width = item.canvas && item.canvas.width ? item.canvas.width : 100
                    node.height = item.canvas && item.canvas.height ? item.canvas.height : 100
                    node._x = item.canvas ? item.canvas._x : null
                    node._y = item.canvas ? item.canvas._y : null
                    node.dragging = false
                    node.service_code = item.service_code

                    if (this.metadataAsObj[item.service_code]) {
                        // 深拷贝对应的元数据，设置资源信息
                        this.$set(node, 'info', JSON.parse(JSON.stringify(this.metadataAsObj[item.service_code])))
                        // 设置分层信息
                        if (item.group_id)
                            this.$set(node.info, 'group_id', item.group_id)
                        if (item.nickname)
                            node.info.name = item.nickname
                        node.info.description = item.description ? item.description : ''
                    }
                    // this.alreadyHasMetadata = this.metadataAsObj[item.service_code] ? true : false

                    // UCMP3-7111 应用编排中配置只使用模板选项
                    let configGroup = _groupby(this.metadataApplyPrivileges, 'service_code')
                    let config = configGroup[node.service_code] && configGroup[node.service_code][0] && configGroup[node.service_code][0].config ? configGroup[node.service_code][0].config : {}
                    //阶段一：创建 config 存在的时候代表的是创建阶段
                    if (config.template_immutable)
                        node.template_immutable = true
                    /** 阶段二：审批，审批阶段的 metadataApplyPrivileges 一定是没值的
                     * 因此两个阶段是互斥的，没有干扰，可以这样使用
                    */
                    if (item.template_immutable)
                        node.template_immutable = true
                    return node
                }
            )

            this.$emit('update:defaultResources', defaultResources)
            this.$emit('update:backupConfigs', JSON.parse(JSON.stringify(this.initConfigs)))
            this.$emit('update:configs', this.initConfigs)
            this.$emit('update:providerInfo', this.initProviderInfo)
            this.$emit('update:propertiesConfig', this.initPropertiesConfigs)

            // 修改依赖关系的列表
            let dependencies = JSON.parse(JSON.stringify(this.treeObj.dependencies))

            this.initLinkConfigs(dependencies, this.treeObj.linkProperties)
            this.$emit('update:defaultLinks', dependencies)
        },

        getDiagramObj (vm) {
            this.diagramInstance = vm
            this.$emit('getDiagramObj', vm)
        },

        getViewportDom (dom) {
            this.$emit('getViewportDom', dom)
        }
    },

    watch: {
        treeObj: {
            deep: true,
            handler (old, newObj) {
                // UCMP3-2640 刷新页面，异步请求得到元数据信息后，分析拓扑图数据
                if (this.treeObj && JSON.stringify(this.treeObj) !== '{}' && this.metadata && this.metadata.length > 1)
                    this.initAllNodesAndLinks()
            }
        },

        metadata () {
            // UCMP3-2640 刷新页面，异步请求得到元数据信息后，分析拓扑图数据
            if (this.treeObj && JSON.stringify(this.treeObj) !== '{}' && this.metadata && this.metadata.length > 1)
                this.initAllNodesAndLinks()
        },

        checkedNode: {
            deep: true,
            handler (old, newObj) {
                if (!this.hasInitCheckedNode) {
                    // 初始化时自动选中第一个节点的资源
                    // UCMP3-2062 可视化工具拖拽卡顿优化后，checked_node取值完整的hierarchical格式的node数据
                    this.$refs.orchestrateEditor.checked_node = this.checkedNode
                    this.hasInitCheckedNode = true
                }
            }
        }
    },

    computed: {
        ...mapGetters([
            'metadata',
            'metadataApplyPrivileges'
        ]),

        parentKeys () {
            let keys = []
            for (let i = 0; i < this.metadata.length; i++) {
                if (this.metadata[i].children && this.metadata[i].children.length)
                    keys.push(this.metadata[i].service_code)
                if (!this.metadata[i].related_service || !this.metadata[i].related_service.length)
                    continue
                for (let j = 0; j < this.metadata[i].related_service.length; j++) {
                    if (keys.indexOf(this.metadata[i].related_service[j].service_code) !== -1)
                        continue
                    if (this.metadata[i].related_service[j].including && !this.metadata[i].related_service[j].including.inner)
                        keys.push(this.metadata[i].related_service[j].service_code)
                }
            }
            return keys
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

        resourceNavs () {
            let resources = this.metadata.filter(
                meta => {
                    // 暂时不支持编排嵌套编排, UCMP-1117 oracle、weblogic不应出现在应用编排列表
                    if (meta.group !== 'blueprint' && meta.orchestrate)
                        return meta
                }
            )
            return resources.map(
                item => {
                    if (item.service_code === 'ecs')
                        item.hasLink = true
                    if (item.related_service && item.related_service.length) {
                        let relatedReference = item.related_service.filter(
                            service => {
                                if (service.reference && service.reference.target)
                                    return service
                            }
                        )
                        if (relatedReference.length)
                            item.hasLink = true
                    }
                    // 添加删除按钮显示条件
                    item.hasRmBtn = true
                    if (item.parent && item.max === 1 && item.min === 1)
                        item.hasRmBtn = false
                    return item
                }
            )
        }
    },

    created () {
        // 初始化页面时拓扑图数据就存在（不是通过异步请求得到，而是使用现成的数据）
        if (this.metadata && this.metadata.length > 1 && this.treeObj && JSON.stringify(this.treeObj) !== '{}')
            this.initAllNodesAndLinks()
    },

    components: {
        HierarchicalDiagramEditor,
        HierarchicalDiagram
    }
}
</script>
<style lang="scss" scoped>
.orchestrate-content {
    height: 100%;
    width: 100%;
    position: relative;
    overflow-y: hidden;
}

.diagram {
    width: 100%;
    height: 100%;
}

.bottom-operations {
    width: 100%;
    height: 72px;
}
</style>

