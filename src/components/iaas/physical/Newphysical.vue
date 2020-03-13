<template lang="pug">
    el-form.full-height(ref="workSheetForm" :rules="rules" label-width="80px" label-position="right" size="small" :model="workSheetForm")
        div 带外信息
        el-row
            el-col(:span="11")
                el-form-item(label="带外版本" prop="oob.oob_version")
                    el-select.select-width(clearable v-model="workSheetForm.oob.oob_version" placeholder="请选择")
                        el-option(v-for="option in versionOptions"
                        :value="option.id"
                        :key="option.id"
                        :label="option.name")
           
            el-col(:span="11")
                el-form-item(label="带外用户" prop="oob.oob_name")
                    el-input(clearable v-model="workSheetForm.oob.oob_name" placeholder="请输入带外用户" maxlength="32")
        el-row
            el-col(:span="11")
                el-form-item(label="带外IP管理" prop="oob.oob_ip")
                    el-input(clearable v-model="workSheetForm.oob.oob_ip" placeholder="请输入带外IP" maxlength="32")
            el-col(:span="11")
                el-form-item(label="带外密码" prop="oob.oob_password")
                    el-input(clearable auto-complete="new-password" v-model="workSheetForm.oob.oob_password" type="password" placeholder="带外密码" maxlength="32")
        div.dividing  基本信息
        el-row
            el-col(:span="11")
                el-form-item(label="名称" prop="name")
                    el-input(clearable v-model="workSheetForm.name" placeholder="请输入名称" maxlength="32")
            el-col(:span="11")
                el-form-item(label="云厂商" prop="provider_id")
                    el-select.select-width(clearable v-model="workSheetForm.provider_id" placeholder="请选择云厂商")
                        el-option(v-for="option in providerList"
                        :key="option.id"
                        :value="option.id"
                        :label="option.name")
        el-row
            el-col(:span="11")
                el-form-item(label="SN" prop="sn")
                    el-row
                        el-col(:span="15")
                            el-input(:disabled="disabled" clearable v-model="workSheetForm.sn" placeholder="请输入SN" maxlength="50")
                        el-col.paddindleft(:span="4")
                            el-button(:disabled="disabled" type="primary" size="small" round @click="getSN()") 自动获取
            el-col(:span="11")
                el-form-item(label="CPU(核)" prop="cpu_sum")
                    el-input(clearable v-model="workSheetForm.cpu_sum" placeholder="请输入CPU" maxlength="32" :disabled="isUseddisabled")
        el-row
            el-col(:span="11")
                el-form-item(label="制造商" prop="company")
                    el-input(clearable v-model="workSheetForm.company" placeholder="请输入制造商" maxlength="32" :disabled="isUseddisabled")
            el-col(:span="11")
                el-form-item(label="内存(MB)" prop="memory_sum")
                    el-input(clearable v-model="workSheetForm.memory_sum" placeholder="请输入内存" maxlength="32" :disabled="isUseddisabled")
        el-row
            el-col(:span="11")
                el-form-item(label="型号" prop="model")
                    el-input(clearable v-model="workSheetForm.model" placeholder="请输入型号" maxlength="32" :disabled="isUseddisabled")
            el-col(:span="11")
                el-form-item(label="磁盘(GB)" prop="disc_sum")
                    el-input(clearable v-model="workSheetForm.disc_sum" placeholder="请输入磁盘" maxlength="32" :disabled="isUseddisabled")
        
        el-row
            el-col(:span="11")
                el-form-item(label="物理机类型" prop="type")
                    el-select.select-width(clearable v-model="workSheetForm.type" placeholder="请选择" :disabled="isUseddisabled")
                        el-option(v-for="option in defaultOptions"
                        :key="option.id"
                        :value="option.id"
                        :label="option.name") 
        div.dividing VNC信息
        el-form-item(label="是否开启")
            el-radio-group(v-model="modeltype" @change="onchangeUp")
                el-radio(label="1") 是
                el-radio(label="0") 否
        el-row(v-if="modeltype==='1'")
            el-col(:span="11")
                el-form-item(label="用户名" prop="vnc.username")
                    el-input(clearable v-model="workSheetForm.vnc.username" placeholder="请输入用户名" maxlength="32")
            el-col(:span="11")
                el-form-item(label="密码" prop="vnc.password")
                    el-input(clearable v-model="workSheetForm.vnc.password" placeholder="请输入密码" type="password" maxlength="32")
        el-row(v-if="modeltype==='1'")
            el-col(:span="11")
                el-form-item(label="IP地址" prop="vnc.ip")
                    el-input(clearable v-model="workSheetForm.vnc.ip" placeholder="请输入IP地址" maxlength="32")
            el-col(:span="11")
                el-form-item(label="端口" prop="vnc.port")
                    el-input(clearable v-model="workSheetForm.vnc.port" placeholder="请输入端口" maxlength="32")
        el-form-item
            el-button(@click="handleClose") 取消
            el-button(type="primary" @click="submitForm" :loading="isSaving") 保存
