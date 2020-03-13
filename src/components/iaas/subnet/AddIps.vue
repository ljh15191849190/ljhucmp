<template lang="pug">
    el-form.add-ip-form(ref="ipForm" :rules="rules" label-width="80px" label-position="left" size="small" :model="ipForm")
        el-tabs(v-model="activeTab" type="card" @tab-click="handleTabClick")
            el-tab-pane(v-for="item in tabs" :label="item.label" :name="item.name" :key="item.name")
        el-form-item(label="子网" prop="subnet")
            el-select.form-item-width(v-model="ipForm.subnet" placeholder="请选择子网" @change="subnetChange")
                el-option(v-for="(item, index) in subnetList" :key="index" :value="item.prefix" :label="item.prefix")
        el-form-item(label="IP" prop="address" v-if="activeTab === 'single'")
            el-input.form-item-width(v-model="ipForm.address" maxlength="20" placeholder="请输入IP地址")
        el-form-item(label="开始IP" prop="first_ip" v-if="activeTab === 'multiple'")
            el-input.form-item-width(v-model="ipForm.first_ip" maxlength="20" placeholder="请输入开始IP")
        el-form-item(label="结束IP" prop="last_ip" v-if="activeTab === 'multiple'")
            el-input.form-item-width(v-model="ipForm.last_ip" maxlength="20" placeholder="请输入结束IP")
        el-form-item(label="状态" prop="status" placeholder="请选择状态")
            el-select.form-item-width(v-model="ipForm.status")
                el-option(v-for="(item, index) in ipStates" :key="item.prop" :value="item.prop" :label="item.label")
        el-form-item(label="用途" prop="purpose")
            el-select.form-item-width(v-model="ipForm.purpose" placeholder="请选择用途")
                el-option(v-for="(item, index) in ipPurposes" :key="item.prop" :value="item.prop" :label="item.label")
        el-form-item(label="描述" prop="description")
            el-input.form-item-width(v-model="ipForm.description" type="textarea" :autosize="{ minRows: 5}" maxlength="100" placeholder="请输入描述")
        el-form-item
            el-button(@click="handleClose" size="small") 取消
            el-button(type="primary" @click="submitForm" size="small") 保存
</template>
<script>
/**
 * @description 创建IP
 */
import Api from '@api'
import axios from 'axios'
import Subnet from '@mock/subnet/subnet.mock'
import OperMixin from '@mixins/operatorLog.mixin'

