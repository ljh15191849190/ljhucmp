export default [
    {
        detail: true,
        isShow: true,
        dataType: 'date',
        label: '租期',
        multiple: false,
        prop: 'resource_expired_at'
    },
    {
        detail: true,
        isShow: true,
        dataType: 'string',
        label: '资源所属类型',
        multiple: false,
        prop: 'owner_type'
    },
    {
        detail: false,
        isShow: true,
        dataType: 'string',
        label: '资源所属',
        multiple: false,
        prop: 'owner_name'
    },
    {
        detail: true,
        isShow: true,
        dataType: 'date',
        label: '创建时间',
        multiple: false,
        prop: 'created_at'
    },
    {
        detail: false,
        isShow: true,
        dataType: 'string',
        label: '责任人',
        multiple: false,
        prop: 'user'      
    },
    {
        detail: true,
        isShow: true,
        dataType: 'string',
        label: '环境',
        multiple: false,
        prop: 'env'
    }
]
