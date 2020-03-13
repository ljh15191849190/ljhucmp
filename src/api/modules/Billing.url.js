/**
 * @description 计费url
 * @author davidPan
 */
import {UCMP_ROOT, BILL_ROOT, STATS_ROOT, PORTAL_ROOT_V2} from './root.url'

export default {
    //**************计费策略***************//
    //计费的服务
    billingServices: UCMP_ROOT + '/service_define?service_attribute=billing&service_attribute_value=true',
    verifyStrategyNameExist: BILL_ROOT + '/price/check_strategy_name/:strategyName',
    //设置服务价格、获取价格
    billingPrice: BILL_ROOT + '/price/:id',
    //上传、下载规则
    priceRule: BILL_ROOT + '/rule/:name',
    //服务使用周期数据获取
    priceDates: BILL_ROOT + '/duration',
    //计费定时配置
    priceTime: BILL_ROOT + '/dispatch',
    //**************设备管理***************//
    //设备信息列表、添加、修改、详情、删除
    deviceInfo: BILL_ROOT + '/custom/device/:deviceId',
    //设备类型
    deviceType: BILL_ROOT + '/custom/device/type',
    //组织机构 整颗树
    orgTree: PORTAL_ROOT_V2 + '/user/orgtree',
    //**************部门账单***************//
    //查询指定部门总消费及上个月与本月的消费概况
    costInfo: STATS_ROOT + '/cost/:type/info',
    //查询指定部门近六个月费用消费趋势情况
    costTrend: STATS_ROOT + '/cost/:type/monthly/trend',
    //查询本部门下所有部门消费情况
    costDepart: STATS_ROOT + '/cost/:type/monthly/comparison',
    //查询指定部门在指定月份用在各类资源上的费用情况
    costResource: STATS_ROOT + '/cost/:type/monthly/resource',
    //本部门消费详单获取
    costOrder: STATS_ROOT + '/cost/:type/monthly/detail',
    //本部门消费详单下载
    costOrderDownload: STATS_ROOT + '/cost/:type/monthly/detail/excel',
    //pdf下载
    costPdf: STATS_ROOT + '/cost/:type/file/pdf',
    //**************费用统计***************//
    // 获取资源对应的单价以及费用信息
    costStatistics: `${BILL_ROOT}/statistics/cost/:service/:instanceId`
}
