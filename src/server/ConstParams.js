const LogicalOperatorOptions = [
    {value: 'and', label: 'AND'},
    {value: 'or', label: 'OR'}
]

const CompareOperator = [
    {value: 'greater', label: '>'},
    {value: 'less', label: '<'},
    {value: 'equal', label: '='}
]

const AlarmType = [
    {value: 'performance', label: '性能'},
    {value: 'pressure', label: '压力'},
    {value: 'hardwareFailure', label: '硬件故障'}
]

const AlarmLevel = [
    {label: '提示', value: 1, prop: 'info'},
    {label: '警告', value: 2, prop: 'warning'},
    {label: '危险', value: 3, prop: 'danger'}
]

const VolumeType = {
    0: '性能型',
    2: '容量型',
    3: '超高性能型',
    5: '分布式SAN',
    thin: '精简模式',
    lazy: '厚置备延迟置零',
    eagerZeroedThick: '厚置备快速置零',
    // 添加阿里云硬盘映射
    cloud_efficiency: '高效云盘',
    cloud: '普通云盘',
    cloud_ssd: 'ssd云盘'
}

const OptionTypes = [
    {name: '创建', type: 'create'},
    {name: '修改', type: 'modify'},
    {name: '删除', type: 'delete'},
    {name: '快照还原', type: 'ecsSnapshotRevert'}
]

const UrgencyLevelsMap = {
    high: '高',
    medium: '中',
    low: '低'
    // other: '其他'
}

// 申请单总状态
const OrdersStatusMap = {
    finished: '完成',
    unfinished: '未完成'
}
// 申请单资源状态配置
const StatusMap = {
    succeed: {label: '已完成', txtColor: 'text-success'},
    pending: {label: '待确认', txtColor: 'text-warning'},
    deploying: {label: '正在部署', txtColor: 'text-warning'},
    // canceled: {label: '已取消', txtColor: 'text-muted'},
    approving: {label: '审批中', txtColor: 'text-warning'},
    failed: { label: '失败', txtColor: 'text-danger' },
    refused: { label: '已拒绝', txtColor: 'text-danger' },
    processing: { label: '待处理', txtColor: 'text-warning' },
    performing: {label: '待执行', txtColor: 'text-warning'},
    performed: {label: '已执行', txtColor: 'text-success'}
}
// 申请单类型配置
const OrderTypeMap = {
    create: '创建',
    modify: '修改',
    modify_load_balancing: '修改负载均衡算法',
    modify_health_check: '修改健康检查算法',
    modify_node_status: '修改节点状态',
    delete: '删除',
    clone: '克隆',
    start: '启动',
    stop: '停止',
    reboot: '重启',
    attach: '挂载',
    detach: '卸载',
    renewal: '续期'
}

// 工单
const WorkSheetStatus = {
    TO_BEGIN: {id: 'TO_BEGIN', label: '待开始', custom_style: '#409eff'},
    INITIATE: {id: 'INITIATE', label: '待处理', custom_style: '#1cd4c7'},
    PROCESSING: {id: 'PROCESSING', label: '处理中', custom_style: '#f1e451'},
    PROCESSED: {id: 'PROCESSED', label: '已处理', custom_style: '#67c23a'},
    CONFIRMED: {id: 'CONFIRMED', label: '已确认', custom_style: '#909399'},
    REVOKED: {id: 'REVOKED', label: '已取消', custom_style: '#f56c6c'} // 已取消java逻辑删除了，不会出现在列表
}
const WS_STATUS = {
    WAIT_BEGIN: 'TO_BEGIN',
    WAIT_PROCESS: 'INITIATE',
    PROCESSING: 'PROCESSING',
    FINISHED: 'PROCESSED',
    CLOSED: 'CONFIRMED',
    CANCELED: 'REVOKED'
}

const WS_GROUP = [
    {name: '待我处理', id: 'tohandle', custom_style: {background: '#fedb75'}},
    {name: '我已处理', id: 'handled', custom_style: {background: '#cccccc'}}
]
const WS_ACTION = {
    TAKING: 'taking', // 接单
    ASSIGN: 'assign', // 分配
    FINISH: 'finish', // 完成
    CLOSE: 'close', // 完成
    CANCEL: 'cancel' // 取消
}

const NasEcsStatus = {
    attaching: { label: '正在挂载', type: 'warning' },
    detaching: { label: '正在卸载', type: 'warning' },
    attached: { label: '已自动挂载', type: 'success' },
    unknown: { label: '未知', type: 'info' },
    opening: {label: '正在关联', type: 'warning'},
    attachable: {label: '已关联', type: 'success'},
    releasing: {label: '正在解除关联', type: 'warning'}
}

const ResourceBelongs = {
    app: { prop: 'app', label: '应用' },
    org: { prop: 'org', label: '组织机构' },
    personal: { prop: 'personal', label: '个人' }
}

// https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/img#%E6%94%AF%E6%8C%81%E7%9A%84%E5%9B%BE%E5%83%8F%E6%A0%BC%E5%BC%8F
const SUPPORT_IMG = ['jpg', 'jpeg', 'gif', 'png', 'apng', 'svg', 'bmp', 'ico']

const PowerStates = {
    start: '开机',
    stop: '关机',
    starting: '开机中',
    stopping: '关机中',
    rebooting: '重启中'
}
const InstallStates = {
    success: '安装成功',
    failure: '安装失败',
    running: '正在安装'
}
const BillType = [
    {id: 0, name: '不计费'},
    {id: 1, name: '套餐'},
    {id: 2, name: '单项'}
]
const BillPeriod = {
    year: '年',
    month: '月',
    day: '天',
    hour: '累积小时/天',
    monute: '累积分钟/天',
    second: '累积秒/天'
}

const Owners = {
    org: '组织机构',
    app: '应用',
    personal: '个人'
}

export {
    LogicalOperatorOptions,
    CompareOperator,
    AlarmType,
    AlarmLevel,
    VolumeType,
    OptionTypes,
    UrgencyLevelsMap,
    OrdersStatusMap,
    StatusMap,
    WS_STATUS,
    WS_GROUP,
    WS_ACTION,
    WorkSheetStatus,
    OrderTypeMap,
    NasEcsStatus,
    ResourceBelongs,
    PowerStates,
    InstallStates,
    SUPPORT_IMG,
    BillType,
    BillPeriod,
    Owners
}
