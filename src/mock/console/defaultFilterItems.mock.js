export default [
    {
        label: '资源所属类型',
        key: 'owner_type',
        validation: {},
        enum: [{
            id: 'org',
            name: '组织机构'
        }, {
            id: 'app',
            name: '应用'
        }],
        type: 'select',
        relation: true,
        childKey: 'owner_name',
        children: [{
            key: 'org',
            label: '组织机构',
            validation: {},
            data_link: {
                text_field: 'org_name',
                value_field: 'id',
                endpoint: '/gd/v2/user/orgtree',
                method: 'get',
                result: 'data',
                children: 'sub_orgs'
            },
            type: 'cascader',
            multiple: true
        },
        {
            key: 'app',
            type: 'select',
            label: '应用',
            validation: {},
            data_link: {
                text_field: 'app_name',
                value_field: 'id',
                result: 'data.apps',
                endpoint: '/gd/v2/business/apps/list?limit=99999&page=1',
                method: 'get'
            }
        }]
    }

]
