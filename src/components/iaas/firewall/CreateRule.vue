<template lang="pug">
    el-dialog(title="创建规则" :visible.sync="visible" :before-close="handleClose" width="600px")
        el-row
            el-col(:span="18")
                el-form.full-height(ref="fireRuleForm" :rules="rules" label-width="120px" label-position="right" size="small" :model="fireRuleForm")
                    el-form-item(:label="item.label" v-for="item in formItems" :key="item.prop" :prop="item.prop" v-if="item.isShow")
                        el-select.select-width(v-if="item.type === 'select'" clearable v-model="fireRuleForm[item.prop]" :placeholder="item.placeHolder")
                            el-option(v-for="option in options[item.prop]" :key="option.value" :value="option.value" :label="option.label")
                        el-input(v-else-if="item.type === 'input'" clearable v-model="fireRuleForm[item.prop]" :placeholder="item.placeHolder" :maxlength="item.maxlength")
                    el-form-item
                        el-button(@click="handleClose") 取消
                        el-button(type="primary" @click="submitForm") 保存
            el-col(:span="6")
                div.short-cut
                    div.title 快捷方式
                    div.short-tag(
                        v-for="(item, index) in shortcut" 
                        :key="index" 
                        :class="{ selected: item.name === activeIndex}"
                        @click="selectProtocal(item)"
                    ) {{item.name}}
</template>
<script>
/**
 *  @description 创建防火墙规则
 */
