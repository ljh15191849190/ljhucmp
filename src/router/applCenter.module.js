//编排定义
import OrchestrateApp from '@/components/orchestration/application/OrchestrateApp'
//编排发布
import Blueprint from '@/components/orchestration/blueprint/Blueprint'

import BlueprintGroups from '@/components/orchestration/group/BlueprintGroups'

// 编辑编排分层
import EditBlueprintGroup from '@/components/orchestration/group/EditBlueprintGroup'

export default [
    {
        authority: {
            license: ['view']
        },
        path: '/orchestrate-app/:id',
        name: 'OrchestrateApp',
        component: OrchestrateApp
    },
    {
        authority: {
            license: ['view']
        },
        path: '/blueprint',
        name: 'blueprint',
        component: Blueprint
    },
    {
        authority: {
            license: ['view']
        },
        path: '/blueprint-group',
        name: 'blueprint-group',
        component: BlueprintGroups
    },
    {
        authority: {
            license: ['view']
        },
        path: '/blueprint-group/:group_id',
        name: 'edit-blueprint-group',
        component: EditBlueprintGroup
    }
]