export default {
    name: 'AddIps',
    props: ['visible'],
    mixins: [OperMixin],
    data () {
        return {
            activeTab: 'single',
            ipStates: [],
            ipPurposes: [],
            subnetList: [],
            networkIp: '',
            netMaskNum: -1,
            tabs: [
                { label: '单个', name: 'single' },
                { label: '批量', name: 'multiple' }
            ],
            ipForm: {
                subnet: '',
                address: '',
                first_ip: '',
                last_ip: '',
                status: 1,
                purpose: '',
                description: ''
            },
            rules: {
                subnet: [
                    { required: true, message: '请选择子网', trigger: 'change' }
                ],
                address: [
                    { required: true, message: '请输入IP', trigger: 'blur' },
                    { pattern: /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/, message: 'IP格式有误', trigger: 'blur' },
                    { validator: this.validStartIp, trigger: 'blur' }
                ],
                first_ip: [
                    { required: true, message: '请输入开始IP', trigger: 'blur' },
                    { pattern: /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/, message: '开始IP格式有误', trigger: 'blur' },
                    { validator: this.validStartIp, trigger: 'blur' }
                ],
                last_ip: [
                    { required: true, message: '请输入结束IP', trigger: 'blur' },
                    { pattern: /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/, message: '结束IP格式有误', trigger: 'blur' },
                    { validator: this.validSEndIp, trigger: 'blur' }
                ],
                status: [
                    { required: true, message: '请选择状态', trigger: 'change' }
                ],
                purpose: [
                    { required: true, message: '请选择用途', trigger: 'change' }
                ],
                description: [
                    { required: true, message: '请输入描述', trigger: 'blur' }
                ]
            }
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
            this.$refs.ipForm.validate((valid) => {
                if (valid)
                    this.postIp()
            }) 
        },
        /**
         * @description 创建ip
         */
        postIp () {
            let ipForm = JSON.parse(JSON.stringify(this.ipForm))
            ipForm.tenant = localStorage.getItem('tenant')
            if (this.activeTab === 'single') {
                let srcAddress = this.ipForm.address
                ipForm.address = srcAddress + '/' + this.netMaskNum
                ipForm._id = 'createip'
                Api.post('iaas_ips', ipForm, false).then(
                    res => {
                        this.$notify({
                            type: 'success',
                            message: '创建IP' + srcAddress + '成功！'
                        })
                        this.$emit('submitIp')

                        // 插入操作日志
                        this.addOperLog({
                            text: '创建IP: ' + srcAddress,
                            modular_code: this.MODULAR_CODE.CLOUDINFRASTRUCTURE,
                            type_code: this.TYPE_CODE.CREATE,
                            resource: 'IP'
                        })
                    }
                )
            } else {
                Api.post('iaas_multiIps', ipForm, false).then(
                    res => {
                        this.$notify({
                            type: 'success',
                            message: '批量创建IP操作成功！'
                        })
                        this.$emit('submitIp')

                        // 插入操作日志
                        this.addOperLog({
                            text: `批量创建IP: (${ipForm.first_ip}-${ipForm.last_ip})`,
                            modular_code: this.MODULAR_CODE.CLOUDINFRASTRUCTURE,
                            type_code: this.TYPE_CODE.CREATE,
                            resource: 'IP'
                        })
                    }
                )
            }
        },
        /**
         * @description Tab切换事件
         */
        handleTabClick () {
            this.$refs.ipForm.clearValidate()
        },
        /**
         * @description 子网选择改变事件
         */
        subnetChange () {
            this.networkIp = this.ipForm.subnet.split('/')[0]
            this.netMaskNum = Number(this.ipForm.subnet.split('/')[1])
        },
        /**
         * @description 获取子网列表
         */
        getSubnetList () {
            let param = { offset: 0, limit: 999999, tenant: localStorage.getItem('tenant') }
            let containerObj = Object.assign(param, {status: 0})
            let containerIps = Api.get('iaas_prefixes', containerObj, false)
            let inuseObj = Object.assign(param, {status: 1})
            let inuseIps = Api.get('iaas_prefixes', inuseObj, false)
            this.submitDisabled = true

            axios.all([containerIps, inuseIps]).then(axios.spread(
                (containerIps, inuseIps) => {
                    this.subnetList = [...containerIps.results, ...inuseIps.results]
                })
            )
        },
        /**
         * @description 校验开始ip
         */
        validStartIp (rule, value, callback) {
            if (!value || !this.networkIp || this.netMaskNum === -1) callback()  
            let netMask = this.getNetMask(this.netMaskNum)
            let lowAddr = this.getLowAddr(this.networkIp, netMask)
            let highAddr = ''
            if (this.netMaskNum > 30) 
                highAddr = lowAddr
            else 
                highAddr = this.getHighAddr(this.networkIp, netMask)

            if (this.compareIp(value, lowAddr) >= 0 && this.compareIp(value, highAddr) <= 0) {
                if (this.ipForm.last_ip) {
                    highAddr = this.ipForm.last_ip 
                    if (this.compareIp(value, highAddr) >= 0)
                        callback(new Error('开始IP地址要小于结束IP地址, 请重新输入!')) 
                    else 
                        callback()
                } else 
                    callback()
            } else 
                callback(new Error(`IP地址有效范围:(${lowAddr} ~ ${highAddr}), 请重新输入!`))
        },
         /**
         * @description 校验结束ip
         */
        validSEndIp (rule, value, callback) {
            if (!value || !this.networkIp || this.netMaskNum === -1) callback() 
            let netMask = this.getNetMask(this.netMaskNum)
            let lowAddr = this.getLowAddr(this.networkIp, netMask)
            let highAddr = ''
            if (this.netMaskNum > 30) 
                highAddr = lowAddr
            else 
                highAddr = this.getHighAddr(this.networkIp, netMask)

            if (this.compareIp(value, lowAddr) >= 0 && this.compareIp(value, highAddr) <= 0) {
                if (this.ipForm.first_ip) {
                    lowAddr = this.ipForm.first_ip 
                    if (this.compareIp(value, lowAddr) <= 0)
                        callback(new Error('结束IP地址要大于开始IP地址, 请重新输入!')) 
                    else 
                        callback() 
                } else 
                    callback()
            } else 
                callback(new Error(`IP地址有效范围:(${lowAddr} ~ ${highAddr}), 请重新输入!`))
        },
        /**
         * @description 比较ip大小
         * @returns 如果大于，返回1，等于返回0，小于返回-1
         */
        compareIp (first_ip, last_ip) {   
            let first_ipArr = first_ip.split('.')
            let last_ipArr = last_ip.split('.')  
            for (let i = 0; i < 4; i++) {  
                if (Number(first_ipArr[i]) > Number(last_ipArr[i]))
                    return 1
                else if (Number(first_ipArr[i]) < Number(last_ipArr[i]))  
                    return -1 
            }  

            return 0
        },
        /**
         * @description 转换掩码的格式
         */
        getNetMask (inetMask) {
            let netMask = ''
            if (inetMask > 32) 
                return netMask

            //子网掩码为1占了几个字节
            let num1 = parseInt(inetMask / 8)
            //子网掩码的补位位数
            let num2 = inetMask % 8
            let array = []
            for (let i = 0; i < num1; i++) 
                array[i] = 255

            for (let i = num1; i < 4; i++) 
                array[i] = 0

            for (let i = 0; i < num2; num2--)
                array[num1] += Math.pow(2, 8 - num2)

            netMask = array[0] + '.' + array[1] + '.' + array[2] + '.' + array[3]

            return netMask
        },
        /**
         * @description 计算子网起始地址(不包括网络地址)
         */
        getLowAddr (ip, netMask) {
            let lowAddr = ''
            let ipArray = []
            let netMaskArray = []
            // I参数不正确
            if (ip.split('.').length !== 4 || netMask === '')
                return ''

            for (let i = 0; i < 4; i++) {
                ipArray[i] = ip.split('.')[i]
                netMaskArray[i] = netMask.split('.')[i]
                if ((ipArray[i] > 255 || ipArray[i] < 0 || netMaskArray[i] > 255) && netMaskArray[i] < 0)
                    return ''

                ipArray[i] = ipArray[i] & netMaskArray[i]
            }
            // 构造最小地址
            for (let i = 0; i < 4; i++) {
                if (i === 3)
                    ipArray[i] = ipArray[i] + 1

                if (lowAddr === '')
                    lowAddr += ipArray[i]
                else
                    lowAddr += '.' + ipArray[i]
            }

            return lowAddr
        },
        /**
         * @description 计算子网终止地址（不包括广播地址）
         */
        getHighAddr (ip, netMask) {
            let lowAddr = this.getLowAddr(ip, netMask)
            let hostNumber = this.getHostNumber(netMask)

            if (lowAddr === '' || hostNumber === 0)
                return ''

            let lowAddrArray = []
            for (let i = 0; i < 4; i++) {
                lowAddrArray[i] = lowAddr.split('.')[i]
                if (i === 3)
                    lowAddrArray[i] = Number(lowAddrArray[i] - 1)
            }
           
            lowAddrArray[3] = lowAddrArray[3] + Number(hostNumber - 1)
            if (lowAddrArray[3] > 255) {
                let k = parseInt(lowAddrArray[3] / 256)
                lowAddrArray[3] = lowAddrArray[3] % 256
                lowAddrArray[2] = Number(lowAddrArray[2]) + Number(k)
                if (lowAddrArray[2] > 255) {
                    k = parseInt(lowAddrArray[2] / 256)
                    lowAddrArray[2] = lowAddrArray[2] % 256
                    lowAddrArray[1] = Number(lowAddrArray[1]) + Number(k)
                    if (lowAddrArray[1] > 255) {
                        k = parseInt(lowAddrArray[1] / 256)
                        lowAddrArray[1] = lowAddrArray[1] % 256
                        lowAddrArray[0] = Number(lowAddrArray[0]) + Number(k)
                    }
                }
            }

            let highAddr = ''
            for (let i = 0; i < 4; i++) {
                if (i === 3)
                    lowAddrArray[i] = lowAddrArray[i] - 1

                if (highAddr === '')
                    highAddr = lowAddrArray[i]

                else
                    highAddr += '.' + lowAddrArray[i]
            }

            return highAddr
        },
        /**
         * @description 获取主机数
         * @param netMask
         * @returns {Number}
         */
        getHostNumber (netMask) {
            var hostNumber = 0
            var netMaskArray = []
            for (var i = 0; i < 4; i++) {
                netMaskArray[i] = netMask.split('.')[i]
                if (netMaskArray[i] < 255) {
                    hostNumber = Math.pow(256, 3 - i) * (256 - netMaskArray[i])
                    break
                }
            }

            return hostNumber
        }
    },
    created () {
        this.ipStates = Subnet.ipStates
        this.ipPurposes = Subnet.ipPurposes
        this.getSubnetList()
    }
}
</script>
<style lang="scss" scoped>
.add-ip-form {
    padding: 0 30px;
}
</style>
<style lang="scss">
.add-ip-form {
    .el-select {
        max-width: 100%!important;
    }
}
</style>




