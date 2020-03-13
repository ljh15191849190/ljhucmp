<template lang="pug">
    el-dialog(title="手动添加应用程序", :visible.sync="showAddAppDialog", :modal="false", @close="handleEmitClose")
        el-container.noPadTop
            el-main.noPadTop
                section.appAppDialog
                    p.subTitle 可以从此交付组中的虚拟机或其他网络位置添加应用程序
                    el-form(ref="appDataForm", :model="appDataForm", :rules="rules", label-width="180px")
                        el-form-item(label="可执行文件的路径:", prop="commandLineExecutable")
                            el-input(v-model="appDataForm.commandLineExecutable", size="small", placeholder="示例:/ProgramFiles(x86)/Internet Explorer/iexplore.exe")
                        el-form-item(label="命令行参数(可选):", prop="commandLineArguments")
                            el-input(v-model="appDataForm.commandLineArguments", size="small", placeholder="示例: http://www.example.com")
                        el-form-item(label="工作目录:", prop="working_directory")
                            el-input(v-model="appDataForm.working_directory", size="small", placeholder="示例:/ProgramFiles(x86)/Internet Explorer")
                        el-form-item(label="应用程序名称(面向用户):", prop="name")
                            el-input(v-model="appDataForm.name", size="small", placeholder="示例: 示例web站点")
                        el-form-item(label="应用程序名称(面向管理员):", prop="publish_name") 
                            el-input(v-model="appDataForm.publish_name", size="small", placeholder="示例: Internet Explorer-示例Web站点")
        footer(slot="footer")
            el-button(size="small", @click="handleEmitSuccess") 添加
            el-button(@click="handleEmitClose", size="small") 取消
</template>

<script>
export default {
  props: ['value', 'appData'],
  data () {
      return {
        appDataForm: {
          commandLineExecutable: '',
          commandLineArguments: '',
          name: '',
          publish_name: '',
          working_directory: ''
        },
        rules: {
          commandLineExecutable: [
            {required: true, message: '请输入可执行文件的路径', trigger: 'blur'}
          ],
          publish_name: [
            {required: true, message: '请输入应用程序名称(面向管理员)', trigger: 'blur'},
            {pattern: /^[^\\\/;；:：#,，\*\?？=<>\|\[\]\(\)""''`]*$/, message: '请输入正确的名称', trigger: 'blur'}
          ],
          name: [
            {required: true, message: '请输入应用程序名称(面向用户)', trigger: 'blur'},
            {pattern: /^[^\\\/;；:：#,，\*\?？=<>\|\[\]\(\)""''`]*$/, message: '请输入正确的名称', trigger: 'blur'}
          ],
          working_directory: [
              { pattern: /.*[^\\]$/, message: '工作目录不能以 \ 结尾', trigger: 'blur' }
          ],
          commandLineArguments: []
        },
        showAddAppDialog: false
      }
  },
  methods: {
    // -------------emit-------------------
    handleEmitClose () {
      this.init()
      this.$emit('close')
    },
    handleEmitSuccess () {
      this.$refs.appDataForm.validate(validate => {
        if (validate) {
          this.$emit('success', {...this.appDataForm})
          this.init()
        } else
          return false
      })
    },
    init () {
      this.appDataForm = {
          commandLineExecutable: '',
          commandLineArguments: '',
          name: '',
          publish_name: '',
          working_directory: ''
      }
      this.$refs.appDataForm.resetFields()
    }
  },
  watch: {
    value (val) {
      this.showAddAppDialog = val
    }
  }
}
</script>

<style lang="scss" scoped>
  .noPadTop{
    padding-top: 0;
  }
  .mT3 {
    margin-top: 10px;
  }
</style>

