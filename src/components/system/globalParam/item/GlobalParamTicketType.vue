<template lang="pug">
    el-dialog(title="添加工单类型" :visible.sync="visible" :before-close="close")
        el-form(ref="form" size="small" label-width="120px" :model="formData" :rules="rules")
            el-form-item(label="工单类型" prop="name")
                el-input(v-model="formData.name" placeholder="请输入工单类型")
            el-form-item(label="处理对象" prop="type")
                el-radio-group(v-model="formData.type")
                    el-radio(label="role") 处理角色
                    el-radio(label="person") 处理人
            el-form-item(v-if="formData.type === 'role'" prop="role")
                el-select(ref="vmRole" v-model="formData.role" placeholder="请选择处理角色")
                    el-option(v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id")
            el-form-item(v-else prop="person")
                LazySelectUser.full-width(ref="vmPerson" v-model="formData.person")
        div.text-center.dialog-footer(slot="footer")
            el-button(size="small" @click="close") 取消
            el-button(type="primary" @click="save" size="small") 保存
</template>

<script>
    import LazySelectUser from '@common/LazySelectUser'
    import Api from '@api'

    /**
     * 工单类型 全局参数添加
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'GlobalParamTicketType',
        components: {LazySelectUser},
        props: ['code', 'visible'],
        data () {
            return {
                formData: {
                    name: '',
                    type: 'role',
                    role: '',
                    person: ''
                },
                roleList: [],
                rules: {
                    name: [{
                        required: true,
                        trigger: 'blur',
                        message: '请输入工单类型'
                    }],
                    type: [{
                        required: true,
                        trigger: 'blur',
                        message: '请选择处理对象'
                    }],
                    role: [{
                        required: true,
                        trigger: 'blur',
                        message: '请选择处理角色'
                    }],
                    person: [{
                        required: true,
                        trigger: 'blur',
                        message: '请选择处理人'
                    }]
                }
            }
        },
        computed: {},
        methods: {
            close () {
                this.$emit('close', this.code)
            },

            save () {
                this.$refs.form.validate(valid => {
                    if (valid) {
                        let obj = {
                            display: {},
                            value: {}
                        }
                        if (this.formData.type === 'role') {
                            obj.display = this.formData.name + ':' + this.$refs.vmRole.selectedLabel
                            obj.value = {
                                name: this.formData.name,
                                type: this.formData.type,
                                value: this.formData.role
                            }
                        } else {
                            obj.display = this.formData.name + ':' + this.$refs.vmPerson.$refs.select.selectedLabel
                            obj.value = {
                                name: this.formData.name,
                                type: this.formData.type,
                                value: this.formData.person
                            }
                        }

                        this.$emit('add', this.code, obj)
                        this.close()
                    }
                })
            },

            getRoleList () {
                let params = {limit: 999999, page: 1, project_id: localStorage.getItem('tenant')}
                Api.get('roleList', params, true).then(res => {
                    this.roleList = res.data.roles.filter(item => item.platform_name === 'ucmp')
                })
            }
        },
        created () {
            this.getRoleList()
        }
    }
</script>

<style lang="scss" scoped>

</style>
