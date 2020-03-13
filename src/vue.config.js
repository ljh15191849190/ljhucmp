/**
 * @description Global config for Vue
 */
import Vue from 'vue'
import ElementUI from 'element-ui'
import Container from '@/components/common/Container'
import TableContainer from '@/components/common/TableContainer'
import FormContainer from '@/components/common/FormContainer'
import IconButton from '@/components/common/IconButton'
import DynamicFormItem from '@/components/common/dynamicForm/DynamicFormItem'
import VeeValidate from 'vee-validate'
import {baseConfig} from './validate/validate.config'
import Validator from './validate/defined.validate.js'
import messages from './validate/zh_CN'
import titleTip from '@/directive/titleTip/titleTip.directive'
import filters from '../src/server/filter'
import loadingDirective from '@/directive/loading/loading.directive'
import { Btnprivilege, Tabactive } from '@leaptocloud/standard-ui'

Vue.config.productionTip = false
// 开启浏览器中的调试工具
// Vue.config.devtools = true
Vue.component('UcmpContainer', Container)
Vue.component('UcmpTableContainer', TableContainer)
Vue.component('UcmpFormContainer', FormContainer)
Vue.component('IconButton', IconButton)
Vue.component('UcmpDynamicFormItem', DynamicFormItem)
Vue.directive('title-tip', titleTip)

// 注入过滤器
Object.keys(filters).forEach(key => {
    Vue.filter(key, filters[key])
})

Vue.use(ElementUI).use(VeeValidate, baseConfig).use(Btnprivilege.directive)
Vue.use(ElementUI).use(Tabactive.directive)
Validator.localize('zh_CN', messages)

Vue.directive('loading', loadingDirective)
Vue.directive('loadmore', {
    bind (el, binding, vnode) {
        const scrollWrap = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap')
        scrollWrap.addEventListener('scroll', function () {
            /*
             * scrollHeight 获取元素内容高度
             * scrollTop 获取或者设置元素的偏移值, 当一个元素的容器没有产生垂直方向的滚动条, 那它的scrollTop的值默认为0.
             * clientHeight 读取元素的可见高度
             * 如果元素滚动到底 ele.scrollHeight - ele.scrollTop === ele.clientHeight
             */
            const condition = this.scrollHeight - this.scrollTop <= this.clientHeight
            if (condition) {
                // directive callback
                binding.value()
            }
        })
    }
})

export default Vue
