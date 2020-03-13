<template lang="pug">
    div.side-shopping-list-modal
        div.side-shopping-list-container
            div.car-navs-container.d-flex
                el-button.turnoff-btn(icon="el-icon-arrow-right" size="small" type="warning" @click="turnoffCar")
                div.d-flex.navs-bg-container.justify-content-between
                    div
                        span.title.ucmp-icon-cart {{title}}
                        el-tooltip(:content="shoppingTip" placement="right")
                            span.ucmp-icon-question.theme-color
                    el-button.no-padding.size-small(v-if="showItems" icon="ucmp-icon-delete" type="text" :disabled="!checkedResources.length" @click="deleteRes")
            AllResourceItems.car-items-container(
            ref="resourceItemsRef"
            v-show="showItems"
            :shoppingList.sync="innerShopCarList")
            div.car-items-container(v-if="!showItems")
                el-form.order-form(
                label-width="120px"
                size="small"
                label-position="left")
                    OrderConfirm(:orderForm.sync="orderForm")
                AllResourceItems(
                :noCheck="true"
                :shoppingList="checkedResources")
            div.car-modal-footer.d-flex.justify-content-end.align-items-center
                el-button.car-submit-btn(
                v-for="btn in submitBtns"
                :key="btn.prop"
                :type="btn.type"
                :plain="btn.plain"
                :disabled="btn.prop === 'apply' && !checkedResources.length || btn.prop !== 'apply' && createOrderDisabled"
                v-if="btn.prop === 'apply' && showItems || btn.prop !== 'apply' && !showItems"
                @click="handleClick(btn.prop)")
                    span(v-if="btn.prop === 'apply'") {{ btn.label + ' ( ' + checkedResources.length + ' )' }}
                    span(v-if="btn.prop !== 'apply'") {{ btn.label }}
</template>
<script>
    /**
     * @description 侧边栏购物车
     * @author xinghua.wen
     */
    import Api from '@api'
    import {mapGetters, mapActions} from 'vuex'
    import OrderConfirm from '@/components/catalog/common/OrderConfirm'
    import AllResourceItems from './AllResourceItems'
    // import Api from '@api'

    export default {
        $_veeValidate: {
            validator: 'new'
        },
        data () {
            return {
                title: '购物车',
                shoppingTip: '您选择的服务长时间未操作，关闭浏览器后清空',
                shoppingList: [],
                innerShopCarList: [],
                submitBtns: [
                    {
                        prop: 'pre_step',
                        label: '上一步',
                        type: 'warning',
                        plain: true
                    },
                    {
                        prop: 'submitForm',
                        label: '提交申请单',
                        type: 'warning',
                        plain: true
                    },
                    {
                        prop: 'apply',
                        label: '立即申请',
                        type: 'warning',
                        plain: false
                    }
                ],
                showItems: true, // 编辑模式开关
                orderForm: {
                    urgency_level: 'low',
                    memo: ''
                },
                order_code: '',
                createOrderDisabled: false
            }
        },
        methods: {
            turnoffCar () {
                this.setCarShow(false)
            },

            ...mapActions([
                'setCarShow',
                'deleteShopCar'
            ]),

            /**
             * @description 从购物车删除选中的资源
             */
            deleteRes () {
                this.$confirm(`从当前${this.systemConfig.shopping_car}删除选中的资源，是否继续`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.deleteShopCarList()
                    this.$message({type: 'success', message: '资源删除成功!'})
                }).catch(() => {
                })
            },

            handleClick (type) {
                if (type === 'apply')
                    this.showItems = false
                else if (type === 'submitForm') {
                    this.$validator.validate().then(validate => {
                        if (validate) {
                            let orderFormContent = JSON.parse(JSON.stringify(this.orderFormContent))
                            orderFormContent.order_item.forEach(
                                content => {
                                    delete content.checked
                                    delete content.index
                                }
                            )
                            this.createOrderDisabled = true
                            Api.post('order', orderFormContent, true).then(
                                res => {
                                    this.$notify.success('资源申请操作成功')
                                    this.turnoffCar()
                                    this.$router.push('/orders')
                                }, () => {
                                    this.$notify.error('资源申请操作失败')
                                }
                            )
                            // UCMP-482 购物车提交申请单后删除对应资源
                            // UCMP-367 购物车无数字显示已加入的资源数量
                            this.deleteShopCarList()
                        }
                    })
                } else if (type === 'pre_step')
                    this.showItems = true
            },
            /**
             * @description 在store中删除对应数据，
             * @comment this.initInnerShopCarList()因为子组件双向绑定的关系，store暂时数据放到了data中，
             * 导致不能自动依赖，需调用一次
             */
            deleteShopCarList () {
                this.deleteShopCar(this.checkedResources.map(item => item.index))
                this.initInnerShopCarList()
            },
            /**
             * @description 初始化组件购物车list
             */
            initInnerShopCarList () {
                // UCMP367 购物车无数字显示已加入的资源数量
                const innerShopCarList = JSON.parse(JSON.stringify(this.shopCarList))
                innerShopCarList.forEach((item, index) => {
                    item.checked = false
                    item.index = index
                })

                this.innerShopCarList = innerShopCarList
            },
            /**
             * '购物车'字样从接口获取 
            */
            initSystemConfig () {
                this.title = this.systemConfig.shopping_car
            }

        },
        computed: {
            checkedResources () {
                return this.innerShopCarList.filter(item => {
                    if (item.checked) return item
                })
            },

            orderFormContent () {
                return {
                    memo: this.orderForm.memo,
                    urgency_level: this.orderForm.urgency_level,
                    order_item: this.checkedResources
                }
            },

            ...mapGetters([
                'shopCarList',
                'systemConfig'
            ])
        },

        created () {
            this.initInnerShopCarList()
            this.initSystemConfig()
        },

        components: {
            AllResourceItems,
            OrderConfirm
        }
    }
</script>
<style lang="scss" scoped>
    .turnoff-btn {
        border-radius: 0 !important;
    }

    .ucmp-icon-question {
        &:before {
            margin-left: 10px;
        }
    }

    .order-form {
        padding: 16px;
    }
</style>
