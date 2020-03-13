/**
 * @description 服务元数据的前端配置文件，包含按钮icon、分类、显示类型、是否需要警告框提示等设置 user_defined 按照service_code进行分类设置，其余都是通用配置
 * @prop [icon] 图标class类
 * @prop [group] 分类 iconGroup|moreGroup|topGroup|columnGroup
 * @prop [type] 按钮显示类型，与el-button的type一致
 * @prop [warn] 执行是否需要警告框提示
 * @prop [icon] 警告框提示信息
 * @prop [hidden] 不显示该按钮
 * @prop [column] 表格操作列显示(true)该按钮
 */
export default {
    actions: {
        start: {
            icon: 'ucmp-icon-console-start',
            group: 'iconGroup',
            type: 'success',
            column: false
        },
        reboot: {
            icon: 'ucmp-icon-console-reboot',
            group: 'iconGroup',
            type: 'success',
            warn: true,
            column: false
        },
        stop: {
            icon: 'ucmp-icon-console-stop',
            group: 'iconGroup',
            type: 'danger',
            warn: true,
            column: false
        },
        delete: {
            icon: 'ucmp-icon-delete',
            group: 'moreGroup',
            warn: true,
            column: true,
            label: '删除'
        },
        assign: {
            group: 'moreGroup',
            warn: false,
            // bug UCMP-1131【控制台】控制台下云主机、云硬盘等列表中操作列过宽，需要优化显示。
            column: false,
            label: '存量分配'
        },
        bind: {
            group: 'moreGroup',
            warn: false,
            // bug UCMP-1131【控制台】控制台下云主机、云硬盘等列表中操作列过宽，需要优化显示。
            column: false,
            label: '绑定标签'
        },
        sync: {
            icon: 'el-icon-refresh',
            type: 'primary',
            group: 'moreGroup',
            warn: true,
            label: '同步'
        },
        modify: {
            icon: '',
            group: 'moreGroup',
            hidden: false,
            // UCMP3-1196 需求，要展示不同的label，配置在元数据了
            // label: '修改',
            // bug #UCMP-476【控制台】云主机申请页面最外层不需要“修改”按钮
            column: false
        },
        update_security_service: {
            icon: '',
            hidden: false,
            group: 'moreGroup',
            column: false,
            modal: true,
            useInitValue: true // 使用当前服务实例数据初始化表单数据
        },
        modify_health_check: {
            icon: '',
            group: 'moreGroup',
            column: false,
            modify_attrs: ['parent', 'send', 'receive'],
            type_for_go: 'monitor' // 此参数go来区分操作
        },
        modify_load_balancing: {
            icon: '',
            group: 'moreGroup',
            column: false,
            modify_attrs: ['load_balancing_mode'],
            type_for_go: 'pool'
        },
        modify_node_status: {
            icon: '',
            group: 'moreGroup',
            column: false,
            modify_attrs: [],
            type_for_go: 'node'
        },
        create: {
            icon: 'el-icon-plus',
            group: 'topGroup',
            hidden: true,
            label: '创建'
        },
        // The volume attach icon
        attach: {
            icon: 'ucmp-icon-console-attach',
            group: 'iconGroup',
            type: 'warning',
            modal: true // 表示执行该操作前需要使用模态框显示表单内容，与以下attribute搭配使用
            // attribute: [
            //     {key: 'ecs_instance_id', filters: ['owner_type', 'owner', 'env', 'provider_id'], remote_key: 'volume_name'}
            // ] // 执行该操作前模态框显示的表单项列表信息， key与元数据的attribute key一致， filters表示需要从被选中的实例中获取的筛选条件
        },
        // The volume detach icon
        detach: {
            icon: 'ucmp-icon-console-detach',
            group: 'iconGroup',
            warn: true,
            type: 'danger'
        },
        // The netbox_ip bind icon
        view: {
            icon: 'ucmp-icon-view',
            group: 'iconGroup',
            modal: true,
            // 关联服务副标题
            modelSubTitle: '云主机',
            // 不在详情顶部展示
            existInDetail: false,
            // 配置只读模式
            readonly: true,
            relateColumns: [
                {label: '云主机名称', prop: 'instance_name'},
                {label: 'IP', prop: 'group_ip'},
                {label: '状态', prop: 'status'},
                {label: '操作系统', prop: 'os_icon', icon: true},
                {label: '资源所属', prop: 'owner_name'},
                {label: '责任人', prop: 'user'}
            ]
        },
        bindIp: {
            icon: 'ucmp-icon-console-bindIp',
            group: 'iconGroup',
            modal: true,
            modelSubTitle: '云主机',
            existInDetail: false,
            filterItems: [{label: '云主机名称', prop: 'instance_name'}],
            relateColumns: [
                {label: '云主机名称', prop: 'instance_name'},
                {label: 'IP', prop: 'group_ip'},
                {label: '状态', prop: 'status'},
                {label: '操作系统', prop: 'os_icon', icon: true},
                {label: '资源所属', prop: 'owner_name'},
                {label: '责任人', prop: 'user'}
            ]
        },
        // The netbox_ip detach icon
        unbindIp: {
            icon: 'ucmp-icon-console-unbindIp',
            group: 'iconGroup',
            modal: true,
            modelSubTitle: '云主机',
            existInDetail: false,
            filterItems: [{label: '云主机名称', prop: 'instance_name'}],
            relateColumns: [
                {label: '云主机名称', prop: 'instance_name'},
                {label: 'IP', prop: 'group_ip'},
                {label: '状态', prop: 'status'},
                {label: '操作系统', prop: 'os_icon', icon: true},
                {label: '资源所属', prop: 'owner_name'},
                {label: '责任人', prop: 'user'}
            ]
        },
        release: {
            icon: 'ucmp-icon-console-release',
            group: 'iconGroup',
            warn: true,
            type: 'danger'
        },
        console: {
            icon: 'ucmp-icon-console-remote-console',
            group: 'iconGroup',
            type: 'success',
            column: false
        },
        add: {
            icon: 'ucmp-icon-plus',
            group: 'iconGroup',
            type: 'success',
            column: false
        },
        reduce: {
            icon: 'ucmp-icon-console-minus',
            group: 'iconGroup',
            type: 'success',
            column: false
        },
        clone: {
            icon: 'ucmp-icon-console-clone',
            group: 'iconGroup',
            type: 'success',
            modal: true,
            column: false
        },
        modify_responsible_person: {
            icon: '',
            group: 'moreGroup',
            hidden: false,
            label: '修改责任人',
            column: false
        },
        modify_resource_belong: {
            icon: '',
            group: 'moreGroup',
            hidden: false,
            label: '修改资源所属',
            column: false
        },
        synchro: {
            icon: 'ucmp-icon-process-convert',
            group: 'iconGroup',
            type: 'danger'
        },
        renewal: {
            group: 'moreGroup',
            warn: false,
            column: false,
            label: '续期'
        },
        /**
         * UCMP3-272 控制台云主机可创建快照    
         */
        create_snapshot: {
            group: 'moreGroup',
            warn: false,
            column: false,
            label: '创建快照'
        },
        modify_password: {
            group: 'moreGroup',
            warn: false,
            column: false,
            label: '录入密码'
        },
        modify_resource_pool: {
            group: 'moreGroup',
            warn: false,
            column: false,
            label: '分配资源池'  
        }
    },
    // 和action中重名的操作需要针对服务做不同的处理
    actionsForService: {
        nas: {
            attach: {
                icon: 'ucmp-icon-console-attach',
                group: 'iconGroup',
                type: 'warning'
            },
            detach: {
                icon: 'ucmp-icon-console-detach',
                group: 'iconGroup',
                type: 'danger'
            }
        }
    },
    user_defined: [
        {
            service_code: 'ecs',
            columns: {
                // bug #UCMP-455 要将重要信息字段展开
                ip: {
                    width: '110px'
                },
                expired_at: {
                    width: '100px'
                }
            },
            transform: {
                fields: ['status'] // 哪些key的volumn需要转化
            },
            filters: {
                state: {
                    group: 'advanced'
                },
                provider: {
                    group: 'advanced'
                }
            },
            attribute: {
                instance_name: {
                    type: 'input'
                },
                status: {
                    type: 'select'
                },
                flavor: {
                    type: 'select'
                },
                image: {
                    type: 'image'
                }
            },
            details: [
                {
                    code: 'basic',
                    button_code: 'use',
                    label: '资源使用',
                    type: 'basic',
                    group: []
                },
                {
                    code: 'ecs_monitor',
                    button_code: 'monitor_info',
                    label: '监控信息',
                    type: 'router'
                },
                {
                    code: 'alarm',
                    button_code: 'alarm_message',
                    label: '告警信息',
                    type: 'router'
                },
                {
                    code: 'strategy',
                    button_code: 'alarm_strategy',
                    label: '告警策略',
                    type: 'router'
                },
                {
                    code: 'strategy/edit',
                    label: '编辑告警策略',
                    type: 'childRouter'
                },
                {
                    code: 'bastion',
                    button_code: 'manage',
                    label: '堡垒机用户管理',
                    type: 'router'
                }
            ]
        },
        {
            service_code: 'volume',
            columns: {},
            transform: {
                fields: ['status'] // 哪些key的volumn需要转化
            },
            filters: {
                state: {
                    group: 'advanced'
                }
            },
            attribute: {},
            details: [
                {
                    code: 'basic',
                    button_code: 'use',
                    label: '资源使用',
                    type: 'basic',
                    group: []
                }
            ]
        },
        {
            service_code: 'tag',
            columns: {},
            filters: {},
            attribute: {},
            details: []
        },
        {
            service_code: 'mysql',
            columns: {},
            transform: {
                fields: [] // 哪些key的volumn需要转化
            },
            filters: {
                state: {
                    group: 'advanced'
                },
                provider: {
                    group: 'advanced'
                }
            },
            attribute: {
                instance_name: {
                    type: 'input'
                },
                status: {
                    type: 'select'
                },
                flavor: {
                    type: 'select'
                },
                image: {
                    type: 'select'
                }
            },
            details: [
                {
                    code: 'basic',
                    button_code: 'use',
                    label: '资源使用',
                    type: 'basic',
                    group: []
                },
                {
                    code: 'ecs_monitor',
                    button_code: 'monitor_info',
                    label: '监控信息',
                    type: 'router'
                },
                {
                    code: 'alarm',
                    button_code: 'alarm',
                    label: '告警信息',
                    type: 'router'
                },
                {
                    code: 'strategy',
                    button_code: 'strategy',
                    label: '告警策略',
                    type: 'router'
                },
                {
                    code: 'strategy/edit',
                    label: '编辑告警策略',
                    type: 'childRouter'
                }
            ]
        },
        {
            service_code: 'tomcat',
            columns: {},
            transform: {
                fields: [] // 哪些key的volumn需要转化
            },
            filters: {
                state: {
                    group: 'advanced'
                },
                provider: {
                    group: 'advanced'
                }
            },
            attribute: {
                instance_name: {
                    type: 'input'
                },
                status: {
                    type: 'select'
                },
                flavor: {
                    type: 'select'
                },
                image: {
                    type: 'select'
                }
            },
            details: [
                {
                    code: 'basic',
                    button_code: 'use',
                    label: '资源使用',
                    type: 'basic',
                    group: []
                },
                {
                    code: 'ecs_monitor',
                    button_code: 'monitor_info',
                    label: '监控信息',
                    type: 'router'
                },
                {
                    code: 'alarm',
                    label: '告警信息',
                    button_code: 'alarm',
                    type: 'router'
                },
                {
                    code: 'strategy',
                    label: '告警策略',
                    button_code: 'strategy',
                    type: 'router'
                },
                {
                    code: 'strategy/edit',
                    label: '编辑告警策略',
                    type: 'childRouter'
                }
            ]
        },
        {
            service_code: 'f5',
            columns: {
                ip: {
                    width: '110px'
                },
                expired_at: {
                    width: '100px'
                }
            },
            transform: {
                fields: ['status'] // 哪些key的volumn需要转化
            },
            filters: {
                state: {
                    group: 'advanced'
                },
                provider: {
                    group: 'advanced'
                }
            },
            attribute: {
                instance_name: {
                    type: 'input'
                },
                status: {
                    type: 'select'
                },
                flavor: {
                    type: 'select'
                },
                image: {
                    type: 'select'
                }
            },
            details: [
                {
                    code: 'basic',
                    button_code: 'use',
                    label: '资源使用',
                    type: 'basic',
                    group: []
                },
                {
                    code: 'ecs_monitor',
                    button_code: 'monitor_info',
                    label: '监控信息',
                    type: 'router'
                },
                {
                    code: 'alarm',
                    button_code: 'alarm',
                    label: '告警信息',
                    type: 'router'
                },
                {
                    code: 'strategy',
                    button_code: 'strategy',
                    label: '告警策略',
                    type: 'router'
                }

            ]
        },
        {
            service_code: 'nas',
            columns: {
                ip: {
                    width: '110px'
                },
                expired_at: {
                    width: '100px'
                }
            },
            transform: {
                fields: ['status', 'size_unit'] // 哪些key的volumn需要转化
            },
            filters: {
                state: {
                    group: 'advanced'
                }
            },
            attribute: {
                instance_name: {
                    type: 'input'
                },
                status: {
                    type: 'select'
                }
            },
            details: [
                {
                    code: 'basic',
                    button_code: 'use',
                    label: '资源使用',
                    type: 'basic',
                    group: []
                },
                {
                    code: 'ecs_monitor',
                    button_code: 'monitor_info',
                    label: '监控信息',
                    type: 'router'
                },
                {
                    code: 'alarm',
                    button_code: 'alarm',
                    label: '告警信息',
                    type: 'router'
                },
                {
                    code: 'strategy',
                    button_code: 'strategy',
                    label: '告警策略',
                    type: 'router'
                }

            ]
        },
        {
            service_code: 'oracle',
            columns: {
                expired_at: {
                    width: '100px'
                }
            },
            transform: {},
            filters: {
                state: {
                    group: 'advanced'
                }
            },
            attribute: {
                oracle_name: {
                    type: 'input'
                }
            },
            details: [
                {
                    code: 'basic',
                    button_code: 'use',
                    label: '资源使用',
                    type: 'basic',
                    group: []
                },
                {
                    code: 'ecs_monitor',
                    button_code: 'monitor_info',
                    label: '监控信息',
                    type: 'router'
                },
                {
                    code: 'alarm',
                    label: '告警信息',
                    button_code: 'alarm',
                    type: 'router'
                },
                {
                    code: 'strategy',
                    label: '告警策略',
                    button_code: 'strategy',
                    type: 'router'
                },
                {
                    code: 'strategy/edit',
                    label: '编辑告警策略',
                    type: 'childRouter'
                }
            ]
        },
        {
            service_code: 'weblogic',
            columns: {
                expired_at: {
                    width: '100px'
                }
            },
            transform: {},
            filters: {
                state: {
                    group: 'advanced'
                }
            },
            attribute: {
                weblogic_name: {
                    type: 'input'
                }
            },
            details: [
                {
                    code: 'basic',
                    button_code: 'use',
                    label: '资源使用',
                    type: 'basic',
                    group: []
                },
                {
                    code: 'ecs_monitor',
                    button_code: 'monitor_info',
                    label: '监控信息',
                    type: 'router'
                },
                {
                    code: 'alarm',
                    label: '告警信息',
                    button_code: 'alarm',
                    type: 'router'
                },
                {
                    code: 'strategy',
                    label: '告警策略',
                    button_code: 'strategy',
                    type: 'router'
                },
                {
                    code: 'strategy/edit',
                    label: '编辑告警策略',
                    type: 'childRouter'
                }
            ]
        },
        {
            service_code: 'qingcloud_rdb',
            columns: {},
            transform: {},
            filters: {},
            attribute: {},
            details: [
                {
                    code: 'basic',
                    label: '资源使用',
                    button_code: 'use',
                    type: 'basic',
                    group: []
                }
            ]
        },
        {
            service_code: 'qingcloud_lb',
            columns: {},
            transform: {},
            filters: {},
            attribute: {},
            details: [
                {
                    code: 'basic',
                    button_code: 'use',
                    label: '资源使用',
                    type: 'basic',
                    group: []
                }
            ]
        },
        {
            service_code: 'qingcloud_cache',
            columns: {},
            transform: {},
            filters: {},
            attribute: {},
            details: [
                {
                    code: 'basic',
                    button_code: 'use',
                    label: '资源使用',
                    type: 'basic',
                    group: []
                }
            ]
        },
        // bug UCMP3-787 云主机被F5服务关联后，进入该云主机详情，在云主机详情中进入pool详情页面，不应该显示“堡垒机”页签
        {
            service_code: 'pool',
            columns: {},
            transform: {},
            filters: {},
            attribute: {},
            details: [
                {
                    code: 'basic',
                    button_code: 'use',
                    label: '资源使用',
                    type: 'basic',
                    group: []
                }
            ]
        },
        {
            service_code: 'netbox_ip',
            columns: {},
            transform: {},
            filters: {},
            attribute: {},
            details: [
                {
                    code: 'basic',
                    button_code: 'use',
                    label: '资源使用',
                    type: 'basic',
                    group: []
                },
                {
                    code: 'related_ecs',
                    button_code: 'related',
                    label: '关联云主机',
                    type: 'basic',
                    group: []
                }
            ]
        },
        {
            service_code: 'backup',
            columns: {},
            transform: {},
            filters: {},
            attribute: {},
            details: [
                {
                    code: 'basic',
                    button_code: 'use',
                    label: '资源使用',
                    type: 'basic',
                    group: []
                },
                {
                    code: 'related_ecs',
                    label: '关联云主机',
                    type: 'basic',
                    group: []
                }
            ]
        },
        {
            service_code: 'firewall_strategy',
            details: [
                {
                    code: 'basic',
                    label: '资源使用',
                    button_code: 'use',
                    type: 'basic',
                    group: []
                }
            ]
        },
        {
            service_code: 'juniper_policy',
            details: [
                {
                    code: 'basic',
                    label: '资源使用',
                    button_code: 'use',
                    type: 'basic',
                    group: []
                }
            ]
        },
        {
            service_code: 'oracle_rac',
            details: [
                {
                    code: 'basic',
                    label: '资源使用',
                    button_code: 'use',
                    type: 'basic',
                    group: []
                },
                {
                    code: 'instance',
                    label: '实例',
                    button_code: 'instance',
                    type: 'router',
                    group: []
                }
            ]
        },
        {
            service_code: 'baremetal',
            columns: {},
            transform: {},
            filters: {},
            attribute: {},
            details: [
                {
                    code: 'basic',
                    label: '资源使用',
                    button_code: 'info',
                    type: 'basic',
                    // detail的group主要用于在基本信息内添加新的card和显示信息用，默认为空
                    group: [
                        {
                            label: '硬件信息',
                            id: 'hardInfo',
                            list: [
                                'company',
                                'model',
                                'sn',
                                'nic_device',
                                'cpu_sum',
                                'memory_sum',
                                'disc_sum',
                                'cpu_type'
                            ]
                        }
                    ]
                },
                {
                    code: 'hardware_monitor',
                    button_code: 'hardware_monitor',
                    label: '硬件监控',
                    type: 'router'
                },
                {
                    code: 'ecs_monitor',
                    button_code: 'system_monitor',
                    label: '系统监控',
                    type: 'router'
                },
                {
                    code: 'alarm',
                    button_code: 'alarm_message',
                    label: '告警信息',
                    type: 'router'
                },
                {
                    code: 'strategy',
                    button_code: 'alarm_strategy',
                    label: '告警策略',
                    type: 'router'
                },
                {
                    code: 'gpu_monitor',
                    button_code: 'gpu_monitor',
                    label: '专业显卡监控',
                    type: 'router'
                }
            ]
        }
    ]
}
