export default {
    columns: [
        { prop: 'prefix', label: '网段' },
        { prop: 'rir', label: '地区互联网管理' },
        { prop: 'family', label: '协议' },
        { prop: 'description', label: '用途' },
        { prop: 'created', label: '创建时间' }
    ],
    formItems: [
        { prop: 'vlan', label: 'VLAN ID' },
        { prop: 'dataCenter', label: 'DataCenter' },
        { prop: 'portGroup', label: 'VMware端口组' },
        { prop: 'masterDns', label: '主DNS' },
        { prop: 'slaveDns', label: '备用DNS' },
        { prop: 'dnsSuffix', label: 'DNS后缀' },
        { prop: 'dnsSearchSuffix', label: 'DNS查找后缀' },
        { prop: 'masterWins', label: '主WINS' },
        { prop: 'slaveWins', label: '备用WINS' },
        { prop: 'desc', label: '描叙' }
    ],
    ippoolsFormItems: [
        { prop: 'firstIp', label: '开始IP' },
        { prop: 'lastIp', label: '结束IP' },
        { prop: 'tag', label: '标签' },
        { prop: 'desc', label: '用途' }
    ],
    ippoolsColumns: [
        { prop: 'prefix', label: '子网' },
        { prop: 'status', label: '状态' },
        { prop: 'family', label: '协议' },
        { prop: 'last_updated', label: '更新时间' },
        { prop: 'role', label: '用途' },
        { prop: 'vlan', label: 'vlan' },
        { prop: 'description', label: '描述' }
    ],
    ipStates: [
        {type: 'success', prop: 1, label: '使用中'},
        {type: 'detail', prop: 2, label: '保留'},
        {type: 'error', prop: 3, label: '弃用'},
        {type: 'primary', prop: 5, label: 'DHCP'}    
    ],
    ipPurposes: [
        {prop: '内网', label: '内网'},
        {prop: '浮动', label: '浮动'},
        {prop: '互联网', label: '互联网'} 
    ],
    ipPoolStates: [
        {type: 'success', prop: 0, label: '容器'},
        {type: 'success', prop: 1, label: '使用中'},
        {type: 'info', prop: 2, label: '保留'},
        {type: 'danger', prop: 3, label: '弃用'}
    ],

    ipFormItems: [
        { prop: 'host', label: '主机' },
        { prop: 'resourceHost', label: '绑定主机' },
        { prop: 'purpose', label: 'IP用途' },
        { prop: 'ipPoolName', label: 'IP组名称' }
    ],
    ipColumns: [
        { prop: 'address', label: 'IP' },
        { prop: 'status', label: '状态' },
        { prop: 'family', label: '协议' },
        { prop: 'last_updated', label: '更新时间' },
        { prop: 'purpose', label: '用途' },
        { prop: 'description', label: '描述' }
    ]
}
