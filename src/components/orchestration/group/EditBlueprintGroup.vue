<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems" :bgEmpty="bgEmpty")
        el-form.save-blueprint-group(
            label-width="120px"
            size="small"
            label-position="left"
            slot="content"
            ref="ruleForm"
        )
            el-form-item(label="分层名称" prop="name")
                el-input(
                    v-model="groupForm.name"
                    v-validate="'required'"
                    name="name"
                    placeholder="请输入分层名称"
                    data-vv-as="分层名称"
                    :class="{'is-danger': errors.has('name')}"
                )
                span.validator-error.is-danger(v-if="errors.has('name')") {{ errors.first('name') }}
            el-form-item(label="分层边框颜色" prop="stroke")
                ColorPicker(
                    :colors="predefineColors"
                    :selectedColor.sync="groupForm.stroke"
                    :class="{'is-danger': errors.has('stroke')}"
                    direction="right"
                )
                el-input.hidden(
                    v-model="groupForm.stroke"
                    v-validate="'required'"
                    name="stroke"
                    data-vv-as="分层边框颜色"
                )
                span.validator-error.is-danger(v-if="errors.has('stroke')") {{ errors.first('stroke') }}
            el-form-item(label="分层背景颜色" prop="name")
                ColorPicker(
                    :colors="lightPredefineColors"
                    :selectedColor.sync="groupForm.fill"
                    :class="{'is-danger': errors.has('fill')}"
                    direction="right"
                )
                el-input.hidden(
                    v-model="groupForm.fill"
                    v-validate="'required'"
                    name="fill"
                    data-vv-as="分层背景颜色"
                )
                span.validator-error.is-danger(v-if="errors.has('fill')") {{ errors.first('fill') }}
            el-form-item
                el-button(type="primary" @click="saveBlueprintGroup") 保存编排分层
</template>
<script>
/**
 * @description 新增/修改编排分层 【表单】
 */
import ColorPicker from '@/components/common/ColorPicker'
import Api from '@api'

export default {
    $_veeValidate: {
        validator: 'new'
    },
    data () {
        return {
            bgEmpty: false,
            id: null,
            groupForm: {
                name: '',
                stroke: null,
                fill: null
            },
            predefineColors: [
                'rgba(138, 254, 252, 0.5)',
                'rgba(255, 219, 73, 0.5)',
                'rgba(226, 167, 254, 0.5)',
                'rgba(253, 152, 152, 0.5)',
                'rgba(155, 253, 157, 0.5)'
            ],
            lightPredefineColors: [
                'rgba(138, 254, 252, 0.2)',
                'rgba(255, 219, 73, 0.2)',
                'rgba(226, 167, 254, 0.2)',
                'rgba(253, 152, 152, 0.2)',
                'rgba(155, 253, 157, 0.2)'
            ],
            rules: {
                name: [
                    { required: true, message: '请输入编排分层名称', trigger: 'blur' }
                ],
                stroke: [
                    { required: true, message: '请输入分层边框颜色', trigger: 'blur' }
                ],
                fill: [
                    { required: true, message: '请输入分层背景颜色', trigger: 'blur' }
                ]
            }
        }
    },

    computed: {
        breadcrumbItems () {
            let rst = [{ prop: '/blueprint-group', label: '编排分层' }]
            if (this.$route.params.group_id === 'add')
                rst.push({prop: '/blueprint-group/add', label: '新增编排分层'})
            else
                rst.push({prop: '/blueprint-group/' + this.$route.params.group_id, label: this.groupForm.name + '编辑'})
            return rst
        }
    },

    methods: {
        saveBlueprintGroup () {
            // UCMP-1564 添加表单校验功能
            this.$validator.validate().then(result => {
                if (result) {
                    if (this.id) {
                        Api.put('blueprintGroups', { group_id: this.id, name: this.groupForm.name, config: { styles: { fill: this.groupForm.fill, stroke: this.groupForm.stroke } } }, true).then(
                            res => {
                                this.$message({ type: 'success', message: '更新编排分层' + this.groupForm.name + '成功' })
                                this.$router.push('/blueprint-group')
                            }
                        )
                        return
                    }

                    Api.post('blueprintGroups', { name: this.groupForm.name, config: { styles: { fill: this.groupForm.fill, stroke: this.groupForm.stroke } } }, true).then(
                        res => {
                            this.$message({ type: 'success', message: '保存编排分层' + this.groupForm.name + '成功' })
                            this.$router.push('/blueprint-group')
                        }
                    )
                }
            })
        }
    },

    created () {
        if (this.$route.params.group_id !== 'add') {
            this.id = this.$route.params.group_id
            Api.get('blueprintGroups', { group_id: this.$route.params.group_id }, true).then(
                res => {
                    this.groupForm.name = res.name
                    this.groupForm.fill = res.config.styles.fill
                    this.groupForm.stroke = res.config.styles.stroke
                }
            )
        }
    },

    components: {
        ColorPicker
    }
}
</script>
<style lang="scss" scoped>
.save-blueprint-group {
    width: 600px;
    margin-top: 16px; // UCMP3-3330 修改编排分组的表单布局优化
}
</style>
