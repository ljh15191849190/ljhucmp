//任务计划
import TaskPlanList from '@/components/userCenter/taskPlan/TaskPlanList'
//任务日志
import TaskLogList from '@/components/userCenter/taskLog/TaskLogList'
//申请单管理
import OrderMgmt from '@/components/userCenter/orderMgmt/OrderMgmt'
import OrderDetail from '@/components/userCenter/orderMgmt/OrderDetail'
//审批管理
import ApproveMgmt from '@/components/userCenter/approveMgmt/ApproveMgmt'
import ApproveDetail from '@/components/userCenter/approveMgmt/ApproveDetail'
//任务单
import TaskOrdersList from '@/components/userCenter/taskOrders/TaskOrdersList'
//任务单详情
import TaskOrderDetail from '@/components/userCenter/taskOrders/TaskDetail'
//任务管理
// import TaskMgmt from '@/components/userCenter/taskMgmt/TaskMgmt'
// --任务管理详情
// import TaskDetail from '@/components/userCenter/taskMgmt/TaskDetail'
//工单管理
import WorkSheetIndex from '@/components/userCenter/workSheetMgmt/WorkSheetIndex'
//工单详情
import WorkSheetDetail from '@/components/userCenter/workSheetMgmt/WorkSheetDetail'
//回收站
import RecycleManage from '@/components/userCenter/recycleBin/RecycleManage'

export default [
    {
        path: '/quartz-task',
        name: 'quartTask',
        component: TaskPlanList
    },
    {
        path: '/script-execution',
        name: 'taskLogList',
        component: TaskLogList
    },
    {
        authority: {
            license: ['view']
        },
        path: '/orders',
        name: 'orderMgmt',
        component: OrderMgmt
    },
    {
        authority: {
            license: ['view']
        },
        path: '/orders/:orderCode',
        name: 'orderDetail',
        component: OrderDetail
    },
    {
        authority: {
            license: ['view']
        },
        path: '/approve',
        name: 'approveMgmt',
        component: ApproveMgmt
    },
    {
        authority: {
            license: ['view']
        },
        path: '/taskOrders',
        name: 'taskOrders',
        component: TaskOrdersList
    },
    {
        authority: {
            license: ['view']
        },
        path: '/taskOrderDetail/:orderId',
        name: 'taskOrderDetail',
        component: TaskOrderDetail
    },
    {
        authority: {
            license: ['view']
        },
        path: '/approveDetail',
        name: 'approveDetail',
        component: ApproveDetail
    },
    // {
    //     path: '/task',
    //     name: 'TaskMgmt',
    //     component: TaskMgmt
    // },
    // {
    //     path: '/task/TaskDetail',
    //     name: 'TaskDetail',
    //     component: TaskDetail
    // },
    {
        authority: {
            license: ['view']
        },
        path: '/tickets',
        name: 'WorkSheetIndex',
        component: WorkSheetIndex
    },
    {
        authority: {
            license: ['view']
        },
        path: '/tickets/detail/:id',
        name: 'WorkSheetDetail',
        component: WorkSheetDetail
    },
    {
        authority: {
            license: ['view']
        },
        path: '/recycle-bin',
        name: 'RecycleManage',
        component: RecycleManage
    }
]
