<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            section.searchBox
                el-input.w200.mr10(v-model="delivery_group_name", placeholder="请输入交付组", size="small")
                el-button(type="primary", size="small", @click="getDeliveryList") 查询
            section.btnGroup.mt10
                el-button.mr10(size="small", @click="showDialog('showDesktopDialog')", :disabled="isCanAddDesktop") 添加计算机
                el-button.mr10(size="small", @click="showDialog('addDialogShow')", :disabled="isCanAddApp") 添加应用程序
                el-button.mr10(size="small", :disabled="isCanAddDesktop") 编辑交付组
            UcmpTableContainer
                div.full-height(slot="tableContainer")    
                    el-table.mt10(:data="deliveryList" stripe lazy border @selection-change="handleSelectDelivery", ref="deliveryTable")
                        el-table-column(type="selection", width="50")
                        el-table-column(label="交付组", prop="delivery_group_name")
                            template(slot-scope="scope") 
                                span {{ `${scope.row.delivery_group_name}（${transStatus[scope.row.session_support]}）` }}
                        el-table-column(label="交付", prop="deliveryType")
                        el-table-column(label="计算机数量", prop="machine_count")
            desktopDialog(v-model="showDesktopDialog", :activeDelivery="activeDelivery" @success="emitDesktopSuccess", @close="emitDesktopClose")
            appDialog(v-model="addDialogShow", :activeDelivery="activeDelivery" @success="emitAppDialogSuccess", @close="emitAppDialogClose")
            EditDelivery(v-if="editDialogShow" :visible.sync="editDialogShow" :activeDelivery="activeDelivery")
</template>

<script>
import desktopDialog from './desktopDialog.vue'
import appDialog from './components/appDialog.vue'
import EditDelivery from './components/EditDelivery.vue'
import Api from '@api'

const CONFIG = {
    0: '桌面操作系统',
    1: '服务器操作系统'
}
export default {
  components: {
    desktopDialog,
    appDialog,
    EditDelivery
  },
  data () {
      return {
          transStatus: CONFIG,
          breadcrumbItems: [
              { prop: '', label: '交付组' }
          ],
          delivery_group_name: '',
          deliveryList: [],
          showDesktopDialog: false,
          selectDelivery: [],
          addDialogShow: false,
          editDialogShow: false
      }
  },
  created () {
      this.getDeliveryList()
  },
  methods: {
      showDialog (name) {
        this[name] = true
      },
      // 获取交付组列表
      getDeliveryList () {
          // delivery_type 0:桌面 1:应用 2桌面和应用
          let deliveryTypeObj = ['桌面', '应用', '桌面和应用']
          Api.get('deliveryGroup', {delivery_group_name: this.delivery_group_name, delivery_type: 0}, false)
          .then(res => {
              this.deliveryList = res.list.map(item => {
                  item.deliveryType = deliveryTypeObj[item.delivery_type]
                  return item
              })
          })
      },
      // 勾选列表
      handleSelectDelivery (selection) {
          this.selectDelivery = selection
      },
      // ---------------emit-------------------
      emitDesktopSuccess () {
          this.showDesktopDialog = false
          this.getDeliveryList()
      },
      emitDesktopClose () {
          this.showDesktopDialog = false
      },
      emitAppDialogSuccess () {
          this.addDialogShow = false
          this.getDeliveryList()
      },
      emitAppDialogClose () {
          this.addDialogShow = false
      },
      emitEditAppDialogClose () {
          this.editDialogShow = false
      }
  },
  computed: {
      isCanAddDesktop () {
          return this.selectDelivery.length !== 1
      },
      isCanAddApp () {
          return this.selectDelivery.length !== 1 || this.selectDelivery[0].session_support === 0
      },
      activeDelivery () {
          return this.selectDelivery.length === 1 ? this.selectDelivery[0] : {}
      }
  }
}
</script>

<style lang="scss" scoped>
.w200{
    width: 200px;
}
.mr10{
    margin-right: 10px;
}
.mt10{
    margin-top: 10px;
}
</style>
