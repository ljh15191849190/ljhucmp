import * as d3 from 'd3-quadtree'
/* eslint-disable */
export default function RectCollision (callback, localCoor) { // UCMP3-6118 localCoor 是否使用本地节点位置(data._x)
    let nodes, sizes, iterateNodes, env
    let size = constant([0, 0])
    let strength = 1
    let iterations = 1

    function force () {
        let node, size, xi, yi
        let collisions = {}
        let i = -1
        while (++i < iterations)
            iterate()
        
        function iterate () {
            let i = -1
            let tree = d3.quadtree(nodes, xCenter, yCenter).visitAfter(prepare)
            iterateNodes = !iterateNodes || !iterateNodes.length ? nodes : iterateNodes
            while (++i < iterateNodes.length) {
                node = iterateNodes[i]
                size = sizes[node.id]
                xi = xCenter(node)
                yi = yCenter(node)

                tree.visit(apply)
            }
            callback && callback(collisions, iterateNodes) // UCMP3-6118 返回遍历节点
        }

        function prepare (quad) {
            if (quad.data)
                quad.size = sizes[quad.data.id]
            else {
                quad.size = [0, 0]
                let i = -1
                while (++i < 4) {
                    if (quad[i] && quad[i].size) {
                        quad.size[0] = Math.max(quad.size[0], quad[i].size[0])
                        quad.size[1] = Math.max(quad.size[1], quad[i].size[1])
                    }
                }
            }
        }

        function apply (quad, x0, y0, x1, y1) {
            let data = quad.data
            let xSize = (size[0] + quad.size[0]) / 2
            let ySize = (size[1] + quad.size[1]) / 2

            if (data && data.id !== node.id) { // UCMP3-6118 条件放宽，只要不是当前象限指定的节点即可
                let x = xi - xCenter(data)
                let y = yi - yCenter(data)
                let xd = Math.abs(x) - xSize
                let yd = Math.abs(y) - ySize

                if (xd < 0 && yd < 0) {
                    collisions[node.id] = !collisions[node.id] ? [] : collisions[node.id]
                    collisions[node.id].push(data)
                    collisions[data.id] = !collisions[data.id] ? [] : collisions[data.id]
                    collisions[data.id].push(node)
                }
            }
            return x0 > xi + xSize || y0 > yi + ySize || x1 < xi - xSize || y1 < yi - ySize
        }
    }

    force.initialize = function (_) {
        sizes = sizeConstructor(nodes = _)
    }

    force.size = function (_) {
        return arguments.length ? (size = typeof _ === 'function' ? _ : constant(_), force) : size
    }
    force.nodes = function (_) {
        sizes = sizeConstructor(nodes = _)
        return arguments.length ? force : nodes
    }
    force.strength = function (_) {
        return (arguments.length ? (strength = +_, force) : strength)
    }
    force.iterations = function (_) {
        return (arguments.length ? (iterations = +_, force) : iterations)
    }
    force.iterateNodes = function (_) {
        return (arguments.length ? (iterateNodes = _, force) : iterateNodes)
    }
    force.env = function (_) {
        return (arguments.length ? (env = _, force) : env)
    }
    force.curEnv = function (_) {
        return env
    }
    function xCenter (d) {
        return (localCoor ? d.data._x : (d.x + d.vx)) + sizes[d.id][0] / 2 
    }
    function yCenter (d) { 
        return (localCoor ? d.data._y : (d.y + d.vy)) + sizes[d.id][1] / 2 
    }
    function sizeConstructor (nodes) {
        let rst = {}
        nodes.forEach(d => { rst[d.id] = size(d) })
        return rst
    }
    function constant (_) {
        return function () { return _ }
    }

    return force
}
