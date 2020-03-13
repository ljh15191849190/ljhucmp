<template lang="pug">
    UcmpFormContainer(
        :breadcrumbItems="breadcrumbItems"
        v-loading="isLoading" element-loading-spinner="ucmp-icon-loading")
        div.full-container.overflow-y-auto(v-if="orderDetail" slot="form-content")
            //- 基础信息
            DetailCard(cardType="order" :detailInfo.sync="orderDetail" cardTitle="申请单信息")
            OrderDetailPanel.border-top(
                :orderDetail="orderDetail"
                :metadata="metadata"
                :currentOperation="currentOperation"
                detailBelong="order"
                @startInitForm="startInitForm"
                @endInitForm="endInitForm"
                :disabled="orderDetail.service_code === 'quota'"
            )
        div.bot-btns(slot="form-footer")
            el-button(:diasbled="disabled.perform" @click="handleFiledOrder('back')" size="small") 返回
            el-button(v-if="orderDetail && orderDetail.perform" type="warning" size="small" :diasbled="disabled.perform" @click="handleFiledOrder('perform')") 处理
</template>

<script>
import OrderDetailPanel from '../itemConponents/OrderDetailPanel'
import DetailCard from '../itemConponents/DetailCard'
import Api from '@api'
import { mapGetters, mapActions } from 'vuex'
import { orderOperation } from '@mixins/orderTypes.mixin'

