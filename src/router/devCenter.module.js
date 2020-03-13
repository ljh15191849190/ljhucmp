//字典列表
import DictList from '@/components/devCenter/dictMgmt/DictList'
//服务分类
import ServiceType from '@/components/devCenter/serviceType/ServiceType'
//服务状态
import ServiceStatus from '@/components/devCenter/serviceStatus/ServiceStatus'
//日志
import LogList from '@/components/devCenter/logs/LogList'
//API
import ApiDocs from '@/components/devCenter/apiDocs/ApiDocs'

export default [
    {
        path: '/dict',
        name: 'dictList',
        component: DictList
    },
    {
        path: '/service-type',
        name: 'serviceType',
        component: ServiceType
    },
    {
        path: '/health',
        name: 'serviceStatus',
        component: ServiceStatus
    },
    {
        path: '/logs',
        name: 'logList',
        component: LogList
    },
    {
        path: '/docs',
        name: 'apiDocs',
        component: ApiDocs
    }
]
