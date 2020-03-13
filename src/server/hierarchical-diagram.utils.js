import Utils from './Utils'
import * as d3 from 'd3-shape'

class HierarchicalUtils {
    getRectCoordinates (coors, distance = 20) {
        if (!coors || !Array.isArray(coors))
            return []
        if (coors.length < 4)
            return coors
        let max_x = null, min_y = null, max_y = null, min_x = null
        coors.forEach(
            coor => {
                if (!max_x) {
                    max_x = coor[0]
                    max_y = coor[1]
                    min_x = coor[0]
                    min_y = coor[1]
                } else {
                    if (coor[0] >= max_x)
                        max_x = coor[0] 
                    else if (coor[0] <= min_x)
                        min_x = coor[0]
                    
                    if (coor[1] >= max_y)
                        max_y = coor[1]
                    else if (coor[1] <= min_y)
                        min_y = coor[1]
                }
            }
        )
        min_x -= distance
        min_y -= distance
        max_y += distance
        max_x += distance

        return [
            [min_x, min_y], [max_x, min_y], [max_x, max_y], [min_x, max_y]
        ]
    }

    /**
     * @description 普通节点集合数据与d3-hierarchy 层次类型的节点集合数据双向绑定函数；处理节点增加(拖拽增加、克隆)、删除以及拖拽位置变化等交互
     * 当节点列表数据发生变化(数组长度|对象属性变更)后，触发该函数
     * 详细介绍 http://192.168.3.56/leaptocloud/ucmp-vue-ui/blob/dev/src/components/common/flowchart/hierarchicalDiagram.md#层次拓扑图节点数据观察机制

     * @param {*} _diagram 
     * @param {*} _newSimpOriginNodeString 
     * @param {*} _oldSimpOriginNodeString 
     */
    dynamicBindHierarchicy (_diagram, _newSimpOriginNodeString, _oldSimpOriginNodeString) {
        // 变化后的节点
        let newSimpOriginNodes = _newSimpOriginNodeString ? _newSimpOriginNodeString.split(',') : []
        // 变化前的节点
        let oldSimpOriginNodes = _oldSimpOriginNodeString ? _oldSimpOriginNodeString.split(',') : []

        if (!Array.prototype.get_node_ids) {
            Array.prototype.get_node_ids = function () {
                return this.map(
                    ids => {
                        return ids.split(':')[0]
                    }
                )
            }
        }

        // 节点数量发生变化
        if (newSimpOriginNodes.length !== oldSimpOriginNodes.length) {
            let newNodeIds = newSimpOriginNodes.get_node_ids()
            let oldNodeIds = oldSimpOriginNodes.get_node_ids()

            let extraNodeIds = Utils.getArrDifference(newNodeIds, oldNodeIds)

            // added one node according clone node or drag
            // 画布节点增加(通过拖拽到画布或者节点克隆功能)
            if (newSimpOriginNodes.length > oldSimpOriginNodes.length) {
                // 变化前节点没有数据，直接使用变化后的节点列表初始化数据
                if (!oldSimpOriginNodes.length)
                    _diagram.rebuildRootAndNodes()
                else {
                    extraNodeIds.forEach(
                        nodeId => {
                            let hierParentNode = _diagram.findNodeById(_diagram.originNodesObj[nodeId].pId)
                            if (!hierParentNode)
                                hierParentNode = _diagram.root
                            hierParentNode.add_child_node(_diagram.originNodesObj[nodeId], [_diagram.originNodesObj[nodeId]._x, _diagram.originNodesObj[nodeId]._y],
                                _diagram.assignPositionById)
                        }
                    )
                }
            } else if (newSimpOriginNodes.length < oldSimpOriginNodes.length) { // 有节点被删除
                // delete one node
                extraNodeIds.forEach(
                    nodeId => {
                        _diagram.findNodeById(nodeId).delete_cur_node()
                    }
                )
            }

            // 节点数量变更且相关数据处理后，重绘画布节点并重启simulation force布局
            _diagram.nodes = _diagram.root.descendants().slice(1)
            _diagram.redrawNodes()
            _diagram.redrawGroups()
            _diagram.simulation.nodes(_diagram.nodes).restart()
        } else { // 节点数量没有发生变化，考虑是拖拽引起的某节点嵌套导致父节点发生变更
            // 节点的父级id发生变化
            let changedParentNodeByOrder = Utils.getArrDifferenceByOrder(newSimpOriginNodes, oldSimpOriginNodes)
            let newChangedParentNodes = changedParentNodeByOrder[0], oldChangedParentNodes = changedParentNodeByOrder[1]
            if (newChangedParentNodes.length !== oldChangedParentNodes.length)
                return
            
            newChangedParentNodes.forEach(
                nodeIdAndPid => {
                    let simpNode = { 
                        id: nodeIdAndPid.split(':')[0],
                        pId: nodeIdAndPid.split(':')[1]
                    }

                    let checkedNode = _diagram.nodeObjs[simpNode.id], parentNode = simpNode.pId === _diagram.root.id ? _diagram.root : _diagram.nodeObjs[simpNode.pId]
                    if (checkedNode && parentNode) {
                        checkedNode.changeParent(parentNode)
                        _diagram.autoExtendSize(parentNode.data, checkedNode.data)
                    }
                }
            )
        }
    }

