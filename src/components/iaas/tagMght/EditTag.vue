<template lang="pug">
    el-dialog(:title="title" :visible.sync="visible" :before-close="handleClose" width="600px")
        el-form(label-width="80px" label-position="right" size="small" :rules="rules" :model="tagData" ref="tagData")
            el-form-item(label="所属类型" prop="service_code")
                el-select(v-model="tagData.service_code" value-key="id" :disabled="isEdit")
                    el-option(v-for="item in belongTypes" :key="item.id" :label="item.name" :value="item")
            el-form-item(label="标签类型" prop="tag_type")
                el-select(v-model="tagData.tag_type" value-key="id" :disabled="isEdit")
                    el-option(v-for="item in tagTypes" :key="item.id" :label="item.name" :value="item")
            el-form-item(label="标签名称" prop="tag_name")
                el-input(v-model.trim="tagData.tag_name" :maxlength="20" :disabled="!tagData.tag_type")
        div.dialog-footer(slot="footer")
            el-button(size="small" @click="handleClose") 取消
            el-button(size="small" @click.native="save" type="primary" :loading="isSaving") 保存    
</template>

<script>
    import axios from 'axios'
    import Api from '@api'
    import Utils from '@server/Utils'

    /**
     * @description 标签管理 —— 修改
     * @author jia.lu
     */
    export default {
        name: 'EditTag',
        props: ['visible', 'resource', 'isEdit', 'metaData'],
        data () {
            return {
                isSaving: false,
                ifNameExistCalling: false,
                tagData: {},
                source: null
            }
        },
        computed: {
            id () {
                // 修改携带id， 创建自定义id
                return this.isEdit ? this.resource.tag_id : Utils.uuid()
            },
            originTagName () {
                return this.isEdit ? this.resource.tag_name : ''
            },
            tagTypes () {
                const metaColumn = this.metaData.attribute.find(item => {
                    return item.key === 'tag_type'
                })

                return metaColumn ? metaColumn.enum : []
            },
            belongTypes () {
                const metaColumn = this.metaData.attribute.find(item => {
                    return item.key === 'service_code'
                })

                return metaColumn ? metaColumn.enum : []
            },
            method () {
                return this.isEdit ? 'put' : 'post'
            },
            title () {
                return this.isEdit ? '修改标签' : '创建标签'
            },
            rules () {
                return {
                    service_code: [{
                        required: true,
                        message: '请选择所属类型',
                        trigger: 'blur'
                    }],
                    tag_type: [{
                        required: true,
                        message: '请选择标签类型',
                        trigger: 'blur'
                    }],
                    tag_name: [{
                        required: true,
                        message: '请输入标签名称',
                        trigger: 'blur'
                    }, {
                        pattern: /^[\u4e00-\u9fa5\w\-]+$/,
                        message: '支持英文字母，数字，汉字，横杠，下划线',
                        trigger: 'blur'
                    }, {
                        validator: this.ifNameExist,
                        trigger: 'blur'
                    }]
                }
            }
        },
        methods: {
            save () {
                this.isSaving = true
                this.$refs.tagData.validate(valid => {
                    if (valid) {
                        /**
                         * {
                                "owner_type":"",
                                "owner":"",
                                "env":"",
                                "data":{
                                    "group":"tag",
                                    "resources":{
                                        "ecs_f8aaf9cc64384815817bd24c35a57dba":{
                                            "id":"tag_f8aaf9cc64384815817bd24c35a57dba",
                                            "group":"tag",
                                            "service_code":"tag",
                                            "display":{
                                                "tag_type":"标签类型",
                                                "tag_name":"标签名称",
                                                "service_code":"公共标签"
                                            },
                                            "reference":"",
                                            "attributes":{
                                                "tag_type":"标签类型",
                                                "tag_name":"标签名称",
                                                "service_code":"public_tag"
                                            }
                                        }
                                    },
                                    "service_code":"tag"
                                }
                            }
                         */
                        let params = {}
                        if (this.isEdit) {
                            params = {
                                service_code: 'tag',
                                resource_id: this.id,
                                items: {
                                    display: {
                                        tag_name: this.tagData.tag_name,
                                        tag_id: this.id,
                                        service_code: this.tagData.service_code.name
                                    },
                                    attributes: {
                                        tag_name: this.tagData.tag_name,
                                        tag_id: this.id,
                                        service_code: this.tagData.service_code.id
                                    }
                                }
                            }
                        } else {
                            params = {
                                owner_type: '',
                                owner: '',
                                env: '',
                                data: {
                                    group: 'tag',
                                    resources: {
                                        [this.id]: {
                                            tag_id: this.id,
                                            group: 'tag',
                                            service_code: 'tag',
                                            reference: '',
                                            display: {
                                                tag_id: this.id,
                                                tag_type: this.tagData.tag_type.name,
                                                tag_name: this.tagData.tag_name,
                                                service_code: this.tagData.service_code.name
                                            },
                                            attributes: {
                                                tag_id: this.id,
                                                tag_type: this.tagData.tag_type.id,
                                                tag_name: this.tagData.tag_name,
                                                service_code: this.tagData.service_code.id
                                            }
                                        }
                                    },
                                    service_code: 'tag'
                                }
                            }
                        }
                        Api[this.method]('serviceApply', params, true).then(res => {
                            this.isSaving = false

                            // UCMP-1345【标签】创建公有标签，没有配置审批流程，但是却提示创建公有审批申请成功
                            const message = this.title + '成功'
                            this.$notify({
                                type: 'success',
                                message
                            })
                            this.emitUpdate()
                            this.handleClose()
                        }).catch(() => {
                            this.isSaving = false
                        })
                    } else
                        this.isSaving = false
                })
            },
            emitUpdate () {
                this.$emit('updateTag')
            },
            handleClose () {
                this.$emit('closeDialog')
            },
            ifNameExist (rule, value, callback) {
                // 如果是save时能取消前一个blur时间的调用
                if (this.source)
                    this.source.cancel()
                this.source = axios.CancelToken.source()

                if (!this.tagData.tag_type) {
                    //
                    callback(new Error('请先选择标签类型'))
                }

                if (this.isEdit && this.tagData.tag_type.id === this.resource.tag_type && this.tagData.tag_name === this.resource.tag_name)
                    callback()

                const param = {
                    cancelToken: this.source.token,
                    tag_name: this.tagData.tag_name,
                    tag_type: this.tagData.tag_type.id,
                    serviceCode: this.tagData.service_code.id
                }
                Api.get('getTagByTypeAndName', param, true).then(res => {
                    if (!res)
                        callback(new Error('该标签名称已经存在，请重新输入!'))
                    else
                        callback()
                }).catch(e => {
                })
            },
            initResource () {
                if (this.isEdit) {
                    this.tagData = {
                        service_code: this.belongTypes.find(item => {
                            return item.id === this.resource.service_code
                        }),
                        tag_type: this.tagTypes.find(item => {
                            return item.id === this.resource.tag_type
                        }),
                        tag_name: this.resource.tag_name
                    }
                } else {
                    //
                    this.tagData = {service_code: this.belongTypes[0]}
                }
            }
        },
        created () {
            this.initResource()
        }
    }
</script>

<style lang="scss" scoped>

</style>