export default {
    $_veeValidate: {
        validator: 'new'
    },
    mixins: [orderOperation],
    data () {
        return {
            breadcrumbItems: [
                { prop: '/orders', label: '申请单管理' },
                { prop: '/orders/details', label: '申请单详情' }
            ],
            isLoading: true,
            orderDetail: null,
            disabled: {
                perform: false
            }
        }
    },

    methods: {
        // [取消,重新执行]申请单
        handleFiledOrder (operationType) {
            // let apiAddress
            // let params
            // let tipTxt
            // if (operationType === 'resubmit') {
            //     params = {
            //         _action: this.orderDetail.order_type,
            //         _service_code: this.orderDetail.service_code
            //     }
            //     if (this.orderDetail.order_type === 'create') {
            //         this.goApply(this.orderDetail.data)
            //         return
            //     }
            //     if (this.orderDetail.order_type === 'modify') {
            //         params.memo = this.orderDetail.memo
            //         params.urgency_level = this.orderDetail.urgency_level
            //         params.service_code = this.orderDetail.service_code
            //         params.items = JSON.parse(JSON.stringify(this.orderDetail.data))
            //         params.resource_id = this.orderDetail.data.resource_id
            //         params.resource_name = this.orderDetail.data.resource_name
            //         delete params.items.resource_id
            //         delete params.items.resource_name
            //     }
            //     params = {...params, ...this.orderDetail.data.param}
            //     apiAddress = 'order'
            //     tipTxt = '重新申请'
            // } else if (operationType === 'cancel') {
            //     params = {
            //         _action: operationType,
            //         _order_code: this.orderDetail.order_code
            //     }
            //     apiAddress = 'handleOrderApi'
            //     tipTxt = '取消'
            // } else
            if (operationType === 'perform') {
                let formDataConstructor = this.formDataConstructor
                if (this.orderDetail.data && !Array.isArray(this.orderDetail.data) && this.orderDetail.data.group === 'blueprint')
                    formDataConstructor = this.blueprintFormDataConstructor
                else if (this.orderDetail.data && Array.isArray(this.orderDetail.data))
                    formDataConstructor = this.basicServiceDataConstructor

                this.validateCurrentForm(formDataConstructor, operationType, '立即执行')
            } else if (operationType === 'back') // 返回列表
                this.$router.push('/orders')
        },

        /**
         * @description 校验当前表单, 如果校验结果OK, 进行下一步操作
         */
        validateCurrentForm (paramsConstructor, operationType, operationName) {
            this.$validator.validate().then(valid => {
                if (!valid) return
                // UCMP3-5574 待处理的申请单管理员在处理时，提示信息都是“您确定立即执行么？”，但申请单可以立即执行也可以定时执行，提示信息需再优化下
                operationName = this.orderDetail.execution_time ? '定时执行' : '立即执行'
                // UCMP3-3219 立即执行按钮添加限制，避免重复点击
                this.disabled.perform = true
                let params = paramsConstructor ? paramsConstructor() : {}
                let url = 'order'
                params._service_code = this.orderDetail.order_code
                // 先修改申请单内容
                this.$confirm(`您确定${operationName}么？`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                .then(() => {
                    Api.put(url, params, true).then(
                        res => {
                            let operaterParams = {
                                _service_code: this.orderDetail.order_code,
                                _action: operationType
                            }
                            // 执行按钮操作
                            this.xhrEvent(url, operaterParams, this.xhrSuccessCallBack, operationType, operationName)
                            this.disabled.perform = false
                        }, () => {
                            this.disabled.perform = false
                        }
                    )
                }).catch(() => {
                    this.disabled.perform = false
                })
            })
        },

        /**
         * @description 提交申请单成功后，回调事件；针对操作动作的不同、当前申请内容的不同可在此处做差异化业务操作
         */
        xhrSuccessCallBack (operationType, operationName) {
            this.$notify.success({
                title: '成功',
                message: `申请单${this.orderDetail.order_code}已${operationName}。`
            })
            this.$router.push('/orders')
        },

        /**
         * @description 封装资源服务外的表单数据
         */
        formDataConstructor () {
            let params = {}
            params = {
                data: this.orderDetail.data
            }

            return params
        },

        /**
         * @description 封装蓝图服务表单数据
         */
        blueprintFormDataConstructor () {
            let params = {}
            params = {
                data: this.orderDetail.data,
                execution_time: this.orderDetail.execution_time
            }
            params.data = JSON.parse(JSON.stringify(this.bpForm))
            params.data.service_code = this.orderDetail.data.service_code
            params.data.group = 'blueprint'
            return params
        },

        /**
         * @description 封装普通服务表单数据
         */
        basicServiceDataConstructor () {
            return {
                data: this.orderDetail.data,
                execution_time: this.orderDetail.execution_time
            }
        },

        /**
         * @description 提交表单事件
         */
        xhrEvent (url, params, callback, operationType, operationName) {
            Api.post(url, params).then(res => {
                    this.isLoading = false
                    callback && callback(operationType, operationName)
                }, () => {
                    this.isLoading = false
                })
        },

        // 创建类型的申请单失败后重新执行操作
        goApply (catalog) {
            if (catalog.group === 'blueprint') {
                this.$router.push({
                    path: `/catalog/${catalog.service_code}`,
                    query: {
                        type: 'service-apply',
                        orderData: this.orderDetail
                    }
                })
            } else {
                this.$router.push({
                    path: `/catalog/${catalog.service_code}`,
                    query: { orderData: this.orderDetail }
                })
            }
        },
        // 初始化
        init () {
            let params = {
                orderCode: this.$route.params.orderCode,
                from: 'order' // 申请单下的详情
            }
            // 获取申请单详情
            this.isLoading = true
            Api.get('orderDetail', params, true).then(
                res => {
                    if (res) {
                        this.orderDetail = res
                        this.getOrderLevelDisplay().then(() => {
                            if (!this.orderlevelDisplay) 
                                this.orderDetail.urgency_level = ''
                        })
                        this.isLoading = false
                    }
                }, () => {
                    this.isLoading = false
                }
            )
        },

        startInitForm (id) {
            this.disabled.perform = true
        },

        endInitForm (id) {
            this.disabled.perform = false
        },
        ...mapActions(['getOrderLevelDisplay'])
    },

    created () {
        this.init()
    },

    computed: {
        ...mapGetters([
            'metadata',
            'bpForm',
            'orderlevelDisplay'
        ])
    },

    components: {
        OrderDetailPanel,
        DetailCard
    }
}
</script>
