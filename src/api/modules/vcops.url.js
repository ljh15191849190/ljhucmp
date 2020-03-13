/**
 * vcops
 */

import {VCOPS_ROOT} from './root.url'

export default {
    // 群集详情
    vcops_cluster_capacity: `${VCOPS_ROOT}/cluster_capacity`,
    // 环境list
    vcops_resources: `${VCOPS_ROOT}/resources`,
    // 利用率
    vcops_capacity_usage: `${VCOPS_ROOT}/capacity_usage`,
    // 数据中心
    vcops_data_centers: `${VCOPS_ROOT}/datacenters`,
    // 集群
    vcops_data_clusters: `${VCOPS_ROOT}/clusters`,
    // 虚拟机增长趋势
    vcops_vm_stats: `${VCOPS_ROOT}/vm_stats`,
    // 重负载
    vcops_vm_heavyload: `${VCOPS_ROOT}/vm_heavyload`,
    // 资源争用
    vcops_resource_topn: `${VCOPS_ROOT}/resource_topn`
}
