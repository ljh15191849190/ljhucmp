/**
 * 监控告警模块路由配置
 */
// 监控仪表盘
// import MonitorDashboard from '@/components/monitorAlarm/monitorDashboard/MonitorDashboard'
// 监控仪表盘-新建
// import NewMonitorDashboard from '@/components/monitorAlarm/monitorDashboard/NewMonitorDashboard'
// import DashboardDetail from '../components/monitorAlarm/monitorDashboard/dashboradItem'

// 监控详情
import MonitorDetails from '@/components/monitorAlarm/monitorDetails/MonitorDetails'
// 监控面板
import HostDashboard from '@/components/monitorAlarm/monitorDetails/HostDashboard'
// 告警分析
import AlarmStatis from '@/components/monitorAlarm/AlarmStatis'
// 告警管理
import AlertMgmt from '@/components/monitorAlarm/alarmList/AlertMgmt'
// 组件监控
import ComponentMonitor from '@/components/monitorAlarm/component_monitor/ComponentMonitor'
// ***组件监控grafana页面
import ComponentDashboard from '@/components/monitorAlarm/component_monitor/ComponentDashboard'

// 告警策略管理页面
import StrategyMgr from '@/components/monitorAlarm/alarmStrategy/StrategyMgr'
// ******策略编辑页面
import StrategyEdit from '@/components/monitorAlarm/alarmStrategy/StrategyEdit'

export default [
    {
        authority: {
            license: ['forbid']
        },
        path: '/monitor-details',
        name: 'monitorDetails',
        component: MonitorDetails
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/monitor-details/host-dashboard',
        name: 'HostDashboard',
        component: HostDashboard
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/alarm-statistics',
        name: 'AlarmStatis',
        component: AlarmStatis
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/alarm-index',
        name: 'alertMgmt',
        component: AlertMgmt
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/component-monitor',
        name: 'ComponentMonitor',
        component: ComponentMonitor
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/component-monitor/component-dashboard',
        name: 'ComponentDashboard',
        component: ComponentDashboard
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/strategy-mgr',
        name: 'StrategyMgr',
        component: StrategyMgr
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/strategy-mgr/edit',
        name: 'StrategyEdit',
        component: StrategyEdit
    }
]
