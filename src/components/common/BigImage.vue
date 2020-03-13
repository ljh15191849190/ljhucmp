<template lang="pug">
    div.big-image(v-if="visible && list.length")
        div.big-image__tool
            span.tool-name {{list[imageIndex].name}}
            span.tool-btn
                el-tooltip(content="放大" placement="bottom")
                    el-button(icon="el-icon-zoom-in" @click="changePicZoom(1.2)")
                el-tooltip(content="减小" placement="bottom")
                    el-button(icon="el-icon-zoom-out" @click="changePicZoom(0.8)")
                el-tooltip(content="还原" placement="bottom")
                    el-button(icon="el-icon-full-screen" @click="changePicZoom(0)")
                el-tooltip(content="下载" placement="bottom")
                    el-button(icon="el-icon-download" @click="downloadPic")
                a.download-icon(ref="aTag" :href="downloadUrl" :download="downloadName" target="_blank")
                el-tooltip(content="关闭" placement="bottom")
                    el-button(icon="el-icon-close" @click="close")
        div.big-image__body(@click="clickWrap")
            el-image(
            :style="imageNodeStyle"
            ref="image"
            :src="list[imageIndex].src"
            fit="contain"
            @load="imgLoaded"
            @error="imgError")

            template(v-if="list.length > 1")
                el-button.big-image__btn.big-image__btn--right(icon="el-icon-arrow-right" type="info" plain @click="changePic(1)")
                el-button.big-image__btn.big-image__btn--left(icon="el-icon-arrow-left" type="info" plain @click="changePic(-1)")
            transition(name="el-fade-in")
                span.zoom-ratio(v-show="showZoom") {{zoomRatioText}}
            span.cp-baseline-extension
</template>