</template>
<script>
    /**
     * @description 创建物理机
     */
    import Api from '@api'

    export default {
        name: 'Newphysical',
        props: ['visible', 'selectRow'],
        data () {
            return {
                modeltype: '0',
                isSaving: false,
                workSheetForm: {
                    // bareId: '',
                    provider_id: '',
                    name: '',
                    model: '',
                    sn: '',
                    type: '',
                    company: '',
                    cpu_sum: '',
                    memory_sum: '',
                    disc_sum: '',
                    oob: {
                        oob_ip: '',
                        oob_version: '',
                        oob_name: '',
                        oob_password: '',
                        oob_port: ''
                    },
                    vnc: {
                        username: '',
                        password: '',
                        ip: '',
                        port: ''
                    }
                },
                providerList: [],
                versionOptions: [{id: 'IPMI1.5', name: 'IPMI1.5'}, {id: 'IPMI2.0', name: 'IPMI2.0'}],
                defaultOptions: [{id: 'metal', name: '裸物理机'}, {id: 'virtual', name: '虚拟服务器'}],
                rules: {
                    name: [
                        {required: true, message: '请输入名称', trigger: 'blur'}
                    ],
                    provider_id: [
                        {required: true, message: '请选择云厂商', trigger: 'change'}
                    ],
                    sn: [
                        {required: true, message: '请输入SN', trigger: 'blur'}
                    ],
                    'oob.oob_ip': [
                        { required: true, message: '请输入带外IP管理', trigger: 'blur' },
                        { pattern: /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/, message: 'IP格式有误', trigger: 'blur' }
                    ],
                    'oob.oob_name': [
                        {required: true, message: '请输入带外用户', trigger: 'blur'}
                    ],
                    'oob.oob_version': [
                        {required: true, message: '请输入带外版本', trigger: 'blur,change'}
                    ],
                    'oob.oob_password': [
                        {required: true, message: '请输入带外密码', trigger: 'blur'}
                    ],
                    'vnc.username': [{required: true, message: '请输入用户名', trigger: 'blur'}],
                    'vnc.password': [{required: true, message: '请输入密码', trigger: 'blur'}],
                    'vnc.ip': [
                            { required: true, message: '请输入IP地址', trigger: 'blur' },
                            { pattern: /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/, message: 'IP格式有误', trigger: 'blur' }
                    ],
                    'vnc.port': [{required: true, message: '请输入端口地址', trigger: 'blur'}],
                    ticketTitle: [
                        {required: true, message: '请输入工单标题', trigger: 'blur'},
                        {
                            pattern: /^[\u4e00-\u9fa5\w\-]+$/,
                            message: '支持英文字母，数字，汉字，横杠，下划线',
                            trigger: 'blur'
                        }
                    ]
                },
                types: [],
                grades: []
            }
        },
        computed: {
            disabled () {
                if (this.selectRow && this.selectRow.length === 1) 
                    return this.selectRow[0].issync || this.selectRow[0].is_used
            },
            isUseddisabled () {
                if (this.selectRow && this.selectRow.length === 1) 
                    return this.selectRow[0].is_used
            }
        },
        methods: {
            getSN () {
                // physic_getSn
                let obj = {}
                obj.oob_host = this.workSheetForm.oob.oob_ip
                obj.oob_pass = this.workSheetForm.oob.oob_password
                obj.oob_user = this.workSheetForm.oob.oob_name
                obj.provider_id = this.workSheetForm.provider_id
                Api.post('physic_getSn', obj).then(res => {
                    if (res && res.data) 
                        this.workSheetForm.sn = res.data.ProductSerial
                }).catch(() => {
                })
            },
            onchangeUp (value) {
                this.modeltype = value
            },
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
                this.isSaving = true
                let checkProvider = this.providerList.find(item => item.id === this.workSheetForm.provider_id)
                this.workSheetForm.provider_code = checkProvider ? checkProvider.provider_code : ''
                this.$refs.workSheetForm.validate((valid) => {
                    if (valid) {
                        if (!this.selectRow) {
                            Api.post('physic_savePhy', this.workSheetForm).then(res => {
                                this.$notify({
                                    type: 'success',
                                    message: '添加成功!'
                                })

                                this.$emit('submitPhy')
                                this.isSaving = false
                            }).catch(() => {
                                this.isSaving = false
                            })
                        } else {
                            //修改和纳管
                            Api.put('physic_editPhy', this.workSheetForm).then(res => {
                                this.$notify({
                                    type: 'success',
                                    message: '修改成功!'
                                })
                                this.$emit('submitPhy')
                                this.isSaving = false
                            }).catch(() => {
                                this.isSaving = false
                            })
                        }
                    } else this.isSaving = false
                })
            },
            getProviderList () {
                Api.get('physic_provider', {provider_code: 'cloudboot'}, true).then(
                    res => {
                        this.providerList = res
                    }
                )
            }
        },
        created () {
            if (this.selectRow && this.selectRow.length === 1) {
                this.workSheetForm.name = this.selectRow[0].name
                this.workSheetForm.bareId = this.selectRow[0].bare_id
                this.workSheetForm.model = this.selectRow[0].model
                this.workSheetForm.sn = this.selectRow[0].sn
                this.workSheetForm.type = this.selectRow[0].type
                this.workSheetForm.company = this.selectRow[0].company
                this.workSheetForm.oob = this.selectRow[0].oob
                this.workSheetForm.cpu_sum = this.selectRow[0].cpu_sum
                this.workSheetForm.memory_sum = this.selectRow[0].memory_sum
                this.workSheetForm.disc_sum = this.selectRow[0].disc_sum
                this.workSheetForm.provider_id = this.selectRow[0].provider_id
                if (this.selectRow[0].vnc && this.selectRow[0].vnc.ip) {
                    this.workSheetForm.vnc = this.selectRow[0].vnc
                    this.modeltype = '1'
                }
            }
            this.getProviderList() //云厂商
        }
    }
</script>
<style lang="scss" scoped>
    .select-width {
        width: 100%;
        max-width:100%;
    }
    .paddindleft{
        padding-left:3px;
    }
    .dividing{
        margin-top:15px;
        border-top: 1px dashed #ccc
    }
</style>
