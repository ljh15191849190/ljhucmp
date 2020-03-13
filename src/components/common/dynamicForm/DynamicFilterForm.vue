<template lang="pug">
    div(ref="advanceRef")
        el-form.filter-form(
            :inline="true"
            size="small"
            label-position="right"
        )
            slot(name="custonItem")
            UcmpDynamicFormItem(
                v-for="formItem in transformFormItems"
                v-if="!formItem.relation"
                :key="formItem.key"
                :showFormItem="showFormItem"
                :formItem="formItem"
                :formData="copyFormData"
                :value.sync="formItemData[formItem.key]"
                :isFilterItem="isFilterItem"
                :ifTrim="ifTrim")
            RelationFormItem(
                v-for="formItem in transformFormItems"
                v-if="formItem.relation"
                :formItem="formItem"
                :formData="copyFormData"
                :formItemData.sync="formItemData"
                :key="formItem.key"
                :showFormItem="showFormItem"
                :isFilterItem="isFilterItem"
                :ifTrim="ifTrim")
            el-form-item(v-if='serviceCode && serviceCode!=="tag"')
                LazySelectUser.full-width(v-model="userId" placeholder='责任人')
            el-form-item.margin-bottom
                <!--el-button.default-button(type="info" size="small" plain @click="clear") 清空-->
                el-button.default-button(type="primary" size="small" @click="submitFn('advance')") 查询
</template>
<script>
import RelationFormItem from './RelationFormItem'
import LazySelectUser from '@common/LazySelectUser'
export default {
    components: {RelationFormItem, LazySelectUser},
    $_veeValidate: {
        validator: 'new' // give me my own validator instance.
    },
    /**
     * @description 筛选数据动态表单，主要用在各个模块管理页面的条件查询Panel
     * @prop {boolean} inline 表单域是否变为行内的表单域,默认值为false
     * @prop {Array} metaItems 表单域展示的所有元数据原子项
     * @prop {object} formData 表单域原子项对应展示的值,需双向绑定
     * @prop {Function} submit 确认按钮函数处理
     * @prop {string} confirmLabel 表单确认按钮的文字,默认值为提交
     * @prop {string} searchPlaceholder 可选 搜索的placeholder
     */
    props: {
        serviceCode: String,
        setStyle: Function,
        metaItems: {
            type: Array,
            default: () => [],
            required: true
        },
        formData: {
            type: Object,
            default: () => {}
        },
        submit: Function
    },
    data () {
        return {
            searchVal: '',
            showFormItem: false,
            ifTrim: true,
            copyFormData: {},
            isFilterItem: true,
            userId: ''
        }
    },
    computed: {
        formItemData: {
            get () {
                this.transformFormItems.forEach(item => {
                    this.formatCopyFormData(item)
                    if (item.relation && item.children) {
                        //
                        item.children.forEach(child => {
                            this.formatCopyFormData(child)
                        })
                    }
                })

                return this.copyFormData
            },
            set (newVal) {
                this.copyFormData = newVal
            }
        },
        /**
         * @description UCMP3-495 控制台 筛选框不指定默认值
         */
        transformFormItems () {
            let formItems = JSON.parse(JSON.stringify(this.metaItems))
            formItems.forEach(
                item => {
                    delete item.default_value
                    // 替换特殊控件类型为select
                    if (item.fe_type && (item.fe_type.type === 'radio' || item.fe_type.type === 'checkbox' || item.fe_type.type === 'switch'))
                        item.fe_type.type = 'select'
                }
            )
            return formItems
        }
    },
    watch: {
        copyFormData: {
            deep: true,
            handler () {
                this.$emit('updateFilterForm', this.copyFormData)
            }
        },

        // UCMP3-1383 修复控制台列表分页栏被遮盖的问题 metaItems.length -> metaItems
        metaItems () {
            this.setStyle()
        }
    },
    methods: {
        // UCMP-560 消除 筛选表单 的所有值
        clearFormData () {
            this.copyFormData = JSON.parse(JSON.stringify({}))
        },

        init () {
            // copy formData
            this.copyFormData = JSON.parse(JSON.stringify(this.formData || {}))
        },
        submitFn (type) {
            this.$validator.validate().then(result => {
                if (result) {
                    // 区分普通搜索和高级搜索
                    if (type === 'advance') {
                        let query_data = {}
                        for (let key in this.copyFormData) {
                            //UCMP-370 网络管理--按容器查询，查询结果不正确(修改过滤条件)
                            //UCMP-564【控制台】云硬盘页面，所属云主机、状态等条件查询后清除搜索条件，点击查询返回为空
                            //类似bug现象为select返回了空，导致传入了url参数中，后台没有做空处理，直接放入sql，查询结果为空
                            //已还原，不影响370的bug
                            if (this.copyFormData[key] !== undefined && this.copyFormData[key] !== null && this.copyFormData[key] !== '')
                                query_data[key] = this.copyFormData[key]
                        }
                        if (this.userId) 
                            query_data = {...query_data, ...{'user_id': this.userId}}
                        
                        // 输出对象副本， 防止父组件submit修改参数导致显示异常
                        this.submit(Object.assign({}, query_data))
                    } else
                        this.submit({searchKey: this.searchVal})
                }
            })
        },
        assignValue (key, value) {
            this.copyFormData[key] = value
        },
        formatCopyFormData (item) {
            if (this.copyFormData[item.key] === undefined) {
                let value = item.multiple ? [] : null
                let data = JSON.parse(JSON.stringify(this.copyFormData))
                data[item.key] = value
                this.copyFormData = data
            }
        }
    },
    created () {
        this.init()
    }
}
</script>
<style lang="scss" scoped>
.input-search-width {
  width: 400px;
}
.default-button {
    margin-top: 0;
}
</style>
