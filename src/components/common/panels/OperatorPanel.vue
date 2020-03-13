<template lang="pug">
  el-row.flex
    template(v-if="btnServiceCode")
        el-tooltip( v-btn-privilege="btnServiceCode+'_'+btn.name" v-for="(btn, index) in basicBtns" :key="index" :content="toolTipContent(btn)" placement="bottom")
            div.operator-btn-container
                el-button.circle-btn.ucmp-service-action(circle v-if="btn.icon" plain :type="btn.type" :icon="btn.icon" size="mini" :disabled="checkBtnDisabled(btn)" @click="operationClick(btn)")
                el-button.circle-btn.ucmp-service-action(v-else plain type="text" :icon="btn.icon" size="mini" :disabled="checkBtnDisabled(btn)" @click="operationClick(btn)")  {{btn.label}}
    template(v-else )
        el-tooltip(v-for="(btn, index) in basicBtns" :key="index" :content="toolTipContent(btn)" placement="bottom")
            div.operator-btn-container
                el-button.circle-btn.ucmp-service-action(circle v-if="btn.icon" plain :type="btn.type" :icon="btn.icon" size="mini" :disabled="checkBtnDisabled(btn)" @click="operationClick(btn)")
                el-button.circle-btn.ucmp-service-action(v-else plain type="text" :icon="btn.icon" size="mini" :disabled="checkBtnDisabled(btn)" @click="operationClick(btn)")  {{btn.label}}
    el-dropdown.margin-left(@command="operationClick" v-if="advancedBtns && advancedBtns.length")
        el-tooltip(content="更多设置" placement="right")
            span
                el-button.more-btn.ucmp-service-action(size="mini" icon="ucmp-icon-more-btn" circle)
        el-dropdown-menu(slot="dropdown")
            template(v-if="btnServiceCode")
                div.position-relative(v-btn-privilege="btnServiceCode+'_'+btn.name" v-for="(btn, index) in advancedBtns" v-if="btn.enabled")
                    el-tooltip.drop-down-tooltip(v-if="checkBtnDisabled(btn)" :content="toolTipContent(btn)" placement="right")
                        span {{btn.label}}
                    el-dropdown-item(:key="index" :disabled="checkBtnDisabled(btn)" :command="btn")
                        span {{btn.label}}
            template(v-else)
                div.position-relative(v-for="(btn, index) in advancedBtns" v-if="btn.enabled")
                    el-tooltip.drop-down-tooltip(v-if="checkBtnDisabled(btn)" :content="toolTipContent(btn)" placement="right")
                        span {{btn.label}}
                    el-dropdown-item(:key="index" :disabled="checkBtnDisabled(btn)" :command="btn")
                        span {{btn.label}}
    slot(name="otherPanels")
</template>
<script>
    import {mapGetters} from 'vuex'
/**
 * @description 云主机操作面板 云主机列表/明细页面使用
 */

export default {
  props: ['basicBtns', 'advancedBtns', 'instances', 'serviceCode', 'btnServiceCode'],
  data () {
    return {
      showInstanceCfgForm: false
    }
  },
  methods: {
    operationClick (btn) {
        this.$emit('operationClick', btn, true)
    },

    /**
     * @description UCMP3-1370 操作按钮 tooltip显示内容 1. 非禁用，显示按钮名称；2. 禁用显示禁用条件提示
     */
    toolTipContent (btn) {
        let disabled = this.checkBtnDisabled(btn)
        let btnName = btn.label

        // nasAutoAttach和action元数据的构建都是异步且多个入口，不影响的前提下放在展示处做处理
        if (this.serviceCode === 'nas' && !this.nasAutoAttach) {
            if (btn.name === 'attach')
                btnName = '关联'
            else if (btn.name === 'detach')
                btnName = '取消关联'
        }

        if (!disabled || !btn.disabled_description)
            return btnName
        else return btnName + ':' + btn.disabled_description
    },
    // 检查按钮的置灰情况
    checkBtnDisabled (btn) {
        // 选中的实例存在且数量>0才可根据后续条件判断禁用
        if (!this.instances || !this.instances.length) return true
        // 选中的实例数量大于按钮要求的数量，禁用该按钮
        if (btn.instance_max_count && this.instances && this.instances.length > btn.instance_max_count)
            return true
        if (btn.instance_min_count && this.instances && this.instances.length < btn.instance_min_count)
            return true

        // nas特殊处理
        // 选中的nas中有存量资源时候禁止进行挂载和卸载操作
        // UCMP3-4349 前端把存量资源的nas卸载挂载放开、只放开已存量分配的资源
        // 具体是否已分配由owner字段控制，java配置在元数据
        // if (this.serviceCode === 'nas' && (btn.name === 'attach' || btn.name === 'detach') && this.nasHasStockResource)
        //     return true
        // 按钮没有禁用条件，可直接使用该按钮
        if (!btn.disabled_rules || !btn.disabled_rules.length)
            return false
        // 根据按钮定义的规则和选中行的数据校验当前按钮是否应该被禁用
        let rst = false
        for (let i = 0; i < this.instances.length; i++) {
            rst = this.checkOneInstance(btn, this.instances[i])
            if (rst) return true
        }
        return rst
    },
    // 检查选中的单个实例对按钮的置灰情况
    checkOneInstance (btn, instance) {
        // 禁用的条件不存在或者长度为0，默认允许使用
        if (!btn.disabled_rules || !btn.disabled_rules.length)
            return false

        // 比对当前选中行内容是否对该按钮禁用条件生效
        for (let rule_index = 0; rule_index < btn.disabled_rules.length; rule_index++) {
            for (let value_index = 0; value_index < btn.disabled_rules[rule_index].value.length; value_index++) {
                // 如果条件值为 Boolean 类型
                if (typeof btn.disabled_rules[rule_index].value[value_index] === 'boolean') {
                    let transform = instance[btn.disabled_rules[rule_index].key] ? true : false

                    // UCMP3-4214 检测出禁用的条件，跳出循环；否则继续判断下一条件
                    if (transform === btn.disabled_rules[rule_index].value[value_index])
                        return true
                }

                // UCMP3-4920【控制台】云应用列表中，选择一个应用（无状态），点击注销，接口报错
                // disabled_rules建立在有值的前提下。值是无效的情况下也应该禁用
                if (!instance[btn.disabled_rules[rule_index].key] || btn.disabled_rules[rule_index].value[value_index] === instance[btn.disabled_rules[rule_index].key])
                    return true
            }
        }

        return false
    }
  },
  computed: {
      nasHasStockResource () {
          if (this.serviceCode === 'nas' && Array.isArray(this.instances))
              return !!(this.instances.find(item => item.stock_resource))
          else
            return false
      },

      ...mapGetters([
          'nasAutoAttach'
      ])
  }
}
</script>
<style lang="scss" scoped>
.drop-down-tooltip {
    pointer-events: auto;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    color: transparent;
}
</style>
