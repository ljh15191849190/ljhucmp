import { mapGetters } from 'vuex'
import MetadataUtils from '@server/metadata.utils'

/**
 * 订单类型信息列表，分析所有元数据的normal_actions、actions得来
 */
export const orderTypesMixin = {
    computed: {
        ...mapGetters([
            'metadata'
        ]),
        allOrderTypes () {
            return MetadataUtils.allUniqueActionKeyAndLabels(this.metadata)
        }
    }
}

/**
 * 当前申请单|审批单的订单类型详细信息，从元数据的normal_actions、actions分析得来
 */
export const orderOperation = {
    computed: {
        /**
         * @description 当前订单的类型(服务操作)详细内容
         */
        currentOperation () {
            let orderDetail = this.orderDetail ? JSON.parse(JSON.stringify(this.orderDetail)) : JSON.parse(JSON.stringify(this.orderDetails))
            let curService = this.metadata.find(service => service.service_code === orderDetail.service_code)
            let temp = {name: orderDetail.order_type}
            if (!curService)
                return temp
            else {
                // 从常规操作找寻
                if (curService.normal_actions && typeof curService.normal_actions === 'object' && curService.normal_actions.hasOwnProperty(orderDetail.service_code))
                    return curService.normal_actions[orderDetail.service_code]
                // 从其他操作中找寻
                if (curService.actions && typeof Array.isArray(curService.actions)) {
                    let currentAction = curService.actions.find(action => {
                        if (orderDetail.order_type === action.name)
                            return action
                    })
                    if (currentAction) return currentAction
                }
                return temp
            }
        }
    }
}
