<template lang="pug">
div.hierarchical-digram-box
  div.top-panel.d-flex.border
    div.moreCanvasBtns-container
        slot(name="moreCanvasBtns")
  div.zoom-slider.d-flex.margin-left
    span.zoom-title.canvas-btn 缩放
    el-slider.manully-scale(
        ref="slider"
        v-model="transformScale"
        :min="scaleExtent[0] * 100"
        :max="scaleExtent[1] * 100"
        :step="(scaleExtent[1] - scaleExtent[0]) / 100"
        @input="zoomedDomEvent"
    )
    output.zoom-number.canvas-btn {{transformScale.toString().replace(/([0-9]+\.[0-9]{2})[0-9]*/,"$1")}}%
  div.hierarchical-digram-container
    div.svg-container
        svg.hierarchical-digram(:width="width" :height="height" oncontextmenu="false" @drop.prevent.stop="svgDrop($event)" @dragover.prevent="svgDragover($event)")
            defs
                marker(
                    id="end-arrow"
                    viewBox="0 -5 10 10"
                    refX="9"
                    markerWidth="8"
                    markerHeight="8"
                    orient="auto"
                )
                    path(
                        d="M0,-5L10,0L0,5"
                        fill="#dddddd"
                    )
            g.grid-container(v-if="gridSwitch")
                g.grid.grid--x
                g.grid.grid--y
                g.grid.grid--max--x
                g.grid.grid--max--y
                g.axis.axis--x
                g.axis.axis--y
            g.viewport
                g.group-container
                g.link-container
                g.link-label-container
                g.node-container
                path.dragline(:d="dragline.data" pointer-events="none" :marker-end="dragline.markerEnd" :class="{'hidden': dragline.display === 'none'}")
                path.guides-horizontal(pointer-events="none" :d="guides.horizontal.data" :class="{'hidden': guides.horizontal.display === 'none'}")
                path.guides-virtical(pointer-events="none" :d="guides.virtical.data" :class="{'hidden': guides.virtical.display === 'none'}")
    div.resizer(:class="{'hidden': !enableEdit || !checked_node || checked_node && checked_node.data && checked_node.data.info && containerKeys.indexOf(checked_node.data.info[uniqueKey]) === -1}")
        div.resize-handler.origin
        div.resize-handler.topRight
        div.resize-handler.corner
        div.resize-handler.bottomLeft
    div.reference-indicater(:class="{'hidden' : rerefIndicater.display === 'none'}" :style="{'top': rerefIndicater.top + 'px', 'left': rerefIndicater.left + 'px'}")
        span.ucmp-icon-complete.icon
</template>
<script>
/**
 * @description combine treemap & tree layout that based on d3 hierarchical data to build a flow chart
 * @author xinghua.wen
 */
import d3 from '@server/d3.hierarchical.prototype'
import Utils from '@server/Utils'
import DIAGRAM_UTILS from '@server/hierarchical-diagram.utils'
import d3Tip from './d3.tip' // UCMP3-5623 d3-tip作者不再更新，迁移至本地维护管理
import rectCollision from '@server/rect.collision'
import { ResizeSensor } from 'css-element-queries'
d3.tip = d3Tip

