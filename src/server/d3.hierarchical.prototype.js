import * as d3 from 'd3'

/**
 * @description delete checked node
 */
d3.hierarchy.prototype.delete_cur_node = function (_custom_delete_event) {
    let to_delete_node = this, children = to_delete_node.parent.children
    let _ancestors = to_delete_node.parent.ancestors()
    let _root = _ancestors[_ancestors.length - 1]

    if (children.length === 1)
        to_delete_node.parent.computeDepth()
    for (let index = children.length - 1; index >= 0; index--) {
        if (children[index].id === to_delete_node.id)
            children.splice(index, 1)
    }

    _root.eachBefore(computeHeight)

    _custom_delete_event && _custom_delete_event()
}

/**
 * @description add node to checked node children
 */
d3.hierarchy.prototype.add_child_node = function (_data, _coors, _custom_add_child_node_event) {
    let hierNode = d3.hierarchy(_data)
    hierNode.id = _data.id
    hierNode.fx = _coors ? _coors[0] : null
    hierNode.fy = _coors ? _coors[1] : null
    let _ancestors = this.ancestors()
    let _root = _ancestors[_ancestors.length - 1]
    _root.each(
        d => {
            if (_data.pId === d.id) {
                if (!d.children)
                    d.children = []
                d.children.push(hierNode)

                hierNode.parent = d
                hierNode.computeDepth()
            }
        }
    )
    _root.eachBefore(computeHeight)
    _custom_add_child_node_event && _custom_add_child_node_event(hierNode)
}

/**
 * @description compute height property of the node according to rule of d3.hierarchy
 * @param {*} node 
 */
let computeHeight = function (node) {
    let height = 0
    do node.height = height
    while ((node = node.parent) && (node.height < ++height))
}

/**
 * @description compute depth property of all ancestors nodes according to rule of d3.hierarchy
 * @param {*} node 
 */
d3.hierarchy.prototype.computeDepth = function () {
    let node = this
    let ancestors = node.ancestors().reverse()
    for (let index = 0; index < ancestors.length; index++)
        ancestors[index].depth = index
}

d3.hierarchy.prototype.changeParent = function (newParentNode) {
    let checkedNode = this, oldParentNode = checkedNode.parent

    for (let i = oldParentNode.children.length - 1; i >= 0; i--) {
        if (oldParentNode.children[i].id === checkedNode.id) {
            oldParentNode.children.splice(i, 1)
            checkedNode.parent = newParentNode
            if (!newParentNode.children)
                newParentNode.children = []
            newParentNode.children.push(checkedNode)

            return
        }
    }

    let _ancestors = checkedNode.ancestors()
    let _root = _ancestors[_ancestors.length - 1]
    _root.eachBefore(computeHeight)
}

/**
 * @description init node fixed position according to the data obj（_x、_y）which happened in init user-defined data to d3-hierarchy format data
 * @author xinghua.wen
 */
d3.hierarchy.prototype.init_fixed_position = function () {
    this.fx = this.data._x !== undefined ? this.data._x : null
    this.fy = this.data._y !== undefined ? this.data._y : null
}

/**
 * @description assign fixed position automatically on nodes which has no it
 * @author xinghua.wen
 */
d3.hierarchy.prototype.autoAssignPosition = function (_padding, callback) {
    let checkedNode = this
    checkedNode.computePosition(_padding)
    callback && callback(checkedNode)
}

d3.hierarchy.prototype.computePosition = function (_padding) {
    let checkedNode = this
    if (checkedNode.fx && checkedNode.fy)
        return
    let parent_coors = {
        fx: checkedNode.parent.fx ? checkedNode.parent.fx : 0,
        fy: checkedNode.parent.fy ? checkedNode.parent.fy : 0
    }
    let virticalDistance = _padding.top + (checkedNode.parent.data.height - _padding.top - checkedNode.data.height) / 2
    checkedNode.fy = parent_coors.fy + virticalDistance

    let base_left = (checkedNode.parent.data.width - checkedNode.data.width) / 2

    let hasPotionChildren = checkedNode.parent.children.filter(
        node => {
            if (node.fx)
                return node
        }
    )

    // UCMP-1581 修复oracle 蓝图实例拓扑图 oracle、weblogic重叠显示，且遮盖云主机的bug
    checkedNode.fx = hasPotionChildren.length === checkedNode.parent.children.length ? parent_coors.fx : parent_coors.fx + (checkedNode.data.width + 10) * hasPotionChildren.length + base_left
}
export default d3
