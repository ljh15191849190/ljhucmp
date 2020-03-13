import Utils from '@server/Utils'
import { PowerStates, InstallStates } from '@server/ConstParams'
export default {
    doColumnsdisplay: {'ip': {'display': true}, 'sn': {'display': true}, 'name': {'display': true}, 'type': {'display': true}, 'model': {'display': true}, 'owner': {'display': false}, 'power': {'display': true}, 'oob_ip': {'display': true}, 'company': {'display': true}, 'cpu_sum': {'display': true}, 'cpu_type': {'display': true}, 'disc_sum': {'display': true}, 'os_status': {'display': true}, 'user_name': {'display': true}, 'created_at': {'display': true}, 'expired_at': {'display': false}, 'memory_sum': {'display': true}, 'system_name': {'display': true}, 'provider_code': {'display': true}},
    notdoColumnsdisplay: {'ip': {'display': true}, 'sn': {'display': true}, 'name': {'display': true}, 'type': {'display': true}, 'model': {'display': true}, 'power': {'display': true}, 'oob_ip': {'display': true}, 'company': {'display': true}, 'cpu_sum': {'display': true}, 'cpu_type': {'display': true}, 'disc_sum': {'display': true}, 'os_status': {'display': true}, 'user_name': {'display': true}, 'created_at': {'display': true}, 'memory_sum': {'display': true}, 'system_name': {'display': true}, 'provider_code': {'display': true}},
    doColumns: [
        { prop: 'name', label: '物理机名称', width: '200', href: true, isShow: true },
        { prop: 'oob_ip', label: '带外IP', width: '200', isShow: true },
        { prop: 'company', label: '制造商', width: '150', isShow: true },
        { prop: 'model', label: '型号', width: '150', isShow: true },
        { prop: 'sn', label: 'SN', width: '200', isShow: true },
        { 
            prop: 'system_name', 
            label: '操作系统',
            filterKey: 'system_id',
            filters: [],
            filter_link: {
                label_field: 'name',
                value_field: 'id'
            },
            width: '150',
            isShow: true
        },
        // { prop: 'system_name', label: '操作系统', width: '150' },
        { prop: 'ip', label: '操作系统IP', width: '200', isShow: true },
        { prop: 'power', label: '电源状态', filterKey: 'power', width: '150', filters: Utils.generateOpts(PowerStates), isShow: true },
        { prop: 'os_status', label: '状态', filterKey: 'os_status', filters: Utils.generateOpts(InstallStates), width: '200', isShow: true },
        { prop: 'cpu_sum', label: 'CPU总量(核)', width: '150', isShow: true },
        { prop: 'memory_sum', label: '内存总量(MB)', width: '150', isShow: true },
        { prop: 'disc_sum', label: '磁盘总量(GB)', width: '150', isShow: true },
        { prop: 'cpu_type', label: '处理器类型', width: '150', isShow: true },
        { 
            prop: 'type', 
            label: '物理机类型',
            filters: [{'label': '裸物理机', 'value': 'metal'}, {'label': '虚拟服务器', 'value': 'virtual'}],
            width: '150',
            isShow: true
        },
        { prop: 'created_at', label: '创建时间', width: '200', isShow: true },
        { prop: 'user_name', label: '责任人', width: '150', isShow: true },
        { 
            prop: 'provider_name', 
            label: '云厂商',
            filterKey: 'provider_id',
            filters: [],
            filter_link: {
                label_field: 'name',
                value_field: 'id'
            },
            width: '150',
            isShow: true
        },
        { prop: 'owner', label: '资源所属', width: '200', isShow: false },
        { prop: 'expired_at', label: '租期', width: '150', isShow: false }
    ],
    notColumns: [
        { prop: 'name', label: '物理机名称', width: '150', href: true, isShow: true },
        { prop: 'oob_ip', label: '带外IP', width: '150', isShow: true },
        { prop: 'company', label: '制造商', width: '150', isShow: true },
        { prop: 'model', label: '型号', width: '150', isShow: true },
        { prop: 'sn', label: 'SN', width: '150', isShow: true },
        { prop: 'system_name', label: '操作系统', width: '150', isShow: true },
        { prop: 'ip', label: '操作系统IP', width: '150', isShow: true },
        { prop: 'power', label: '电源状态', filterKey: 'power', filters: Utils.generateOpts(PowerStates), width: '150', isShow: true },
        { prop: 'os_status', label: '状态', filterKey: 'os_status', filters: Utils.generateOpts(InstallStates), width: '150', isShow: true },
        { prop: 'cpu_sum', label: 'CPU总量(核)', width: '150', isShow: true },
        { prop: 'memory_sum', label: '内存总量(MB)', width: '150', isShow: true },
        { prop: 'disc_sum', label: '磁盘总量(GB)', width: '150', isShow: true },
        { prop: 'cpu_type', label: '处理器类型', width: '150', isShow: true },
        { 
            prop: 'type', 
            label: '物理机类型',
            filters: [{'label': '裸物理机', 'value': 'metal'}, {'label': '虚拟服务器', 'value': 'virtual'}],
            width: '150',
            isShow: true
        },
        { prop: 'created_at', label: '创建时间', width: '150', isShow: true },
        { prop: 'user_name', label: '责任人', width: '150', isShow: true },
        { 
            prop: 'provider_name', 
            label: '云厂商',
            filterKey: 'provider_id',
            filters: [],
            filter_link: {
                label_field: 'name',
                value_field: 'id'
            }, 
            width: '150',
            isShow: true
        }
    ],
    allActions: {
        'iconGroup': [
            {
                'name': 'start',
                'label': '开机',
                'endpoint': {
                    'url': '/baremetal/resource/action/:bareId/start',
                    'method': 'POST'
                },
                'description': '开机',
                'disabled_rules': [
                    {
                        'key': 'power',
                        'value': [
                            'start',
                            'starting',
                            'rebooting'
                        ]
                    },
                    {
                        'key': 'os_status',
                        'value': [
                            'running'
                        ]
                    }
                ],
                'support_providers': [
                    'cloudboot'
                ],
                'disabled_description': '状态为开机、开机中、重启中或正在安装的物理机不能再次启动',
                'icon': 'ucmp-icon-console-start',
                'group': 'iconGroup',
                'type': 'success',
                'column': false
            },
            {
                'name': 'reboot',
                'label': '重启',
                'endpoint': {
                    'url': '/baremetal/resource/action/:bareId/reboot',
                    'method': 'POST'
                },
                'description': '重启物理机',
                'disabled_rules': [
                    {
                        'key': 'power',
                        'value': [
                            'stop',
                            'rebooting'
                        ]
                    },
                    {
                        'key': 'os_status',
                        'value': [
                            'running'
                        ]
                    }
                ],
                'support_providers': [
                    'cloudboot'
                ],
                'disabled_description': '状态为关机、重启中或正在安装的物理机不能重启',
                'icon': 'ucmp-icon-console-reboot',
                'group': 'iconGroup',
                'type': 'success',
                'warn': true,
                'column': false
            },
            {
                'name': 'stop',
                'label': '关机',
                'endpoint': {
                    'url': '/baremetal/resource/action/:bareId/stop',
                    'method': 'POST'
                },
                'description': '关闭物理机',
                'disabled_rules': [
                    {
                        'key': 'power',
                        'value': [
                            'stop',
                            'stopping',
                            'rebooting'
                        ]
                    },
                    {
                        'key': 'os_status',
                        'value': [
                            'running'
                        ]
                    }
                ],
                'support_providers': [
                    'cloudboot'
                ],
                'disabled_description': '状态为关机、关机中、重启中或正在安装的物理机不能关机',
                'icon': 'ucmp-icon-console-stop',
                'group': 'iconGroup',
                'type': 'danger',
                'warn': true,
                'column': false
            }, {
                'name': 'stop',
                'label': '取消纳管',
                'endpoint': {
                    'url': '/baremetal/resource/unmanaged/:bareId',
                    'method': 'POST'
                },
                'description': '取消纳管',
                'disabled_rules': [
                    {
                        'key': 'status',
                        'value': [
                            'not_exist',
                            'stopped'
                        ]
                    }
                ],
                'support_providers': [
                    'cloudboot'
                ],
                'disabled_description': '取消纳管',
                'icon': 'ucmp-icon-cancelnatube',
                'group': 'iconGroup',
                'type': 'danger',
                'warn': true,
                'column': false
            },
            {
                'name': 'console',
                'label': '远程控制台',
                'endpoint': {
                    'url': '/console',
                    'method': 'GET'
                },
                'description': '获取远程控制台窗口',
                'support_providers': [
                    'vmware_vsphere'
                ],
                'instance_max_count': 1,
                'disabled_description': '只能选择一台物理机',
                'icon': 'ucmp-icon-console-remote-console',
                'group': 'iconGroup',
                'type': 'success',
                'column': false
            }
        ],
        'moreGroup': [
            {
                'name': 'delete',
                'label': '从PXE启动',
                'enabled': true,
                'recycle': true,
                'endpoint': {
                    'url': '/baremetal/resource/action/:bareId/pxereboot',
                    'method': 'post'
                },
                'is_approve': true,
                'description': '从PXE启动',
                'attr_for_action': [
                    'provider_code',
                    'provider_id'
                ],
                'disabled_description': '从PXE启动',
                'icon': 'ucmp-icon-delete',
                'group': 'moreGroup',
                'warn': true,
                'column': true
            },
            {
                'name': 'modify',
                'label': '修改信息',
                'enabled': true,
                'is_approve': false,
                'description': '修改信息',
                'instance_max_count': 1,
                'icon': '',
                'group': 'moreGroup',
                'hidden': false,
                'column': false
            }
            // {
            //     'label': '修改信息',
            //     'enabled': true,
            //     'is_approve': true,
            //     'validation': {
            //         'remote': {
            //             'url': '',
            //             'method': 'post'
            //         }
            //     },
            //     'disabled_rules': [
            //         {
            //             'key': 'provider_code',
            //             'value': [
            //                 'cloudboot'
            //             ]
            //         },
            //         {
            //             'key': 'status',
            //             'value': [
            //                 'not_exist',
            //                 'error',
            //                 'unknown'
            //             ]
            //         }
            //     ],
            //     'instance_max_count': 1,
            //     'disabled_description': '已停止、错误、未知或资源不存在以及云厂商为阿里云的云主机无法修改配置',
            //     'name': 'modify',
            //     'icon': '',
            //     'group': 'moreGroup',
            //     'hidden': false,
            //     'column': false
            // }
            
        ]
    },
    cards: {
        left: [{
            title: '基础信息',
            content: [{
                    'key': 'physical_name',
                    'name': '物理机名称',
                    'label': '',
                    'isLink': true,
                    'link': ''
                },
                {
                    'key': 'status',
                    'name': '操作系统',
                    'label': ''
                },
                {
                    'key': 'size',
                    'name': '操作系统IP',
                    'label': ''
                }, {
                    'key': 'physical_name',
                    'name': '电源状态',
                    'label': '',
                    'isLink': true,
                    'link': ''
                },
                {
                    'key': 'status',
                    'name': '状态',
                    'label': ''
                },
                {
                    'key': 'size',
                    'name': '创建时间',
                    'label': ''
                }, {
                    'key': 'physical_name',
                    'name': '物理机类型',
                    'label': '',
                    'isLink': true,
                    'link': ''
                }]
        }, {
            title: '带外信息',
            content: [{
                    'key': 'physical_name',
                    'name': '电源IP地址',
                    'label': '',
                    'isLink': true,
                    'link': ''
                },
                {
                    'key': 'status',
                    'name': '带外版本',
                    'label': ''
                },
                {
                    'key': 'size',
                    'name': '用户名',
                    'label': ''
                }]
        }],
        right: [{
            title: '硬件信息',
            content: [{
                    'key': 'physical_name',
                    'name': 'SN',
                    'label': '',
                    'isLink': true,
                    'link': ''
                },
                {
                    'key': 'status',
                    'name': '制造商',
                    'label': ''
                },
                {
                    'key': 'size',
                    'name': '产品型号',
                    'label': ''
                }, {
                    'key': 'physical_name',
                    'name': '处理器型号',
                    'label': '',
                    'isLink': true,
                    'link': ''
                },
                {
                    'key': 'status',
                    'name': '网卡信息',
                    'label': ''
                },
                {
                    'key': 'size',
                    'name': '网络硬件信息',
                    'label': ''
                }, {
                    'key': 'physical_name',
                    'name': 'CPU（核）',
                    'label': '',
                    'isLink': true,
                    'link': ''
                },
                {
                    'key': 'status',
                    'name': '内存（MB）',
                    'label': ''
                },
                {
                    'key': 'size',
                    'name': '磁盘（GB）',
                    'label': ''
                }]
        }]
    }
    
}
