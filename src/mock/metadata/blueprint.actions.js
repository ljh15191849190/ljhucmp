export default [
    {
        key: 'delete',
        name: 'delete',
        column: true,
        description: '',
        enabled: true,
        recycle: true, 
        endpoint: {
            method: 'delete',
            url: '/ucmp3/blueprint_instance_resource/:service_code/:instance_ids/recycle'
        },
        // bug UCMP-680【控制台】控制台下编排实例资源列表中无删除按钮。
        icon: 'ucmp-icon-delete',
        multiple: false,
        label: '删除',
        warn: true,
        is_approve: true
    },
    {
        key: 'create',
        label: '创建',
        column: false,
        is_approve: true,
        name: 'create'
    }
]
