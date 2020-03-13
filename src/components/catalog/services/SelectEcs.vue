<template lang="pug">
    div.select-ecs-container(v-if="tableForms && tableForms.length")
        div.child-form-title
            label.title {{tableForms[0].name}}
        div.business-form-body
            el-button.margin-bottom(size="mini" type="primary" @click="mountEcs" :icon="'ucmp-icon-console-attach'" round) {{tableForms[0].name}}
            el-button.margin-bottom(size="mini" @click="remove" :icon="'ucmp-icon-delete'" :disabled="selectedList.length === 0" round) 删除
            el-table.table-cot(:data="tableForms[0].list" border @selection-change="handleSelectionChange")
                el-table-column(type="selection" width="45")
                el-table-column(v-for="column in tableForms[0].tabAttrs"
                    :prop="column.key"
                    :key="column.prop"
                    :label="column.label"
                )
                    template(slot-scope="scope")
                        el-input(
                            v-if="column.key === 'port'"
                            size="small"
                            v-validate="rules.ssh_port"
                            v-model="scope.row[column.key]"
                            placeholder="端口号(1-65535)"
                            maxlength="10"
                            :name="'ssh_port' + scope.row['instance_id'] + scope.$index"
                            :data-vv-as="'端口号'"
                            :class="{'input': true, 'is-danger': errors.has('ssh_port' + scope.row['instance_id'] + scope.$index)}"
                            @blur="portBlur(scope.row['ip'])"
                        )
                        span(v-else-if="column.key === '_name'") {{scope.row['instance_name']}}
                        span(v-else) {{scope.row[column.key]}}
                        //- UCMP-1214 问题一：F5申请页面，选择云主机，无法二次选择ip；问题二：端口号超出范围，无提示信息
                        span.validator-error.is-danger.cell-error(v-if="column.key === 'port' && errors.has('ssh_port' + scope.row['instance_id'] + scope.$index)") {{ errors.first('ssh_port' + scope.row['instance_id'] + scope.$index) }}
            //- UCMP-1293 F5负载均衡申请页面，部分字段优化---光大客户提出的
            el-input.hidden(
                size="small"
                v-validate="rules.required"
                v-model="pool_ecs"
                :name="'pool_ecs'"
                :data-vv-as="tableForms[0].name"
                :class="{'input': true, 'is-danger': errors.has('pool_ecs')}"
            )
            span.validator-error.is-danger.pool_ecs-error(v-if="!pool_ecs && errors.has('pool_ecs')") {{ pool_ecs_msg }}
        SelectEcsDialog(v-if="dialogVisible" :visible="dialogVisible" :selectedList="tableForms[0].list" @closeDialog="closeDialog" @selectEcs="selectEcs" :isF5FormItem="isF5")
</template>
<script>
/**
 * @description 选择云主机
 */
import Api from '@api'
import { Validator } from 'vee-validate'
import SelectEcsDialog from './SelectEcsDialog'
export default {
    name: 'SelectEcs',
    inject: ['$validator'],
    props: {
        tableForms: {
            type: Array,
            default () {
                return []
            }
        },
        isF5: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            pool_ecs_msg: '至少需要两个云主机节点!',
            originAttributes: [],
            ip: '',
            rules: {
                required: {
                    required: true
                },
                ssh_port: {
                    required: true,
                    regex: /^(^[1-9]\d{0,3}$)|(^[1-5]\d{4}$)|(^[6][0-5][0-5][0-3][0-5]$)/,
                    uniqueRule: true
                }
            },
            title: '选择云主机',
            dialogVisible: false,
            dialogColumns: [
                {label: '云主机名称', prop: 'instance_name'},
                {label: 'IP地址', prop: 'ip', key: 'selectIp', isEdit: true, type: 'select'}
            ],
            dialogConfig: {
                search: true,
                searchKey: 'instance_name',
                searchPlaceholder: '请输入主机名',
                multiple: false, // 是否多选
                unique: 'instance_id',   // 能确定唯一数据的key
                api: '/f5/f5Pool/ecs/list',
                params: {},
                listRoot: 'list',
                pagination: true,
                frontPagination: false
            },
            selectedList: []
        }
    },
    methods: {
        /**
         * @description 挂载云主机
         */
        mountEcs () {
            this.dialogVisible = true
        },
        closeDialog () {
            this.dialogVisible = false
        },
         /**
         * @description 挂载云主机对话框确定事件
         */
        selectEcs (selectedArray) {
            this.tableForms[0].list = selectedArray.map(item => {
                return {
                    instance_id: item.instance_id,
                    instance_name: item.instance_name,
                    ip: item.selectIp,
                    selectIp: item.selectIp,
                    port: item.port || '',
                    major: item.major || 0
                }
            })

            this.closeDialog()
        },
        portBlur (ip) {
            this.ip = ip
        },
        /**
         * @description 端口号添加唯一性校验
         */
        setValidePort () {
            let self = this
            let uniqueRule = {
                getMessage (field, params, data) {
                    return (data && data.message) || 'something error!'
                },
                validate (value) {
                    if (value && self.ip) {
                        let sameInstance = self.tableForms[0].list.filter(item => self.ip === item.ip && value === item.port)
                        if (sameInstance.length > 1) {
                            return {
                                valid: false,
                                data: {message: '端口号被占用，请修改'}
                            }
                        }
                    }
                    return Api.get('f5PortExist', {port: value, ip: self.ip}, true).then(
                        res => {
                            return {
                                valid: !res.in_use,
                                data: res.in_use ? {message: '端口号被占用，请修改'} : undefined
                            }
                        }
                    )
                }
            }
            Validator.extend('uniqueRule', uniqueRule)
        },
        remove () {
            let selectList = []
            this.tableForms[0].list.forEach(item => {
                if (!this.selectedList.find(selectItem => selectItem === item))
                    selectList.push(item)
            })
            this.tableForms[0].list = selectList
            this.selectedList = []
        }, 
        handleSelectionChange (selectedList) {
            this.selectedList = selectedList
        }
    },
    created () {
        this.setValidePort()
    },
    computed: {
        pool_ecs () {
            this.setValidePort()
            return this.tableForms[0].list.length > 1 ? 'hasList' : ''
        }
    },
    components: {
        SelectEcsDialog
    }
}
</script>
<style lang="scss" scoped>
.select-ecs-container {
    background: #fff;
    margin-bottom: 10px;
    // padding: 20px;
    .business-form-body {
        .margin-bottom {
            margin-bottom: 5px;
        }
        .cell-error {
            padding-left: 10px;
        }
    }
}
.hidden {
    display: none;
}
.pool_ecs-error {
    position: relative !important;
}
</style>
