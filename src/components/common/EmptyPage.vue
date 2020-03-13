<template lang="pug">
    div.empty
        img(:src="imgSrc")
        div.desc-pane
            slot(name="content")
</template>
<script>
export default {
    data () {
        return {}
    },
    computed: {
        imgSrc () {
            if (process.env.NODE_ENV !== 'development')
                return `../../../../static/ucmp-ui/static/images/provides/empty.png`
            return '../../../../static/images/provides/empty.png'
        }
    }
}
</script>
<style lang="scss" scoped>
// 页面数据为空时的样式设置
.empty {
    background-color: #ffffff;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    .desc-pane {
        margin-top: 20px;
        .desc {
            color: $fontTitleLight;
        }
        .add {
            cursor: pointer;
        }
    }
}
</style>

