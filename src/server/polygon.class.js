/**
 * @description 力导向流程拓扑图多边形配置类
 */
export default class Polygon {
    constructor (key, name, config, textConfig, text) {
        this.key = key // 多边形的唯一标志
        this.name = name // svg节点名称 rect|circle|polygon等
        this.config = config // 配置，包含fill|stroke|width|height|path等信息
        this.textConfig = textConfig // 文字显示配置
        this.text = text // 文字        
    }
}
