<template lang="pug">
    el-dialog(title="添加工单紧急程度" :visible.sync="visible" :before-close="close")
        el-form(ref="form" size="small" label-width="120px" :model="formData" :rules="rules")
            el-form-item(label="紧急程度" prop="name")
                el-input(v-model="formData.name" placeholder="工单紧急程度")
            el-form-item(label="权重" prop="weight")
                el-select(v-model="formData.weight" placeholder="请选择权重")
                    el-option(v-for="item in 10" :key="item" :label="item" :value="item")
        div.text-center.dialog-footer(slot="footer")
            el-button(size="small" @click="close") 取消
            el-button(type="primary" @click="save" size="small") 保存
</template>

<script>
    /**
     * @description
     * @author jia.lu
     */
    export default {
        name: 'GlobalParamTicketGeneral',
        props: ['code', 'visible'],
        data () {
            return {
                formData: {
                    name: '',
                    weight: ''
                },
                rules: {
                    name: [{
                        required: true,
                        trigger: 'blur',
                        message: '请输入工单紧急程度'
                    }],
                    weight: [{
                        required: true,
                        trigger: 'blur',
                        message: '请选择权重'
                    }]
                },
                weightColor: ['#989898', '#000000', '#8b531b', '#9b40d8', '#0198e4', '#8bd8fe', '#61c359', '#fedb75', '#ffaa00', '#ff0000']
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
                            display: this.formData.name + ':' + this.formData.weight,
                            value: {
                                name: this.formData.name,
                                weight: this.formData.weight,
                                color: this.weightColor[this.formData.weight - 1]
                            }
                        }

                        this.$emit('add', this.code, obj)
                        this.close()
                    }
                })
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>