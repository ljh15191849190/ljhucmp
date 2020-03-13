<template lang="pug">
    el-dialog(v-if="propsVisble" title="应用程序设置" :visible.sync="propsVisble" :before-close="close" width="800px")
        div.dialog-content
            div.content
                div.menu-pane
                    div.menu-item-pane
                        div.menu-item(v-for="item in tabItems" :key="item.prop" :class="{'active': item.prop === tabActive}" @click="selectTab(item.prop)") {{item.label}}
                div.form-pane.left-shasow
                    SetupSign(ref="sign" v-show="tabActive === 'sign'" :instance="instance" :application="application")
                    SetupDelivery(ref="delivery" v-show="tabActive === 'delivery'" :instance="instance" :application="application")
                    SetupPosition(ref="position" v-show="tabActive === 'position'" :instance="instance" :application="application")
                    SetupGroup(ref="group" v-show="tabActive === 'group'" :instance="instance" :application="application")
                    SetupVisble(ref="visble" v-show="tabActive === 'visble'" :instance="instance" :application="application")
                    //- component(:is="tabActive" :instance="instance" :ref="tabActive")
        div.dialog-footer(slot="footer")
            el-button(type="primary" @click="save" size="small" v-loading="isLoading") 确定
            el-button(@click="close" size="small") 取消
            el-button(type="primary" @click="apply" size="small") 应用
</template>
<script>
/**
 * 应用程序-属性设置
 */
import axios from 'axios'
import SetupSign from './SetupSign'
import SetupDelivery from './SetupDelivery'
import SetupPosition from './SetupPosition'
import SetupGroup from './SetupGroup'
import SetupVisble from './SetupVisble'

export default {
    name: 'PropsDialog',
    props: {
        propsVisble: {
            type: Boolean,
            default: () => false
        },
        instance: {
            type: Object,
            default: () => {}
        },
        application: {
            type: Object,
            default: () => {}
        }
    },
    data () {
        return {
            isLoading: false,
            tabActive: 'sign',
            tabItems: [
                {prop: 'sign', label: '标识'},
                {prop: 'delivery', label: '交付'},
                {prop: 'position', label: '位置'},
                {prop: 'group', label: '组'},
                {prop: 'visble', label: '限制可见性'}
            ]
        }
    },
    methods: {
        close () {
            this.$emit('closeDialog')
        },
        apply () {
            this.$refs[this.tabActive].apply()
        },
        save () {
            this.isLoading = true
            let validateFlag = false, promises = [], tabItems = this.tabItems
            for (let i = 0; i < tabItems.length; i++) {
                if (!this.$refs[tabItems[i].prop].save()) {
                    this.tabActive = tabItems[i].prop
                    validateFlag = true
                    break
                }

                promises.push(this.$refs[tabItems[i].prop].save())
            }

            if (validateFlag) return 
            
            axios.all(promises).then(axios.spread(res => {
                this.isLoading = false
                this.$emit('saveOk')
            }))
        },
        selectTab (item) {
            this.tabActive = item
        }
    },
    components: {
        SetupSign,
        SetupDelivery,
        SetupPosition,
        SetupGroup,
        SetupVisble
    }
    // components: {
    //     sign: SetupSign,
    //     delivery: SetupDelivery,
    //     position: SetupPosition,
    //     group: SetupGroup,
    //     visble: SetupVisble
    // }
}
</script>

<style lang="scss" scoped>
.content {
    display: flex;
    padding-left: 20px;
    height: 550px;
    .menu-pane {
        width: 165px;
        background-color: #f5f5f5;
        .menu-item-pane {
            margin-top: 50px;
            padding-top: 20px;
            background-color: #ffffff;
            border-bottom: 1px solid $borderBottom;
        }
        .menu-item {
            cursor: pointer;
            position: relative;
            padding-left: 15px;
            height: 30px;
            color: $fontContent;
            font-weight: 600;
            line-height: 30px;
            border-top: 1px solid $borderBottom;
            &.active {
                background-color: $themeColor;
                &:after{
                    content: "";
                    position: absolute;
                    right: -30px;
                    display: inline-block;
                    border-width: 15px;
                    border-style: solid;
                    border-color: transparent;
                    border-left-color: $themeColor;
                }
            }
        }
    }
    .form-pane {
        width: 100%;
        padding: 30px;
        &.left-shasow{
            background: linear-gradient(white, white), radial-gradient(at left, rgba(0, 0, 0, 0.3), transparent 70%);
            background-repeat: no-repeat;
            background-size: 100% 50px, 1% 550px;
        }
    }
}
</style>