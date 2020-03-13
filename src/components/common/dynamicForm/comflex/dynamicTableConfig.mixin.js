import metaUtils from '@/server/metadata.utils'
import {mapGetters} from 'vuex'

const nasAutoColumns = [
    {label: '端口', prop: 'target_ssh_port', edit: true},
    {label: '主机密码', prop: 'root_passwd', edit: true, password: true}
]

const nasAutoRules = {
    target_ssh_port: {
        required: true,
        regex: /^(^[1-9]\d{0,3}$)|(^[1-5]\d{4}$)|(^[6][0-5][0-5][0-3][0-5]$)/
    },
    root_passwd: {
        required: true
    }
}
export default {
    methods: {
        getCheckedMeta (serviceCode) {
            const metaData = this.metadata
            return metaUtils.getCheckedMeta(metaData, serviceCode)
        },
        getItemEnum (serviceCode, key) {
            const checkedMetaData = this.getCheckedMeta(serviceCode)

            const attribute = checkedMetaData.attribute ? checkedMetaData.attribute.find(item => {
                return item.key === key
            }) : {}
            return attribute.enum || []
        },
        getRelatedItemEnum (serviceCode, key) {
            const checkedMetaData = this.getCheckedMeta(serviceCode)

            const attribute = checkedMetaData.related_service ? checkedMetaData.related_service[0].attribute.find(item => {
                return item.key === key
            }) : {}
            return attribute.enum || []
        }
    },
    computed: {
        dynamicTableConfig () {
            let config = {
                tag: {
                    dialogConfig: {
                        search: true,
                        searchKey: 'tag_name',
                        searchPlaceholder: '请输入标签名称搜索',
                        multiple: false, // 是否多选
                        unique: 'tag_id',   // 能确定唯一数据的key
                        api: '/ucmp3/service_instance/tag',
                        frontPagination: false,
                        listRoot: 'list',
                        maxChooseCount: 10
                    },
                    dialogColumns: [
                        {
                            label: '所属类型',
                            prop: 'service_code',
                            enum: this.getItemEnum('tag', 'service_code'),
                            text_field: 'name',
                            value_field: 'id'
                        },
                        {
                            label: '标签类型',
                            prop: 'tag_type',
                            enum: this.getItemEnum('tag', 'tag_type'),
                            text_field: 'name',
                            value_field: 'id'
                        },
                        {label: '标签名称', prop: 'tag_name'}
                    ],
                    columns: [
                        {
                            label: '所属类型',
                            prop: 'service_code',
                            enum: this.getItemEnum('tag', 'service_code'),
                            text_field: 'name',
                            value_field: 'id'
                        },
                        {
                            label: '标签类型',
                            prop: 'tag_type',
                            enum: this.getItemEnum('tag', 'tag_type'),
                            text_field: 'name',
                            value_field: 'id'
                        },
                        {label: '标签名称', prop: 'tag_name'}
                    ]
                },
                ecs: {
                    dialogColumns: [
                        {label: '云主机名称', prop: 'instance_name'},
                        {label: 'ID', prop: 'instance_id'},
                        {label: '操作系统', prop: 'os_icon', icon: true},
                        {label: 'IP地址', prop: 'ip', key: 'selectIp', isEdit: true, type: 'select', width: '180px'}
                    ],
                    dialogConfig: {
                        search: true,
                        searchKey: 'instance_name',
                        searchPlaceholder: '请输入主机名',
                        multiple: false, // 是否多选
                        unique: 'instance_id',   // 能确定唯一数据的key
                        api: '/nas/ecs/usable/list',
                        params: {},
                        listRoot: 'list',
                        pagination: true,
                        frontPagination: false,
                        // UCMP3.1-18 NAS申请时也只支持单个挂载
                        // UCMP3.1-18 现在只支持NFS，在云主机选择时没有足够条件来判断是什么os，所以只添加了提示，让用户判断
                        alert: this.nasAutoAttach ? 'Windows暂不支持自动挂载' : 'NAS需要手动挂载',
                        selectable: function (row, index) {
                            return row.os_icon
                        }
                    },
                    rules: {
                        selectIp: {
                            required: true
                        },
                        nas_fs_type: {
                            required: true
                        },
                        target_path: {
                            required: true,
                            regex: /^[\w\/\\:\-]*$/
                        }
                    },
                    columns: [
                        {label: '云主机', prop: 'instance_name'},
                        {label: 'ID', prop: 'instance_id'},
                        {label: 'IP', prop: 'selectIp'},
                        {
                            label: '文件系统类型',
                            prop: 'nas_fs_type',
                            reference: true,
                            referenceKey: 'os_icon',
                            referenceValue: {
                                windows: {value: 'cifs', label: 'CIFS'},
                                linux: {value: 'nfs', label: 'NFS'}
                            }
                        },
                        {label: '挂载路径', prop: 'target_path', edit: true}
                    ]
                }
            }

            if (this.nasAutoAttach) {
                config.ecs.columns = config.ecs.columns.concat(nasAutoColumns)
                Object.assign(config.ecs.rules, nasAutoRules)
            }

            return config
        },
        ...mapGetters([
            'metadata',
            'nasAutoAttach'
        ])
    }
}
