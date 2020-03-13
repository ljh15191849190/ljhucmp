<template lang="pug">
    el-dialog(:title="title" :visible.sync="visible" width="600px" :before-close="cancel")
        el-form(ref="ticket" size="small" label-width="80px" :rules="rules" :model="wsModel")
            el-form-item(label="工单标题" prop="title")
                el-input(v-model="wsModel.title" placeholder="请输入工单标题" :maxlength="100")
            el-form-item(label="工单类型" prop="type")
                el-select.select-width(v-model="wsModel.type" placeholder="请选择工单类型" @change="changeType" value-key="name")
                    el-option(v-for="item in wsTypes" :key="item.name" :value="item" :label="item.name")
            el-form-item(label="紧急程度" prop="urgency")
                el-select.select-width(v-model="wsModel.urgency" placeholder="请选择紧急程度")
                    el-option(v-for="item in wsUrgency" :key="item.name" :value="item.name" :label="item.name")

            el-form-item(label="处理对象" prop="operator_obj")
                el-radio-group(v-model="wsModel.operator_obj" @change="changeOperator")
                    el-radio(label="role") 处理角色
                    el-radio(label="person") 处理人
            el-form-item(v-if="wsModel.operator_obj === 'role'" prop="operator_role")
                el-select(ref="vmRole" v-model="wsModel.operator_role" placeholder="请选择处理角色")
                    el-option(v-for="item in wsRoleList" :key="item.value" :value="item.value" :label="item.label")
            el-form-item(v-else prop="operator_person")
                LazySelectUser(ref="vmPerson" v-model="wsModel.operator_person" placeholder="请选择处理人")

            el-form-item(label="工单描述" prop="comment")
                el-input(v-model="wsModel.comment" type="textarea" :rows="4" maxlength="200" placeholder="请输入工单描述，不多于200字符")
            el-form-item(label="工单附件")
                el-upload(
                ref="upload"
                action="/ucmp3/attachment"
                :headers="uploadHeaders"
                :file-list="wsModel.files"
                :limit="fileLimit"
                :on-exceed="fileExceed"
                :on-success="fileSuccess"
                :on-remove="fileRemove"
                :multiple="true"
                :auto-upload="true"
                :before-upload="beforeUpload"
                list-type="picture"
                :data="uploadData"
                )
                    el-button(type="primary") 点击上传
                    div.el-upload__tip(slot="tip") 可上传附件，照片或文档，数量不超过3个，每个文件大小不超过2M
            el-form-item
                el-button(@click="cancel") 取消
                el-button(type="primary" @click="save" :loading="isSaving") 保存
</template>

