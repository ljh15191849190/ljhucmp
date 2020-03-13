/**
 * @description bmp3存放接口的统一位置
 *
 */
import { BPM_ROOT, UCMP_ROOT } from './root.url'

export default {
    // 流程定义
    processList: `${BPM_ROOT}/api/processes`,
    processBusiness: `${BPM_ROOT}/api/process-business`,
    // 模型相关API
    modelApi: `${BPM_ROOT}/api/models/:modelId`,
    modelDeleteApi: `${BPM_ROOT}/api/models/delete`,
    // 部署模型
    modelDeploy: `${BPM_ROOT}/api/models/deploy/:modelId`,
    // 流程相关API
    progressApi: `${BPM_ROOT}/api/processes/:deploymentId`,
    progressDeleteApi: `${BPM_ROOT}/api/processes/delete`,
    uploadProcessDeploy: `${BPM_ROOT}/api/processes/deploy`,
    f5HandleBtns: `${UCMP_ROOT}/service_define/service_actions`,
    // get,post,put process config data
    processConfig: `${BPM_ROOT}/api/act/user/business`,
     // 组织机构标识保存
    processConfigAge: `${BPM_ROOT}/api/act/user/business/tag`,
    // Delete process config data
    deleteProcessConfig: `${BPM_ROOT}/api/act/user/business/:id`,
    // Convert process data to model data
    convertProcess2Model: `${BPM_ROOT}/api/processes/convert-to-modeler/:processDefinitionId`,
    // 审批管理
    approveList: `${BPM_ROOT}/api/workflow/:page_type`,
    approveDetail: `${BPM_ROOT}/api/tasks/:taskId`,
    corOrderDetail: `${UCMP_ROOT}/order/corOrderDetails`,
    getProcessImg: `${BPM_ROOT}/api/workflow/process-image`,
    getProcessRecordList: `${BPM_ROOT}/api//workflow/process-comments`,
    getProcessorInfo: `${BPM_ROOT}/api/users/:taskId`,

    // 处理审批任务
    // POST
    handleApproveTaskApi: `${BPM_ROOT}/api/workflow/complete-task`,

    // 获取删除的资源列表
    getResourceDetail: `${UCMP_ROOT}/service_instance/:service_code/:resource_id`,
    blueprintEditPrivileges: `${UCMP_ROOT}/order/role/service`
}
