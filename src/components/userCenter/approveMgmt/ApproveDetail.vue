<template lang="pug">
    UcmpFormContainer(
        :breadcrumbItems="breadcrumbItems"
        v-loading="loading" element-loading-spinner="ucmp-icon-loading")
        div.full-container.overflow-y-auto(slot="form-content")
            //- 申请单基础信息
            DetailCard.padding(cardType="approve" :detailInfo.sync="orderDetails" cardTitle="审批单信息")

            //- 资源信息部分 (编排资源/非编排资源两种场景)
            //-此处为待审批的相关资源详情信息
            template(v-if="orderDetails")
                OrderDetailPanel.padding.border-top(
                    :orderDetail.sync="orderDetails"
                    :currentOperation="currentOperation"
                    :metadata="metadata"
                    :operationType="operationType"
                    detailBelong="approve"
                    @startInitForm="startInitForm"
                    @endInitForm="endInitForm"
                    :disabled="orderDetails.service_code === 'quota'"
                    ref="orderDetailPanel"
                )
            div.padding.card-padding-top.padding.border-top
                div.card-title 审批信息
                //- 审批流程列表/审批流程图
                el-tabs
                    el-tab-pane(label="审批记录")
                        ProcessList(:processInstanceId="processId")
                    el-tab-pane(label="审批流程图")
                        ProcessImg(:processInstanceId="processId" :taskId="taskId")

            //- 以下部分为意见框和操作按钮，仅审批操作时显示 operationType === 'todo'
            template(v-if="operationType === 'todo'")
                div.padding.card-padding-top.padding.border-top
                    div.card-title 审批意见（拒绝操作必须标注拒绝原因)
                    el-form(:model="sendParams")
                        el-form-item(prop="approveOpinion")
                            el-input.margin-bottom(
                                type="textarea"
                                v-model="sendParams.opinion"
                                placeholder="请输入审批意见"
                                v-validate="{required: isRefuse}"
                                data-vv-as="审批意见"
                                name="approveOpinion"
                                :class="{'is-danger': errors.has('approveOpinion')}")
                        span.validator-error.is-danger(v-if="errors.has('approveOpinion')") {{ errors.first('approveOpinion') }}
        //- 操作按钮
        div.bot-btns(slot="form-footer")
            el-button(@click="backToList" size="small" plain) 返回
            el-button(v-if="operationType === 'todo'" @click="isRefuse = true; validatorParams(false)" :disabled="isSaving" type="danger" size="small" plain) 拒绝
            el-button(v-if="operationType === 'todo'" type="warning" size="small" :disabled="isSaving || disabled.confirm" @click="isRefuse = false; validatorParams(true)") 同意

</template>
<script>
/**
 * @description 审批单明细组件，基础服务、蓝图服务的审批均可
 */
import Api from '@api'
import DetailCard from '../itemConponents/DetailCard'
import ProcessImg from '../itemConponents/ProcessImg'
import ProcessList from '../itemConponents/ProcessList'
import OrderDetailPanel from '../itemConponents/OrderDetailPanel'
import { mapGetters, mapActions } from 'vuex'
import { orderOperation } from '@mixins/orderTypes.mixin'

const BasicDetailColumns = [
    { key: 'service_name', label: '服务名称' },
    { key: 'owner_name', label: '' },
    { key: 'env', label: '环境' },
    { key: 'count', label: '申请数量' }
]