    /**
     * @description 根据连线数据得到绘制path的数据
     * @param {*} d 
     */
    linkTick (d) {
        let sourceCent = this.getCentPoint(d.source)
        let targetCent = this.getCentPoint(d.target)
        let linkLine = d3.line()
            .x(d => { return d[0] })
            .y(d => { return d[1] })
            // .curve(d3.curveBasis)
        let points = []
        if (!d.format || d.format === 'straight')
            points = this.brokenLinkTick(d, sourceCent, targetCent)
        else
            points = this.straightLinkTick(d, sourceCent, targetCent)

        return linkLine(points)
    }

    /**
     * 根据source和target节点位置以及尺寸计算直线连线的起始位置
     * 详见层次拓扑图库说明文档 http://192.168.3.56/leaptocloud/ucmp-vue-ui/blob/dev/src/components/common/flowchart/hierarchicalDiagram.md#连线位置算法
     * @param {*} d 
     * @param {*} sourceCent 
     * @param {*} targetCent 
     */
    straightLinkTick (d, sourceCent, targetCent) {
        let startX = 0, startY = 0, endX = 0, endY = 0
        let deltaX = targetCent.x - sourceCent.x
        let deltaY = targetCent.y - sourceCent.y

        if (Math.abs(deltaY / deltaX) >= d.source.data.height / d.source.data.width) {
            let compareR = d.source.data.height / 2 * deltaY / Math.abs(deltaY)
            startY = sourceCent.y + compareR
            startX = compareR * deltaX / deltaY + sourceCent.x
        } else {
            let compareR = d.source.data.width / 2 * deltaX / Math.abs(deltaX)
            startX = sourceCent.x + compareR
            startY = compareR * deltaY / deltaX + sourceCent.y
        }
        if (Math.abs(deltaY / deltaX) <= d.target.data.height / d.target.data.width) {
            let compareR = d.target.data.width / 2 * deltaX / Math.abs(deltaX)
            endX = targetCent.x - compareR
            endY = targetCent.y - compareR * deltaY / deltaX
        } else {
            let compareR = d.target.data.height / 2 * deltaY / Math.abs(deltaY)
            endY = targetCent.y - compareR
            endX = targetCent.x - compareR * deltaX / deltaY
        }
        return [[startX, startY], [endX, endY]]
    }

