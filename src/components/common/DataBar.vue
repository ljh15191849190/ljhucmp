<template lang="pug">
    div.data-bar
        span.active {{activeText}}
        span {{invalidText}}

</template>
<script>
export default {
    props: {
        activeText: {
            type: [String, Number],
            default: '0'
        },
        invalidText: {
            type: [String, Number],
            default: '0'
        }
    },
    data () {
        return {}
    },
    computed: {

    }
}
</script>
<style lang="scss" scoped>
    .data-bar {
        width: 90%;
        height: 18px;
        line-height: 18px;
        border-radius: 10px;
        background-color: #EBEEF5;
        text-align: center;
        span {
            display: inline-block;
            height: 18px;
            line-height: 18px;
            border-radius: 10px;
            width: 45%;
        }
    }
    .active{
        float: left;
        background-color: rgb(97, 195, 89);
        color: #333;
    }
</style>

