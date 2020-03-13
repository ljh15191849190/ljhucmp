<template lang="pug">
    div.tree-container(:id="id")
        svg.d3-tree
            g.container
        div.zoom-div
            el-button.zoom(type="default" size="mini" icon="el-icon-zoom-in" @click="zoomCtrl('in')")
            el-button.zoom(type="default" size="mini" icon="el-icon-zoom-out" @click="zoomCtrl('out')")
</template>
<script>
/**
 * @description 拓扑图tree
 */
import * as d3 from 'd3'
import Utils from '@server/Utils'
export default {
    name: 'TidyTopologyTree',
    props: ['treeData', 'addCluster'],
    data () {
        return {
            id: '',
            zoom: null,
            width: 1000,
            height: 450,
            index: 0,
            duration: 750,
            root: null,
            nodes: [],
            links: [],
            dTreeData: null,
            transform: null,
            nodepadding: {left: 16, top: 5},
            margin: { top: 20, right: 90, bottom: 30, left: 90 }
        }
    },
    methods: {
        /**
         * @description 获取构造根节点
         */
        getRoot () {
            let root = d3.hierarchy(this.treeData, d => {
                return d.children
            })
            root.x0 = this.height / 2
            root.y0 = 0
            return root
        },
        /**
         * @description 点击节点，展开or收缩
         */
        clickNode (d) {
            if (!d._children && !d.children)
                return
            if (d.children) {
                this.$set(d, '_children', d.children)
                d.children = null
            } else {
                this.$set(d, 'children', d._children)
                d._children = null
            }
            this.$nextTick(
                () => {
                    this.update(d)
                }
            )
        },
        diagonal (s, d) {
            return `M ${s.y} ${s.x}
                    C ${(s.y + d.y) / 2} ${s.x},
                    ${(s.y + d.y) / 2} ${d.x},
                    ${d.y} ${d.x}`
        },
        /**
         * @description 懒加载选中节点的子节点群
         * @arguments xhr拿到数据后，在 d.data.children添加子节点即可，具体参考 CloudProviderDetail.vue
         */
        addChildren (d) {
            this.addCluster(d, this.update)
        },
        /**
         * @description 获取构造的node数据和link数据
         * @augments [refreshRoot] 是否需要刷新根节点
         */
        getNodesAndLinks (refreshRoot = false) {
            // treemap generate new x、y coordinate according to root node,
            // so can‘t use computed propter of vue
            if (refreshRoot)
                this.root = this.getRoot()
            this.dTreeData = this.treemap(this.root)
            this.nodes = this.dTreeData.descendants()
            this.links = this.dTreeData.descendants().slice(1)
        },
        /**
         * @description 重新计算高度
         */
        calculateHeight (source) {
            let treeData = JSON.parse(JSON.stringify(this.treeData))
            let levelWidth = [1]
            let newClientHeight = -1
            this.height = document.getElementById(this.id).clientHeight

            let childCount = function (level, n) {
                let children = [], isExpend = true
                if (n.node_id === source.data.node_id && (source.children === null)) 
                    isExpend = false

                if (n.children) 
                    children = isExpend ? n.children : []
        
                if (n.data && n.data.children)
                    children = isExpend ? n.data.children : []

                if (children && children.length > 0) {
                    if (levelWidth.length <= level + 1) levelWidth.push(0)
                    levelWidth[level + 1] += children.length
                    children.forEach(d => {
                        childCount(level + 1, d)
                    })
                }
            }
            childCount(0, treeData)
            newClientHeight = d3.max(levelWidth) * 40 // 40 pixels per line  
            this.height = newClientHeight > this.height ? newClientHeight : this.height
        },
        /**
         * @description 数据与Dom进行绑定
         */
        update (source, refreshRoot) {
            //UCMP-751【云厂商】Vmware的云厂商拓扑显示有问题
            this.calculateHeight(source)
            this.getNodesAndLinks(refreshRoot)
            this.nodes.forEach(d => {
                d.y = d.depth * 180
            })
            // *************************** Nodes section *************************** //
            // Update the nodes...
            const svg = d3.select(this.$el).select('svg.d3-tree')
            const container = svg.select('g.container')
            let node = container.selectAll('g.node')
                .data(this.nodes, d => {
                    return d.id || (d.id = ++this.index)
                })
            // Enter any new sources at the parent's previous position.
            let nodeEnter = node.enter().append('g')
                .attr('class', 'node')
                .on('click', this.clickNode)
                .attr('transform', d => {
                    return 'translate(' + source.y0 + ',' + source.x0 + ')'
                })
            let propertyGraph = nodeEnter.append('g')
                .attr('class', 'field')
                .classed('node-pointer', d => {
                    return d.data.children || d.data._children
                })
            // Add rect for the nodes
            propertyGraph.append('rect')
                .attr('class', 'node_rect')
            // Add labels for the nodes
            propertyGraph.append('text')
                .attr('class', 'node_text')
                .attr('dy', '.35em')
                .attr('text-anchor', d => {
                    return d.children || d._children ? 'end' : 'start'
                })
                .attr('x', d => {
                    return this.nodepadding.left
                })
                .text(d => { return d.data.name })
                .append('tspan') // 添加懒加载子节点按钮
                .attr('class', 'arrow node-pointer')
                .attr('dx', '0.5em')
                .classed('hidden', d => {
                    return !d.data.cantoggle
                })
                .text('>')
                .on('click', d => {
                    return this.addChildren(d)
                })
            // add value graph for all values of cur source's fields
            let valueGraph = nodeEnter.append('g')
                .attr('class', 'field_value')
                .attr('transform', d => {
                    return 'translate(0, 0)'
                })

            valueGraph.append('rect')
                .attr('class', 'value_rect')
                .classed('no-height', d => {
                    return !d.data.value
                })

            valueGraph.append('text')
                .attr('class', 'value_text')
                .attr('dy', '.35em')
                .attr('x', d => {
                    return this.nodepadding.left
                })
                .text(d => {
                    return d.data.value
                })
            let nodeUpdate = nodeEnter.merge(node)

            // 计算图形尺寸，缓存在d中，以便画出合适尺寸的长方形
            nodeUpdate.select('.field').each(function (d, i) {
                // 如果已经获取节点dom信息，使用之前缓存的数据
                if (d.dd)
                    return
                d.dd = this.getBBox()
            })
            nodeUpdate.select('.field_value').each(function (d, i) {
                d.nodetext = this.getBBox()
            })

            // Transition to the proper position for the node
            nodeUpdate.transition()
                .duration(this.duration)
                .attr('transform', d => {
                    return 'translate(' + d.y + ',' + d.x + ')'
                })
            nodeUpdate.select('.field').transition()
                .duration(this.duration)
                .attr('transform', d => {
                    return 'translate(0, 0)'
                })

            // Update the node attributes and style
            nodeUpdate.select('rect.node_rect')
                .classed('children', d => { return !d._children && d.children ? true : false })
                .attr('x', d => {
                    return d.children || d._children ? -d.dd.width : 0
                })
                .attr('y', d => {
                    return 0 - d.dd.height / 2 - this.nodepadding.top
                })
                .attr('width', d => {
                    return d.dd.width + this.nodepadding.left * 2
                })
                .attr('height', d => {
                    return d.dd.height + this.nodepadding.top * 2
                })
            nodeUpdate.select('g.field_value').transition()
                .duration(this.duration)
                .attr('transform', d => {
                    return 'translate(' + (d.dd.width + this.nodepadding.left * 1 + 10) + ',0)'
                })
            nodeUpdate.select('rect.value_rect')
                .attr('x', d => {
                    return 0
                })
                .attr('y', d => {
                    return 0 - d.nodetext.height / 2 - this.nodepadding.top
                })
                .attr('width', d => {
                    return d.nodetext.width + this.nodepadding.left * 2
                })
                .attr('height', d => {
                    return d.nodetext.height + this.nodepadding.top * 2
                })
            // Remove any exiting nodes
            node.exit().select('g.field_value').transition()
                .duration(this.duration)
                .attr('transform', d => {
                    return 'translate(0, 0)'
                })
                .remove()
            let nodeExit = node.exit().transition()
                .duration(this.duration)
                .attr('transform', d => {
                    return 'translate(' + source.y + ',' + source.x + ')'
                })
                .remove()

            // On exit reduce the node circles size to 0
            nodeExit.select('.node_rect').attr('width', 1e-6).attr('height', 1e-6).remove()
            nodeExit.select('.value_rect').attr('width', 1e-6).attr('height', 1e-6).remove()
            nodeExit.select('.node_text').style('fill-opacity', 1e-6).remove()
            nodeExit.select('.value_text').style('fill-opacity', 1e-6).remove()

            // ****************** links section *************************** //
            // Update the links...
            let link = container.selectAll('path.link')
                .data(this.links, d => { return d.id })
            // Enter any new links at the parent's previous position.
            let linkEnter = link.enter().insert('path', 'g')
                .attr('class', 'link')
                .attr('id', d => {
                    return 'link_' + d.id
                })
                .attr('d', d => {
                    let o = {x: source.x0, y: source.y0}
                    return this.diagonal(o, o)
                })
            // UPDATE
            let linkUpdate = linkEnter.merge(link)
            // Transition back to the parent element position
            linkUpdate.transition()
                .duration(this.duration)
                .attr('d', d => { return this.diagonal(d, d.parent) })
            // Remove any exiting links
            let linkExit = link.exit().transition()
                .duration(this.duration)
                .attr('d', d => {
                    let o = {x: source.x, y: source.y}
                    return this.diagonal(o, o)
                })
            linkExit.remove()
            this.nodes.forEach(d => {
                d.x0 = d.x
                d.y0 = d.y
            })
        },
        /**
         * @description control the canvas zoom to up or down
         */
        zoomed () {
            d3.select(this.$el).select('g.container').attr('transform', d3.event.transform)
        },
        /**
         * @description 缩小放大事件
         * @augments [symbal] 放大缩小标志
         */
        zoomCtrl (symbal) {
            let scale = symbal === 'in' ? 1.1 : 0.8
            const svg = d3.select(this.$el).select('svg.d3-tree')
            this.zoom.scaleBy(svg, scale)
        }
    },
    created () {
        this.id = Utils.uuid()
    },
    mounted () {
        this.width = document.getElementById(this.id).clientWidth
        this.height = document.getElementById(this.id).clientHeight
        const svg = d3.select(this.$el).select('svg.d3-tree')
            .attr('width', this.width)
            .attr('height', this.height)
        const transform = d3.zoomIdentity.translate(this.margin.left, this.margin.top).scale(1)
        const container = svg.select('g.container')
        // init zoom behavior, which is both an object and function
        this.zoom = d3.zoom()
            .scaleExtent([1 / 2, 8])
            .on('zoom', this.zoomed)
        container.transition().duration(750).call(this.zoom.transform, transform)
        svg.call(this.zoom)
        this.root = this.getRoot()
        this.update(this.root)
    },
    computed: {
        treemap () {
            return d3.tree().size([this.height, this.width])
        }
    }
}
</script>
<style lang="scss">
.tree-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    .arrow {
        font-family: "iconfont-ucmp" !important;
        speak: none;
        font-style: normal;
        font-weight: 400;
        font-variant: normal;
        text-transform: none;
        line-height: 1;
        vertical-align: baseline;
        display: inline-block;
        -webkit-font-smoothing: antialiased;
        &.hidden {
            display: none;
        }
    }
}
</style>
