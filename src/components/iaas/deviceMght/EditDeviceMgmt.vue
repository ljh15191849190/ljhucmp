<template lang="pug">
    UcmpFormContainer(:breadcrumbItems="breadcrumbItems")
        div.full-height(slot="form-content")
            el-form.full-height.device-form.padding(label-width="120px" label-position="right" size="small")
                el-form-item.is-required(label="设备名称")
                    el-input.form-width(v-model="deviceForm.name"
                        v-validate="rules.require"
                        :name="'name'"
                        placeholder="请输入设备名称"
                        data-vv-as="设备名称"
                        :class="{'input': true, 'is-danger': errors.has('name')}"
                        maxlength="100"
                    )
                    span.validator-error.is-danger(v-if="errors.has('name')") {{ errors.first('name') }}
                el-form-item.is-required(label="设备编号")
                    el-input.form-width(v-model="deviceForm.serial"
                        v-validate="rules.require"
                        :name="'serial'"
                        placeholder="请输入设备编号"
                        data-vv-as="设备编号"
                        :class="{'input': true, 'is-danger': errors.has('serial')}"
                        maxlength="100"
                    )
                    span.validator-error.is-danger(v-if="errors.has('serial')") {{ errors.first('serial') }}
                el-form-item.is-required(label="设备类型")
                    el-radio(v-model="deviceType" label="1") 已有类型
                    el-radio(v-model="deviceType" label="2") 自定义类型
                el-form-item.is-required(label="")
                    el-select.form-width(v-model="deviceForm.type" v-if="deviceType === '1'"
                        v-validate="rules.require"
                        :name="'type'"
                        placeholder="请选择设备类型"
                        data-vv-as="设备类型"
                        :class="{'input': true, 'is-danger': errors.has('type')}"
                    )
                        el-option(v-for="(item, index) in deviceOptions" :key="index" :value="item.id" :label="item.name")
                    el-input.form-width(v-model="deviceForm.typeName" v-else
                        v-validate="rules.require"
                        :name="'typeName'"
                        maxlength="100"
                        placeholder="请输入设备类型"
                        data-vv-as="设备类型"
                        :class="{'input': true, 'is-danger': errors.has('typeName')}"
                    )
                    span.validator-error.is-danger(v-if="deviceType === '1' && errors.has('type')") {{ errors.first('type') }}
                    span.validator-error.is-danger(v-if="deviceType === '2' && errors.has('typeName')") {{ errors.first('typeName') }}
                el-form-item.is-required(
                        :label="index === 0 ? '设备规格' : ''"
                        v-for="(item, index) in deviceForm.customDeviceSpecReqList"
                        :key="index"
                    )
                        el-input.half-item-width(
                            size="small"
                            v-model.trim="item.name"
                            v-validate="rules.require"
                            :name="'flavorName'+index"
                            placeholder="请输入规格名称"
                            data-vv-as="规格名称"
                            :class="{'input': true, 'is-danger': errors.has('flavorName' + index) }"
                            maxlength="100"
                        )
                        el-input.half-item-width.flavor-value(
                            size="small"
                            v-model.trim="item.value"
                            v-validate="rules.require"
                            :name="'flavorValue'+index"
                            placeholder="请输入规格值"
                            data-vv-as="规格值"
                            :class="{'input': true, 'is-danger': errors.has('flavorValue' + index) }"
                            maxlength="100"
                        )
                        i.flavor-btn.remove(class="ucmp-icon-device-remove" v-if="(index !== 0 && (index === deviceForm.customDeviceSpecReqList.length - 1))" size="small" type="primary" @click="deleteFlavor(index)")
                        i.flavor-btn.plus(class="ucmp-icon-device-plus"
                            :class="{active: index !== 0 && (index === deviceForm.customDeviceSpecReqList.length - 1)}"
                            v-if="(index === 0 && (deviceForm.customDeviceSpecReqList.length === 1)) || (index !== 0 && (index === deviceForm.customDeviceSpecReqList.length - 1))"
                            size="small" type="primary" @click="addFlavor"
                        )
                        i.flavor-btn.remove(class="ucmp-icon-device-remove" v-else size="small" type="primary" @click="deleteFlavor(index)")
                        span.validator-error.is-danger(v-if="errors.has('flavorName' + index)") {{ errors.first('flavorName' + index) }}
                        span.validator-error.is-danger.flavor-value-error(v-if="errors.has('flavorValue' + index)") {{ errors.first('flavorValue' + index) }}
                el-form-item.is-required(label="组织/应用")
                    el-radio(v-model="deviceForm.ownerType" label="org" @change="ownerTypeChange") 组织机构
                    el-radio(v-model="deviceForm.ownerType" label="app" @change="ownerTypeChange") 应用
                el-form-item(v-if="deviceForm.ownerType === 'org'" label="组织机构")
                    Input-Tree.form-width(
                    v-model="deviceForm.ownerName"
                    v-validate="'required'"
                    :name="'ownerName'"
                    placeholder="请选择组织机构"
                    data-vv-as="组织机构"
                    :isDanger="errors.has('ownerName')"
                    :defaultProps="defaultProps"
                    :treeData="orgList"
                    @nodeClick="nodeClick")
                    span.validator-error.is-danger(v-if="errors.has('ownerName')") {{ errors.first('ownerName') }}
                el-form-item(v-if="deviceForm.ownerType === 'app'" label="应用")
                    el-select.form-width(v-model="deviceForm.owner"
                        @change="ownerChange"
                        v-validate="rules.require"
                        :name="'owner'"
                        placeholder="请选择应用"
                        data-vv-as="应用"
                        :class="{'input': true, 'is-danger': errors.has('owner')}"
                        maxlength="20"
                    )
                        el-option(v-for="item in appList" :key="item.id" :value="item.id" :label="item.app_name")
                    span.validator-error.is-danger(v-if="errors.has('owner')") {{ errors.first('owner') }}
                el-form-item.is-required(label="价格" prop="price")
                    el-input.form-width(v-model="deviceForm.price"
                        v-validate="rules.price"
                        :name="'price'"
                        placeholder="请输入价格(0.00-9999999.99)"
                        data-vv-as="价格"
                        :class="{'input': true, 'is-danger': errors.has('price')}"
                        maxlength="10"
                    )
                        template(slot="append") 元
                    span.validator-error.is-danger(v-if="errors.has('price')") {{ errors.first('price') }}
                el-form-item.is-required(label="单位")
                    el-select.form-width(v-model="deviceForm.durationCode"
                        v-validate="rules.require"
                        :name="'durationCode'"
                        placeholder="请选择单位"
                        data-vv-as="单位"
                        :class="{'input': true, 'is-danger': errors.has('durationCode')}"
                        maxlength="20"
                    )
                        el-option(v-for="(item, index) in dateOptions" :key="index" :value="item.code" :label="item.name")
                    span.validator-error.is-danger(v-if="errors.has('durationCode')") {{ errors.first('durationCode') }}
        div(slot="form-footer")
            el-button(plain size="small" @click="goBack") 返回
            el-button(type="warning" size="small" @click="submit" :disabled="submitDisabled") 保存
