<template lang="pug">
    el-form.blueprint-form(:model="form" :rules="rules" ref="ruleForm" label-width="80px" size="small")
        el-form-item(label="编排名称" prop="name")
            el-input(v-model="form.name" placeholder="请输入编排名称")
        el-form-item(label="编排编码" prop="service_code")
            el-input(v-model="form.service_code" :disabled="ifEdit" placeholder="请输入编排编码")
                span(v-if="!ifEdit" slot="prefix") bp_
        el-form-item(label="描述" prop="description")
            Editor.editor(:content.sync="form.description")
        el-form-item(label="编排icon" prop="icon")
            EditBlueprintIcon(:checkedIcon.sync="form.icon")
        el-form-item.margin-top
            el-button(size="small" @click="quit") 取消
            el-button(size="small" type="primary" @click="submit" :disabled="submitDisabled") 保存
</template>
<script>
import Api from '@api'
import DefaultAttributes from '@mock/metadata/blueprint.attributes'
import BLUEPRINTACTIONS from '@mock/metadata/blueprint.actions'
import EditBlueprintIcon from './EditBlueprintIcon'
import Editor from '@common/editor/editor.vue'
import { mapActions } from 'vuex'

/**
 * @description 保存编排
 */
export default {
    props: ['resources', 'dialogVisible', 'ifEdit', 'blueInfo'],

    data () {
        return {
            form: {
                name: '',
                service_code: '',
                icon: '',
                group: 'blueprint',
                description: '可将一个或一组资源（云主机、云硬盘、软件、F5、NAS等）进行灵活的排列组合，提供一键式、场景化的多个资源自动化交付。'
            },
            submitDisabled: false,
            rules: {
                name: [
                    { required: true, message: '请输入编排名称', trigger: 'blur' },
                    { pattern: /^[\w\-\u4e00-\u9fa5]{1,100}$/g, message: '编排名称支持英文大小写字符、数字、 -、 _以及中文字符，最多不能超过100个字符', trigger: 'blur' }
                ],
                service_code: [
                    { required: true, message: '请输入编排编码', trigger: 'blur' },
                    { max: 50, message: '编排编码最多支持50个字符', trigger: 'blur' },
                    { validator: this.checkServiceCode, trigger: 'blur' },
                    { pattern: /^[a-zA-Z_]+[\w]*$/g, message: '编排编码支持英文大小写、数字以及 _ ，首个字符不能为数字', trigger: 'blur' }
                ],
                description: [
                    { validator: this.checkDescription, trigger: 'blur' }
                ]
            }
        }
    },

    methods: {
        ...mapActions([
            'updateMetaData'
        ]),
        quit () {
            this.$emit('update:dialogVisible', false)
        },

        /**
         * @description 校验编排编码唯一性
         */
        checkServiceCode (rule, value, callback) {
            // 更新模式，禁止校验唯一性
            if (this.ifEdit) {
                callback()
                return
            }

            let service_code = this.ifEdit ? value : `bp_${value}`

            Api.get('getMetadata', {_code: 'blueprint/service_code_check', service_code: service_code}, true).then(
                res => {
                    if (!res.result)
                        callback(new Error('编排编码已经存在，请修改'))
                    else
                        callback()
                }
            )
        },
        /**
         * @description 去除空格和html标签后,查看字符长度
         */
        checkDescription (rule, value, callback) {
            let noSpace = value.replace(/(&nbsp;)/g, 'a').replace(/\<p\>/g, '').replace(/\<\/p\>/g, '')
            if (noSpace.length > 110) 
                callback(new Error('描述最多支持110个字符'))
            else 
                callback()
        },

        submit () {
            this.$refs.ruleForm.validate((valid) => {
                if (valid) {
                    this.submitDisabled = true
                    // 编排添加默认normal_actions
                    let _normalActions = {}

                    BLUEPRINTACTIONS && BLUEPRINTACTIONS.forEach(
                        action => {
                            _normalActions[action.key] = action
                        }
                    )

                    let data = Object.assign(this.resources,
                        {
                            service_code: this.ifEdit ? this.form.service_code : `bp_${this.form.service_code}`,
                            _code: 'blueprint',
                            group: 'blueprint',
                            tenancy: true,
                            icon: this.form.icon,
                            applicable: true,
                            name: this.form.name,
                            description: this.form.description,
                            attribute: DefaultAttributes,
                            normal_actions: _normalActions,
                            resource_owner: ['app', 'org'],
                            actions: [
                                {
                                    description: '租期续期',
                                    enabled: true,
                                    label: '续期',
                                    name: 'renewal',
                                    instance_max_count: 1,
                                    is_approve: true // UCMP3-3113 允许在流程定义对其进行操作
                                },
                                {
                                    description: '修改资源所属',
                                    enabled: true,
                                    label: '修改资源所属',
                                    name: 'modify_resource_belong',
                                    is_approve: true 
                                }
                            ],
                            orchestrate: true, // UCMP-1117 应用编排资源列表过滤条件
                            text_field: 'name',
                            value_field: 'service_instance_id',
                            name_field: 'name'
                        }
                    )
                    let requestMethod = this.ifEdit ? 'put' : 'post'
                    Api[requestMethod]('getMetadata', data, true).then(
                        res => {
                            this.$message({
                                message: `${this.ifEdit ? '更新' : '保存'}编排${this.form.name}成功`,
                                type: 'success'
                            })
                            // 操作完成之后更新元数据中的数据
                            this.updateMetaData(res)
                            this.$emit('saveSuccess')
                        }
                    )
                }
            })
        }
    },

    created () {
        if (this.ifEdit) {
            this.form.name = this.blueInfo.name
            this.form.icon = this.blueInfo.icon
            this.form.service_code = this.blueInfo.service_code
            this.form.description = this.blueInfo.description
        }
    },

    components: {
        EditBlueprintIcon,
        Editor
    }
}
</script>
<style lang="scss" scoped>
.margin-top {
    margin-top: 30px;
}
</style>

<style lang="scss">
.editor .w-e-text-container{
    height: 200px!important;
}
</style>

