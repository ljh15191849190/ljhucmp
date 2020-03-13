import Vue from 'vue'
import HelloWorld from '@/components/HelloWorld'

describe('HelloWorld.vue', () => {
    // 测试简单的组件
    const Constructor = Vue.extend(HelloWorld)
    it('should render correct contents', () => {
        const vm = new Constructor().$mount()
        expect(vm.$el.querySelector('.test h1').textContent)
            .to.equal('Welcome to Your Vue.js App')
    })

    it('adds a new item to list on click', () => {
        // build component
        const vm = new Constructor().$mount()
    
        // set input value
        vm.newItem = 'brush my teeth'
    
        // simulate click event
        const button = vm.$el.querySelector('button')
        const clickEvent = new window.Event('click')
        button.dispatchEvent(clickEvent)
        vm._watcher.run()
    
        // assert list contains new item
        expect(vm.$el.textContent).to.contain('brush my teeth')
        expect(vm.listItems).to.contain('brush my teeth')
    })
})