export default {
  props: {
    // 容器节点key集合
    containerKeys: {
        type: Array,
        default: function () {
            return []
        }
    },

    // 节点唯一标志
    uniqueKey: {
        type: String,
        default: function () {
            return 'key'
        }
    },

    // 节点显示名称的key值(嵌套关系使用.代替)
    label: {
        type: String,
        default: function () {
            return 'label'
        }
    },

    // 左侧资源列表默认显示icon集合({key: icon})
    icons: {
        type: Object,
        default: function () {
            return {}
        }
    },

    // 左侧资源列表默认显示icon
    defaultIcon: {
        type: String,
        default: function () {
            return 'icon'
        }
    },

    // 画布中节点集合，双向绑定，亦做节点初始化使用 [必须]
    defaultNodes: {
       type: Array,
        default: function () {
            return []
        }
    },

    // 画布中节点连线集合，双向绑定，亦做节点连线初始化使用 [必须]
    defaultLinks: {
        type: Array,
        default: function () {
            return []
        }
    },

    // 虚拟根节点的id
    rootId: {
        type: String,
        default: function () {
            return Utils.uuid()
        }
    },

    linkReferences: {
        type: Function,
        default: function () {
            return []
        }
    },

    findReferencedNode: {
        type: Function,
        default: function () {
            return false
        }
    },

    findParentNode: {
       type: Function,
       default: function () {
            return false
       } 
    },

    // validate the checked node can be nested in the hovered node according to the user defined rules
    canNestNodeRule: {
        type: Function,
        default: function () {
            return false
        }
    },

    // all nodes default size
    nodeDefaultSize: {
        type: Object,
        default: function () {
            return {
                container: {
                    width: 140,
                    height: 180
                },
                normal: {
                    width: 100,
                    height: 100
                }
            }
        }
    },

    // nested container node padding size, top/right/bottom/left
    nodeDefaultPadding: {
        type: Array,
        default: [40, 40, 40, 40]
    },

    // if Keyboard delete fired
    keyboardFire: {
        type: Boolean,
        default: false
    },

    beforeAddLink: {
        type: Function,
        default: function () {
            return false
        }
    },

    scaleExtent: {
        type: Array,
        default: function () {
            return [1 / 2, 5]
        }
    },

    adding_node: {
        type: Object,
        default: function () {
            return {}
        }
    },

    enableEdit: {
        type: Boolean,
        default: function () {
            return true
        }
    },

    allowWheelZoom: {
        type: Boolean,
        default: function () {
            return true
        }
    },

    groupInfo: {
        type: Object,
        default: function () {
            return {
                key: 'group_id',
                name: 'group_name',
                style: {
                    fill: null,
                    stroke: null
                }
            }
        }
    },

    groupsConfigs: {
        type: Object,
        default: () => {}
    },

    gridDomain: {
        type: Array,
        default: function () {
            return [0, 100]
        }
    },

    nodeTooltip: {
        type: String,
        default: 'description'
    },

    // tooltip configuration
    tipConfiguration: {
        type: Object,
        default: () => {
            return {
                rootElement: document.body,
                offset: [0, 0]
            }
        }
    },
    gridSwitch: {
        type: Boolean,
        default: false
    }
  },

  data () {
    return {
        width: 0,
        height: 0,
        checked_node: null,
        hovered_node: null,
        adding_parent_node: null,
        checked_link: null,
        inner_adding_node: null,
        rootData: {
            info: {
                label: 'root',
                [this.uniqueKey]: 'root'
            },
            width: 120,
            height: 80,
            pId: ''
        },
        operations: [
            { type: 'import', icon: 'ucmp-icon-upload', title: '导入编排' },
            { type: 'export', icon: 'ucmp-icon-download', title: '导出编排' },
            { type: 'help', icon: 'ucmp-icon-question', title: '帮助' }
        ],
        dragSuccess: true,
        root: {},
        simulation: null,
        nodes: [],
        forceLink: null,
        source: null,
        target: null,
        toLinkSize: 27,
        topMenuHeight: 40,
        zoom: null,
        resizeDirection: null,
        zoomTransform: {
            x: 0,
            y: 0,
            k: 1
        },
        transformScale: 100,
        valueline: null,
        xScale: null,
        yScale: null,
        xAxis: null,
        yAxis: null,
        xGridAxis: null,
        yGridAxis: null,
        xMaxGridAxis: null,
        yMaxGridAxis: null,
        panel: {
            top: 15,
            left: 15
        },
        dragline: {
            display: 'none',
            markerEnd: 'url(#end-arrow)',
            data: 'M0,0L0,0'
        },
        tooltip: null,
        rerefIndicater: {
            display: 'none',
            left: 0,
            top: 0
        },
        guides: {
            horizontal: {
                display: 'none',
                data: 'M0,0L0,0'
            },
            virtical: {
                display: 'none',
                data: 'M0,0L0,0'
            }
        },
        ctrlCheckedNodes: [],
        rectCollision: null,
        dragCollision: {},
        alignCollision: null,
        firstAccess: {
            multipleDrag: true
        },
        resizeSensor: null
    }
  },

  methods: {
    canvasOperator (type) {},

    /**
     * @description redraw diagram grid background while zoom or window size changing
     */
    redrawGrids (width, height) {
        this.xScale = d3.scaleLinear()
            .domain([0, width])
            .range([0, width])

        this.yScale = d3.scaleLinear()
            .domain([0, height])
            .range([0, height])
        
        this.xAxis = d3.axisBottom(this.xScale).ticks(width * 10 / height).tickSize(8).tickPadding(3)
        this.yAxis = d3.axisRight(this.yScale).ticks(10).tickSize(8).tickPadding(3)
        this.xGridAxis = d3.axisBottom(this.xScale).ticks(d3.event && d3.event.transform ? width / d3.event.transform.k / 10 : width / this.zoomTransform.k / 10).tickSize(height).tickFormat('')
        this.yGridAxis = d3.axisRight(this.yScale).ticks(d3.event && d3.event.transform ? height / d3.event.transform.k / 10 : height / this.zoomTransform.k / 10).tickSize(width).tickFormat('')
        this.xMaxGridAxis = d3.axisBottom(this.xScale).ticks(d3.event && d3.event.transform ? width / d3.event.transform.k / 50 : width / this.zoomTransform.k / 50).tickSize(height).tickFormat('')
        this.yMaxGridAxis = d3.axisRight(this.yScale).ticks(d3.event && d3.event.transform ? height / d3.event.transform.k / 50 : height / this.zoomTransform.k / 50).tickSize(width).tickFormat('')
        
        if (d3.event && d3.event.transform) {
            d3.select(this.$el).select('g.axis.axis--x').call(this.xAxis.scale(d3.event.transform.rescaleX(this.xScale)))
            d3.select(this.$el).select('g.axis.axis--y').call(this.yAxis.scale(d3.event.transform.rescaleY(this.yScale)))
            d3.select(this.$el).select('g.grid.grid--x').call(this.xGridAxis.scale(d3.event.transform.rescaleX(this.xScale)))
            d3.select(this.$el).select('g.grid.grid--y').call(this.yGridAxis.scale(d3.event.transform.rescaleY(this.yScale)))
            d3.select(this.$el).select('g.grid.grid--max--x').call(this.xMaxGridAxis.scale(d3.event.transform.rescaleX(this.xScale)))
            d3.select(this.$el).select('g.grid.grid--max--y').call(this.yMaxGridAxis.scale(d3.event.transform.rescaleY(this.yScale)))
        } else if (!d3.event && this.zoomTransform && this.zoomTransform.rescaleX && this.zoomTransform.rescaleY) {
            d3.select(this.$el).select('g.axis.axis--x').call(this.xAxis.scale(this.zoomTransform.rescaleX(this.xScale)))
            d3.select(this.$el).select('g.axis.axis--y').call(this.yAxis.scale(this.zoomTransform.rescaleY(this.yScale)))
            d3.select(this.$el).select('g.grid.grid--x').call(this.xGridAxis.scale(this.zoomTransform.rescaleX(this.xScale)))
            d3.select(this.$el).select('g.grid.grid--y').call(this.yGridAxis.scale(this.zoomTransform.rescaleY(this.yScale)))
            d3.select(this.$el).select('g.grid.grid--max--x').call(this.xMaxGridAxis.scale(this.zoomTransform.rescaleX(this.xScale)))
            d3.select(this.$el).select('g.grid.grid--max--y').call(this.yMaxGridAxis.scale(this.zoomTransform.rescaleY(this.yScale)))
        } else {
            d3.select(this.$el).select('g.axis.axis--x').call(this.xAxis)
            d3.select(this.$el).select('g.axis.axis--y').call(this.yAxis)
            d3.select(this.$el).select('g.grid.grid--x').call(this.xGridAxis)
            d3.select(this.$el).select('g.grid.grid--y').call(this.yGridAxis)
            d3.select(this.$el).select('g.grid.grid--max--x').call(this.xMaxGridAxis)
            d3.select(this.$el).select('g.grid.grid--max--y').call(this.yMaxGridAxis)
        }
    },

    svgDrop (ev) {
        // Set the dropEffect to move
        ev.dataTransfer.dropEffect = 'move'
        // fixed bug that invalid add a node use H5 drag
        if (this.adding_node)
            this.$emit('beforeAddNode', this.adding_node, null, [ev.layerX, ev.layerY])
        this.resetReferenceFeedback()
    },

    svgDragover (ev) {
        if (this.adding_node)
            this.referenceFeedback({info: this.adding_node}, this.findParentNode)
    },

    /**
     * @description control the canvas zoom to up or down
     * @author xinghua.wen
     */
    zoomed (transform) {
        this.zoomTransform = transform || d3.event.transform
        d3.select(this.$el).select('g.viewport').attr('transform', this.zoomTransform)
        this.transformScale = this.zoomTransform.k * 100
        this.resizerPosition()
        if (this.gridSwitch)
            this.redrawGrids(this.width, this.height)
    },

    zoomedDomEvent () {
        const container = d3.select(this.$el).select('svg.hierarchical-digram')
        // avoid change zoom scale repeatly while centering layout
        if (this.transformScale !== this.zoomTransform.k * 100) 
            this.zoom.scaleTo(container, this.transformScale / 100)
        this.resizerPosition()
    },

    rebuildRootAndNodes () {
        this.root = this.stratify(this.plainNodes)
        this.nodes = this.root.descendants().slice(1)

        // init all nodes' position according to its plain array data（_x,_y）
        this.root.eachBefore(
            node => {
                if (node.id !== this.root.id)
                    node.init_fixed_position()
            }
        )
    },

    stratify (data) {
        return d3.stratify()
        .id(function (d) { return d.id })
        .parentId(function (d) { return d.pId })(data)
    },

    /**
     * @description 生成uuid
     */
    getUUID () {
        return Utils.uuid()
    },

    /**
     * @description 左侧资源菜单栏拖拽条目进来，增加节点
     */
    addNode (x, y, parentNode) {
        // fixed bug that invalid add a node use H5 drag
        if (!this.adding_node)
            return
        let _x = x, _y = y
        if (this.zoomTransform && x !== null && x !== undefined && y !== null && y !== undefined) {
            _x = (x - this.zoomTransform.x) / this.zoomTransform.k
            _y = (y - this.zoomTransform.y) / this.zoomTransform.k
        }
        let node = {id: this.getUUID(), _x, _y}
        node.info = { ...this.adding_node }
        node.width = this.nodeDefaultSize.container.width
        node.height = this.nodeDefaultSize.container.height

        if (this.containerKeys && this.containerKeys.indexOf(node.info[this.uniqueKey]) === -1) {
            node.width = this.nodeDefaultSize.normal.width
            node.height = this.nodeDefaultSize.normal.height
        }

        let toAddParentNode = parentNode
        if (!toAddParentNode)
            toAddParentNode = this.rootData

        node.pId = toAddParentNode.id
        this.inner_adding_node = node

        // validate that if parent can contain specified child node
        let validation = this.canNestNode(this.inner_adding_node, toAddParentNode)
        if (!validation) {
            node.pId = this.rootData.id
            this.inner_adding_node._x = 0
            this.inner_adding_node._y = 0
        }

        this.originNodes.push(this.inner_adding_node)
        this.inner_adding_node = null
        // empty this.adding_node while after adding the specified node
        this.$emit('update:adding_node', null)
        return node
    },

    /**
     * @description clone node based on specified node data
     */
    cloneNode (nodeData) {
        let clonedNode = JSON.parse(JSON.stringify(nodeData))
        clonedNode.id = this.getUUID()
        this.$emit('beforeClone', nodeData.id, clonedNode.id)

        let clonedX = clonedNode._x
        let clonedY = clonedNode._y
        while (this.nodePoints.indexOf(clonedX + ',' + clonedY) !== -1) {
            clonedX += 20
            clonedY += 20
        }
        clonedNode._x = clonedX
        clonedNode._y = clonedY

        this.originNodes.push(clonedNode)
        this.$emit('afterClone', clonedNode)
    },

    /**
     * @description add link between specified two nodes
     */
    addLink (d) {
        let link = {
            source: this.source.id,
            target: d.id,
            values: {},
            id: Utils.uuid()
        }
        this.dragline.display = 'none'
        this.dragline.markerEnd = ''

        let validationRst = d3.select('.node.node_' + d.id).classed('reference_feedback') && this.beforeAddLink(this.source.data, d)
        if (!validationRst)
            return
        
        //修复重复连线问题
        let ifExist = this.links.filter(
            item => {
                return (item.source.id === link.source && item.target.id === link.target)
        })[0]

        if (!ifExist) {
            link.description = validationRst.description
            link.type = validationRst.type

            this.links.push(link)
            this.$emit('afterAddLink', this.source, d.data)
        }
        this.source = null
    },

    findNodeById (id) {
        return this.nodeObjs[id]
    },

    /**
     * @description 定位node、link位置
     */
    tick () {
        let svg = d3.select(this.$el).select('svg.hierarchical-digram')
        
        let links = svg.select('g.link-container').selectAll('path.link')
        let linkLabels = svg.select('g.link-label-container').selectAll('text.edgelabel')
        let linkbgs = svg.select('g.link-container').selectAll('path.link-actived-bg')
        let self = this

        // draw directed edges with proper padding from node centers
        links.attr('d', function (d) {
            return self.linkTick(d)
        })

        linkbgs.attr('d', function (d) {
            return self.linkTick(d)
        })

        // update link label position
        // UCMP3-4070 firefox getBBox on text warn: [NS_ERROR_FAILURE], guess text has not be rendered
        this.$nextTick(() => {
            linkLabels.attr('transform', function (d, i) {
                if (d.target.x < d.source.x) {
                    let bbox = this.getBBox()
                    let rx = bbox.x + bbox.width / 2
                    let ry = bbox.y + bbox.height / 2
                    return 'rotate(180 ' + rx + ' ' + ry + ')'
                } else
                    return 'rotate(0)'
            })
        })
        
        if (this.enableEdit) {
            svg.select('g.link-container').selectAll('g.option-remove').attr('transform', d => {
                let sourceCent = DIAGRAM_UTILS.getCentPoint(d.source)
                let targetCent = DIAGRAM_UTILS.getCentPoint(d.target)
                return 'translate(' + (sourceCent.x + targetCent.x / 2 - sourceCent.x / 2) + ',' + (sourceCent.y + targetCent.y / 2 - sourceCent.y / 2) + ')'
            })
        }

        this.nodesTick()
        this.updateGroups()
    },

    nodesTick () {
        let nodes = d3.select(this.$el).select('g.node-container').selectAll('g.node')
        nodes.attr('d', d => {
            if (!d.fx && d.parent && d.parent.fx)
                d.autoAssignPosition(this.mergedNodeDefaultPadding, this.initNodeLocalPosition)
        }).attr('transform', d => {
            return 'translate(' + d.x + ',' + d.y + ')'
        })

        this.updateNodes(nodes)
    },

    /**
     * @description assign position according to defined node id which is exsit and has no fixed position
     * @description the function is always used after add hierarchy node
     */
    assignPositionById (_node) {
        this.nodes = this.root.descendants().slice(1)
        let node = this.findNodeById(_node.id)
        if (node && node.autoAssignPosition)
            node.autoAssignPosition(this.mergedNodeDefaultPadding, this.initNodeLocalPosition)
        this.autoAssignPositionCallBack(node)
    },

    initNodeLocalPosition (d) {
        d.data._x = d.fx
        d.data._y = d.fy
        d.children && d.children.forEach(
            node => {
                node.data._x = node.fx
                node.data._y = node.fy
            }
        )
        if (this.ctrlCheckedNodes.length) {
            this.ctrlCheckedNodes.forEach(
                node => {
                    node.data._x = node.fx
                    node.data._y = node.fy
                }
            )
        }
    },

    autoAssignPositionCallBack (d) {
        this.autoExtendSize(d.parent.data, d.data)
    },

    /**
     * @description calclate link path source and target to position it
     */
    linkTick (d) {
        return DIAGRAM_UTILS.linkTick(d)
    },

    /**
     * @description auto detect that if any group is collided by the node, if yes, add the group_id to the node
     */
    detectNodeCollideGroup (node) {
        let group_id = this.groupInfo.id ? this.groupInfo.id : 'group_id'
        if (node.data.info[group_id])
            return
        let groups = d3.select(this.$el).select('g.group-container').selectAll('g.path_placeholder')
        let collidedGroup = []
        groups.each(
            d => {
                let x = node.fx + node.data.width / 2 - d.coordinates[0][0] - (d.coordinates[1][0] - d.coordinates[0][0]) / 2
                let y = node.fy + node.data.height / 2 - d.coordinates[0][1] - (d.coordinates[2][1] - d.coordinates[0][1]) / 2
                let spaceX = (node.data.width + d.coordinates[1][0] - d.coordinates[0][0]) / 2
                let spaceY = (node.data.height + d.coordinates[2][1] - d.coordinates[0][1]) / 2
                if (Math.abs(x) < spaceX && Math.abs(y) < spaceY)
                    collidedGroup.push(d)
            }
        )
        if (collidedGroup.length && collidedGroup.length > 1)
            console.log('not allowed')
        else if (collidedGroup.length && collidedGroup.length === 1)
            this.$emit('AddNodeToGroup', node.data.info, collidedGroup[0].group_id)
            // this.$set(node.data.info, group_id, collidedGroup[0].group_id)
    },

    /**
     * @description redraw node groups
     */
    redrawGroups () {
        let self = this
        let groupDatas = this.groupIds.map(
            group_id => {
                let data = {}
                data.group_id = group_id
                let polygon = this.polygonGenerator(group_id) 
                let transformedRect = DIAGRAM_UTILS.getRectCoordinates(polygon)
                data.coordinates = transformedRect
                return data
            }
        )
        let groups = d3.select(this.$el).select('g.group-container')
            .selectAll('.path_placeholder')
            .data(groupDatas, d => {
                return d.group_id
            })

        let groupsEnter = groups.enter()
            .append('g')
            .attr('class', d => {
                return 'path_placeholder ' + (d.group_id ? 'group_' + d.group_id : '')
            })
        let groupsPaths = groupsEnter.append('path').attr('class', 'group-path').attr('opacity', 0)
        groupsEnter.append('text').attr('class', 'group-name')
            .text(d => {
                return this.groupsConfigs && this.groupsConfigs[d.group_id] ? this.groupsConfigs[d.group_id][this.groupInfo.name ? this.groupInfo.name : 'group_name'] : ''
            })
            .attr('x', d => {
                return d.coordinates[0][0] + 20
            })
            .attr('y', d => {
                return d.coordinates[0][1] + 16
            })
        groupsPaths.transition().duration(2000)
            .attr('d', d => {
                return this.valueline(
                    d.coordinates.map(point => {
                        return [point[0], point[1]]
                    })
                )
            })
            .attr('style', d => {
                let group_id = this.groupInfo.id ? this.groupInfo.id : 'group_id'
                let styleSheel = ''
                if (this.groupsConfigs && this.groupsConfigs[d[group_id]] && this.groupsConfigs[d[group_id]].styles)
                    styleSheel = 'fill:' + this.groupsConfigs[d[group_id]].styles.fill + ';' + 'stroke:' + this.groupsConfigs[d[group_id]].styles.stroke + ';'
                return styleSheel
            })
            .attr('opacity', 1)

        let groupsUpdate = groupsEnter.merge(groups)
            
        groupsUpdate.select('.group-path')
            .attr('d', d => {
                return this.valueline(
                    d.coordinates.map(point => {
                        return [point[0], point[1]]
                    })
                )
            })
            .attr('style', d => {
                let group_id = this.groupInfo.id ? this.groupInfo.id : 'group_id'
                let styleSheel = ''
                if (this.groupsConfigs && this.groupsConfigs[d[group_id]] && this.groupsConfigs[d[group_id]].styles)
                    styleSheel = 'fill:' + this.groupsConfigs[d[group_id]].styles.fill + ';' + 'stroke:' + this.groupsConfigs[d[group_id]].styles.stroke + ';'
                return styleSheel
            })
        
        groupsUpdate.select('.group-name')
            .text(d => {
                return this.groupsConfigs && this.groupsConfigs[d.group_id] ? this.groupsConfigs[d.group_id][this.groupInfo.name ? this.groupInfo.name : 'group_name'] : ''
            })
            .attr('x', d => {
                return d.coordinates[0][0] + 20
            })
            .attr('y', d => {
                return d.coordinates[0][1] + 16
            })
        groupsUpdate.on('mousedown', d => {
            d3.event.stopPropagation()
            this.$emit('groupClick', d.group_id)
        })
        .call(d3.drag().on('start', function (d) {
            return self.groupDragStart(d, this)
            }
        ))

        groups.exit().remove()
    },

    updateGroups () {
        let self = this
        let groups = d3.select(this.$el).select('g.group-container').selectAll('g.path_placeholder')
        groups.each(function (d) {
            let polygon = self.polygonGenerator(d.group_id) 
            d.coordinates = DIAGRAM_UTILS.getRectCoordinates(polygon)
            d3.select(this).attr('d', d)
            d3.select(this).select('.group-path').attr('d', d => {
                return self.valueline(
                    d.coordinates.map(point => {
                        return [point[0], point[1]]
                    })
                )
            })
            d3.select(this).select('.group-name')
                .attr('x', d => {
                    return d.coordinates[0][0] + 20
                })
                .attr('y', d => {
                    return d.coordinates[0][1] + 16
                })
            d3.select(this).select('path.group-path')
                .attr('style', d => {
                    if (self.groupsConfigs && self.groupsConfigs[d.group_id] && self.groupsConfigs[d.group_id].styles)
                        return 'fill:' + self.groupsConfigs[d.group_id].styles.fill + ';' + 'stroke:' + self.groupsConfigs[d.group_id].styles.stroke + ';'
                })
        })
    },

    polygonGenerator (groupId) {
        // let nodes = this.getD3Nodes()
        let node_coords = this.nodes
            .filter(d => { return d.data.info[this.groupInfo.key ? this.groupInfo.key : 'group_id'] === groupId })
            // .data()
            .map(d => { 
                return [[d.x, d.y], [d.x + d.data.width, d.y], [d.x + d.data.width, d.y + d.data.height], [d.x, d.y + d.data.height]]
            })
    
        let final_node_coords = Utils.flatten(node_coords)
        return d3.polygonHull(final_node_coords)
    },

    /**
     * @description redraw nodes when this.nodes changed
     */
    redrawNodes () {
        let self = this, reference_padding_top = 10

        let nodes = this.getD3Nodes()
        let nodesEnter = nodes.enter()
            .append('g')
            // .attr('class', 'node')
            .attr('class', d => {
                return 'node node_' + d.id
            })

        nodesEnter.append('rect')
            .attr('class', 'node_rect')
            .attr('width', d => {
                return this.containerKeys && d.data.info && this.containerKeys.indexOf(d.data.info[this.uniqueKey]) !== -1
                    ? d.data.width : this.normalNodeSize.width
            })
            .attr('height', d => {
                return this.containerKeys && d.data.info && this.containerKeys.indexOf(d.data.info[this.uniqueKey]) !== -1
                    ? d.data.height : this.normalNodeSize.height
            })
        
        let parentTitleContainer = nodesEnter.append('g')
            .attr('class', 'parent-node-title-container')
            .attr('transform', d => {
                return 'translate(0, 0)'
            })
        if (this.enableEdit) {
            let optionRemoveContainer = nodesEnter.append('g')
                .attr('class', 'option-remove-container')
                .attr('transform', d => {
                    return 'translate(' + (d.data.width + 11) + ', 0)'
                })

            optionRemoveContainer.append('circle').attr('r', 11)

            optionRemoveContainer.append('svg:path')
                .attr('transform', 'scale(.8) translate(-16, -16)')
                .attr('d', d => {
                    return 'M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z'
                })
        }
        parentTitleContainer.append('rect')
            .attr('class', 'parent-node-title-bg')
            .attr('width', d => {
                return d.data.width
            })
            .attr('height', 40)

        parentTitleContainer.append('text')
            .attr('class', 'title-icon')
            .attr('font-size', '16px')
            .style('text-anchor', 'middle')
            .attr('transform', d => {
                // 设置文字水平居中显示
                // return 'matrix(1,0,0,1,' + d.data.width / 2 + ', 10' + ')'
                return 'translate(30, 25)'
            })
            .attr('stroke', '#fff')
            .text(d => {
                return ''
            })

        parentTitleContainer.append('text')
            .attr('font-size', '16px')
            .style('text-anchor', 'middle')
            .attr('transform', d => {
                // 设置文字水平居中显示
                // return 'matrix(1,0,0,1,' + d.data.width / 2 + ', 10' + ')'
                return 'translate(80, 25)'
            })
            .attr('stroke', '#fff')
            .attr('class', 'node-title')
            .text(d => { return '' })

        let contentContainer = nodesEnter.append('g')
            .attr('class', 'content-container')
            .attr('transform', d => {
                let size = this.computeContentIconPosition(d)
                return 'translate(' + size[0] + ', ' + size[1] + ')'
            })

        contentContainer.append('text')
            .attr('class', 'content-icon')
            .attr('font-size', d => {
                return this.contentIconSize + 'px'
            })
            .attr('stroke', '#fff')
            .text(d => {
                return ''
            })
        
        // add link reference circles
        let linkReference = nodesEnter.append('g')
            .attr('class', 'link_reference_container')
        linkReference.attr('d', d => {
                d.linkReferences = self.linkReferences(d)
                return d
            }).selectAll('g.link_reference_graph').data(d => {
                let rst = JSON.parse(JSON.stringify(d.linkReferences))
                rst.forEach(
                    (reference, index) => {
                        reference._node = d
                        reference._index = index
                    }
                )
                return rst
            }, d => {
                return d.reference_key
            })
            .enter()
            .append('g')
            .attr('class', 'link_reference_graph')
            .attr('transform', (d, i) => {
                let padding_top = 10
                return 'translate(0,' + (padding_top + 20) * (i + 1) + ')'
            })
            .append('circle')
            .attr('r', 10)
            .attr('class', 'link_reference')
            .on('mouseover', function (d) {
                d3.event.stopPropagation()
                let position = self.getlinkReferenceDirectionAndOffset(d, this)
                // UCMP3-5623 低分辨下的Firefox因为opacity出现滚动条，使用display避免该问题发生
                self.tooltip.style('display', 'block')
                self.tooltip.direction(position.direction).offset(position.offset).show(d, this)
                d3.select(this).classed('reference_hover', true)
            })
            .on('mouseout', function (d) {
                d3.event.stopPropagation()
                // UCMP3-5623 低分辨下的Firefox因为opacity出现滚动条，使用display避免该问题发生
                self.tooltip.style('display', 'none')
                self.tooltip.hide(d)
                d3.select(this).classed('reference_hover', false)
            })
            .on('mousedown', function (d) {
                d3.event.stopPropagation()
            })
            .call(d3.drag().on('end', d => {
                this.dragline.display = 'none'
                if (this.hovered_node)
                    this.addLink(this.hovered_node)
                this.resetReferenceFeedback()                
            }).on('drag', function (d) {
                let coors = d3.mouse(this.ownerSVGElement)
                let endX = (coors[0] - self.zoomTransform.x) / self.zoomTransform.k, endY = (coors[1] - self.zoomTransform.y) / self.zoomTransform.k
                self.dragline.data = 'M' + d._node.fx + ',' + (d._node.fy + (reference_padding_top + 20) * (d._index + 1)) + 'L' + endX + ',' + endY
                self.dragline.display = 'block'
                self.dragline.markerEnd = 'url(#end-arrow)'
            }).on('start', function (d) {
                self.source = d._node
                self.referenceFeedback(d, self.findReferencedNode)
                let coors = d3.mouse(this.ownerSVGElement)
                let endX = (coors[0] - self.zoomTransform.x) / self.zoomTransform.k, endY = (coors[1] - self.zoomTransform.y) / self.zoomTransform.k
                self.dragline.display = 'block'
                self.dragline.markerEnd = 'url(#end-arrow)'
                self.dragline.data = 'M' + d._node.fx + ',' + (d._node.fy + (reference_padding_top + 20) * (d._index + 1)) + 'L' + endX + ',' + endY
            }))
        
        let nodesUpdate = nodesEnter.merge(nodes)
            .classed('nested-node', d => {
                // return d.containerKeys
                if (this.containerKeys && d.data.info && this.containerKeys.indexOf(d.data.info[this.uniqueKey]) !== -1)
                    return true
                return false
            })
            .classed('invalid', d => {
                return d.data.validation !== undefined && !d.data.validation
            })
            .on('mouseover', function (d) {
                if (d.data.dragging)
                   return
                // UCMP3-2528 keep tooltip hide while current node's description is empty
                if (d.data.info && d.data.info[self.nodeTooltip]) {
                    let position = self.getNodeTooltipDirectionAndOffset(d)
                    // UCMP3-5623 低分辨下的Firefox因为opacity出现滚动条，使用display避免该问题发生                    
                    self.tooltip.style('display', 'block')
                    self.tooltip.direction(position.direction).offset(position.offset).show(d, this)
                }
                // if edit mode is turn on, don't run anything
                if (!self.enableEdit)
                    return
                self.hovered_node = d.data
                // highlight node when it's hovered & the checked node moving towards to it
                self.computeRerefIndicater(this, d)
            })
            .on('mouseout', function (d) {
                // UCMP3-5623 低分辨下的Firefox因为opacity出现滚动条，使用display避免该问题发生
                self.tooltip.style('display', 'none')
                self.tooltip.hide(d)
                self.rerefIndicater.display = 'none'
            })
            .on('mousedown', function (d) {
                // if edit mode is turn on, don't run anything
                // if (!this.enableEdit)
                //     return
                if (d3.event.ctrlKey && (self.checked_node && self.checked_node.id !== d.id)) {
                    // UCMP3-2294 多个激活节点去重校验
                    let ctrlCheckedNodeIds = self.ctrlCheckedNodes.map(node => { return node.id })
                    // 只有画布上的根节点(实际为一级节点)才可以被同时选中
                    if (d.parent && d.parent.id === self.rootId && ctrlCheckedNodeIds.indexOf(d.id) === -1)
                        self.ctrlCheckedNodes.push(d)
                } else {
                    if (self.checked_node && self.checked_node.id !== d.id)
                        self.ctrlCheckedNodes.splice(0, self.ctrlCheckedNodes.length)
                    self.checked_node = d
                    // // UCMP3-2294 添加多节点选中、拖拽说明提示, 初次操作提示一次
                    if (self.enableEdit && self.firstAccess.multipleDrag) {
                        self.$notify({ title: '提示', type: 'success', message: '按住Ctrl键同时点击画布其他节点，可以选中多个节点，同时支持多节点拖拽的功能' })
                        self.firstAccess.multipleDrag = false
                    }
                }
                if (self.checked_node.data.info.hasRmBtn)
                    d3.select(this).classed('show-rm-btn', true)
                self.$emit('nodeClick', d)
                d3.event.stopPropagation()
            })
            .on('dragover', function (d) {
                self.computeRerefIndicater(this, d)
            })
            .on('dragleave', d => {
                this.rerefIndicater.display = 'none'
            })
            .on('drop', d => {
                d3.event.stopPropagation()
                d3.event.preventDefault()
                this.$emit('beforeAddNode', this.adding_node, d.data, [d3.event.layerX, d3.event.layerY])
                this.rerefIndicater.display = 'none'
            })
            .call(d3.drag().on('start', function (d) {
                return self.dragStart(d, this)
                }
            ))

        nodesUpdate.select('.parent-node-title-container')
            .select('.title-icon')
            .text(d => {
                if (!d.data.info)
                    return ''
                return self.icons[d.data.info[self.uniqueKey]]
            })
            .attr('pointer-events', 'none')

        nodesUpdate.select('.parent-node-title-container')
            .select('.node-title')
            .text(d => {
                if (!d.data.info)
                    return ''
                return d.data.info[this.label]
            })
            .attr('pointer-events', 'none')

        nodesUpdate.select('.content-container')
            .attr('transform', d => {
                let size = this.computeContentIconPosition(d)
                return 'translate(' + size[0] + ', ' + size[1] + ')'
            })
            .select('.content-icon')
            .text(d => {
                if (!d.data.info)
                    return ''
                return self.icons[d.data.info[self.uniqueKey]] || this.defaultIcon
            })
            .attr('pointer-events', 'none')

        nodesUpdate.select('.parent-node-title-bg')
            .attr('width', d => {
                return d.data.width
            })
            .attr('pointer-events', 'none')
        if (this.enableEdit) {
            nodesUpdate.select('.option-remove-container')
                .attr('transform', d => {
                    return 'translate(' + (d.data.width + 11) + ', 0)'
                })
                .on('mousedown', d => {
                    d3.event.stopPropagation()
                    this.$emit('beforeDeleteNode', [d], this.deleteCheckedNodeObj)
                })
        }
        nodesUpdate.select('.node_rect')
            .attr('width', d => {
                return this.containerKeys && d.data.info && this.containerKeys.indexOf(d.data.info[this.uniqueKey]) !== -1
                    ? d.data.width : this.normalNodeSize.width
            })
            .attr('height', d => {
                return this.containerKeys && d.data.info && this.containerKeys.indexOf(d.data.info[this.uniqueKey]) !== -1
                    ? d.data.height : this.normalNodeSize.height
            })

        nodes.exit().remove()
        // UCMP3-5622 重绘节点后自动重绘分层
        this.redrawGroups()
    },

    /**
     * @description compute content icon position
     */
    computeContentIconPosition (d) {
        let width = d.data.width, height = d.data.height
        if (this.containerKeys && this.containerKeys.indexOf(d.data.info[this.uniqueKey]) === -1) {
            width = d.data.width = this.normalNodeSize.width
            height = d.data.height = this.normalNodeSize.height
        }
        return [(width - this.contentIconSize) / 2, this.contentIconSize - 7 * this.contentIconSize / 60 + (height - this.contentIconSize) / 2]
    },

    computeRerefIndicater (target, d) {
        // highlight node when it's hovered & the checked node moving towards to it
        if (d3.select(target).classed('reference_feedback')) {
            this.rerefIndicater.left = d.fx * this.zoomTransform.k + this.zoomTransform.x - 20
            this.rerefIndicater.top = d.fy * this.zoomTransform.k + this.zoomTransform.y - 20
            this.rerefIndicater.display = 'block'
        }
    },

    /**
     * @description get tooltip direction & offset information according to its position
     */
    getNodeTooltipDirectionAndOffset (d, _tooltip) {
        let top = d.y * this.zoomTransform.k + this.zoomTransform.y
        
        let direction = top < 200 ? 's' : 'n',
            offset = top < 200 ? [10, 0] : [-10, 0]
        if (this.tipConfiguration.offset && Array.isArray(this.tipConfiguration.offset) && this.tipConfiguration.offset.length === 2)
            offset = [offset[0] + this.tipConfiguration.offset[0], offset[1] + this.tipConfiguration.offset[1]]
        return {direction, offset}
    },

    /**
     * @description get tooltip direction & offset information according to its position
     */
    getlinkReferenceDirectionAndOffset (d, target) {
        let direction = 'n',
            offset = [-target.getBBox().height / 2, 0]
        if (this.tipConfiguration.offset && Array.isArray(this.tipConfiguration.offset) && this.tipConfiguration.offset.length === 2)
            offset = [offset[0] + this.tipConfiguration.offset[0], offset[1] + this.tipConfiguration.offset[1]]
        return {direction, offset}
    },
    /**
     * @description align layout of checked nodes according to direction
     */
    alignDefinedNodes (nodes, direction) {
        this.simulation.alphaTarget(0.3).restart()

        nodes.forEach(
            _node => {
                _node.data.dragStartCoor = {
                    fx: _node.fx,
                    fy: _node.fy
                }
            }
        )
        if (!Array.isArray(nodes) || ['top', 'bottom', 'left', 'right'].indexOf(direction) === -1) {
            console.warn('please check that if arguments is valid')
            return
        }
        this.alignNodesAccordingToDirection(nodes, direction)
    },

    alignNodesAccordingToDirection (nodes, direction) {
        // 根据对齐方向获取对应坐标的顺序数组
        let coorArrs = nodes.map(
            node => {
                if (direction === 'left' || direction === 'top')
                    return direction === 'left' ? node.fx : node.fy
                else
                    return direction === 'right' ? node.fx + node.data.width : node.fy + node.data.height
            }
        ).sort(
            (a, b) => {
                return a - b
            }
        )
        // 定义坐标最小|大值
        let mini = coorArrs[0], max = coorArrs[coorArrs.length - 1]

        // UCMP3-6118 获取一级深度的节点列表，准备对其使用对齐功能
        let rootNodes = nodes.filter(node => {
            if (node.depth === 1)
                return node
        })

        // 【对齐函数】根据对齐方向对指定节点进行位置更改
        let alignFunc = (_nodes) => {
            _nodes.forEach(
                node => {
                    let fx = node.fx, fy = node.fy
                    if (direction === 'left' || direction === 'top')
                        direction === 'left' ? fx = mini : fy = mini
                    else
                        direction === 'right' ? fx = max - node.data.width : fy = max - node.data.height
                    this.dragDescendants(node, direction === 'left' || direction === 'right' ? fx - node.fx : 0, direction === 'top' || direction === 'bottom' ? fy - node.fy : 0)
                    node.fx = fx
                    node.fy = fy
                    // if (node.parent && node.parent.id !== this.rootId)
                    //     this.autoExtendSize(node.parent.data, node.data)
                    this.initNodeLocalPosition(node)
                }
            )

            // 碰撞检测，发生碰撞的节点进行位置调整
            this.alignCollision = rectCollision(this.alignCollisionCallback, true)
                .size(function (d) { return [d.data.width, d.data.height] })
                .nodes(nodes)
                .env('align_' + direction)
            this.alignCollision.initialize(_nodes)
            this.alignCollision()
            // clear no-use function
            alignFunc = null
        }
        // 对筛选后的节点执行对齐函数
        alignFunc(rootNodes)
    },

    /**
     * @description callback event after align event trigged
     */
    alignCollisionCallback (collisions, nodes) {
        if (!Object.keys(collisions).length)
            return
        // 发生碰撞，全部按照固定顺序依次进行排列
        let env = this.alignCollision.curEnv()
        if (env === 'align_left' || env === 'align_right') {
            let target = nodes.find(d => {
                if (d.data.dragStartCoor.fx === d.fx) return d
            })

            target && nodes.filter(
                d => {
                    if (d.id !== target.id) return d
                }
            ).forEach(
                (d, i, arr) => {
                    let height = target.fy + target.data.height
                    for (let index = 0; index < i; index++)
                        height += (arr[index].data.height + 10)
                    let shift = height + 10 - d.fy
                    d.data._y = d.fy = height + 10
                    this.dragDescendants(d, 0, shift)
                }
            )
        } else {
            let target = nodes.find(d => {
                if (d.data.dragStartCoor.fy === d.fy) 
                    return d
            })

            target && nodes.filter(
                d => {
                    if (d.id !== target.id) return d
                }
            ).forEach(
                (d, i, arr) => {
                    let width = target.fx + target.data.width
                    for (let index = 0; index < i; index++)
                        width += (arr[index].data.width + 10)
                    let shift = width + 10 - d.fx
                    d.data._x = d.fx = width + 10
                    this.dragDescendants(d, shift, 0)
                }
            )
        }
    },

    /**
     * @description feedback function after one link reference button is checked
     * @param { reference }
     */
    referenceFeedback (reference, _findNode_func) {
        let self = this

        d3.select(self.$el).selectAll('.node').each(
            function (d) {
                let matched = _findNode_func(reference, d.data)
                d3.select(this).classed('no_reference_feedback', !matched)
                d3.select(this).classed('reference_feedback', matched)
            }
        )
    },

    resetReferenceFeedback () {
        d3.select(this.$el).selectAll('.node').each(
            function (d) {
                d3.select(this).classed('no_reference_feedback', false)
                d3.select(this).classed('reference_feedback', false)
            }
        )
    },

    /**
     * @description update nodes' style while nodes' hierarchy data has been changed
     */
    updateNodes (nodes) {
        let self = this
        nodes.classed('nested-node', d => {
                // return d.containerKeys
                if (this.containerKeys && d.data.info && this.containerKeys.indexOf(d.data.info[this.uniqueKey]) !== -1)
                    return true
                return false
            })
            .classed('invalid', d => {
                return d.data.validation !== undefined && !d.data.validation
            })
            .classed('ctrl-checked-node', d => {
                return (self.ctrlCheckedNodes.map(
                    node => {
                        return node.id
                    }
                ).indexOf(d.id)) !== -1
            })
        nodes.select('.parent-node-title-container')
            .select('.title-icon')
            .text(d => {
                if (!d.data.info)
                    return ''
                return self.icons[d.data.info[self.uniqueKey]]
            })

        nodes.select('.parent-node-title-container')
            .select('.node-title')
            .text(d => {
                if (!d.data.info)
                    return ''
                return d.data.info[this.label]
            })

        nodes.select('.content-container')
            .attr('transform', d => {
                let size = this.computeContentIconPosition(d)
                return 'translate(' + size[0] + ', ' + size[1] + ')'
            })
            .select('.content-icon')
            .text(d => {
                if (!d.data.info)
                    return ''
                return self.icons[d.data.info[self.uniqueKey]] || this.defaultIcon
            })

        nodes.select('.parent-node-title-bg')
            .attr('width', d => {
                return d.data.width
            })

        if (this.enableEdit) {
            nodes.select('.option-remove-container')
                .attr('transform', d => {
                    return 'translate(' + (d.data.width + 11) + ', 0)'
                })
        }
        nodes.select('.node_rect')
            .attr('width', d => {
                return this.containerKeys && d.data.info && this.containerKeys.indexOf(d.data.info[this.uniqueKey]) !== -1
                    ? d.data.width : this.normalNodeSize.width
            })
            .attr('height', d => {
                return this.containerKeys && d.data.info && this.containerKeys.indexOf(d.data.info[this.uniqueKey]) !== -1
                    ? d.data.height : this.normalNodeSize.height
            })
    },
    resizerPosition () {
        if (!this.checked_node)
            return

        let left = this.checked_node.fx, top = this.checked_node.fy, width = this.checked_node.data.width, height = this.checked_node.data.height
        if (this.zoomTransform) {
            left = this.zoomTransform.x + this.zoomTransform.k * left
            top = this.zoomTransform.y + this.zoomTransform.k * top
            width = this.zoomTransform.k * width
            height = this.zoomTransform.k * height
        }
        d3.select('div.resizer')
            .style('left', d => {
                return left + 'px'
            })
            .style('top', d => {
                return top + 'px'
            })
            .style('width', d => {
                return width + 'px'
            })
            .style('height', d => {
                return height + 'px'
            })
    },

    /**
     * @description draw links between all nodes
     */
    redrawLinks () {
        let paths = d3.select('.link-container').selectAll('g.link-g')
        let pathLabels = d3.select('.link-label-container').selectAll('text.edgelabel')
        // delete not valid link data
        let links = this.links.map(link => {
            let _link = {}
            // UCMP3-5717 避免直接修改原有数据，引起校验异常的问题
            Object.keys(link).forEach(key => {
                if (key === 'source' || key === 'target')
                    _link[key] = typeof link[key] === 'object' ? link[key].id : link[key]
                else _link[key] = link[key]
            })
            return _link
        })
        let valueChanged = false
        for (let i = links.length - 1; i >= 0; i--) {
            if (!this.originNodesObj[links[i].source] || !this.originNodesObj[links[i].target]) {
                links.splice(i, 1)
                valueChanged = true
            }
        }
        if (valueChanged)
            this.links = links
        this.$nextTick(() => {
            this.forceLink.links(this.links)

            // add id to each link whose id property is undefined
            this.links.forEach(
                link => {
                    if (!link.id)
                        link.id = Utils.uuid()
                }
            )

            // define links data due to its id
            paths = paths.data(this.links, d => {
                return d.id
            })

            pathLabels = pathLabels.data(this.links, d => {
                return d.id
            })

            let pathsEnter = paths.enter()
                .append('svg:g')
                .attr('class', 'link-g')

            pathsEnter.append('svg:path')
                .attr('class', 'link')
                // .style('marker-start', 'url(#start-arrow)')
                .style('marker-end', 'url(#end-arrow)')

            pathsEnter.append('svg:path')
                .attr('class', 'link-actived-bg')

            if (this.enableEdit) {
                let option = pathsEnter.append('g')
                    .attr('class', 'option-remove')
                option.append('circle').attr('r', 11)

                option.append('svg:path')
                    .attr('transform', 'scale(.8) translate(-16, -16)')
                    .attr('d', d => {
                        return 'M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z'
                    })
            }
            let pathsUpdate = pathsEnter.merge(paths)
                .classed('invalid', d => {
                    return d.validation !== undefined && !d.validation
                })
                .on('mousedown', d => {
                    this.checked_link = d
                    this.checked_node = null
                    d3.event.stopPropagation()
                    this.$emit('linkClick', d)
                })

            pathsUpdate.select('.link')
                .attr('id', (d, i) => {
                    return 'edgepath_' + d.id
                })
            if (this.enableEdit) {
                pathsUpdate.select('.option-remove')
                    .on('mousedown', d => {
                        d3.event.stopPropagation()
                        this.$emit('beforeDeleteLink', this.checked_link, this.deleteCheckedLinkObj)
                    })
        }

        let pathLabelsEnter = pathLabels.enter()
            .append('text')
            .style('pointer-events', 'none')
            .attr('class', 'edgelabel')
            .attr('id', (d, i) => {
                return 'edgelabel_' + d.id
            })
            .attr('dx', 80)
            .attr('dy', 0)
            .attr('font-size', 10)
            .attr('fill', '#aaa')
        pathLabelsEnter.append('textPath')
            .attr('xlink:href', (d, i) => {
                return '#edgepath_' + d.id
            })
            .style('pointer-events', 'none')
            .text((d, i) => {
                return d.description ? d.description : ''
            })
        pathLabelsEnter.merge(pathLabels)
        paths.exit().remove()
        pathLabels.exit().remove()
        })
    },

    resetNodesOrLinks (class_name, checked) {
        d3.select(this.$el).selectAll(class_name)
            .each(function (d, i) {
                d3.select(this).classed('actived', d => {
                    if (class_name === '.node')
                        return checked && d.id === checked.id
                    else if (class_name === '.link-g')
                        return checked && d.source.id === checked.source.id && d.target.id === checked.target.id
                })
            })
    },

    /**
     * @description set filtered nodes hovered
     */
    setNodesHovered () {
        d3.select(this.$el).selectAll('.node').each(
            function (d, i) {
                d3.select(this).classed('actived', d => {

                })
            }
        )
    },

    /**
     * @description validate that if the checked node can be nested in the hovered node according to parent configs
     */
    canNestNode (nodeObj, parentNodeObj) {
        // if (parentNodeObj.id === this.rootId && !d3.select('.node.node_' + parentNodeObj.id).classed('reference_feedback'))
        //     return false
        
        return this.canNestNodeRule(nodeObj, parentNodeObj)
    },

    setChildrenDragSuccess (d, flag) {
        d.data.dragSuccess = flag
        if (!d.children) return
        d.children.forEach(node => { node.data.dragSuccess = flag })
    },

    /**
     * @description add checked node to specified node
     */
    addChildToNode (dragedNode, collidedNode) {
        let index_1 = this.nestedRelations.indexOf(JSON.stringify({id: dragedNode.id, pId: collidedNode.id})) !== -1,
            index_2 = this.nestedRelations.indexOf(JSON.stringify({id: collidedNode.id, pId: dragedNode.id})) !== -1
        if (index_1 || index_2) {
            let parentNode = index_1 && !index_2 ? collidedNode : dragedNode
            let childNode = index_1 && !index_2 ? dragedNode : collidedNode
            this.autoExtendSize(parentNode.data, childNode.data, true)

            // fix bug that exist nodes can't be dragged
            this.setChildrenDragSuccess(dragedNode, true)
            return
        }

        let collIsParent = this.containerKeys.indexOf(collidedNode.data.info[this.uniqueKey]),
            dragIsParent = this.containerKeys.indexOf(dragedNode.data.info[this.uniqueKey])

        let parentNode = collIsParent === -1 && dragIsParent !== -1 ? dragedNode : collidedNode
        let childNode = collIsParent === -1 && dragIsParent !== -1 ? collidedNode : dragedNode
        dragedNode.data.dragSuccess = this.canNestNode(childNode.data, parentNode.data)
        if (!dragedNode.data.dragSuccess)
            return
        
        // update checked node's pId to desc its containment
        childNode.data.pId = parentNode.data.id
        this.setChildrenDragSuccess(dragedNode, true)
        this.rerefIndicater.display = 'none'
        this.$emit('afterNested', childNode.data, parentNode.data)
    },

    /**
     * @description extend parent node's size once specified node was dragged to it
     */
    autoExtendSize (parentNode, node, ifTarget) {
        // if parent node is root node,ignore its size
        if (parentNode.id === this.rootId)
            return
        // UCMP-1581 fix bug that f5 is too big that overlapped other nodes
        if (!node._x || !node._y) {
            let clonedX = parentNode._x
            let clonedY = parentNode._y
            while (this.nodePoints.indexOf(clonedX + ',' + clonedY) !== -1) {
                clonedX += 20
                clonedY += 20
            }
            node._x = clonedX
            node._y = clonedY
        }
        // ignore that node is cross the border of parent node
        if (parentNode._x <= node._x - this.mergedNodeDefaultPadding.left && parentNode._y <= node._y - this.mergedNodeDefaultPadding.top && parentNode.width + parentNode._x - node.width - node._x >= (this.mergedNodeDefaultPadding.left + this.mergedNodeDefaultPadding.right) / 2 && parentNode.height + parentNode._y - node.height - node._y >= (this.mergedNodeDefaultPadding.top + this.mergedNodeDefaultPadding.bottom) / 2) {
            this.nodeObjs[node.id].init_fixed_position()
            if (!ifTarget) {
                this.redrawNodes()
                this.simulation.restart()
            }
            return
        }

        if (parentNode._x > node._x - this.mergedNodeDefaultPadding.left) {
            let distance = parentNode._x - node._x + this.mergedNodeDefaultPadding.left
            parentNode._x -= distance
            parentNode.width += distance
        }

        if (parentNode._y + this.mergedNodeDefaultPadding.top > node._y) {
            let distance = parentNode._y - node._y + this.mergedNodeDefaultPadding.top
            parentNode._y -= distance
            parentNode.height += distance
        }

        if (parentNode.width + parentNode._x - node.width - node._x < this.mergedNodeDefaultPadding.right) {
            let distance = node.width + node._x - (parentNode.width + parentNode._x) + this.mergedNodeDefaultPadding.right
            parentNode.width += distance
        }

        if (parentNode.height + parentNode._y - node.height - node._y < this.mergedNodeDefaultPadding.bottom) {
            let distance = node.height + node._y - (parentNode.height + parentNode._y) + this.mergedNodeDefaultPadding.bottom
            parentNode.height += distance
        }
        // get hierarchy node which reflect specified parent node
        let hierarchyNode = this.findNodeById(parentNode.id)

        this.nodeObjs[node.id] && this.nodeObjs[node.id].init_fixed_position()
        hierarchyNode.init_fixed_position()
        if (hierarchyNode.parent.id !== this.rootId)
            this.autoExtendSize(hierarchyNode.parent.data, hierarchyNode.data, false)
    },

    /**
     * @description remove checked child node from specified node
     */
    removeChildFromNode (d) {
        let descendants = d.data.children
        let allIds = descendants.map(
            node => {
                return node.id
            }
        )
        let index = allIds.indexOf(this.checked_node.id)
        if (index !== -1)
            d.data.children.splice(index, 1)
    },

    dragStart (d, _target) {
        // UCMP3-2630 hidden tooltip before current node dragged
        // UCMP3-5623 低分辨下的Firefox因为opacity出现滚动条，使用display避免该问题发生
        this.tooltip.style('display', 'none')
        this.tooltip.hide(d)
        let allCheckedNodes = this.ctrlCheckedNodes.concat([d])
        this.rectCollision.nodes(this.nodes).iterateNodes(allCheckedNodes)

        // store node coordinate before drag
        allCheckedNodes.forEach(
            node => {
                node.data.dragStartCoor = {
                    fx: node.fx,
                    fy: node.fy
                }
            }
        )
        this.referenceFeedback(d.data, this.findParentNode)
        d3.event.on('drag', d => { this.drag(d, _target) }).on('end', d => {
            return this.dragEnd(d, _target)
        })

        if (!d3.event.active)
            this.simulation.alphaTarget(0.3).restart()
        this.checked_link = null
        // move dragged dom to top to trigger other nodes mouseover event
        d3.select(_target).lower()
        this.clearGuidesData()
        this.findSameRowOrLineNode(d)
    },

    drag (d, _target) {
        // if edit mode is turn on, don't run anything
        if (!this.enableEdit)
            return
        this.multipleDrag(this.ctrlCheckedNodes.concat(this.checked_node), d)
        this.resizerPosition()
        this.clearGuidesData()
        this.findSameRowOrLineNode(d)
    },

    /**
     * @description multiple nodes drag event
     * @author xinghua.wen
     */
    multipleDrag (nodes, dragedTarget) {
        // get all descendants according to the checked nodes (arguments[0])
        let descendantIds = Utils.flatten(
            nodes.map(
                _node => {
                    return _node.descendants().slice(1).map(
                        _child => {
                            return _child.id
                        }
                    )
                }
            )
        )
        nodes.forEach(
            node => {
                node.data.dragging = true
                let fx = node.id === dragedTarget.id ? d3.event.x : (descendantIds.indexOf(node.id) !== -1 ? node.fx : node.fx + d3.event.dx),
                    fy = node.id === dragedTarget.id ? d3.event.y : (descendantIds.indexOf(node.id) !== -1 ? node.fy : node.fy + d3.event.dy)
                
                let nodeUltimate = this.getCanvasUltimateCoor(fx, fy, node)
                fx = Math.min(Math.max(fx, nodeUltimate.x.min), nodeUltimate.x.max)
                fy = Math.min(Math.max(fy, nodeUltimate.y.min), nodeUltimate.y.max)
                // cache the coordinates before current node moved for compute shift
                let preX = node.fx, preY = node.fy
                node.fx = fx
                node.fy = fy
                if (node.children && node.children.length)
                    this.dragDescendants(node, node.fx - preX, node.fy - preY)
            }
        )
    },

    initMultipleNodesLocalPosition (nodes) {
        nodes.forEach(node => { this.initNodeLocalPosition(node) })
    },

    dragEnd (d, _target) {
        if (!d3.event.active) this.simulation.alphaTarget(0)

        let allCheckedNodes = this.ctrlCheckedNodes.concat([d])
        // restore fixed x、y coordinates
        this.initMultipleNodesLocalPosition(allCheckedNodes)
        this.resetReferenceFeedback()

        this.dragCollisionEvent(allCheckedNodes)
        
        // make the DOM element order match data after this.nodes get calculated
        let nodes = this.getD3Nodes()

        this.$nextTick(
            () => {
                nodes.order()
            }
        )
        // auto detect that if any group is collided by the node, if yes, add the group_id to the node
        if (!d.data.info[this.groupInfo.id ? this.groupInfo.id : 'group_id'])
            this.detectNodeCollideGroup(d)
        // this.checked_node = null
        this.hovered_node = null
        // d.data.dragging = false
        this.clearGuidesData()
    },

    dragCollisionEvent (nodes) {
        this.rectCollision()
        nodes.forEach(
            (node, index) => {
                node.data.dragging = false
                // if it is forbidden tnat  add child to the specied node
                if (!node.data.dragSuccess) {
                    this.resetDescendantsPosition(node)
                    this.redrawNodes()
                    this.simulation.nodes(this.nodes).restart()
                }
                // delete node.data.dragStartCoor
                // if (index === nodes.length - 1 && Object.keys(this.dragCollision).length)
                //     this.dragCollisionEvent(nodes)
            }
        )
    },

    clearGuidesData () {
        this.guides.horizontal.display = 'none'
        this.guides.virtical.display = 'none'
    },

    /**
     * @description add guideline for canvas while dragging
     */
    findSameRowOrLineNode (node) {
        let guideline = d3.line(), hasHorizontalLine = false, hasVirticalLine = false
        for (let index = 0; index < this.nodes.length; index++) {
            if (this.nodes[index].id === node.id)
                continue
            let comparedNode = this.getNodeCoorInfo(this.nodes[index])
            let draggedNode = this.getNodeCoorInfo(node)
            if (!hasHorizontalLine && (draggedNode.coor.x === comparedNode.coor.x || draggedNode.coor.x === comparedNode.centerPoint.x)) {
                this.guides.horizontal.display = 'block'
                hasHorizontalLine = true
                this.guides.horizontal.data = guideline([[draggedNode.coor.x, this.computeSizeOnZoom(0, 'y')], [draggedNode.coor.x, this.computeSizeOnZoom(this.height, 'y')]])
            }
            if (!hasHorizontalLine && (draggedNode.centerPoint.x === comparedNode.coor.x || draggedNode.centerPoint.x === comparedNode.centerPoint.x)) {
                this.guides.horizontal.display = 'block'
                hasHorizontalLine = true
                this.guides.horizontal.data = guideline([[draggedNode.centerPoint.x, this.computeSizeOnZoom(0, 'y')], [draggedNode.centerPoint.x, this.computeSizeOnZoom(this.height, 'y')]])
            }
            if (!hasVirticalLine && (draggedNode.coor.y === comparedNode.coor.y || draggedNode.coor.y === comparedNode.centerPoint.y)) {
                this.guides.virtical.display = 'block'
                hasVirticalLine = true
                this.guides.virtical.data = guideline([[this.computeSizeOnZoom(0, 'x'), draggedNode.coor.y], [this.computeSizeOnZoom(this.width, 'y'), draggedNode.coor.y]])
            }
            if (!hasVirticalLine && (draggedNode.centerPoint.y === comparedNode.coor.y || draggedNode.centerPoint.y === comparedNode.centerPoint.y)) {
                this.guides.virtical.display = 'block'
                hasVirticalLine = true
                this.guides.virtical.data = guideline([[this.computeSizeOnZoom(0, 'x'), draggedNode.centerPoint.y], [this.computeSizeOnZoom(this.width, 'y'), draggedNode.centerPoint.y]])
            }

            if (hasHorizontalLine && hasVirticalLine)
                return
            
            if (index === this.nodes.length - 1) {
                if (!hasHorizontalLine)
                    this.guides.horizontal.display = 'none'
                if (!hasVirticalLine)
                    this.guides.virtical.display = 'none'
            }
        }
    },

    computeSizeOnZoom (size, _property) {
        return parseInt((size - this.zoomTransform[_property]) / this.zoomTransform.k)
    },

    getNodeCoorInfo (node) {
        let centerPoint = DIAGRAM_UTILS.getCentPoint(node)
        return {
            coor: {x: parseInt(node.fx), y: parseInt(node.fy)},
            centerPoint: {x: parseInt(centerPoint.x), y: parseInt(centerPoint.y)}
        }
    },

    groupDragStart (d, _target) {
        d3.event.on('drag', d => { this.groupDrag(d, _target) }).on('end', d => {
            return this.groupDragEnd(d, _target)
        })
        if (!d3.event.active)
            this.simulation.alphaTarget(0.3).restart()
        d3.select(_target).lower()
    },

    groupDrag (d) {
        let group_id = this.groupInfo.id ? this.groupInfo.id : 'group_id'
        this.nodes.forEach(
            node => {
                if (node.data.info[group_id] && node.data.info[group_id] === d.group_id && node.data.pId === this.rootId) {
                    node.fx += d3.event.dx
                    node.fy += d3.event.dy
                    if (node.children && node.children.length)
                        this.dragDescendants(node, d3.event.dx, d3.event.dy)
                    this.resizerPosition()
                }
            }
        )
    },

    groupDragEnd (d) {
        let groups = d3.select(this.$el).selectAll('group-placeholder')
        this.$nextTick(
            () => {
                groups.order()
            }
        )
        if (!d3.event.active)
            this.simulation.alphaTarget(0)
    },

    /**
     * @description bind node doms with its data based on the data function of d3.js
     */
    getD3Nodes () {
        return d3.select(this.$el).select('g.node-container').selectAll('g.node').data(this.nodes, d => {
            return d.id
        })
    },

    /**
     * @description get canvas ultimate coors while checked node is dragging
     */
    getCanvasUltimateCoor (x, y, node) {
        let transformX = 0, transformY = 0, scale = 1, nodeWidth = node.data.width, nodeHeight = node.data.height
        if (this.zoomTransform) {
            transformX = this.zoomTransform.x
            transformY = this.zoomTransform.y
            scale = this.zoomTransform.k
        }

        return {
            x: {
                min: -transformX / scale,
                max: (this.width - nodeWidth * scale - transformX) / scale
            },
            y: {
                min: -transformY / scale,
                max: (this.height - nodeHeight * scale - transformY) / scale
            }
        }
    },

    /**
     * @description drag all descendants once specified node is dragged
     * @param [d] checked node Node obj
     * @param [xShift] checked node x-shift while dragging
     * @param [xShift] checked node y-shift while dragging
     */
    dragDescendants (d, xShift, yShift) {
        let descendants = d.descendants().slice(1)
        descendants.forEach(
            node => {
                // fix bug that checked node is stopped but its descendants still moving while drag the checked node to the borderpf canvas
                // node.fx = node.fx + d3.event.dx
                // node.fy = node.fy + d3.event.dy
                node.data.dragging = true
                node.fx = node.fx + xShift
                node.fy = node.fy + yShift
                // node.data._x = node.fx
                // node.data._y = node.fy
            }
        )
    },

    /**
     * @description batch reset all descendants of specified node to origin position
     */
    resetDescendantsPosition (d) {
        let distance_x = d.data.dragStartCoor.fx - d.fx
        let distance_y = d.data.dragStartCoor.fy - d.fy

        let descendants = d.descendants()
        descendants.forEach(
            node => {
                node.fx = node.data._x = node.fx + distance_x
                node.fy = node.data._y = node.fy + distance_y
            }
        )
    },

    /**
     * @description add event to canvas(svg),to add node when drag resource to canvas
     */
    initSvg () {
        let rootElement = document.body
        if (this.tipConfiguration.rootElement)
            rootElement = typeof this.tipConfiguration.rootElement === 'string' ? document.querySelector(this.tipConfiguration.rootElement) : this.tipConfiguration.rootElement
        this.tooltip = d3.tip()
            .attr('class', 'd3-tip')
            .html(d => {
                return this.initToolTipContent(d)
            })
            .rootElement(rootElement)
        
        // 画布事件
        let svg = d3.select('svg.hierarchical-digram')

        this.zoom = d3.zoom()
        .scaleExtent(this.scaleExtent)
        .on('.zoom', null)
        .on('zoom', this.zoomed)

        svg.on('mousedown', d => {
            this.checked_node = null
            this.checked_link = null
            this.ctrlCheckedNodes.splice(0, this.ctrlCheckedNodes.length)
            this.$emit('clickCanvas')
        })
        .on('contextmenu', d => {
            // prevent brower context menu to appear
            d3.event.preventDefault()
        })
        .call(this.zoom)
        .call(this.tooltip)
        .on('dblclick.zoom', null) // remove zoom on double click 

        // forbidden zoom while used wheel
        if (!this.allowWheelZoom)
            svg.on('wheel.zoom', null)

        d3.select(window)
            .on('keyup', d => {
            if (!this.keyboardFire)
                return
            d3.event.preventDefault()
            this.keyPressEvent()
        })
        if (this.gridSwitch)
            this.redrawGrids(this.width, this.height)
    },

    initToolTipContent (d) {
        if (d.tooltip)
            return d.tooltip
        // UCMP3-2353 add tooltip supports to nodes
        // UCMP3-2528 节点的tooltip信息为空，显示空内容，而不是显示 node (d) 整体信息
        if (d.data && d.data.info)
            return d.data.info[this.nodeTooltip] ? d.data.info[this.nodeTooltip] : ''
        return d
    },

    /**
     * @description initialize drag event of the canvas console 
     */
    initPanel () {
        let self = this
        d3.select('.top-panel').call(
            d3.drag()
                .on('start', function (d) {
                    let styles = d3.select(this).attr('style') ? d3.select(this).attr('style') : ''
                    if (styles) {
                        let styleArray = styles.split(';')
                        styleArray.forEach(
                            style => {
                                if (!style)
                                    return
                                
                                let value = style.split(':')[1]
                                if (value && style.match(/top/g))
                                    self.panel.top = value.replace('px', '') - '0'
                                if (value && style.match(/left/g))
                                    self.panel.left = value.replace('px', '') - '0'
                            }
                        )
                    }
                })
                .on('drag', function (d) {
                    self.panel.top = self.panel.top + d3.event.dy
                    self.panel.left = self.panel.left + d3.event.dx

                    self.panel.top = self.panel.top > 0 ? self.panel.top : 0
                    self.panel.left = self.panel.left > 0 ? self.panel.left : 0

                    d3.select(this).attr('style', d => {
                        return 'top:' + self.panel.top + 'px;' + 'left:' + self.panel.left + 'px;'
                    })
                    d3.select('.zoom-slider').attr('style', d => {
                        return 'top:' + self.panel.top + 'px;' + 'left:' + self.panel.left + 'px;'
                    })
                })
                .on('end', function () {

                })
        )
    },

    /**
     * @description get transform params of center canvas
     */
    getCanvasCenteredParams () {
        let viewport = this.$el.querySelector('.viewport')
        let box = viewport.getBBox()
        let scale = (this.height - 60) / box.height < (this.width - 60) / box.width ? (this.height - 60) / box.height : (this.width - 60) / box.width
        // UCMP3-434 修改 scaleExtent 变量错误导致的居中功能偶尔错乱的问题
        scale = this.scaleExtent[0] > scale ? this.scaleExtent[0] : scale
        scale = this.scaleExtent[1] < scale ? this.scaleExtent[1] : scale

        // UCMP3-2630 画布居中 scale 最大不能大于 1，增强体验性
        scale = scale > 1 ? 1 : scale
        let translate = [-box.x * scale + (this.width - box.width * scale) / 2, -box.y * scale + (this.height - box.height * scale) / 2]
        return {
            scale,
            translate
        }
    },

    /**
     * @description centered canvas
     */
    zoomExtent (callback) {
        let centeredParams = this.getCanvasCenteredParams()
        this.interpolateZoom(centeredParams, 700, callback)
    },

    interpolateZoom (params, duration = 700, callback = function () {}) {
        let self = this
        d3.select(this.$el).select('svg.hierarchical-digram')
            .transition()
            .duration(duration)
            .tween('custom', function () {
                let curZoom = d3.zoomTransform(d3.select(this).node())
                let kInter = d3.interpolate(curZoom.k, params.scale)
                let xInter = d3.interpolate(curZoom.x, params.translate[0])
                let yInter = d3.interpolate(curZoom.y, params.translate[1])

                return function (t) {
                    let transform = d3.zoomIdentity.translate(xInter(t), yInter(t)).scale(kInter(t))
                    self.zoomed(transform)
                }
            })
            .on('end', function () {
                d3.select(this).call(self.zoom.transform, d3.zoomIdentity.translate(params.translate[0], params.translate[1]).scale(params.scale))
                self.$nextTick(() => { callback() })
            })
    },

    initResizer () {
        let resizers = d3.select('.resizer')
        let self = this
        resizers
            .call(
                d3.drag()
                .subject(d => {
                    return {x: d3.event.x, y: d3.event.y}
                })
                .on('start', function (d) {
                    if (!d3.event.active)
                        self.simulation.alphaTarget(0.3).restart()
                    return self.rectResizeStart(d, this)
                })
                .on('drag', function (d) {
                    return self.rectResizing(d, this)
                })
                .on('end', function () {
                    self.simulation.alphaTarget(0)
                    self.checked_node.data._x = self.checked_node.fx
                    self.checked_node.data._y = self.checked_node.fy
                })
            )
    },

    rectResizeStart () {
        this.resizeDirection = this.getResizeDirection()
    },

    getResizeDirection (_class) {
        let allDirections = ['origin', 'topRight', 'corner', 'bottomLeft']
        let direct = allDirections.filter(
            item => {
                // fix bug that d3.event.sourceEvent.path is undefined while run on firefox
                // eslint-disable-next-line
                let path = d3.event.sourceEvent.path || d3.event.sourceEvent.composedPath && d3.event.sourceEvent.composedPath()
                if (d3.select(path[0]).classed(item))
                    return item
            }
        )[0]
        if (direct)
            return direct
        return null
    },

    rectResizeEnd () {
        this.resizeDirection = null
    },

    /**
     * @description resize node operation
     */
    rectResizing (d, resizer) {
        let scale = this.zoomTransform ? this.zoomTransform.k : 1
        let translateX = this.zoomTransform ? this.zoomTransform.x : 0
        let translateY = this.zoomTransform ? this.zoomTransform.y : 0

        let ultimate = this._getUltimateCoordinates(scale)
        if (this.resizeDirection === 'origin')
            this.originResize(ultimate.origin, translateX, translateY, scale)
        else if (this.resizeDirection === 'topRight')
            this.topRightResize(ultimate.topright, translateX, translateY, scale)
        else if (this.resizeDirection === 'corner')
            this.cornerResize(ultimate.corner, translateX, translateY, scale)
        else if (this.resizeDirection === 'bottomLeft')
            this.bottomLeftResize(ultimate.bottomLeft, translateX, translateY, scale)

        // auto extend parent node size if child node has crossed its border
        if (this.checked_node.parent.id !== this.rootId)
            this.autoExtendSize(this.checked_node.parent.data, this.checked_node.data)

        this.resizerPosition()
    },

    /**
     * @description get Ultimate Coordinates of checked node while resizing it
     */
    _getUltimateCoordinates (scale) {
        let checkedNode = this.findNodeById(this.checked_node.id)
        if (checkedNode && checkedNode.children && checkedNode.children.length) {
            let children = checkedNode.children
            let originCoors = this.getChildrenOriginCoordinates(children)
            let toprightX = this.getTopRightXCoordinate(children, scale)
            let cornerY = this.getCornerYCoordinate(children, scale)
            return {
                origin: {_x: originCoors._x - this.mergedNodeDefaultPadding.left, _y: originCoors._y - this.mergedNodeDefaultPadding.top},
                topright: {_x: toprightX + this.mergedNodeDefaultPadding.right, _y: originCoors._y - this.mergedNodeDefaultPadding.top},
                corner: {_x: toprightX + this.mergedNodeDefaultPadding.right, _y: cornerY + this.mergedNodeDefaultPadding.bottom},
                bottomLeft: {_x: originCoors._x - this.mergedNodeDefaultPadding.left, _y: cornerY + this.mergedNodeDefaultPadding.bottom}
            }
        }

        let defaultOriginCoors = this.getDefaultOriginCoordinates(scale)
        let defaultToprightXCoor = this.getDefaultTopRightXCoordinate(scale)
        let defaultCornerYCoor = this.getDefaultCornerYCoordinate(scale)
        return {
            origin: defaultOriginCoors,
            topright: {_x: defaultToprightXCoor, _y: defaultOriginCoors._y},
            corner: {_x: defaultToprightXCoor, _y: defaultCornerYCoor},
            bottomLeft: {_x: defaultOriginCoors._x, _y: defaultCornerYCoor}
        }
    },

    /**
     * get origin ultimate coordinates of the checked node which has children node
     */
    getChildrenOriginCoordinates (children) {
        let originXs = children.map(
                node => {
                    return node.fx
                }
            )
        let originYs = children.map(
            node => {
                return node.fy
            }
        )

        originXs.sort(
            (a, b) => {
                return a - b
            }
        )
        originYs.sort(
            (a, b) => {
                return a - b
            }
        )
        return {
            _x: originXs[0], _y: originYs[0]
        }
    },

    /**
     * get topright ultimate x_coordinate of the checked node which has children node
     */
    getTopRightXCoordinate (children) {
        let toprightXs = children.map(
            node => {
                return node.fx + node.data.width
            }
        )
        toprightXs.sort(
            (a, b) => {
                return a - b
            }
        )
        return toprightXs[toprightXs.length - 1]
    },

    /**
     * get corner ultimate y_coordinate of the checked node which has children node
     */
    getCornerYCoordinate (children) {
        let cornerYs = children.map(
            node => {
                return node.fy + node.data.height
            }
        )
        cornerYs.sort(
            (a, b) => {
                return a - b
            }
        )
        return cornerYs[cornerYs.length - 1]
    },

    /**
     * get origin ultimate coordinates of the checked node which has no children node or is not a container node
     */
    getDefaultOriginCoordinates () {
        let width = this.containerKeys.indexOf(this.checked_node.data.info[this.uniqueKey]) === -1 ? this.nodeDefaultSize.normal.width : this.nodeDefaultSize.container.width
        let height = this.containerKeys.indexOf(this.checked_node.data.info[this.uniqueKey]) === -1 ? this.nodeDefaultSize.normal.height : this.nodeDefaultSize.container.height
        let rightX = this.checked_node.fx + this.checked_node.data.width
        let BottomY = this.checked_node.fy + this.checked_node.data.height

        return {_x: rightX - width, _y: BottomY - height}
    },

    /**
     * get topright ultimate x_coordinate of the checked node which has no children node or is not a container node
     */
    getDefaultTopRightXCoordinate () {
        let width = this.containerKeys.indexOf(this.checked_node.data.info[this.uniqueKey]) === -1 ? this.nodeDefaultSize.normal.width : this.nodeDefaultSize.container.width

        return this.checked_node.fx + width
    },

    /**
     * get corner ultimate y_coordinate of the checked node which has no children node or is not a container node
     */
    getDefaultCornerYCoordinate () {
        let height = this.containerKeys.indexOf(this.checked_node.data.info[this.uniqueKey]) === -1 ? this.nodeDefaultSize.normal.height : this.nodeDefaultSize.container.height
        return this.checked_node.fy + height
    },

    /**
     * @description origin point(left-top) resize checked node group
     */
    originResize (_ultimate, translateX, translateY, scale) {
        let dragX = Math.min(_ultimate._x, (d3.event.x - translateX) / scale)
        let dragY = Math.min(_ultimate._y, (d3.event.y - translateY) / scale)
        let distanceX = this.checked_node.fx - dragX
        let distanceY = this.checked_node.fy - dragY
        this.checked_node.fx = dragX
        this.checked_node.fy = dragY
        this.checked_node.data.width = this.checked_node.data.width + distanceX
        this.checked_node.data.height = this.checked_node.data.height + distanceY
    },

    /**
     * @description origin point(top-right) resize checked node group
     */
    topRightResize (_ultimate, translateX, translateY, scale) {
        let DragY = Math.min(_ultimate._y, (d3.event.y - translateY) / scale)
        let dragX = Math.max(_ultimate._x, (d3.event.x - translateX) / scale)

        let distanceY = this.checked_node.fy - DragY

        this.checked_node.data.width = dragX - this.checked_node.fx
        this.checked_node.data.height = this.checked_node.data.height + distanceY
        this.checked_node.fy = DragY
    },

    cornerResize (_ultimate, translateX, translateY, scale) {
        let dragX = Math.max(_ultimate._x, (d3.event.x - translateX) / scale)
        let DragY = Math.max(_ultimate._y, (d3.event.y - translateY) / scale)

        this.checked_node.data.width = dragX - this.checked_node.fx
        this.checked_node.data.height = DragY - this.checked_node.fy
    },

    bottomLeftResize (_ultimate, translateX, translateY, scale) {
        let dragX = Math.min(_ultimate._x, (d3.event.x - translateX) / scale)
        let DragY = Math.max(_ultimate._y, (d3.event.y - translateY) / scale)

        let distanceX = this.checked_node.fx - dragX
        this.checked_node.fx = dragX
        this.checked_node.data.width = this.checked_node.data.width + distanceX
        this.checked_node.data.height = DragY - this.checked_node.fy
    },

    /**
     * @description add node、link with keyboard buttons
     */
    keyPressEvent (d) {
        if (d3.event.keyCode !== 8 && d3.event.keyCode !== 46)
            return
        if (this.checked_node)
            this.$emit('beforeDeleteNode', this.ctrlCheckedNodes.concat(this.checked_node), this.deleteCheckedNodeObj)
        else if (this.checked_link)
            this.$emit('beforeDeleteLink', this.checked_link, this.deleteCheckedLinkObj)
    },

    /**
     * @description delete checked nodes and with all related links
     */
    deleteCheckedNodeObj (nodes) {
        let allCheckedNodes = []
        nodes.forEach(
            node => {
                allCheckedNodes = allCheckedNodes.concat(node.descendants())
            }
        )
        let indexes = Array.from(new Set(allCheckedNodes.map(
            node => {
                return node.id
            }
        ))).map(
            deleteId => {
                return this.originNodeIndexs[deleteId]
            }
        ).sort(
            (a, b) => {
                return b - a
            }
        )

        indexes.forEach(
            index => {
                this.deleteRelatedLinks(this.originNodes[index])
                this.originNodes.splice(index, 1)
            }
        )
        
        this.$emit('afterDeleteNode', nodes)
        if (this.checked_node)
            this.checked_node = null
        if (nodes.length !== 1)
            this.ctrlCheckedNodes.splice(0, this.ctrlCheckedNodes.length)
    },

    /**
     * @description delete all links which related with checked node
     */
    deleteRelatedLinks (node) {
        let index = this.links.length
        while (index--) {
            if (this.links[index].source.id === node.id || this.links[index].target.id === node.id)
                this.links.splice(index, 1)
        }
    },

    /**
     * @description delete checked link
     */
    deleteCheckedLinkObj () {
        this.links.forEach(
            (item, index) => {
                if (item.source.id === this.checked_link.source.id && item.target.id === this.checked_link.target.id) {
                    this.links.splice(index, 1)
                    this.$emit('afterDeleteLink', this.checked_link)
                    this.checked_link = null
                }
            }
        )
    },

    /**
     * @description init d3 force layout,once used in mounted lifecycle method
     */
    initForce () {
        // initialize the D3 force layout
        this.forceLink = d3.forceLink(this.links)
        this.simulation = d3.forceSimulation(this.nodes)
            .force('link', this.forceLink.id(d => { return d.id }))
            .force('charge', d3.forceManyBody())
            .on('tick', this.tick)
            // .force('collison', this.rectCollision)
    },

    hierarchyNode (nodeData) {
        return d3.hierarchy(nodeData)
    },

    /**
     * @description callback event after detected collision
     */
    collison_callback (collisons) {
        if (!this.checked_node)
            return
        let caches = []

        this.ctrlCheckedNodes.concat([this.checked_node]).forEach(
            node => {
                if (collisons[node.id] && collisons[node.id].length > 1) {
                    console.log('not allowed')
                    this.setChildrenDragSuccess(node, !collisons[node.id].some(_node => { if (_node.data.pId !== node.id) return true }))
                } else if (collisons[node.id] && collisons[node.id].length === 1) {
                    let key_1 = node.id + ',' + collisons[node.id][0].id,
                    key_2 = collisons[node.id][0].id + ',' + node.id
                    if (caches.indexOf(key_1) !== -1 || caches.indexOf(key_2) !== -1)
                        return
                    this.addChildToNode(node, collisons[node.id][0])
                    caches.push(key_1)
                } else {
                    if (node.data.pId !== this.rootId) {
                        node.data.pId = this.rootId
                        this.$emit('afterNested', node.data, this.root.data)
                    }
                    this.setChildrenDragSuccess(node, true)
                }
                this.rerefIndicater.display = 'none'
            }
        )
        this.dragCollision = collisons
    },

    getDescendantsById (id) {
        let node = this.findNodeById(id)
        if (!node || !node.children)
            return []
        return node.descendants()
    }
  },

  watch: {
    simplifiedOriginNodes (newVal, oldVal) {
        DIAGRAM_UTILS.dynamicBindHierarchicy(this, newVal, oldVal)
    },

    /**
     * @description redraw all links after link data is changed
     */
    links () {
        this.redrawLinks()
        this.simulation.restart()
    },

    checked_node () {
        this.resetNodesOrLinks('.node', this.checked_node)
        this.resetNodesOrLinks('.link-g', this.checked_link)
        // auto adjust resizer position according checked node
        this.resizerPosition()
    },

    checked_link () {
        this.resetNodesOrLinks('.node', this.checked_node)
        this.resetNodesOrLinks('.link-g', this.checked_link)
    },

    groupsConfigsToString (newVal, oldVal) {
        let newgroupsConfigs = JSON.parse(newVal)
        let oldgroupsConfigs = JSON.parse(oldVal)
        //UCMP3-1486【编排管理】修改编排分层名称，再编辑查看已添加编排分层的应用编排，分层名称显示不正确
        //问题原因：此处忽略了oldgroupsConfigs为空对象{}的情况
        if (JSON.stringify(oldgroupsConfigs) === '{}') {
            this.redrawGroups()
            return
        }

        let newKeys = Object.keys(newgroupsConfigs), oldKeys = Object.keys(oldgroupsConfigs)
        let allKeys = Array.from(new Set(newKeys.concat(oldKeys)))

        for (let i = 0; i < allKeys.length; i++) {
            if (newKeys.indexOf(allKeys[i]) === -1 || oldKeys.indexOf(allKeys[i]) === -1) {
                this.redrawGroups()
                return
            }
        }
        // UCMP3-5622 分层的列表没有发生变化，节点的分层发生变更后，重启simulation，更新分层信息(位置、名称、颜色)
        if (!d3.event || !d3.event.active)
            this.simulation.alphaTarget(0.3).restart()
    },

    // 'hasGroupInfoNodes.length' () {
    //     this.redrawGroups()
    // },

    'ctrlCheckedNodes.length' (newVal, oldVal) {
        if (newVal === oldVal)
            return
        let nodes = d3.select(this.$el).select('g.node-container').selectAll('g.node')
        this.updateNodes(nodes)
    }
  },

  computed: {
    normalNodeSize () {
        if (this.nodeDefaultSize && this.nodeDefaultSize.normal && this.nodeDefaultSize.normal.width && this.nodeDefaultSize.normal.height)
            return { width: this.nodeDefaultSize.normal.width, height: this.nodeDefaultSize.normal.height }
        return { width: 60, height: 60 }
    },

    /**
    * @description icon font-size
     */
    contentIconSize () {
        return this.normalNodeSize.width - (this.normalNodeSize.width > 60 ? 10 : 6)
    },

    /**
     * @description transform nodeDefaultPadding format from array to obj, which is like {left: 10, right: 10, top: 10, bottom: 10} 
     */
    mergedNodeDefaultPadding () {
        let _default = { top: 40, right: 40, bottom: 40, left: 40 }

        if (Array.isArray(this.nodeDefaultPadding) && this.nodeDefaultPadding.length) {
            if (this.nodeDefaultPadding.length >= 1)
                _default.top = this.nodeDefaultPadding[0]
            if (this.nodeDefaultPadding.length >= 2)
                _default.right = this.nodeDefaultPadding[1]
            if (this.nodeDefaultPadding.length >= 3)
                _default.bottom = this.nodeDefaultPadding[2]
            if (this.nodeDefaultPadding.length === 4)
                _default.left = this.nodeDefaultPadding[3]
        }

        return _default
    },

    hasGroupInfoNodes () {
        return this.defaultNodes.filter(
            node => {
                if (node.info && node.info[this.groupInfo.key ? this.groupInfo.key : 'group_id'])
                    return node
            }
        )
    },

    /**
     * get all node group set of exited in canvas
     */
    groupIds () {
        return d3.set(this.hasGroupInfoNodes.map(
            node => {
                if (node.info)
                    return node.info[this.groupInfo.key ? this.groupInfo.key : 'group_id']
            }
        )).values()
    },

    groupsConfigsToString () {
        // UCMP3-5622 分层添加对应的节点id映射信息
        let groupsConfigs = JSON.parse(JSON.stringify(this.groupsConfigs))
        Object.keys(groupsConfigs).forEach(
            groupId => {
                groupsConfigs[groupId].nodeIds = this.originNodes.filter(node => node.info.group_id === groupId)
                .map(node => node.id)
            }
        )
        return JSON.stringify(groupsConfigs)
    },

    plainNodes () {
        let rst = []
        rst.push(this.rootData)
        rst = rst.concat(this.originNodes)
        return rst
    },

    originNodes: {
        set (val) {
            this.$emit('update:defaultNodes', val)
        },
        get () {
            return this.defaultNodes
        }
    },

    /**
     * @description origin node id & index,to find checked node from originNodes quickly
     */
    originNodeIndexs () {
        let rst = {}
        this.originNodes.map(
            (node, index) => {
                rst[node.id] = index
            }
        )
        return rst
    },

    originNodesObj () {
        let rst = {}
        this.originNodes.forEach(
            node => {
                rst[node.id] = node
            }
        )
        return rst
    },

    simplifiedOriginNodes () {
        return this.originNodes.map(
            node => {
                return node.id + ':' + node.pId
            }
        ).join(',')
    },

    nodeObjs () {
        let rst = {}
        this.nodes.forEach(
            d => {
                rst[d.id] = d
            }
        )
        return rst
    },

    links: {
        set (val) {
            this.$emit('update:defaultLinks', val)
        },
        get () {
            return this.defaultLinks
        }
    },

    nestedRelations () {
        return this.plainNodes.map(
            node => {
                return JSON.stringify({
                    id: node.id,
                    pId: node.pId
                })
            }
        )
    },

    nodePoints () {
        return this.defaultNodes.map(
            node => {
                return node._x + ',' + node._y
            }
        )
    }
  },

  created () {
    this.rootData.id = this.rootId
    this.valueline = d3.line()
      .x(d => { return d[0] })
      .y(d => { return d[1] })
      .curve(d3.curveLinearClosed)
    this.rebuildRootAndNodes()
    this.rectCollision = rectCollision(this.collison_callback)
        .size(function (d) { return [d.data.width, d.data.height] })
        .nodes(this.nodes)
    this.rectCollision.initialize(this.nodes)
    // add emit event to dispatch current diagram obj
    this.$emit('getDiagramObj', this)
  },

  mounted () {
    this.width = this.$el.offsetWidth
    this.height = this.$el.offsetHeight
    const element = this.$el

    this.$emit('getViewportDom', this.$el.querySelector('.viewport'))
    
    // UCMP3-4464 使用 ResizeSensor 监测 svg 容器div的尺寸变化，更新svg尺寸，不再使用onresize事件
    this.resizeSensor = new ResizeSensor(d3.select(this.$el).select('.svg-container').node(), () => {
            this.width = element.offsetWidth
            this.height = element.offsetHeight
            if (this.gridSwitch)
                this.redrawGrids(this.width, this.height)
    })
    this.initSvg()
    this.initPanel()
    // d3.dragDisable(this.$el)
    this.initResizer()
    this.initForce()
    this.redrawNodes()
    this.redrawLinks()
  },

  // UCMP3-2528 组件销毁前，先销毁tooltip的DOM
  destroyed () {
    // UCMP3-4464 消除对指定div的监测事件
    this.resizeSensor.detach(d3.select(this.$el).select('.svg-container').node())

    this.tooltip && this.tooltip.destroy()

    // UCMP3-3235 路由跳转后，在当前组件完全销毁前，可能仍然触发tooltip的绘制工作(如点击触发的拖拽)。针对该场景重写tooltip的内容，让其不再渲染DOM
    let temptip = {
        hide: () => {},
        show: () => {},
        direction: () => {
            return temptip
        },
        offset: () => {
            return temptip
        }
    }
    
    this.tooltip = temptip
  }
}
</script>
<style lang="scss" scoped>
.resizer {
    position: absolute;
    pointer-events: none;
    .resize-handler {
        position: absolute;
        pointer-events: auto;
        background-color: $fontContentGray;
        border: 1px solid $fontContentGray;
        width: 10px;
        height: 10px;
        &.origin {
            position: absolute;
            top: 0px;
            left: 0px;
            cursor: nw-resize;
        }
        &.topRight {
            position: absolute;
            top: 0px;
            right: 0px;
            cursor: ne-resize;
        }
        &.corner {
            position: absolute;
            bottom: 0px;
            right: 0px;
            cursor: se-resize;
        }
        &.bottomLeft {
            position: absolute;
            bottom: 0px;
            left: 0px;
            cursor: sw-resize;
        }
    }
}
.hierarchical-digram-box {
    width: 100%;
    height: 100%;
    position: relative;
}

.hierarchical-digram-container {
    width: 100%;
    // height: calc(100% - 40px);
    height: 100%;
    & > .svg-container {
        width: 100%;
        height: 100%;
    }
}

.top-panel {
    cursor: move;
    .zoom-title {
        width: 26px;
    }
}
.reference-indicater {
    position: absolute;
    .icon {
        font-size: 20px;
        &.ucmp-icon-complete {
            color: $running
        }
    }
}
</style>