    /**
     * 折线打点设计方案
     * 详见层次拓扑图库说明文档 http://192.168.3.56/leaptocloud/ucmp-vue-ui/blob/dev/src/components/common/flowchart/hierarchicalDiagram.md#连线位置算法
     * @param {*} d 连线数据 {id, source, target}
     * @param {*} sourceCent source中心点 {x, y}
     * @param {*} targetCent target中心点 {x, y}
     */
    brokenLinkTick (d, sourceCent, targetCent) {
        let xDistance = Math.abs(targetCent.x - sourceCent.x) - (d.source.data.width + d.target.data.width) / 2,
        yDistance = Math.abs(targetCent.y - sourceCent.y) - (d.source.data.height + d.target.data.height) / 2,
        maxDistance = 20

        let source = [d.source.fx + d.source.data.width, sourceCent.y], sourceBroken = [d.source.fx + d.source.data.width + xDistance / 2, sourceCent.y],
        targetBroken = [d.source.fx + d.source.data.width + xDistance / 2, targetCent.y], target = [d.target.fx, targetCent.y]
        if (xDistance >= maxDistance || yDistance >= maxDistance) {
            if ((sourceCent.x - targetCent.x) - (d.source.data.width + d.target.data.width) / 2 >= maxDistance) {
                source[0] = d.source.fx
                sourceBroken[0] = targetBroken[0] = d.target.fx + d.target.data.width + xDistance / 2
                target[0] = d.target.fx + d.target.data.width
            } else if ((sourceCent.y - targetCent.y) - (d.source.data.height + d.target.data.height) / 2 >= maxDistance) {
                source[0] = sourceBroken[0] = sourceCent.x
                source[1] = d.source.fy
                sourceBroken[1] = targetBroken[1] = d.target.fy + d.target.data.height + yDistance / 2
                target[0] = targetBroken[0] = targetCent.x
                target[1] = d.target.fy + d.target.data.height
            } else if ((targetCent.y - sourceCent.y) - (d.source.data.height + d.target.data.height) / 2 >= maxDistance) {
                source[0] = sourceBroken[0] = sourceCent.x
                source[1] = d.source.fy + d.source.data.height
                sourceBroken[1] = targetBroken[1] = d.source.fy + d.source.data.height + yDistance / 2
                target[0] = targetBroken[0] = targetCent.x
                target[1] = d.target.fy
            }
        } else {
            let addedDistance = 30
            if (sourceCent.x - targetCent.x >= 0 && (d.target.fy + d.target.data.width + maxDistance <= sourceCent.y || d.target.fy - maxDistance >= sourceCent.y)) {
                source[0] = d.source.fx
                source[1] = sourceBroken[1] = sourceCent.y
                sourceBroken[0] = targetBroken[0] = (d.target.fx >= d.source.fx ? d.source.fx : d.target.fx) - addedDistance
                target[1] = targetBroken[1] = targetCent.y
                target[0] = d.target.fx
            } else if (sourceCent.x - targetCent.x < 0 && (d.target.fy + d.target.data.width + maxDistance <= sourceCent.y || d.target.fy - maxDistance >= sourceCent.y)) {
                source[0] = d.source.fx + d.source.data.width
                source[1] = sourceBroken[1] = sourceCent.y
                sourceBroken[0] = targetBroken[0] = d.target.fx + d.target.data.width + addedDistance
                targetBroken[1] = target[1] = targetCent.y
                target[0] = d.target.fx + d.target.data.width
            } else {
                source[0] = sourceBroken[0] = sourceCent.x
                source[1] = d.source.fy
                sourceBroken[1] = targetBroken[1] = (d.target.fy >= d.source.fy ? d.source.fy : d.target.fy) - addedDistance
                targetBroken[0] = target[0] = targetCent.x
                target[1] = d.target.fy
            }
        }
        return [source, sourceBroken, targetBroken, target]
    }

    /**
     * @description 获取图形的中心点(圆心)
     */
    getCentPoint (node) {
        return { x: node.fx + node.data.width / 2, y: node.fy + node.data.height / 2 }
    }
}

export default new HierarchicalUtils()