<script>
    import Api from '@api'

    /**
     * 图片预览
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'BigImage',
        props: {
            // 双向绑定的 打开关闭展示
            visible: {
                type: Boolean,
                default: false
            },
            // 图片列表，需传数组，格式{name, src}
            pictures: {
                type: Array,
                default: () => []
            },
            // 默认选中展示的图片Index
            defaultCheckedIndex: {
                type: Number,
                default: 0
            }
        },
        data () {
            return {
                imageNodeSize: {
                    width: 500,
                    height: 300
                },
                list: [],
                imageIndex: 0,
                zoomRatio: 1,
                showZoom: false,
                timer: null,
                downloadUrl: '',
                downloadName: ''
            }
        },
        computed: {
            imageNodeStyle () {
                return {
                    width: (this.imageNodeSize.width * this.zoomRatio).toFixed() + 'px',
                    height: (this.imageNodeSize.height * this.zoomRatio).toFixed() + 'px'
                }
            },

            zoomRatioText () {
                let str = (this.zoomRatio * 100).toFixed() + '%'
                this.flashZoom()

                return str
            }
        },
        methods: {
            init () {
                this.list = this.pictures.map(item => {
                    return {
                        name: item.name || item.url,
                        src: item.url,
                        id: item.id
                    }
                })

                this.downloadName = this.list[this.imageIndex].name
            },

            // 显示缩放比
            flashZoom () {
                this.showZoom = true

                clearTimeout(this.timer)
                this.timer = setTimeout(() => {
                    this.showZoom = false
                }, 1000)
            },

            // 点击空白处关闭
            clickWrap (event) {
                let currentNodeIsWrap = Array.prototype.some.call(event.target.classList, item => item === 'big-image__body')
                if (currentNodeIsWrap) {
                    // 点击的是空白处
                    this.close()
                }
            },
            close () {
                this.$emit('update:visible', false)
            },

            // 图片加载完成， 需处理外部容器的尺寸，来方便居中和放大缩小
            imgLoaded (event) {
                let width, height

                let bodyWrapNode = this.$refs.image.$el.parentNode
                let bodyWrapHeight = bodyWrapNode.offsetHeight
                let bodyWrapWidth = bodyWrapNode.offsetWidth

                let imageHeight = event.path[0].height
                let imageWidth = event.path[0].width

                let heightScale = imageHeight / bodyWrapHeight
                let widthScale = imageWidth / bodyWrapWidth

                // 图片长宽都超过了背景板
                if (imageHeight > bodyWrapHeight && imageWidth > bodyWrapWidth) {
                    // 更宽一些
                    if (heightScale < widthScale) {
                        //
                        height = (imageHeight / widthScale)
                        width = bodyWrapWidth
                    } else {
                        // 更高一些
                        width = (imageWidth / heightScale)
                        height = bodyWrapHeight
                    }
                } else if (imageHeight > bodyWrapHeight) {
                    // 高度超过
                    width = (imageWidth / heightScale)
                    height = bodyWrapHeight
                } else if (imageWidth > bodyWrapWidth) {
                    // 宽度超过
                    height = (imageHeight / widthScale)
                    width = bodyWrapWidth
                } else {
                    // 都未超过，保持原图大小
                    width = imageWidth
                    height = imageHeight
                }

                // 初始化图片尺寸和缩放比例
                this.imageNodeSize = {width, height}
                this.zoomRatio = 1
            },
            imgError () {
                this.imageNodeSize = {
                    width: 500,
                    height: 300
                }
                this.zoomRatio = 1
            },

            // 切换图片
            changePic (step) {
                this.imageIndex = (this.imageIndex + step + this.list.length) % this.list.length
                this.downloadName = this.list[this.imageIndex].name
            },

            // 修改图片大小
            changePicZoom (ratio) {
                if (ratio) {
                    // 增加或者减少
                    this.zoomRatio = Math.round(this.zoomRatio * ratio * 100) / 100
                } else {
                    // 重置
                    this.zoomRatio = 1
                }
            },

            downloadPic () {
                Api.get('attachment', {ucmp_file_id: this.list[this.imageIndex].id}).then(res => {
                    this.downloadUrl = res.url
                    this.$nextTick(() => {
                        this.$refs.aTag.click()
                    })
                })
            }
        },
        created () {
            // 没有watch变化，只初次赋值了图片list，需要重新加载数据组件上使用v-if
            this.init()
        },
        watch: {
            defaultCheckedIndex: {
                immediate: true,
                handler (val) {
                    this.imageIndex = (val < 0 || val >= this.list.length) ? 0 : val
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .big-image {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        overflow: hidden;
        margin: 0;
        z-index: 1000;
        background-color: rgba(51, 51, 51, 0.95);

        .big-image__tool {
            width: 100%;
            height: 50px;
            background-color: rgb(0, 0, 0);
            display: flex;

            .tool-name {
                flex: 1;
                line-height: 50px;
                color: white;
                padding-left: 16px;
                font-size: 16px;
            }

            .el-button {
                height: inherit;
                color: white;
                background-color: inherit;
                border: none;
                font-size: 24px;
                padding-left: 12px;
                padding-right: 12px;
                margin-left: 0;

                &:hover {
                    background-color: #707070;
                }
            }
        }

        .big-image__body {
            position: relative;
            width: 100%;
            height: calc(100% - 50px);
            overflow: auto;
            white-space: nowrap;
            text-align: center;

            .el-image {
                background-color: #f5f7fa;
                vertical-align: middle;
            }
        }

        .zoom-ratio {
            position: absolute;
            top: 50%;
            left: 50%;
            padding: 8px 32px;
            border-radius: 8px;
            font-size: 16px;
            background-color: rgba(38, 38, 38, 0.5);
            color: white;
            transform: translate(-50%, -50%);
        }

        .cp-baseline-extension {
            display: inline-block;
            vertical-align: middle;
            height: 100%;
        }

        .big-image__btn {
            margin-left: 0;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            font-size: 36px;
            height: 150px;
            width: 100px;
            color: #707070;
            background-color: inherit;
            border: none;
        }

        .big-image__btn--right {
            right: 0;
        }

        .big-image__btn--left {
            left: 0;
        }
    }
</style>
