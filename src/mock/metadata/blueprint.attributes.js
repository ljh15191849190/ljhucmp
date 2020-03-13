export default [
    {
        created: true,
        description: '编排实例名称',
        key: 'name',
        label: '编排实例名称',
        modified: false,
        multiple: false,
        query_condition: true,
        query_symbol: 'like',
        quota: false,
        relate_created: false,
        required: true,
        table_column: true,
        type: 'string',
        validation: {
            max: 100,
            reg: '/^[\\w\\-\u4e00-\u9fa5]{1,100}$/',
            backendRepetition: {
                url: '/ucmp3/blueprint_instance_resource/exists?exists=true',
                rule: 'instance_name',
                name: 'instance_name'
            }
        }
    },
    {
        created: false,
        description: '编排模板',
        key: 'template',
        label: '编排模板',
        modified: false,
        multiple: false,
        query_condition: false,
        quota: false,
        relate_created: false,
        required: true,
        table_column: false,
        type: 'json',
        detail: true
    }
]
