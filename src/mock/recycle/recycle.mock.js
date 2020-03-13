const filterItems = [
    {
        label: '资源名称',
        key: 'instance_name'
    },
    {
        label: '服务名称',
        key: 'instance_type',
        type: 'select',
        multiple: false,
        defaultOptions: [],
        data_link: {
            text_field: 'name',
            value_field: 'type'
        },
        query_condition: {
            enable: true,
            query_symbol: '=',
            query_attribute: 'status',
            table_head: true
        }
    }
]

const columns = [
    {prop: 'instance_name', label: '资源名称'},
    {prop: 'instance_type', label: '服务名称'},
    {prop: 'resource_status', label: '状态'},
    {prop: 'provider_name', label: '云厂商'},
    {prop: 'user_name', label: '责任人'},
    {prop: 'recycle_at', label: '删除时间'},
    {prop: 'org_name', label: '组织机构'},
    {prop: 'app_name', label: '应用'}
]

export {
    columns,
    filterItems
}
