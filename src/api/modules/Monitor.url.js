/**
 * @description 告警
 */
import { MONITOR_ROOT } from './root.url'

export default {
    monitor_ecs_list: `${MONITOR_ROOT}/monitor/instances`, // 监控主机列表
    alarm_unprocessed_api_each: `${MONITOR_ROOT}/alerts/list`, // 获取未处理告警
    bs_alarm_within: `${MONITOR_ROOT}/alerts-within`, // 某个时间间隔内的告警列表
    bs_instance_avail: `${MONITOR_ROOT}/instance-avail`, // 云主机的可用率
    alarm_deal_api: `${MONITOR_ROOT}/alerts/:serial/status/:status/users/:userid`, //告警处置
    monitor_dashboard_path_api: `${MONITOR_ROOT}/grafana/path`, // 获取监控告警页面的grafana地址
    component_monitor_list: `${MONITOR_ROOT}/monitor/components`,  // 组件监控中的监控列表
    alarm_counts_by_serve_type: `${MONITOR_ROOT}/alerts/count`,  // 通过服务类型获取告警数量
    service_select_options_api: `${MONITOR_ROOT}/monitor/typelist`, // 获取监控对象类型集合,
    service_components_typelist: `${MONITOR_ROOT}/monitor/components/typelist`, // 组件监控-实例类型,

    /**
     * 告警列表
     * @method GET
     */
    alarm_list_api: `${MONITOR_ROOT}/alerts/list`,

    /**
     * 修改告警状态
     * @method PUT
     */
    change_alarm_status: `${MONITOR_ROOT}/alerts`,

    /**
     * 告警策略列表API
     * @method GET
     * @params [offset] 页码
     *         [limit] 页数
     *         [resource_type] 告警对象类型(必填： 默认为0)
     *         [severity] 告警级别
     *         [alert_type] 告警类型
     *         [rule_name] 策略名称 （支持模糊搜索）
     **/
    api_alarm_rules_list: `${MONITOR_ROOT}/rules/list`,

    /**
     *  查看指定实例ID获取该实例包含的策略列表API
     * @method GET
     * @params [instance] 实例ID
     *         [offset] 页码
     *         [limit] 页数
     *         [resource_type] 告警对象类型(必填： 默认为0)
     *         [severity] 告警级别
     *         [alert_type] 告警类型
     *         [rule_name] 策略名称 （支持模糊搜索）
     **/
    api_instance_alarm_rules_list: `${MONITOR_ROOT}/rules/list/instance`,

    /**
     *  查看告警策略详情API
     * @method GET
     * @params [id] 告警策略ID
     **/
    api_alarm_rule_detail: `${MONITOR_ROOT}/rules/detail`,

    /**
     *  创建/编辑告警策略API
     * @method POST
     * @params [...]
     *         [id] 策略ID --编辑策略时需要
     **/
    api_alarm_rule_edit: `${MONITOR_ROOT}/rules/create`,

    /**
     * 删除告警策略API
     * @method DELETE
     * @params [id] 策略ID
     **/
    api_alarm_rule_delete: `${MONITOR_ROOT}/rules`,

    /**
     *  获取消息策略列表API
     * @method GET
     **/
    api_msssage_rules_list: `${MONITOR_ROOT}/rules/message/list`,

    /**
     *  获取消息策略详情API
     * @method GET
     **/
    api_msssage_rule_detail: `${MONITOR_ROOT}/rules/message/detail`,

    /**
     *   获取指标分类集合API
     * @method GET
     * @params [resource_type] 监控对象类型 --必需
     **/
    api_metrics_list: `${MONITOR_ROOT}/rules/metrics/type`,

    /**
     *   获取指标分类集合API
     * @method GET
     * @params [type] 指标类型
     *         [resource_type] 当前监控对象类型
     **/
    api_metrics_detail: `${MONITOR_ROOT}/rules/metrics`,

    /**
     * 查询监控对象主机列表API
     * @method GET
     * @params [owner_type] 归属资源类型 org | app
     *         [owner_id] 归属资源ID
     *         [offset]
     *         [limit]
     *         [ip] 主机IP
     *         [instance_name] 实例名称
     *         [resource_type] 资源类型
     *         [rule_id] 该资源所属的策略ID 编辑时需要
     **/
    api_resource_list: `${MONITOR_ROOT}/rules/resource/list`,

    /**
     * 校验策略名是否重复API
     * @method GET
     * @params [name] 策略名称
     **/
    api_alarm_rule_checkname: `${MONITOR_ROOT}/rules/checkname`,
    /**
     * 获取告警策略下单个告警对象实例
     * @method GET
     * @params [resource_type] 资源类型
     * @params [resource_id] 资源id
     **/
    api_alarm_rule_resouce: `${MONITOR_ROOT}/rules/resource`
}
