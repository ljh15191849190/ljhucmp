<template lang="pug">
    div.full-height
        UcmpFormContainer.task-detail-container(:breadcrumbItems="breadcrumbItems")
            div(slot="form-content" v-loading="isLoading")
                div.position-relative.padding.card-padding-top
                    p.card-title 任务单信息
                    el-row(:gutter="20")
                        el-col.padding-row(:xs="24" :sm="12" :md="8" :lg="8" :xl="6" v-for="(item, idx) in basicDetail" :key="idx")
                            span.col-name {{item.label}}：
                            a(v-if="item.link && item.value !== '--'" href="javascript:;" @click="goTaskOrderDetail(item.value)")
                                span.value.link {{item.value}}
                            el-tag(v-else-if="item.tagType" :type="orderType" size="mini") {{item.value}}
                            span.col-value(v-else) {{item.value}}
                div.task-detail-error.padding.card-padding-top.position-relative.border-top(v-if="taskDetail && taskDetail.error_message")
                    p.card-title 失败原因
                    div.error-content
                        pre.error-msg {{taskDetail.error_message}}
                div.padding.card-padding-top.position-relative.border-top(v-if="resourceDetail.length")
                    p.card-title {{resouceTitle}}
                    div.resource-detail-content
                        div.resource-item(v-for="(item, idx) in resourceDetail" :key="idx")
                            p.service-title {{item.title}}
                            div.resource-item-content
                                el-row(:gutter="20")
                                    el-col.padding-row(:xs="24" :sm="12" :md="8" :lg="8" :xl="6" v-for="(displayItem, idx) in item.display" :key="idx" v-title-tip)
                                        span.col-name {{displayItem.label}}：
                                        span.icon(v-if="displayItem.icon" :class="displayItem.value")
                                        span.col-value(v-else-if="displayItem.password") 
                                            PassWordPanel(:displayItem="displayItem")
                                        span.col-value(v-else) {{displayItem.value}}
            div.task-order-footer.padding-left(slot="form-footer")
                div.padding-left
                    div(v-if="taskDetail && taskDetail.manual")
                        p 备注：1、请先到虚拟机进行手工配置，完成后再点击“手工配置”按钮。
                        p.capi-text 2、手工配置：点击后系统将默认资源已经部署完成。
                div
                    el-button(@click="goBack" size="small") 返回
                    el-button(size="small" type="warning" @click="submit('closeable')" :class="{'close-btn': taskDetail && taskDetail.performable}" :disabled="submitDisabled" v-if="taskDetail && taskDetail.closeable") 关闭任务
                    el-button(size="small" type="primary" @click="submit('manual')" :disabled="submitDisabled" v-if="taskDetail && taskDetail.manual") 手工配置
                    el-button(size="small" type="primary" @click="submit('delivery')" :disabled="submitDisabled" v-if="taskDetail && taskDetail.delivery ") 交付
                    el-button(size="small" type="warning" @click="submit('cleaned')" :disabled="submitDisabled" v-if="taskDetail && taskDetail.cleanable") 已清理
                    el-button(size="small" type="primary" @click="submit('confirm_complete')" :disabled="submitDisabled" v-if="taskDetail && taskDetail.confirmable ") 确认完成
                    el-button(size="small" type="primary" @click="submit('performable')" :disabled="submitDisabled" v-if="taskDetail && taskDetail.performable") 重新执行
        el-dialog(title="交付消息" :visible="dialogDeliverVisible" @close="handleCancel")
            el-form(:model="form" :rules="rules" ref="ruleForm")
                el-form-item(label-width="10" prop="message")
                    el-input(
                        v-model="form.message"
                        :rows="3"
                        type="textarea" 
                        placeholder="请输入交付消息，最多200个字符。"
                    )
            div(slot="footer")
                el-button(@click="handleCancel") 取 消
                el-button(type="primary" @click="handleDeliver") 确定
                
</template>
<script>
/**
 * @description task order detail
 */
import Api from '@api'
import {mapGetters} from 'vuex'
import DateUtil from '@server/date-utils'
import MetadataUtils from '@server/metadata.utils'
import {Owners} from '@server/ConstParams'
import PassWordPanel from '@/components/common/PassWordPanel'