export default {
    name: 'CreateRule',
    props: ['visible'],
    data () {
        return {
            fireRuleForm: {
                name: '',
                priority: '',
                direction: '0',
                behavior: '1',
                protocal: 'tcp',
                icmpType: '',
                icmpCode: '',
                startPort: '',
                endPort: '',
                srcIp: ''
            },
            rules: {
                name: [
                    { required: true, message: '请输入名称', trigger: 'blur' }
                ],
                priority: [
                    { required: true, message: '请输入优先级', trigger: 'blur' }
                ]
            },
            formItems: [
                {
                    label: '名称',
                    prop: 'name',
                    type: 'input',
                    maxlength: 20,
                    placeHolder: '',
                    isShow: true
                },
                {
                    label: '优先级',
                    prop: 'priority',
                    type: 'input',
                    maxlength: 20,
                    placeHolder: '',
                    isShow: true
                },
                {
                    label: '方向',
                    prop: 'direction',
                    type: 'select',
                    placeHolder: '',
                    isShow: true
                },
                {
                    label: '行为',
                    prop: 'behavior',
                    type: 'select',
                    placeHolder: '',
                    isShow: true
                },
                {
                    label: '协议',
                    prop: 'protocal',
                    type: 'select',
                    placeHolder: '',
                    isShow: true
                },
                {
                    label: 'ICMP类型',
                    prop: 'icmpType',
                    type: 'select',
                    placeHolder: '',
                    isShow: false
                },
                {
                    label: 'ICMP代码',
                    prop: 'icmpCode',
                    type: 'select',
                    placeHolder: '',
                    isShow: false
                },
                {
                    label: '起始端口',
                    prop: 'startPort',
                    type: 'input',
                    maxlength: 20,
                    placeHolder: '',
                    isShow: true
                },
                {
                    label: '结束端口',
                    prop: 'endPort',
                    type: 'input',
                    maxlength: 20,
                    placeHolder: '',
                    isShow: true
                },
                {
                    label: '源IP',
                    prop: 'srcIp',
                    type: 'input',
                    maxlength: 20,
                    placeHolder: '',
                    isShow: true
                }
            ],
            options: {
                direction: [
                    {
                        label: '上行规则',
                        value: '0'
                    },
                    {
                        label: '下行规则',
                        value: '1'
                    }
                ],
                behavior: [
                    {
                        label: '拒绝',
                        value: '0'
                    },
                    {
                        label: '接受',
                        value: '1'
                    }
                ],
                protocal: [
                    {
                        label: 'TCP',
                        value: 'tcp'
                    },
                    {
                        label: 'UDP',
                        value: 'udp'
                    },
                    {
                        label: 'ICMP',
                        value: 'icmp'
                    },
                    {
                        label: 'GRE',
                        value: 'gre'
                    },
                    {
                        label: 'ESP',
                        value: 'esp'
                    },
                    {
                        label: 'AH',
                        value: 'ah'
                    },
                    {
                        label: 'IPIP',
                        value: 'ipip'
                    },
                    {
                        label: 'VRRP',
                        value: 'vrrp'
                    },
                    {
                        label: 'IPV6',
                        value: 'ipv6'
                    },
                    {
                        label: 'IPENCAP',
                        value: 'ipencap'
                    }
                ],
                icmpType: [
                    {
                        value: '8',
                        label: 'Echo',
                        code: [
                            {
                                value: '0',
                                label: 'Echo request'
                            }
                        ]
                    },
                    {
                        value: '0',
                        label: 'Echo Reply',
                        code: [
                            {
                                value: '0',
                                label: 'Echo reply'
                            }
                        ]
                    },
                    {
                        value: '3',
                        label: 'Destination Unreachable',
                        code: [
                            {
                                value: '0',
                                label: 'Destination network unreachable'
                            },
                            {
                                value: '1',
                                label: 'Destination host unreachable'
                            },
                            {
                                value: '2',
                                label: 'Destination protocol unreachable'
                            },
                            {
                                value: '3',
                                label: 'Destination port unreachable'
                            },
                            {
                                value: '4',
                                label: 'Fragmentation required, and DF flag set'
                            },
                            {
                                value: '5',
                                label: 'Source route failed'
                            },
                            {
                                value: '6',
                                label: 'Destination network unknown'
                            },
                            {
                                value: '7',
                                label: 'Destination host unknown'
                            },
                            {
                                value: '8',
                                label: 'Source host isolated'
                            },
                            {
                                value: '9',
                                label: 'Network administratively prohibited'
                            },
                            {
                                value: '10',
                                label: 'Host administratively prohibited'
                            },
                            {
                                value: '11',
                                label: 'Network unreachable for TOS'
                            },
                            {
                                value: '12',
                                label: 'Host unreachable for TOS'
                            },
                            {
                                value: '13',
                                label: 'Communication administratively prohibited'
                            },
                            {
                                value: '14',
                                label: 'Host Precedence Violation'
                            },
                            {
                                value: '15',
                                label: 'Precedence cutoff in effect'
                            }
                        ]
                    },
                    {
                        value: '4',
                        label: 'Source Quench',
                        code: [
                            {
                                value: '0',
                                label: 'Source quench (congestion control)'
                            }
                        ]
                    },
                    {
                        value: 5,
                        label: 'Redirect Message',
                        code: [
                            {
                                value: '0',
                                label: 'Redirect Datagram for the Network'
                            },
                            {
                                value: '1',
                                label: 'Redirect Datagram for the Host'
                            },
                            {
                                value: '2',
                                label: 'Redirect Datagram for the TOS & network'
                            },
                            {
                                value: '3',
                                label: 'Redirect Datagram for the TOS & host'
                            }
                        ]
                    },
                    {
                        value: '9',
                        label: 'Router Advertisement',
                        code: [
                            {
                                value: '0',
                                label: 'Router Advertisement'
                            }
                        ]
                    },
                    {
                        value: '10',
                        label: 'Router Solicitation',
                        code: [
                            {
                                value: '0',
                                label: 'Router discovery/selection/solicitation'
                            }
                        ]
                    },
                    {
                        value: '11',
                        label: 'Time Exceeded',
                        code: [
                            {
                                value: '0',
                                label: 'TTL expired in transit'
                            },
                            {
                                value: '1',
                                label: 'Fragment reassembly time exceeded'
                            }
                        ]
                    },
                    {
                        value: '12',
                        label: 'Parameter Problem: Bad IP header',
                        code: [
                            {
                                value: '0',
                                label: 'Pointer indicates the error'
                            },
                            {
                                value: '1',
                                label: 'Missing a required option'
                            },
                            {
                                value: '2',
                                label: 'Bad length'
                            }
                        ]
                    },
                    {
                        value: '13',
                        label: 'Timestamp',
                        code: [
                            {
                                value: '0',
                                label: 'Timestamp'
                            }
                        ]
                    },
                    {
                        value: '14',
                        label: 'Timestamp Reply',
                        code: [
                            {
                                value: '0',
                                label: 'Timestamp reply'
                            }
                        ]
                    },
                    {
                        value: '15',
                        label: 'Information Request',
                        code: [
                            {
                                value: '0',
                                label: 'Information Request'
                            }
                        ]
                    },
                    {
                        value: '16',
                        label: 'Information Reply',
                        code: [
                            {
                                value: '0',
                                label: 'Information Reply'
                            }
                        ]
                    },
                    {
                        value: '17',
                        label: 'Address Mask Request',
                        code: [
                            {
                                value: '0',
                                label: 'Address Mask Request'
                            }
                        ]
                    },
                    {
                        value: '18',
                        label: 'Address Mask Reply',
                        code: [
                            {
                                value: '0',
                                label: 'Address Mask Reply'
                            }
                        ]
                    },
                    {
                        value: '30',
                        label: 'Traceroute',
                        code: [
                            {
                                value: '0',
                                label: 'Information Request'
                            }
                        ]
                    }
                ],
                icmpCode: []
            },
            activeIndex: '',
            //快捷方式
            shortcut: [
                {
                    name: 'ping',
                    rule: {
                        protocol: 'icmp'
                    },
                    direction: 0
                }, {
                    name: 'ssh',
                    rule: {
                        protocol: 'tcp',
                        port: '22'
                    },
                    direction: 0
                }, {
                    name: 'http',
                    rule: {
                        protocol: 'tcp',
                        port: '80'
                    },
                    direction: 0
                }, {
                    name: 'https',
                    rule: {
                        protocol: 'tcp',
                        port: '443'
                    },
                    direction: 0
                }, {
                    name: 'ftp',
                    rule: {
                        protocol: 'tcp',
                        port: '21'
                    },
                    direction: 0
                }, {
                    name: 'remote',
                    rule: {
                        protocol: 'tcp',
                        port: '3389'
                    },
                    direction: 0
                }, {
                    name: 'openvpn',
                    rule: {
                        protocol: 'udp',
                        port: '1194'
                    },
                    direction: 0
                }, {
                    name: 'pptp',
                    rule: {
                        protocol: 'tcp',
                        port: '1723'
                    },
                    direction: 0
                }, {
                    name: 'l2tp',
                    rule: {
                        protocol: 'udp',
                        port: '1701'
                    },
                    direction: 0
                }, {
                    name: 'gre',
                    rule: {
                        protocol: 'gre'
                    },
                    direction: 0
                }, {
                    name: 'ipip',
                    rule: {
                        protocol: 'ipip'
                    },
                    direction: 0
                }
            ]
        }
    },
    methods: {
        /**
         * @description 关闭对话框
         */
        handleClose () {
            this.$emit('closeDialog')
        },
        /**
         * @description 提交表单
         */
        submitForm () {
            this.$refs.fireRuleForm.validate((valid) => {
                if (valid) {
                }
            })
        },
        /**
         * @description 设置表单显示内容
         */
        setFormItems () {
            if (!this.fireRuleForm.protocal) return
            if (this.fireRuleForm.protocal === 'icmp') {
                this.formItems[5].isShow = true
                this.formItems[6].isShow = true
                this.formItems[7].isShow = false
                this.formItems[8].isShow = false
            } else if (this.fireRuleForm.protocal === 'tcp' || this.fireRuleForm.protocal === 'udp') {
                this.formItems[5].isShow = false
                this.formItems[6].isShow = false
                this.formItems[7].isShow = true
                this.formItems[8].isShow = true
            } else {
                this.formItems[5].isShow = false
                this.formItems[6].isShow = false
                this.formItems[7].isShow = false
                this.formItems[8].isShow = false
            }
        },
        /**
         * @description 设置icmp codes
         */
        setIcmpCodes () {
            if (!this.fireRuleForm.icmpType) return
            let index = this.options.icmpType.findIndex(item => item.value === this.fireRuleForm.icmpType)
            if (index > -1) 
                this.options.icmpCode = this.options.icmpType[index].code
        },
        /**
         * @description 选择协议快捷方式
         * @param [shutItem] 选中快捷对象
         */
        selectProtocal (shutItem) {
            this.fireRuleForm.protocal = shutItem.rule.protocol
            this.activeIndex = shutItem.name
        }
    },
    computed: {
    },
    watch: {
        'fireRuleForm.protocal': {
            handler: function (newVal, oldVal) {
                this.setFormItems()
            },
            deep: true
        },
        'fireRuleForm.icmpType': {
            handler: function (newVal, oldVal) {
                this.setIcmpCodes()
            },
            deep: true
        }
    }
}
</script>
<style lang="scss" scoped>
$activeShotcum: #468847;
$fontContent: #333;
.short-cut {
    position: absolute;
    right: 20px;
    padding: 10px;
    text-align: center;
    .title {
        color: $fontContent;
        font-weight: 700;
    }
    .short-tag {
        height: 25px;
        line-height: 25px;
        width: 60px;
        margin-top: 5px;
        border: 1px solid $fontContent;
        border-radius: 5px;
        cursor: pointer;
    }
    .selected {
        background: $activeShotcum;
        border: 1px solid $activeShotcum;
        color: #fff;
    }
}
</style>

