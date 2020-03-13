<template lang="pug">
    SimplifiedServiceForm(
        :dialogVisible.sync="visible"
        :formItems="showformItems"
        @submit="submit"
        @blurWidget="blurWidget"
        :isSaving="isSaving"
        :formData="formData"
        :display="display")
        GuardianAppLikedPercent(ref="similarRef" slot="moreFormSlot" :formData="formData")
</template>
<script>
/**
 * @description 添加应用表单，申请服务服务资源归属使用
 */
import SimplifiedServiceForm from './common/SimplifiedServiceForm'
import GuardianAppLikedPercent from './common/GuardianAppLikedPercent'
import Api from '@api'
import Utils from '@server/Utils'
import {mapGetters} from 'vuex'

export default {
    $_veeValidate: {
        validator: 'new'
    },
    props: ['dialogVisible', 'formItems'],

    data () {
        return {
            formData: {},
            display: {},
            service_code: 'guardian_app',
            isSaving: false,
            likedAppList: []
        }
    },
    
    methods: {
        closeDialog () {
            this.visible = false
        },

        /**
         * @description 封装为申请单接口类型的数据
         */
        orderDataConstructor (data) {
            let orderData = {
                _action: 'create',
                _service_code: this.service_code,
                order_item: [{
                    owner_type: '',
                    owner: '',
                    count: 1, 
                    env: '',
                    service_item: { expired_at: 0 },
                    data: {
                        resources: {},
                        dependencies: [],
                        service_code: this.service_code
                    }
                }],
                urgency_level: 'low',
                expected_time: '',
                memo: ''
            }

            let resources = [{
                attributes: data.formData,
                display: data.display,
                service_code: this.service_code,
                id: Utils.uuid(),
                reference: '',
                group: ''
            }]

            orderData.order_item[0].data.resources = Utils.transformTreeMapData(resources, 'id', 'reference', 'includings', '')
            return orderData
        },

        submit (data) {
            this.isSaving = true
            let orderFormContent = this.orderDataConstructor(data)
            Api.post('order', orderFormContent, true).then(
                res => {
                    this.isSaving = false
                    this.$nextTick(() => {
                        this.$emit('submitAppOrder', res)
                    })
                }, () => {
                    this.isSaving = false
                }
            )
        },

        blurWidget (id) {
            if (id === 'business_app_name')
                this.$refs.similarRef.refreshAppLikedPercent()
        }
    },

    computed: {
        ...mapGetters([
            'businessOrproject'
        ]),
        selectedBusinessLabel () {
            return this.businessOrproject === 'business' ? '业务' : '项目'
        },
        showformItems () {
            this.formItems.forEach(item => {
                if (item.key === 'business_id') 
                    item.label = this.selectedBusinessLabel
            })
            return this.formItems
        },
        visible: {
            set (val) {
                this.$emit('update:dialogVisible', val)
            },

            get () {
                return this.dialogVisible
            }
        }
    },

    created () {
    },

    components: {
        SimplifiedServiceForm,
        GuardianAppLikedPercent
    }
}
</script>

<style lang="scss" scoped>

</style>