export default {
    name: 'taskOrderDetail',
    data () {
        return {
            isLoading: false,
            submitDisabled: false,
            breadcrumbItems: [
                { prop: '/taskOrders', label: '任务单管理' },
                { prop: '', label: '任务单详情' }
            ],
            taskDetail: null,
            basicDetail: [],
            resourceDetail: [],
            dialogDeliverVisible: false,
            form: {
                message: '软件已交付'
            },
            rules: {
                message: [
                    { min: 3, max: 200, message: '长度在 3 到 200 个字符', trigger: 'blur' }
                ]
            }
        }
    },
    components: {PassWordPanel},
    created () {
        this.getTaskOrderDetail()
    },
    methods: {
        /**
         * @description 返回任务单列表
         */
        goBack () {
            this.$router.push('/taskOrders')
        },
        /**
         * @description 返回任务单列表
         * @param type 类型：手工部署or重新执行
         */
        submit (type) {
            this.submitDisabled = true
            let resObj = {
                orderId: this.$route.params.orderId
            }
            if (type === 'manual') {
                // 手工部署
                this.$confirm(`手工部署任务单: ${this.taskDetail.task_code}, 是否继续?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    Api.post('manualDeployTask', resObj, true).then(
                        res => {
                            this.submitDisabled = false
                            this.$notify.success('手工部署操作成功!')
                            this.getTaskOrderDetail()
                        }, () => {
                            this.submitDisabled = false
                        }
                    )
                }).catch(() => {
                    this.submitDisabled = false
                })
            } else if (type === 'performable') {
                // 重新执行
                this.$confirm(`重新执行任务单: ${this.taskDetail.task_code}, 是否继续?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    Api.post('rerunTask', resObj, true).then(
                        res => {
                            this.submitDisabled = false
                            this.$notify.success('重新执行操作成功!')
                            this.getTaskOrderDetail()
                        }, () => {
                            this.submitDisabled = false
                        }
                    )
                }).catch(() => {
                    this.submitDisabled = false
                })
            } else if (type === 'delivery') {
                this.dialogDeliverVisible = true
                console.log('delivery')
                // 交付
                // this.$confirm(`交付任务单: ${this.taskDetail.task_code}, 是否继续?`, '提示', {
                //     confirmButtonText: '确定',
                //     cancelButtonText: '取消',
                //     type: 'warning'
                // }).then(() => {
                //     Api.post('deliveryTask', resObj, true).then(
                //         res => {
                //             this.submitDisabled = false
                //             this.$notify.success('交付操作成功!')
                //             this.getTaskOrderDetail()
                //         }, () => {
                //             this.submitDisabled = false
                //         }
                //     )
                // }).catch(() => {
                //     this.submitDisabled = false
                // })
            } else if (type === 'cleaned') {
                // 已清理
                resObj = {task_code: this.taskDetail.task_code} 
                this.$confirm(`已清理任务单: ${this.taskDetail.task_code}, 是否继续?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    Api.post('cleanTask', resObj, true).then(
                        res => {
                            this.submitDisabled = false
                            this.$notify.success('已清理操作成功!')
                            this.getTaskOrderDetail()
                        }, () => {
                            this.submitDisabled = false
                        }
                    )
                }).catch(() => {
                    this.submitDisabled = false
                })
            } else if (type === 'confirm_complete') {
                // 确认完成
                  resObj = {task_code: this.taskDetail.task_code} 
                this.$confirm(`确认完成任务单: ${this.taskDetail.task_code}, 是否继续?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    Api.post('completeTask', resObj, true).then(
                        res => {
                            this.submitDisabled = false
                            this.$notify.success('确认完成操作成功!')
                            this.getTaskOrderDetail()
                        }, () => {
                            this.submitDisabled = false
                        }
                    )
                }).catch(() => {
                    this.submitDisabled = false
                })
            } else {
                // 关闭任务
                this.$confirm(`关闭任务单: ${this.taskDetail.task_code}, 是否继续?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    Api.post('closeTask', resObj, true).then(
                        res => {
                            this.$message({
                                type: 'success',
                                message: `关闭任务单:${this.taskDetail.task_code}. 操作成功!`
                            })
                            this.goBack()
                        }
                    )
                }).catch(() => {
                     this.submitDisabled = false
                })
            }
        },
        /**
         * @description 任务单详情
         */
        getTaskOrderDetail () {
            let resObj = {
                orderId: this.$route.params.orderId
            }
            this.isLoading = true
            Api.get('taskOrderDetail', resObj, true).then(
                res => {
                    this.isLoading = false
                    this.taskDetail = res
                    this.initData()
                }, () => {
                    this.isLoading = false
                }
            )
        },
        /**
         * @description 初始化数据
         */
        initData () {
            // 格式化基本信息
            this.basicDetail = [
                {
                    label: '任务单编号',
                    value: this.taskDetail.task_code
                },
                {
                    label: '服务名称',
                    value: this.getServiceName(this.taskDetail.service_code)
                },
                {
                    label: '类型',
                    value: this.taskDetail.task_type_zh_cn
                },
                {
                    label: '申请单详情编号',
                    value: this.taskDetail.order_code,
                    link: true
                },
                {
                    label: '申请人',
                    value: this.taskDetail.applicantName
                },
                {
                    label: '任务创建时间',
                    value: this.getApplyTime(this.taskDetail.created_at)
                },
                {
                    label: '定时任务执行时间',
                    value: this.getApplyTime(this.taskDetail.execution_time)
                },
                {
                    tagType: true,
                    label: '状态',
                    value: this.taskDetail.task_status_zh_cn
                }
            ]
            // 格式化资源信息
            this.resourceDetail = []
            Object.keys(this.taskDetail.resources).forEach(service_code => {
                let serviceItem = this.metadata.find(item => item.service_code === service_code)
                if (serviceItem) {
                    let attributes = serviceItem.attribute.filter(attr => attr.core_attr)
                    let resources = this.taskDetail.resources[service_code]
                    resources.forEach(resouceItem => {
                        let resource_item = {
                            title: serviceItem.name,
                            service_code: serviceItem.service_code,
                            display: []
                        }
                        attributes.forEach(attrItem => {
                            if (resouceItem[attrItem.key] !== undefined) {
                                let isPassWord = (attrItem.fe_type && (attrItem.fe_type.type === 'password')) || (attrItem.type === 'password')
                                let displayItem = {
                                    key: attrItem.key,
                                    label: attrItem.unit ? attrItem.label + '(' + attrItem.unit + ')' : attrItem.label,
                                    value: this.getFormatValue(service_code, attrItem, resouceItem[attrItem.key], resouceItem),
                                    icon: attrItem.icon,
                                    password: isPassWord
                                }
                                if (isPassWord) {
                                    displayItem.isShowPassWord = false
                                    displayItem.hiddenPass = displayItem.value.replace(/./g, '*')
                                }
                                    
                                resource_item.display.push(displayItem)

                                if (attrItem.table_column_group)
                                    this.formatGroupDisplay(attrItem, resource_item.display, resouceItem)
                            }
                        })

                        if (resouceItem.owner_type) {
                            //资源归属
                            let ownerItem = {
                                label: '资源归属',
                                value: Owners[resouceItem.owner_type] || '--'
                            }
                            resource_item.display.push(ownerItem)
                        }

                        this.resourceDetail.push(resource_item)
                    })
                }
            })

            let getServiceCode = res => {
                return res.service_code
            }
            this.resourceDetail.sortAsMetadataOrder(this.basicMetadataCodes, getServiceCode)
        },
        /**
         * @description 格式化资源详情value
         */
        getFormatValue (service_code, currentItem, value, resouceItem) {
            return MetadataUtils.getFormatOrderDetailValue(service_code, currentItem, value, resouceItem)
        },

        /**
         * @description 处理group的显示
         */
        formatGroupDisplay (attr, displays, resouceItem) {
            MetadataUtils.formatGroupDisplay(attr, displays, resouceItem)
        },
        /**
         * @description 服务名称
         * @param code 服务code
         */
        getServiceName (code) {
            let serviceItem = this.metadata.find(item => item.service_code === code)
            return serviceItem && serviceItem.name ? serviceItem.name : ''
        },
        /**
         * @description 申请时间
         * @param time 时间戳
         */
        getApplyTime (time) {
            return time ? DateUtil.formate(new Date(time)) : '--'
        },
        /**
         * @description 进入申请单详情
         * @param orderCode 申请单详情编号
         */
        goTaskOrderDetail (orderCode) {
            this.$router.push(`/orders/${orderCode}`)
        },
        /**
         * 取消交付任务对话框
         */
        handleCancel () {
            this.dialogDeliverVisible = false
            this.submitDisabled = false
        },
        /**
         * 交付任务
         */
        handleDeliver () {
            this.$refs.ruleForm.validate(valid => {
                if (valid) {
                    this.dialogDeliverVisible = false
                    let resObj = {
                        orderId: this.$route.params.orderId,
                        message: this.form.message
                    }
                    Api.post('deliveryTask', resObj, true).then(
                        res => {
                            this.submitDisabled = false
                            this.$notify.success('交付操作成功!')
                            this.getTaskOrderDetail()
                        }, () => {
                            this.submitDisabled = false
                        }
                    )
                }
            })
        }
    },
    computed: {
        orderType () {
            let type = ''
            if (this.taskDetail.healthy)
                type = this.taskDetail.closeable ? 'info' : 'success'
            else
                type = 'error'

            return type
        },
        resouceTitle () {
            return `${this.taskDetail.task_type_zh_cn}资源`
        },
        ...mapGetters([
            'metadata'
        ]),
        basicMetadataCodes () {
            return this.metadata.filter(meta => { return meta.group !== 'blueprint' })
                .map(meta => { return meta.service_code })
        }
    },
    watch: {
        'metadata.length' () {
            this.initData()
        }
    }
}
</script>
<style lang="scss" scoped>
.resource-detail-content {
    padding-top: 14px;
}
.service-title {
    color: $fontLightGrey;
}
.resource-item{
  margin-bottom: 15px;
}
</style>