<script>
    import Api from '@api'
    import LazySelectUser from '@common/LazySelectUser'
    import {SUPPORT_IMG} from '@/server/ConstParams'
    import {mapGetters} from 'vuex'

    /**
     * 创建、修改工单
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'CreateWorkSheet',
        props: {
            visible: Boolean,
            isEdit: Boolean,
            ticketCode: String
        },
        components: {LazySelectUser},
        data () {
            return {
                fileLimit: 3, // 文件数量限制
                wsModel: {
                    title: '',
                    type: '',
                    urgency: '',
                    operator_obj: 'role',
                    operator_person: '',
                    operator_role: '',
                    comment: '',
                    files: [] // 上传返回的地址list
                },
                rules: {
                    title: [{
                        required: true,
                        trigger: 'blur',
                        message: '请输入工单标题'
                    }, {
                        pattern: /^[\u4e00-\u9fa5\w\-]+$/,
                        message: '支持英文字母，数字，汉字，横杠，下划线',
                        trigger: 'blur'
                    }],
                    type: [{
                        required: true,
                        trigger: 'blur, change',
                        message: '请选择工单类型'
                    }],
                    urgency: [{
                        required: true,
                        trigger: 'blur, change',
                        message: '请选择紧急程度'
                    }],
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
                    }],
                    comment: [{
                        required: true,
                        trigger: 'blur',
                        message: '请输入工单描述'
                    }]
                },
                isSaving: false,
                files: [],
                uploadHeaders: {
                    'X-Subject-Token': localStorage.getItem('authenticationToken')
                },
                uploadData: {
                    filename: ''
                }
            }
        },
        computed: {
            title () {
                return this.isEdit ? '修改工单' : '创建工单'
            },
            ...mapGetters([
                'wsTypes',
                'wsUrgency',
                'wsRoleList'
            ])
        },
        methods: {
            beforeUpload (file) {
                if (file.size > 2 * 1024 * 1024) {
                    this.$message.error('上传文件单个大小不能超过 2MB!')
                    return false
                }

                // 后台需要传filename规避中文乱码
                this.uploadData.filename = file.name
                return true
            },
            fileRemove (file, fileList) {
                // UCMP3-5700【工单管理】创建工单，选择了附件后清除附件，保存仍有附件信息
                if (file.response) {
                    // file.response存在表示是上传成功过的，而不是上传失败自动remove的
                    this.files = this.files.filter(item => item.id !== file.response.ucmp_file_id)
                }
            },
            fileExceed () {
                this.$message.error(`最多上传文件${this.fileLimit}个文件！`)
            },
            fileSuccess (response, file, fileList) {
                this.files.push({name: file.name, id: response.ucmp_file_id})

                // 非img展示固定的文档图片
                let uploadDomList = document.querySelectorAll('.el-upload-list li')
                Array.prototype.forEach.call(uploadDomList, li => {
                    this.$nextTick(() => {
                        if (!this.isImage(li.querySelector('.el-upload-list__item-name').textContent.trim())) {
                            // 替换展示
                            li.querySelector('.el-upload-list__item-thumbnail').src = process.env.NODE_ENV !== 'development'
                                ? '../../../static/ucmp-ui/static/images/icon/document.jpg'
                                : '../../../static/images/icon/document.jpg'
                        }
                    })
                })
            },
            isImage (name) {
                let suffix = name.split('.').pop().toString().toLowerCase()
                return SUPPORT_IMG.includes(suffix)
            },
            // 修改工单类型，填充全局参数默认处理人/处理角色
            changeType (item) {
                this.wsModel.operator_obj = item.type
                item.type === 'person' ? this.wsModel.operator_person = item.value : this.wsModel.operator_role = item.value
            },
            changeOperator () {
                this.wsModel.operator_people = ''
                this.wsModel.operator_role = ''
            },
            cancel () {
                this.$emit('update:visible', false)
            },
            success () {
                // 通知表格更新
                this.$emit('modified', this.isEdit)
                this.cancel()
            },
            save () {
                this.$refs.ticket.validate(valid => {
                    if (valid) {
                        let handlerName = this.wsModel.operator_obj === 'role' ? this.$refs.vmRole.selectedLabel : this.$refs.vmPerson.$refs.select.selectedLabel
                        let params = {
                            ticketTitle: this.wsModel.title,
                            ticketType: this.wsModel.type.name,
                            ticketGrade: this.wsModel.urgency,
                            attachments: this.files,
                            ticketDescription: this.wsModel.comment,
                            handlerType: this.wsModel.operator_obj,
                            handlerName,
                            handler: this.wsModel.operator_obj === 'role' ? this.wsModel.operator_role : this.wsModel.operator_person
                        }

                        // 修改
                        if (this.isEdit) params.ticketCode = this.ticketCode

                        Api.post('ticket', params, true).then(res => {
                            this.$notify.success(`工单${this.ticketCode}${this.isEdit ? '修改' : '创建'}操作成功！`)
                            this.success()
                        })
                    }
                })
            }
        },
        created () {
            if (this.isEdit) {
                Api.get('ticket', {id: this.ticketCode}, true).then(res => {
                    this.wsModel = {
                        title: res.ticketTitle,
                        type: res.ticketType,
                        urgency: res.ticketGrade,
                        operator_obj: res.handlerType,
                        operator_person: res.handlerType === 'person' ? res.handler : '',
                        operator_role: res.handlerType === 'role' ? res.handler : '',
                        comment: res.ticketDescription,
                        files: res.attachments || []
                    }
                })
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>