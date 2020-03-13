/**
 * @description 个人中心url
 * @author davidPan
 */
import { UCMP_ROOT } from './root.url'
export default {
    //***********************回收站接口定义*************************//
    recycleBin: UCMP_ROOT + '/recycle_bin/:type',  //回收站列表、还原、删除
    recycleWaitBin: UCMP_ROOT + '/recycle_bin/recycled', 
    recycleFilter: UCMP_ROOT + '/recycle_bin/filter/service_code', 
    recycleBlueprintResources: UCMP_ROOT + '/recycle_bin/:instance_id/resources', // 查询蓝图实例下实际资源列表
    //***********************任务单接口定义*************************//
    taskOrderList: UCMP_ROOT + '/task/page',       //任务单列表
    taskOrderDetail: UCMP_ROOT + '/task/:orderId', //任务单详情
    rerunTask: UCMP_ROOT + '/task/:orderId/reperform', //重新执行
    manualDeployTask: UCMP_ROOT + '/task/:orderId/manual', //手动部署
    deliveryTask: UCMP_ROOT + '/task/:orderId/delivery', //交付
    closeTask: UCMP_ROOT + '/task/:orderId/close',   //关闭
    taskCounts: UCMP_ROOT + '/task/status_group_count',    //状态个数
    taskServices: UCMP_ROOT + '/task/include_service_code', //任务单服务过滤
    orderServices: UCMP_ROOT + '/order/include_service_code', //订单、申请单服务过滤
    cleanTask: UCMP_ROOT + '/task/:task_code/cleaned',   //清理
    completeTask: UCMP_ROOT + '/task/:task_code/confirm_complete', //确认完成
    systemService: UCMP_ROOT + '/service_define/system_service', //订单、申请单服务过滤
    taskType: UCMP_ROOT + '/task/task_type', //任务单操作类型

    //***********************申请单接口定义************************//
    /**
     * 查看申请单详情
     * @params [orderCode] 申请单编号
     */
    orderType: `${UCMP_ROOT}/order/order_type`,
    /**
     * 查看申请单详情
     * @params [orderCode] 申请单编号
     */
    orderDetail: `${UCMP_ROOT}/order/:orderCode`,
    orderDetailResouce: `${UCMP_ROOT}/order/:orderCode/resources`,
    // 申请单操作接口
    /**
     * @param action 操作类型
     *  POST  [perform] => 执行
     * */
    order: UCMP_ROOT + '/order/:_service_code/:_action',
    /**
     * 申请单变更（取消/重新执行/修改）调用接口
     * @param action 操作类型
     * POST   [cancel] => 取消
     *        [create] => 创建
     * PUT    [data] => 修改创建类型的申请单data字段参数接口
     */
    handleOrderApi: `${UCMP_ROOT}/order/:order_code/:_action`

}
