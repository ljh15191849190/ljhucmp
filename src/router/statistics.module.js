//容量概览
import CapacityIndex from '@/components/statistics/capacityMgmt/CapacityIndex'
//**使用分析
import usingAnalysis from '@/components/statistics/capacityMgmt/UsingAnalysis'
//**容量优化建议
import CapacitySuggestion from '@/components/statistics/capacityMgmt/CapacitySuggestion'

//资源使用情况
import ResourceIndex from '@/components/statistics/resource/ResourceIndex'
//---资源趋势
import ResourceEmploy from '@/components/statistics/resource/ResourceEmploy'
//---配额使用
import ResourceQuotaCount from '@/components/statistics/resource/ResourceQuotaCount'
// ---资源统计分析
import ResourceAnalysis from '@/components/statistics/resource/ResourceAnalysis'
// ---资源使用统计分析
import ResourceUseAnalysis from '@/components/statistics/resource/ResourceUseAnalysis'
// ---月度统计
import ResourceMonth from '@/components/statistics/resource/ResourceMonth'
// 台账
import ReportForm from '@/components/statistics/report/ReportForm'
// vcops
import VCopsIndex from '@/components/statistics/vcops/VCopsIndex'

export default [
    {
        authority: {
            license: ['forbid']
        },
        path: '/capacity-mgmt',
        name: 'CapacityIndex',
        redirect: {name: 'usingAnalysis'},
        component: CapacityIndex,
        children: [{
            authority: {
                license: ['forbid']
            },
            path: 'using-analysis',
            name: 'usingAnalysis',
            component: usingAnalysis
        },
            {
                authority: {
                    license: ['forbid']
                },
                path: 'capacity-suggestion',
                name: 'capacitySuggestion',
                component: CapacitySuggestion
            }]
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/resourceIndex',
        name: 'resourceIndex',
        redirect: {name: 'ResourceEmploy'},
        component: ResourceIndex,
        children: [
            {
                authority: {
                    license: ['forbid']
                },
                path: 'ResourceEmploy',
                name: 'ResourceEmploy',
                component: ResourceEmploy
            },
            {
                authority: {
                    license: ['forbid']
                },
                path: 'ResourceQuotaCount',
                name: 'ResourceQuotaCount',
                component: ResourceQuotaCount
            },
            {
                authority: {
                    license: ['forbid']
                },
                path: 'ResourceAnalysis',
                name: 'ResourceAnalysis',
                component: ResourceAnalysis
            }, {
                authority: {
                    license: ['forbid']
                },
                path: 'ResourceUseAnalysis',
                name: 'ResourceUseAnalysis',
                component: ResourceUseAnalysis
            }, {
                authority: {
                    license: ['forbid']
                },
                path: 'ResourceMonth',
                name: 'ResourceMonth',
                component: ResourceMonth
            }
        ]
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/report-form',
        name: 'ReportForm',
        component: ReportForm
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/vcops',
        name: 'VCops',
        component: VCopsIndex
    }
]
