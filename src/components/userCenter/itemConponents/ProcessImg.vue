<template lang="pug">
    div
        div.adjust-img
            img(:src="trackInfos.imgUrl" @click="showFullScreen = true" v-show="!showFullScreen")
        div.all-screen-img(v-show="showFullScreen" @click="showFullScreen = false")
            img(:src="trackInfos.imgUrl")
</template>
<script>
import Api from '@api'
// 该组件展示流程图和该节点下的责任人列表
export default {
    props: [ 'processInstanceId' ],
    data () {
        return {
            trackInfos: {
                imgUrl: ''
            },
            showFullScreen: false
        }
    },
    created () {
        // 获取流程图
        this.getProcessImg(this.processInstanceId)
    },
    methods: {
        // 获取流程图
        getProcessImg (processInstanceId) {
            Api.get('getProcessImg', { processInstanceId: processInstanceId }, true).then(
                res => {
                    res && res.img && (this.trackInfos.imgUrl = `data:image/png;base64,${res.img}`)
                }
            )
        }
    }
}
</script>
<style lang="scss" scoped>
.adjust-img {
    position: relative;
    display: flex;
    min-height: 300px;
    justify-content: center;
    align-items: center;
    img {
        cursor: pointer;
        max-width: 100%;
    }
}
.all-screen-img {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: 9999;
    img {
        min-width: 30%;
        max-width: 90%;
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
}
</style>
