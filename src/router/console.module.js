// 服务管理列表
import ServiceInstanceList from '@/components/console/ServiceInstanceList'
// EVS
import Dashboard from '@/components/dashboard/Dashboard'
// 大屏
import BigScreenDisplay from '@/components/dashboard/bigscreen/BigScreenDisplay'
// 服务实例详情
import InstanceDetail from '@/components/console/seviceinstance/InstanceDetail'

// 蓝图实例明细，拓扑图展示
import BlueprintInstanceDisplay from '@/components/orchestration/application/BlueprintInstanceDisplay'

// 服务实例详情-基础信息
import InstanceDetailBasic from '@/components/console/seviceinstance/InstanceDetailBasic'
// 服务实例详情-监控信息
import InstanceDetailMonitor from '@/components/console/seviceinstance/InstanceDetailMonitor'
// 服务实例详情-oracle实例
import instanceDetailInstance from '@/components/console/seviceinstance/instanceDetailInstance'
// 服务实例详情-快照列表
import InstanceDetailSnapshot from '@/components/console/seviceinstance/InstanceDetailSnapshot'
// 服务实例详情-告警信息
import InstanceDetailAlarmInfo from '@/components/console/seviceinstance/InstanceDetailAlarmInfo'
// 服务实例详情-告警策略
import InstanceDetailAlarmRule from '@/components/console/seviceinstance/InstanceDetailAlarmRule'
// *****编辑云主机告警策略
import EditInstanceDetailAlarmRule from '../components/console/seviceinstance/childService/EditInstanceDetailAlarmRule'
// 服务实例详情-VMware
import InstanceDetailVmware from '@/components/console/seviceinstance/InstanceDetailVmware'
// 服务实例详情-堡垒机
import InstanceDetailBastion from '@/components/console/seviceinstance/InstanceDetailBastion'
// 服务实例详情-关联云主机
import InstanceDetailRelatedEcs from '@/components/console/seviceinstance/InstanceDetailRelatedEcs'

// 云硬盘-详情-监控信息
// import VolumeMonitor from '@/components/console/volume/VolumeMonitor'
// 云硬盘-详情-快照列表
// import VolumeSnapshot from '@/components/console/volume/VolumeSnapshot'

export default [
    {
        authority: {
            license: ['forbid']
        },
        path: '/dashboard',
        name: 'dashboard',
        component: Dashboard
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/bigscreen',
        name: 'bigscreen',
        component: BigScreenDisplay
    },
    {
        authority: {
            license: ['view']
        },
        path: '/serviceInstance/:code',
        name: 'serviceInstanceList',
        component: ServiceInstanceList
    },
    {
        authority: {
            license: ['view']
        },
        path: '/:code/instanceDetail/:id',
        name: 'instanceDetail',
        // redirect: { name: 'instanceDetailBasic' },
        component: InstanceDetail,
        children: [
            {
                authority: {
                    license: ['view']
                },
                path: 'basic',
                name: 'instanceDetailBasic',
                component: InstanceDetailBasic
            },
            {
                authority: {
                    license: ['view']
                },
                path: 'ecs_monitor',
                name: 'instanceDetailMonitor',
                component: InstanceDetailMonitor
            },
            {
                authority: {
                    license: ['view']
                },
                path: 'instance',
                name: 'instanceDetailInstance',
                component: instanceDetailInstance
            },
            {
                authority: {
                    license: ['view']
                },
                path: 'snapshot',
                name: 'instanceDetailSnapshot',
                component: InstanceDetailSnapshot
            },
            {
                authority: {
                    license: ['view']
                },
                path: 'alarm',
                name: 'instanceDetailAlarmInfo',
                component: InstanceDetailAlarmInfo
            },
            {
                authority: {
                    license: ['view']
                },
                path: 'strategy',
                name: 'instanceDetailAlarmRule',
                component: InstanceDetailAlarmRule
            },
            {
                authority: {
                    license: ['view']
                },
                path: 'strategy-edit',
                name: 'EditInstanceDetailAlarmRule',
                component: EditInstanceDetailAlarmRule
            },
            {
                authority: {
                    license: ['view']
                },
                path: 'vmware',
                name: 'instanceDetailVmware',
                component: InstanceDetailVmware
            },
            {
                authority: {
                    license: ['view']
                },
                path: 'bastion',
                name: 'instanceDetailBastion',
                component: InstanceDetailBastion
            },
            {
                authority: {
                    license: ['view']
                },
                path: 'related_ecs',
                name: 'InstanceDetailRelatedEcs',
                component: InstanceDetailRelatedEcs
            },
            {
                authority: {
                    license: ['view']
                },
                path: 'hardware_monitor',
                name: 'InstanceDetailHardwareMonitor',
                component: InstanceDetailMonitor
            },
            {
                authority: {
                    license: ['view']
                },
                path: 'gpu_monitor',
                name: 'InstanceDetailGpuMonitor',
                component: InstanceDetailMonitor
            }
            // {
            //     path: 'monitor',
            //     name: 'volumeMonitor',
            //     component: VolumeMonitor
            // },
            // {
            //     path: 'snapshot',
            //     name: 'volumeSnapshot',
            //     component: VolumeSnapshot
            // }
        ]
    },
    {
        authority: {
            license: ['view']
        },
        path: '/:_service_code/bp_detail/:_id',
        name: 'blueprintDetail',
        component: BlueprintInstanceDisplay
    }
]
