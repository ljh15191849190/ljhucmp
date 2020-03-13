# 层次拓扑图(应用编排)API

    > HierarchicalDiagram.vue 是基于 d3.js 实现的层次流程拓扑图绘制、交互的Vue组件。该组件与实际业务(应用编排)解耦，重心在拓扑图本身，包含画布功能、节点交互(增加、删除、拖拽、嵌套)以及连线交互(增加、删除)，对外暴露接口方便实现业务功能增强。

## 关键功能
* 内置渲染引擎，然别处理画布节点、连线、栅格背景以及节点分组(编排分层)的绘制功能
* 内置节点拖拽
* 内置画布伸缩平移，可设置伸缩边界、是否允许滚轮伸缩、是否允许双击画布伸缩等
* 基于d3层次布局的数据结构，支持节点嵌套交互

## 配置参数

| 参数(Props)      | 说明          | 类型      | 必选|可选值                           |  默认值  |
|---------- |-------------- |---------- |---|---|--------------------------------  |
| uniqueKey     | 节点数据的类别属性           | string |否| — | key |
| containerKeys | 能够嵌套其他节点的节点key集合 | array<string> | 否|— | []|
| label | 节点的名称key | srting | 否| - |'label'|
|defaultNodes | 节点数据源 | array<any> | 是| - | []
|defaultLinks | 节点连线数据源 | array<any> | 是| - | []
|scaleExtent | 画布可伸缩范围 | array | 否 | - |[0.5, 5]|
|enableEdit | 是否允许编辑(节点拖拽)| boolean | 否 | - |true|
|rootId | 虚拟根节点的id | string | 否 | - |自动生成uuid|
|allowWheelZoom| 是否允许鼠标滚轮伸缩 | boolean | 否| - |true|
|gridSwitch |是否使用栅格背景| boolean | 否| - |false|
|canNestNodeRule | 根据业务规则校验选中的节点是否能够被悬浮的节点嵌套 | function | 否|- | false|
|beforeAddLink | 添加连线前的钩子函数 | function | 否|- | -|

## 渲染引擎
| 事件名称 | 说明 | 参数 |返回值|
|---------- |-------- |---------- |------|
| redrawNodes | 根据节点数据重绘画布节点Dom | - | -|
| redrawLinks | 根据连线数据重绘画布连线Dom | - | -|
| redrawGrids | 根据画布的伸缩、平移尺寸重绘栅格背景 | - | -|
| redrawGroups | 根据分组信息重绘节点分组Dom | - | - |

