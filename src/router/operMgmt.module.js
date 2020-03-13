//VDC管理
import VdcMgmt from '@/components/operationMgmt/vdcMgmt/VdcMgmt'
//组织机构
import OrgMgmt from '@/components/operationMgmt/organization/OrgMgmt'
//用户管理
import UserMgmt from '@/components/operationMgmt/userMgmt/UserMgmt'
//角色管理
import RoleMgmt from '@/components/operationMgmt/roleMgmt/RoleMgmt'
//应用系统管理
import ApplicationMgmt from '@/components/operationMgmt/application/ApplicationMgmt'
//应用系统管理概览
import AppMgmtView from '@/components/operationMgmt/application/AppMgmtView'
//服务定义
import ServiceDefine from '@/components/operationMgmt/serviceDefine/ServiceDefine'
//服务套餐列表
import ServicePackage from '@/components/operationMgmt/servicePackage/ServicePackage'
// 服务套餐列表-查看
import ServicePackageView from '@/components/operationMgmt/servicePackage/ServicePackageView'
//网络简化配置管理
import NetworkTemplate from '@/components/operationMgmt/networkOprMgmt/NetworkTemplate'
//计费策略-列表
import CostRuleList from '@/components/operationMgmt/costRule/CostRuleList'
//计费策略
import CostRule from '@/components/operationMgmt/costRule/CostRule'
//部门账单
import Bill from '@/components/operationMgmt/billMgmt/Bill'
// 配额管理
import QuotaManage from '@/components/operationMgmt/quotaMgmt/QuotaManage'
// 流程定义
import ProcessPage from '@/components/operationMgmt/processDefinition/ProcessPages'
//--模型列表
import ModelList from '@/components/operationMgmt/processDefinition/ModelLists'
//--流程列表
import ProcessList from '@/components/operationMgmt/processDefinition/ProcessList'
//--模型定义
import defineModel from '@/components/operationMgmt/processDefinition/DefineProcessModel'
//--流程配置
import ConfigList from '@/components/operationMgmt/processDefinition/ConfigList'
//自定义设备管理
import CustomDevice from '@/components/iaas/deviceMght/CustomDevice'
import EditDeviceMgmt from '@/components/iaas/deviceMght/EditDeviceMgmt'
import ServiceConfiguration from '@/components/operationMgmt/serviceConfiguration/ServiceConfiguration'

export default [
    {
        path: '/tenant',
        name: 'vdcMgmt',
        component: VdcMgmt
    },
    {
        path: '/orgNode',
        name: 'orgMgmt',
        component: OrgMgmt
    },
    {
        path: '/user-management',
        name: 'userMgmt',
        component: UserMgmt
    },
    {
        path: '/role',
        name: 'roleMgmt',
        component: RoleMgmt
    },
    {
        path: '/application',
        name: 'applicationMgmt',
        component: ApplicationMgmt
    },
    {
        path: '/application/appMgmtView/:id',
        name: 'appMgmtView',
        component: AppMgmtView
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/service-define',
        name: 'serviceDefine',
        component: ServiceDefine
    },
    {
        path: '/service-package',
        name: 'servicePackage',
        component: ServicePackage
    },
    {
        path: '/service-package/service-package/:id',
        name: 'servicePackageView',
        component: ServicePackageView
    },
    {
        path: '/network-template',
        name: 'networkTemplate',
        component: NetworkTemplate
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/cost-rule-mgmt',
        name: 'costRuleMgmt',
        component: CostRuleList
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/cost-rule/:id',
        name: 'costRule',
        component: CostRule
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/bill-mgmt',
        name: 'bill',
        component: Bill
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/quota',
        name: 'quotaMgmt',
        component: QuotaManage
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/processDefinition',
        name: 'processDefinition',
        redirect: {name: 'ProcessConfig'},
        component: ProcessPage,
        children: [
            {
                authority: {
                    license: ['forbid']
                },
                path: 'ModelList',
                name: 'ModelList',
                component: ModelList
            },
            {
                authority: {
                    license: ['forbid']
                },
                path: 'ProcessList',
                name: 'ProcessList',
                component: ProcessList
            },
            {
                authority: {
                    license: ['forbid']
                },
                path: 'ProcessConfig',
                name: 'ProcessConfig',
                component: ConfigList
            }
        ]
    },
    {
        path: '/processDefinition/defineModel',
        name: 'defineModel',
        component: defineModel
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/custom-device',
        name: 'customDevice',
        component: CustomDevice
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/custom-device/deviceMgmt/:id',
        name: 'editDeviceMgmt',
        component: EditDeviceMgmt
    },
    {
        authority: {},
        path: '/service-configuration',
        name: 'serviceConfiguration',
        component: ServiceConfiguration
    }
]
