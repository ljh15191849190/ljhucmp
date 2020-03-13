<template lang="pug">
    div.rule-pane
        div.rule-content
            div.form-pane
                el-form(ref="ruleForm" :rules="rules" label-width="60px" label-position="left" size="small" :model="ruleForm")
                    el-form-item(label="名称" prop="name")
                        el-input.form-item-width(v-model="ruleForm.name" maxlength="20")
                    el-form-item(label="规则" prop="rule")
                        el-input.detail(type="textarea" 
                            placeholder="请输入规则脚本"
                            :rows="21"
                            v-model="ruleForm.rule"
                        )
            div.temp-pane.border
                div.title 规则模板
                div.rule-item(v-for="(item, index) in templateRuleList" 
                    :key="index" 
                    :class="{'active': index === activeIndex}"
                    @click="selectRule(item, index)"
                ) {{item.name}}
        div.rule-footer
            el-button(@click="handleClose" size="small") 取消
            el-button(type="warning" size="small" @click="submitForm" :disabled="submitDisabled") 保存
</template>
<script>
/**
 * 新建、编辑同步规则
 */
import Api from '@api'
export default {
    name: 'EditBlackRule',
    props: {
        provider_id: {
            type: String,
            default: () => {
                return ''
            }
        },
        ruleInfo: {
            type: Object,
            default: () => {
                return null
            }
        }
    },
    data () {
        return {
            activeIndex: -1,
            submitDisabled: false,
            templateRuleList: [],
            ruleForm: {
                name: '',
                rule: ''
            },
            rules: {
                name: [
                    { required: true, message: '请输入规则名称', trigger: 'blur' }
                ],
                rule: [
                    { required: true, message: '请输入详情', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        /**
         * @description 规则模板选中
         */
        selectRule (rule, index) {
            this.activeIndex = index
            if (!this.ruleForm.name) 
                this.ruleForm.name = rule.name
            this.ruleForm.rule = rule.script
        },
        /**
         * @description 取消
         */
        handleClose () {
            this.$emit('closeDialog')
        },
        /**
         * @description 保存
         */
        submitForm () {
            this.$refs.ruleForm.validate((valid) => {
                if (valid) {
                    this.submitDisabled = true
                    this.$set(this.ruleForm, 'provider_id', this.provider_id)
                    if (this.ruleInfo) {
                        this.$set(this.ruleForm, 'id', this.ruleInfo.id)
                        Api.put('providerRule', this.ruleForm, true).then(
                            res => {
                                this.$message({
                                    type: 'success',
                                    message: '修改规则成功!'
                                })
                                this.$emit('submitForm')
                            }, err => {
                                console.log(err)
                                this.submitDisabled = false
                            }
                        )
                    } else {
                        Api.post('providerRule', this.ruleForm, true).then(
                            res => {
                                this.$message({
                                    type: 'success',
                                    message: '创建规则成功!'
                                })
                                this.$emit('submitForm')
                            }, err => {
                                console.log(err)
                                this.submitDisabled = false
                            }
                        )
                    }
                }
            })
        }
    },
    created () {
        if (this.ruleInfo) {
            this.ruleForm.name = this.ruleInfo.name
            this.ruleForm.rule = this.ruleInfo.rule
        }
            
        Api.get('getDictByCode', {code: 'default_black_rules', level: 'system'}, true).then(
            res => {
                this.templateRuleList = res.default_black_rules
            }
        )
    }
}
</script>
<style lang="scss" scoped>
</style>
