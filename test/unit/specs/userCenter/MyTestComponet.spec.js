import Vue from 'vue'
import MyTestComponet from '@/components/MyTestComponet'

// 挂载元素并返回已渲染的文本的工具函数
function getRenderedText (Component, propsData) {
    const Constructor = Vue.extend(Component)
    const vm = new Constructor({ propsData: propsData }).$mount()
    return vm.$el.textContent
}

describe('MyTestComponet.vue', () => {
    // 测试有入参的组件
    it('renders correctly with different props', () => {
        expect(getRenderedText(MyTestComponet, {
          msg: 'Hello'
        })).to.equal('Hello')
    
        expect(getRenderedText(MyTestComponet, {
          msg: 'Bye'
        })).to.equal('Bye')
    })

    // 测试有异步操作的组件
    it('updates the rendered message when vm.message updates', done => {
        const vm = new Vue(MyTestComponet).$mount()
        vm.msg = 'foo'
        
        // 在状态改变后和断言 DOM 更新前等待一刻
        Vue.nextTick(() => {
            done()
            expect(vm.$el.querySelector('.msg').textContent)
            .to.equal('foo')
        })
    })
})