</template>
<script>
/**
 * @description 创建、编辑设备
 */
import axios from 'axios'
import Api from '@api'
import InputTree from '@common/InputTree'
import { mapGetters } from 'vuex'
export default {
    name: 'EditDeviceMgmt',
    inject: ['$validator'],
    data () {
        return {
            id: '',
            breadcrumbItems: [
                {prop: '/custom-device', label: '设备管理'},
                {prop: '', label: '添加设备'}
            ],
            submitDisabled: true,
            deviceType: '1',
            dateOptions: [],
            deviceOptions: [],
            appList: [],
            orgList: [],
            deviceForm: {
                name: '',
                serial: '',
                type: '',
                typeName: '',
                customDeviceSpecReqList: [],
                owner: '',
                ownerType: 'org',
                ownerName: '',
                price: '',
                durationCode: ''
            },
            rules: {
                require: {
                    required: true,
                    regex: /^[\u4e00-\u9fa5\w\-]+$/
                },
                price: {
                    required: true,
                    regex: /^(([1-9]\d{0,6})|0)(\.\d{1,2})?$/
                }
            },
            // inputObj: {
            //     value: '',
            //     placeholder: '请选择组织机构'
            // },
            defaultProps: {
                id: 'id',
                parentId: 'parent_id',
                children: 'sub_orgs',
                label: 'org_name'
            }
        }
    },
    methods: {
        /**
         * @description 初始化
         */
        init () {
            this.id = this.$route.params.id
            let priceDates = Api.get('priceDates', { type: 1 }, true)
            let deviceTypes = Api.get('deviceType', {}, true)
            let orgList = Api.get('orgTree', {}, true)
            let appList = Api.get('appListByName', { limit: 999999, page: 1 }, true)
            axios.all([priceDates, deviceTypes, orgList, appList]).then(axios.spread(
                (resDate, resDevice, org, app) => {
                    this.deviceOptions = resDevice
                    //获取单位(周期)
                    this.dateOptions = resDate
                    //组织机构
                    this.orgList = org.data
                    //应用系统
                    this.appList = app.data.apps

                    if (this.id === 'add') {
                        let index = this.dateOptions.findIndex(item => item.preference)
                        if (index > -1)
                            this.deviceForm.durationCode = this.dateOptions[index].code
                        this.addFlavor()
                        this.submitDisabled = false
                    } else {
                        this.breadcrumbItems = [
                            {prop: '/custom-device', label: '设备管理'},
                            {prop: '', label: '修改设备'}
                        ]
                        Api.get('deviceInfo', { deviceId: this.id }, true).then(
                            res => {
                                this.submitDisabled = false
                                this.deviceForm = res
                                this.$set(this.deviceForm, 'customDeviceSpecReqList', res.customDeviceSpecRespList)
                                delete this.deviceForm.customDeviceSpecRespList
                                // //编辑时处理组织机构
                                if (this.deviceForm.ownerType === 'org') {
                                    this.deviceForm.ownerName = {
                                        org_name: this.deviceForm.ownerName,
                                        id: this.deviceForm.owner
                                    }
                                }
                            }
                        )
                    }
                })
            )
        },
        /**
         * @description 添加规格
         */
        addFlavor () {
            this.deviceForm.customDeviceSpecReqList.push({name: '', value: ''})
        },
        /**
         * @description 删除规格
         */
        deleteFlavor (index) {
            this.deviceForm.customDeviceSpecReqList.splice(index, 1)
        },
        /**
         * @description 应用选中改变事件
         */
        ownerChange () {
            let ownerObj = this.appList.find(item => item.id === this.deviceForm.owner)
            this.deviceForm.ownerName = ownerObj.app_name
        },
        /**
         * @description ownerType选中改变事件
         */
        ownerTypeChange () {
            this.deviceForm.ownerName = ''
            this.deviceForm.owner = ''
            // if (this.deviceForm.ownerType === 'app')
            //     this.inputObj.value = ''
        },
        goBack () {
            this.$router.push('/custom-device')
        },
        submit () {
            this.$validator.validate().then(result => {
                if (result) {
                    //格式化请求参数
                    if (this.deviceType === '1')
                        delete this.deviceForm.typeName
                    else
                        delete this.deviceForm.type

                    let payload = JSON.parse(JSON.stringify(this.deviceForm))
                    if (payload.ownerType === 'org') {
                        //
                        payload.ownerName = payload.ownerName.org_name
                    }

                    //添加设备
                    if (this.id === 'add') {
                        Api.post('deviceInfo', payload, true).then(
                            res => {
                                this.$message({
                                    type: 'success',
                                    message: '添加设备操作成功!'
                                })
                                this.$router.push('/custom-device')
                            }
                        )
                    } else {
                        Api.put('deviceInfo', payload, true).then(
                            res => {
                                this.$message({
                                    type: 'success',
                                    message: '修改设备操作成功!'
                                })
                                this.$router.push('/custom-device')
                            }
                        )
                    }
                }
            })
        },
        /**
         * @description 组织机构点击节点
         */
        nodeClick (data) {
            this.deviceForm.owner = data.id
            // this.deviceForm.ownerName = data.org_name
            // this.inputObj.value = data._org_name
        }
    },
    created () {
        this.init()
    },
    computed: {
        ...mapGetters([
            'sysName'
        ])
    },
    components: {
        InputTree
    }
}
</script>
<style lang="scss" scoped>
.hidden{
    display: none;
}
</style>
