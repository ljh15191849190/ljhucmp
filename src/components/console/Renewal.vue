<template lang="pug">
    el-dialog(v-if="renewalVisible" title="租期续期" :visible.sync="renewalVisible" :before-close="close" max-heigth="400px" width="800px")
        div(v-if="!tenancy.available")
            div.text-center 租期未开启，请在【系统设置--全局参数--自服务是否需要租期】中开启
        div.renewal(v-else-if="tempData[temp.resource_id]")
            el-row.expired-row
                div 资源名称: {{tempData[temp.resource_id].name}}
            el-row.expired-row 
                div 过期时间: {{tempData[temp.resource_id].expired_at | time}}
            el-row.expired-row
                span 续期日期:
                ExpiredAtWidget.expired-at-widget.margin-left(
                    :value.sync="tempData[temp.resource_id].date"
                    :start="tempData[temp.resource_id].expired_at")
                //- el-date-picker(
                //- v-model="tempData[temp.resource_id].date"
                //- size="mini"
                //- type="date"
                //- :default-value="tempData[temp.resource_id].expired_at"
                //- :picker-options="getDatePickerOptions(tempData[temp.resource_id].expired_at, tenancy.maxTime)"
                //- placeholder="续期日期")
            RenewalGroup(v-if="!blueprint && subResource.length" :resource="subResource")
        div.text-center(v-else) 暂无数据
        div.dialog-footer(slot="footer")
            el-button(@click="close" size="small") 取消
            el-button(type="primary" @click="renewalSave" size="small" :loading="renewalLoading" :disabled="!tempData[temp.resource_id]") 保存
</template>

<script>
    /**
     * @description
     * @author jia.lu
     */
    import Api from '@api'
    import RenewalGroup from './RenewalGroup'
    // import renewalMixin from '@mixins/renewal.mixin'
    import {mapGetters} from 'vuex'
    import DateUtil from '@server/date-utils'
    import ExpiredAtWidget from '@/components/common/dynamicForm/ExpiredAtWidget'

    export default {
        name: 'Renewal',
        components: {RenewalGroup, ExpiredAtWidget},
        // mixins: [renewalMixin],
        props: ['renewalVisible', 'serviceCode', 'checkedInstance', 'checkedMetadata', 'ifRouteToOrder'],
        data () {
            return {
                renewalLoading: false,
                blueprint: false,
                temp: {},
                tempData: {},
                // 租期应在设定在选中日的最后一秒
                timeAddition: 23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000,
                subResource: []
            }
        },
        computed: {
            ...mapGetters([
                'tenancy'
            ])
        },
        filters: {
            time: (value) => {
                return value ? DateUtil.formate(new Date(value)) : ''
            }
        },
        methods: {
            close () {
                this.$emit('closeRenewalDialog')
            },

            renewalSave () {
                this.renewalLoading = true

                let arr = []
                for (let [key, value] of Object.entries(this.tempData)) {
                    if (value.checked) {
                        // 只传选中的
                        arr.push({
                            resource_id: key,
                            // 选择日期了就依照选择的为准，否则以之前过期日期为准
                            expired_at: value.date ? (new Date(value.date).getTime() + this.timeAddition) : value.expired_at,
                            service_code: value.service_code
                        })
                    }
                }

                Api.put('renewal', arr).then(res => {
                    this.renewalLoading = false

                    this.$notify({
                        title: '成功',
                        type: 'success',
                        message: '租期续期操作成功，可在个人中心-申请单管理中查看续期结果'
                    })
                    this.close()
                    if (this.ifRouteToOrder(res))
                        this.$router.push('/orders')
                }).catch(() => {
                    this.renewalLoading = false
                })
            },

            getSubResource (resource) {
                // 需要被 子组件 watch, props传递的是方法结果， 父组件每个元素的修改都会计算一次
                let arr = []
                resource.sub_resource && resource.sub_resource.forEach(item => {
                    let obj = this.tempData[item.resource_id]

                    if (item.sub_resource) {
                        //
                        obj.sub_resource = this.getSubResource(item)
                    }
                    arr.push(obj)
                })

                this.subResource = arr
            },

            getRenewalInfo () {
                Api.get('getResourceExpired', {
                    serviceCode: this.serviceCode,
                    instanceId: this.checkedInstance[this.checkedMetadata.value_field]
                }).then(res => {
                    this.temp = res
                    this.tempData = this.getTempDataSet(this.temp)
                    if (!this.blueprint)
                        this.getSubResource(this.temp)
                })
            },

            getTempDataSet (temp) {
                let obj = {}

                // UCMP3-3066【租期续期】在控制台下，给存量资源续期，保存报“参数格式不正确”，提示信息不合理，需优化
                if (temp.resource_id && temp.expired_at) {
                    obj[temp.resource_id] = {
                        checked: true,
                        date: '',
                        expired_status: temp.expired_status,
                        expired_at: temp.expired_at,
                        name: temp.name,
                        service_code: temp.service_code
                    }

                    // 蓝图不展示相关资源
                    if (!this.blueprint)
                        this.getTempDataItem(temp.sub_resource, obj)
                }

                return obj
            },

            getTempDataItem (resource, obj) {
                if (!Array.isArray(resource)) return

                resource.forEach(item => {
                    if (!obj[item.resource_id]) {
                        //
                        obj[item.resource_id] = {
                            checked: false,
                            date: '',
                            expired_status: item.expired_status,
                            expired_at: item.expired_at,
                            name: item.name,
                            service_code: item.service_code
                        }
                    }

                    if (resource.sub_resource)
                        this.getTempDataItem(resource.sub_resource, obj)
                })
            }
        },
        created () {
            this.getRenewalInfo()

            this.blueprint = this.checkedInstance.blueprint
        }
    }
</script>

<style lang="scss" scoped>
    .expired-at-widget {
        display: inline-block;
    }
    .expired-row {
        height: 40px;
        line-height: 40px;
    }
</style>

<style lang="scss">
    .renewal {
        .el-checkbox .el-checkbox__label {
            white-space: normal;
            word-break: break-all;
        }
    }
</style>