## 图示添加节点
![增加节点流程](http://easycloud.jios.org:38889/download/attachments/29264088/image2019-9-12_14-5-15.png "增加节点流程")

## 连线位置算法
两个节点的连线本质上是两个节点的中心点(对于circle的图形就是圆心)进行连线。为了实现更好的视觉体验，需要隐藏连线与节点重合的部分，也就需要计算连线与节点交叉的点作为连线的起始位置，如下图所示的红点。

* 直线类型的连线

![直线连线两种场景](http://easycloud.jios.org:38889/download/attachments/29264088/image2019-9-17_11-19-10.png "直线连线两种场景")

如上图所示，直线连线有两个场景(起始点的计算方式相同)：

    a. 红色交叉点在矩形的宽(width)上, 代码判断条件是：Math.abs(deltaY / deltaX) >= source.height / source.width

    b. 红色交叉点在矩形的高(height)上, 代码判断条件是：Math.abs(deltaY / deltaX) < source.height / source.width
    以上条件来源于三角函数的相关定理，计算图示如下,详细计算过程不再赘述：


![三角函数定理](http://easycloud.jios.org:38889/download/attachments/29264088/image2019-9-16_17-52-10.png "三角函数定理")

* 折线类型连线
折线类型的连线相对直线增加了两个转折点，即便如此，位置计算仍旧相对简单。

如下图所示，起始位置的x(或y)坐标与节点的中心点一致，y(或x)为节点中心点的一半。折点的位置也较为简单，取节点距离的一半作为位移。

![折点连线图示](http://easycloud.jios.org:38889/download/attachments/29264088/image2019-9-17_13-44-22.png "折点连线图示")

更多关于折线连线的场景分析请查阅组件库拓扑图的代码注释(standard-ui/src/d3/utils/link.ts brokenLinkTick)

### [碰撞检测](https://github.com/xswei/d3-force/blob/master/README.md#forceCollide)

> 比较两个节点是否发生碰撞，是对两个节点的中心点距离(x、y)分别和两个节点的长度、高度的和(1/2)进行比较，如果前者均小于后者，则判定发生碰撞

基于四叉树的碰撞检测在层次拓扑图中用来判断两个指定节点是否触发了嵌套的交互。

对所有节点数据进行遍历也能达到类似的效果，但是节点数量增多可能带来性能代价。基于四叉树([d3-quadtree](https://github.com/xswei/d3-quadtree/blob/master/README.md#quadtree))的碰撞检测在画布中找寻与指定节点物理位置最近的节点，则可以优化规避这个问题。

碰撞检测的文档是针对circle图形的碰撞检测实现，层次拓扑图的节点都是 rect，可参考的实现示例如下：

[碰撞检测 rect 实例](https://bl.ocks.org/cmgiven/547658968d365bcc324f3e62e175709b)


## 画布边界检测

## 层次拓扑图节点数据观察机制


d3.js 专注于使用现有数据进行数据处理、绘制图形的工作，并不处理数据变化观察，因此对于节点数据的增加、删除、父级指向的变更需要我们自己处理。

为了实现对节点数据的集中处理，以便达到类似数据与DOM绑定的关系，特制定以下机制，详细代码在 src/server/hierarchical-diagram.utils.js 中。对于节点的增、删、父级指向改变不需要手动更新DOM(主动使用redrawNodes等函数)，以减少不必要的渲染次数。只需改变节点的内部数据即可，之后自动触发该机制，处理DOM的变化或者数据的更新(hierarchi Node 数据变更 parent 和 children)
    
    
![节点数据观察机制](http://easycloud.jios.org:38889/download/attachments/29264088/%E6%9C%AA%E5%91%BD%E5%90%8D%E6%96%87%E4%BB%B6.png "节点数据观察机制")

##  钩子函数
* 添加节点
    * `beforeAddNode` 添加节点前 
    
        参数： (data, parentNode, [x, y])  

        需要使用 v-bind 进行事件绑定

        在改函数中可以做一些业务的判断工作，比如是否允许添加节点...etc 然后在当前函数中使用层次拓扑图的 addNode 函数来主动添加节点

    * `addNode` 主动添加节点

        参数：  (x, y, parentNode)

* 添加连线
    
    * `beforeAddLink` 添加连线前，需要返回 true | false 来表示是否可以连线

        与beforeAddNode类似，在该函数中可以做一些业务的判断工作

        需要使用 v-bind 进行参数绑定(该事件作为一个 prop 输入项来处理)


    * `afterAddLink` 添加连线后
    
        可以在该处做一些业务的提示工作，如弹框提示添加连线成功，或者保存数据到后端

        需要使用 v-on 进行事件绑定

* 删除节点

    * `beforeDeleteNode` 删除节点前

        需要使用 v-on 进行事件绑定
        参数： (nodes, deleteCheckedNodeObj)

        deleteCheckedNodeObj 是直接删除节点的函数(如下)，可传递参数直接执行


    * `deleteCheckedNodeObj` 删除指定的节点

        无需绑定，在 beforeDeleteNode 中作为参数传递，直接使用并执行
    
        参数：(nodes)
    
    * `afterDeleteNode` 删除节点后

        需要使用 v-on 进行事件绑定

* 删除连线

    * `beforeDeleteLink` 删除连线前

        需要使用 v-on 进行事件绑定
        参数： (checkedLink, deleteCheckedLinkObj)

        deleteCheckedLinkObj 是直接删除连线的函数(如下)，可传递参数直接执行

    * `deleteCheckedLinkObj` 删除连线
        
        无需绑定，在 beforeDeleteLink 中作为参数传递，直接使用并执行

        参数：不需指定参数

    * `afterDeleteLink` 删除连线后

        需要使用 v-on 进行事件绑定
        
