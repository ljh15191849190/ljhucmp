<template lang="pug">
    span {{passwordItem.isShowPassWord ? passwordItem.value || passwordItem.label : passwordItem.hiddenPass}}
        span.password-icon(:class="{ 'ucmp-icon-password-hidden': passwordItem.isShowPassWord, 'ucmp-icon-password-view': !passwordItem.isShowPassWord}" @click="handleShowHidPass(passwordItem)")
</template>
<script>
/**
 * 密码显示-隐藏控件
 */
export default {
    name: 'PassWordPanel',
    props: {
        displayItem: {
            type: Object,
            default: () => {},
            required: true
        }
    },
    data () {
        return {
            passwordItem: {}
        }
    },
    created () {
        this.passwordItem = JSON.parse(JSON.stringify(this.displayItem))
    },
    methods: {
        handleShowHidPass (content) {
            content.isShowPassWord = !content.isShowPassWord
        }
    }
}
</script>
