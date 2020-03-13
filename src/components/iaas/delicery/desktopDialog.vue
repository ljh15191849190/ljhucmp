<template lang="pug">
    el-dialog(title="添加计算机", :visible.sync="showDesktopDialog", @close="handleEmitClose")
        el-container.noPadTop
            //- el-aside(width="140px")
            //-     p 计算机
            //-     p 摘要
            el-main.noPadTop
                section(v-if="activeStep == 0")
                    p.subTitle 选择计算机目录
                    el-table(:data="computerList" stripe lazy border)
                        el-table-column(width="30")
                            template(slot="header")
                                span
                            template(slot-scope="{row}")
                                el-radio-group(v-model="selectComputer")
                                    el-radio(:label="row.uuid") {{''}}
                        el-table-column(label="目录", prop="name")
                        el-table-column(label="类型", prop="sessionSupportText")
                        el-table-column(label="计算机", prop="availableCount")
                    section.mT3
                        label 选择此交付组的计算机数量:
                        el-input-number(v-model="computerNum", size="small", :min="1", :max="selectMax", :step-strictly="true", :step="1")
                section(v-if="activeStep == 1")
                    p.title 摘要
                    section.deliveryItem
                      p
                        span 交付组
                        span WinServer2012
                      p
                        span 已添加的计算机
                        span 1台未分配
        footer(slot="footer")
            //- el-button(:disabled="activeStep == 0", size="small") 上一步
            //- el-button(v-if="activeStep != 1", size="small") 下一步
            el-button(size="small", @click="handleEmitSuccess") 添加
            el-button(@click="handleEmitClose", size="small") 取消
</template>

<script>
import Api from '@api'
export default {
  props: ['value', 'activeDelivery'],
  data () {
      return {
        activeStep: 0,
        computerList: [],
        computerNum: 1, //UCMP3-5664 计算机数量最小为1
        selectComputer: '',
        showDesktopDialog: false
      }
  },
  methods: {
    // 获取计算机列表
    getComputerList () {
      Api.get('computerList', {provider_id: this.activeDelivery.provider_id, desktop_group_uid: this.activeDelivery.delivery_group_id})
      .then(res => {
        this.computerList = res.data && res.data.catalogs.map(item => {
          item.sessionSupportText = item.sessionSupport === 0 ? '桌面操作系统' : '服务器操作系统'
          return item
        })
        // UCMP3-6471【交付组】给交付组添加静态计算机目录优化：如果计算机已经分配了用户，这个数据需要过滤掉
        .filter(item => item.availableUnassignedCount > 0) //UCMP3-5666 可用数量为0的计算机目录不需要显示
      })
    },
    // 提交之前的验证
    validateSendInfoToDelivery () {
      if (this.selectComputer === '') {
        this.$message.warning('请选择需要添加的计算机目录')
        return false
      }
      if (this.computerNum < 1) {
        this.$message.warning('请添加计算机数量')
        return false
      }
      return true
    },
    // 提交 添加计算机到交付组
    sendInfoToDelivery () {
      if (!this.validateSendInfoToDelivery()) return Promise.reject(Error('no pass validate'))
      return Api.put('addComputerToDelivery', {
        provider_id: this.activeDelivery.provider_id,
        desktop_group_uid: this.activeDelivery.delivery_group_id,
        catalog_uid: this.findSelectComputer.uid,
        count: this.computerNum
      })
    },
    // -------------emit-------------------
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
    init () {
      this.computerNum = 1
      this.selectComputer = ''
      this.computerList = []
    }
  },
  watch: {
    value (val) {
      if (val) this.getComputerList()
      this.showDesktopDialog = val
    },
    // 如果选中的计算机修改了, 重置computerNum的值
    selectComputer () {
      this.computerNum = 1
    }
  },
  computed: {
    // 选中的row
    findSelectComputer () {
      let selectedComputer = this.computerList.find(computer => computer.uuid === this.selectComputer)
      return selectedComputer
    },
    // UCMP3-5710 交付组添加计算机目录，需要对计算机数量进行校验
    // 根据选中的computer来确定最大值
    selectMax () {
      return this.findSelectComputer ? this.findSelectComputer.availableCount : 1
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
