<template lang="pug">
    el-dialog(title="分配处理对象" :visible.sync="visible" width="600px" :before-close="cancel")
        el-form(ref="ticket" size="small" label-width="80px" :rules="rules" :model="wsModel")
            el-form-item(label="处理对象" prop="operator_obj")
                el-radio-group(v-model="wsModel.operator_obj" @change="changeOperator")
                    el-radio(label="role") 处理角色
                    el-radio(label="person") 处理人
            el-form-item(v-if="wsModel.operator_obj === 'role'" prop="operator_role")
                el-select(v-model="wsModel.operator_role" placeholder="请选择处理角色")
                    el-option(v-for="item in wsRoleList" :key="item.value" :value="item.value" :label="item.label")
            el-form-item(v-else prop="operator_person")
                LazySelectUser(v-model="wsModel.operator_person" placeholder="请选择处理人")

            el-form-item
                el-button(@click="cancel") 取消
                el-button(type="primary" @click="save" :loading="isSaving") 保存
</template>

<script>
    import LazySelectUser from '@common/LazySelectUser'
    import {mapGetters} from 'vuex'
    import {WS_ACTION} from '@/server/ConstParams'
    import Api from '@api'

    /**
     * 工单分配
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'WorkSheetAssign',
        components: {LazySelectUser},
        props: {
            visible: Boolean,
            ticketCode: String
        },
        data () {
            return {
                wsModel: {
                    operator_obj: 'role',
                    operator_person: '',
                    operator_role: ''
                },
                rules: {
                    operator_obj: [{
                        required: true,
                        trigger: 'blur, change',
                        message: '请选择处理对象'
                    }],
                    operator_role: [{
                        required: true,
                        trigger: 'blur, change',
                        message: '请选择处理角色'
                    }],
                    operator_person: [{
                        required: true,
                        trigger: 'blur, change',
                        message: '请选择处理人'
                    }]
                },
                isSaving: false
            }
        },
        computed: {
            ...mapGetters([
                'wsRoleList'
            ])
        },
        methods: {
            changeOperator () {
                this.wsModel.operator_people = ''
                this.wsModel.operator_role = ''
            },
            cancel () {
                this.$emit('update:visible', false)
            },
            save () {
                this.$refs.ticket.validate(valid => {
                    if (valid) {
                        let params = {
                            id: this.ticketCode,
                            action: WS_ACTION.ASSIGN,
                            handleType: this.wsModel.operator_obj,
                            handlerId: this.wsModel.operator_obj === 'role' ? this.wsModel.operator_role : this.wsModel.operator_person
                        }

                        Api.post('ticketAction', params, true).then(res => {
                            this.$notify.success(`工单${this.ticketCode}分配操作成功!`)
                            this.$emit('assigned')
                            this.cancel()
                        })
                    }
                })
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>