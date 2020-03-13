<template lang="pug">
    el-dialog(title="添加应用程序", :visible.sync="showDesktopDialog", @close="handleEmitClose")
        el-container.noPadTop
            el-main.noPadTop
                section
                    p.subTitle 选择要添加到交付组的可用应用程序。 要添加程序, 请点击手动添加应用程序按钮
                    el-table(:data="appList" stripe lazy border @selection-change="handleSelectionChange")
                        el-table-column(width="45", type="selection")
                        el-table-column(label="名称", prop="name")
                    section.mT3
                        el-button(size="small", @click="addAppDialogShow = true") 手动添加程序
                        el-button(size="small", :disabled="selectApp.length == 0", @click="handleDeleteSelectApp") 删除
                    //- section.mT3    
                    //-     p 将新应用程序放置在文件夹中：
                    //-     p {{'show Time'}}
                    //-     el-button 更改
        footer(slot="footer")
            el-button(size="small", @click="handleEmitSuccess", type="primary") 添加
            el-button(@click="handleEmitClose", size="small") 取消
        addAppDialog(v-model="addAppDialogShow", :appData="appData",  @close="emitAddAppClose", @success="emitAddAppSuccess")    
</template>

<script>
import Api from '@api'
import addAppDialog from './addAppDialog.vue'
export default {
  props: ['value', 'activeDelivery'],
  data () {
      return {
        appList: [],
        selectApp: [],
        appData: {
          commandLineExecutable: '',
          commandLineArguments: '',
          name: '',
          publish_name: '',
          working_directory: ''
        },
        addAppDialogShow: false,
        showDesktopDialog: false
      }
  },
  components: {
    addAppDialog
  },
  watch: {
    value (val) {
      if (val) this.appList = []
      this.showDesktopDialog = val
    }
  },
  methods: {
    // 提交之前的验证
    validateSendInfoToDelivery () {
      if (!this.appList.length) {
        this.$message.warning('请选择需要添加的应用程序')
        return false
      }
      return true
    },
    // 勾选application
    handleSelectionChange (selection) {
      this.selectApp = selection
    },
    // 删除勾选中的application
    handleDeleteSelectApp () {
      this.selectApp.forEach(item => {
        let selectAppIndex = this.appList.findIndex(app => app.uuid === item.uuid)
        if (selectAppIndex > -1) this.appList.splice(selectAppIndex, 1)
      })
    },
    
    // 提交 添加应用程序到交付组
    sendInfoToDelivery () {
      if (!this.validateSendInfoToDelivery()) return Promise.reject(Error('no pass validate'))
      let applications = this.appList.map(item => {
          let serviceItem = {
            command_line_executable: item.commandLineExecutable,
            command_line_arguments: item.commandLineArguments,
            name: item.name,
            working_directory: item.working_directory,
            publish_name: item.name
          }
          return serviceItem
      })
      return Api.post('addApplication', {
        provider_id: this.activeDelivery.provider_id,
        desktop_group_uid: this.activeDelivery.delivery_group_id,
        applications: applications
      })
    },

    // -------------emit-------------------
    emitAddAppClose () {
      this.addAppDialogShow = false
    },
    emitAddAppSuccess (data) {
      this.addAppDialogShow = false
      data.uuid = Date.now()
      this.appList.push(data)
    },
    handleEmitClose () {
      this.init()
      this.$emit('close')
    },
    handleEmitSuccess () {
      this.sendInfoToDelivery()
      .then(() => {
        this.init()
        this.$message.success('添加成功')
        this.$emit('success')
      })
      .catch(() => {})
    },
    // 初始化弹框
    init () {
      this.selectApp = ''
      this.appList = []
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