export default {
    $_veeValidate: {
        validator: 'new'
    },
    mixins: [orderOperation],
    components: { DetailCard, ProcessImg, ProcessList, OrderDetailPanel },
    data () {
        return {
            breadcrumbItems: [
                {prop: '/approve', label: '审批管理'},
                {prop: '/approveDetail', label: '审批详情'}
            ],
            orderDetails: {},
            basicDetailColumns: BasicDetailColumns,
            sendParams: {
                opinion: ''
            },
            isRefuse: false, // 是否拒绝该审批任务
            loading: false,
            isSaving: false,
            disabled: {
                confirm: false
            }
        }
    },
    created () {
        this.initOrderDetail()
    },
    methods: {
        ...mapActions(['getOrderLevelDisplay']),
        // 获取审批相关申请单信息
        initOrderDetail () {
            this.loading = true
            let params = {
                orderCode: this.orderCode,
                from: this.operationType === 'todo' ? 'todo' : 'done'
            }
            Api.get('orderDetail', params).then(
                res => {
                    this.loading = false
                    this.orderDetails = res
                    this.getOrderLevelDisplay().then(() => {
                        if (!this.orderlevelDisplay) 
                            this.orderDetails.urgency_level = ''
                    })
                },
                () => {
                    this.loading = false
                }
            )
        },

        backToList () {
            this.$router.push({path: '/approve', query: {type: this.operationType}})
        },

        // 需要先校验审批意见框是否填写
        validatorParams (status) {
            this.$nextTick(() => {
                // 同意操作需要填写所有必填项
                if (status) {
                    this.$validator.validate().then(
                        valid => {
                            if (valid) {
                                this.$confirm(`您确定同意吗?`, '提示', {
                                    confirmButtonText: '确定',
                                    cancelButtonText: '取消',
                                    type: 'warning'
                                }).then(() => {
                                    this.handleApprove(status)
                                }).catch(() => {})
                            } else {
                                this.$notify({
                                    title: '警告',
                                    message: '当前表单内容未校验通过，请检查并修改',
                                    type: 'warning'
                                })
                            }
                        }
                    )
                } else { // 拒绝操作只需要校验审批意见，pass资源配置表单校验
                    // UCMP3-1380 重置表单校验状态，规避先点同意配置表单报错再点拒绝配置表单的错误信息仍然存在的问题
                    this.$validator.reset()
                    setTimeout(() => {
                        this.$validator.validate('approveOpinion').then(
                            valid => {
                                if (valid)
                                    this.handleApprove(status)
                                else {
                                    this.$notify({
                                        title: '警告',
                                        message: '拒绝操作必须标注审批意见',
                                        type: 'warning'
                                    })
                                }
                            }
                        )
                    }, 200)
                }
            })
        },

        /**
         * status 处理状态
         *    => true 审批通过
         *    => false 拒绝审批
         */
        handleApprove (status) {
            let params = {
                task_id: this.taskId,
                pass: status,
                comment: this.sendParams.opinion
            }
            if (status) {
                params.order = {
                    data: this.orderDetails.data,
                    execution_time: this.orderDetails.execution_time
                }
                // UCMP3-661 针对蓝图从 vuex 取资源配置表单的值并填充
                if (this.orderDetails.data.group && this.orderDetails.data.group === 'blueprint') {
                    params.order.data = JSON.parse(JSON.stringify(this.bpForm))
                    params.order.data.service_code = this.orderDetails.data.service_code
                    params.order.data.group = 'blueprint'
                }
                // UCMP3-6910 配额审批提交的时候需要特殊处理下data数据
                if (this.orderDetails.service_code === 'quota') {
                    let applyQuota = this.$refs.orderDetailPanel.$refs.applyQuota
                    let flag = false
                    applyQuota.quotaData.forEach(item => {
                        let itemFlag = item.quota_conf.some(item => item.value)
                        if (itemFlag)
                            flag = true 
                    })
                    if (!flag) {
                        this.$notify.error('申请单中至少需要一项有值！')
                        // 如果校验不通过则直接返回
                        return
                    }
                    let serviceQuotas = applyQuota.getQuotaConfig()
                    if (params.order.data)
                        params.order.data.quota_resources = serviceQuotas
                }
            }

            this.isSaving = true
            Api.post('handleApproveTaskApi', params).then(res => {
                this.isSaving = false
                this.$notify.success({ title: '成功', message: '审批成功' })
                this.$router.push({path: '/approve', query: {type: 'done'}})
            }, () => {
                this.isSaving = false
            })
        },

        startInitForm (id) {
            this.disabled.confirm = true
        },

        endInitForm (id) {
            this.disabled.confirm = false
        }
    },
    computed: {
        ...mapGetters([
            'metadata',
            'bpForm',
            'orderlevelDisplay'
        ]),
        orderCode () {
            return this.$route.query.orderCode
        },
        processId () {
            return this.$route.query.processId
        },
        taskId () {
            return this.$route.query.taskId
        },
        operationType () {
            return this.$route.query.type
        }
    }
}
</script>
<style lang="scss" scoped>
.pane-padding{
    padding: 0 15px 10px;
}
</style>
