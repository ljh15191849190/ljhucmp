//资源池
import SourcePoolList from '@/components/iaas/sourcepool/SourcePoolList'
//资源池详情
import SourcePoolDetail from '@/components/iaas/sourcepool/SourcePoolDetail'
//创建、编辑资源池
import EditSourcePool from '@/components/iaas/sourcepool/EditSourcePool'
//资源配置
import AllocateResources from '@/components/iaas/sourcepool/AllocateResources'
//模板列表
import ConfigTemplateList from '@/components/iaas/configTemplate/CfgTemplateList'
//编辑模板
import ConfigTemplate from '@/components/iaas/configTemplate/ConfigTemplate'
//云厂商
import CloudProvider from '@/components/iaas/cloudProvider/CloudProvider'
//云厂商详情
import CloudProviderDetail from '@/components/iaas/cloudProvider/CloudProviderDetail'
//云厂商新增、编辑
import EditCloudProvider from '@/components/iaas/cloudProvider/EditCloudProvider'
//同步规则
import BlackList from '@/components/iaas/cloudProvider/BlackList'
//HMC
import HmcMachineCloud from '@/components/iaas/hmcMachineCloud/HmcMachineCloud'
//虚拟桌面应用
import VirtualApp from '@/components/iaas/virtual/VirtualApp'
//历史会话
import HistoryChat from '@/components/iaas/history/History'
//模板管理
import TemplateDefine from '@/components/iaas/templateMght/TemplateDefine'
//修改/新增模版管理
import EditTemplate from '@/components/iaas/templateMght/EditTemplate'
//网络管理
import Subnet from '@/components/iaas/subnet/list/Subnet'
//网络
import NetworkList from '@/components/iaas/subnet/list/NetworkList'
//IP管理
import IpList from '@/components/iaas/subnet/list/IpList'
//子网管理
import SubnetList from '@/components/iaas/subnet/list/SubnetList'

//物理机管理
import PhysicalList from '@/components/iaas/physical/PhysicalList'
//已纳管
import DoNatube from '@/components/iaas/physical/DoNatube'
//未纳管
import NotNatube from '@/components/iaas/physical/NotNatube'
//物理机详情
import PhysicalDetail from '@/components/iaas/physical/PhysicalDetail'
//物理机详情
import PhysicalDetailBasic from '@/components/iaas/physical/PhysicalDetailBasic'
// 服务实例详情-监控信息--硬件监控
import InstanceDetailMonitor from '@/components/console/seviceinstance/InstanceDetailMonitor'
// 服务实例详情-告警信息
import InstanceDetailAlarmInfo from '@/components/console/seviceinstance/InstanceDetailAlarmInfo'
// 服务实例详情-告警策略
import InstanceDetailAlarmRule from '@/components/console/seviceinstance/InstanceDetailAlarmRule'
// 服务实例详情-云架构告警策略新建
import EditInstanceDetailAlarmRule from '@/components/console/seviceinstance/childService/EditInstanceDetailAlarmRule'

//ssh
import SshList from '@/components/iaas/ssh/SshList'
//防火墙
import Firewall from '@/components/iaas/firewall/FirewallList'
import FirewallRule from '@/components/iaas/firewall/FireWall.rule'
//规格管理
import SpecificationList from '@/components/iaas/specificationMght/SpecificationList'
//修改规格管理
import EditSpecification from '@/components/iaas/specificationMght/EditSpecification'
//发布应用程序管理
import CloudAppMght from '@/components/iaas/cloudAppMght/CloudAppMght'
import AppQuerySession from '@/components/iaas/cloudAppMght/QuerySession'
//桌面云计算机管理
import VirtualCloudMght from '@/components/iaas/virtualCloudMght/VirtualCloudMght'

//桌面云计算机管理-查看会话
import QuerySession from '@/components/iaas/virtualCloudMght/QuerySession'

// 交付组
import Delivery from '@/components/iaas/delicery/delivery.vue'
export default [
    {
        authority: {
            license: ['forbid']
        },
        path: '/cloud-provider',
        name: 'cloudProvider',
        component: CloudProvider
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/cloud-provider/detail/:id',
        name: 'cloudProviderDetail',
        component: CloudProviderDetail
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/cloud-provider/edit/:id',
        name: 'editCloudProvider',
        component: EditCloudProvider
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/blacklist/:id',
        name: 'blacklist',
        component: BlackList
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/config-template',
        name: 'configTemplateList',
        component: ConfigTemplateList
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/config-template/edit/:id',
        name: 'configTemplate',
        component: ConfigTemplate
    },
    {
        path: '/resource-pool',
        name: 'resource-pool',
        component: SourcePoolList
    },
    {
        path: '/resource-pool/resource/:id',
        name: 'editSource-pool',
        component: EditSourcePool
    },
    {
        path: '/resource-pool/allocate/:id',
        name: 'allocate-resources',
        component: AllocateResources
    },
    {
        path: '/resource-pool/detail/:id',
        name: 'resource-pool-detail',
        component: SourcePoolDetail
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/hmc-machine-cloud',
        name: 'hmcMachineCloud',
        component: HmcMachineCloud
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/virtual-app',
        name: 'virtualApp',
        component: VirtualApp
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/history',
        name: 'historyChat',
        component: HistoryChat
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/template-define',
        name: 'templateDefine',
        component: TemplateDefine
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/edit-template/:id',
        name: 'editTemplate',
        component: EditTemplate
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/subnet',
        name: 'subnet',
        component: Subnet,
        children: [
            {
                authority: {
                    license: ['forbid']
                },
                path: 'network',
                name: 'network',
                component: NetworkList
            },
            {
                authority: {
                    license: ['forbid']
                },
                path: 'subnet',
                name: 'subnetList',
                component: SubnetList
            },
            {
                authority: {
                    license: ['forbid']
                },
                path: 'ips',
                name: 'ips',
                component: IpList
            }
        ]
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/physical',
        name: 'physical',
        component: PhysicalList,
        redirect: { name: 'donatubeList' },
        children: [
            {
                authority: {
                    license: ['forbid']
                },
                path: 'donatube',
                name: 'donatubeList',
                component: DoNatube
            },
            {
                authority: {
                    license: ['forbid']
                },
                path: 'notnatube',
                name: 'notnatubeList',
                component: NotNatube
            }
        ]
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/physical/physicalDetail/:id',
        name: 'physicalDetail',
        redirect: { name: 'physicalDetailBasic' },
        component: PhysicalDetail,
        children: [
            {
                authority: {
                    license: ['view']
                },
                path: 'basic',
                name: 'physicalDetailBasic',
                component: PhysicalDetailBasic
            },
            {
                authority: {
                    license: ['view']
                },
                path: 'hardware_monitor',
                name: 'InstanceDetailHardwareMonitorY',
                component: InstanceDetailMonitor
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
            }

        ]
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/ssh',
        name: 'sshList',
        component: SshList
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/firewall',
        name: 'firewall',
        component: Firewall
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/firewall/rule',
        name: 'firewallRule',
        component: FirewallRule
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/specification',
        name: 'specificationList',
        component: SpecificationList
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/specification/:id',
        name: 'editSpecification',
        component: EditSpecification
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/virtual-cloud-mght',
        name: 'virtualCloudMght',
        component: VirtualCloudMght
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/virtual-cloud-mght/query-session',
        name: 'querySession',
        component: QuerySession
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/cloud-app-mght',
        name: 'cloudAppMght',
        component: CloudAppMght
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/cloud-app-mght/query-session',
        name: 'appQuerySession',
        component: AppQuerySession
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/delivery',
        name: 'delivery',
        component: Delivery
    }
]
