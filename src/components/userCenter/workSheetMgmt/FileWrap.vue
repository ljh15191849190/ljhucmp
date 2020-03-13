<template lang="pug">
    div.image-wrap.border(style="position: relative;" :style="layout")
        el-image.full-container(v-if="isImage" fit="scale-down" :src="realSrc")
        div.other-file.full-container(v-else)
            i.el-icon-document
        div.image-wrap__operator.full-container.d-flex
            div.view(v-if="isImage" @click="view")
                i.icon.el-icon-view
            div.download
                a.download-icon(ref="aTag" :href="downloadUrl" :download="name" target="_blank")
                i.icon.el-icon-download(@click="downloadFile")
</template>

<script>
    import {SUPPORT_IMG} from '@/server/ConstParams'
    import Api from '@api'

    /**
     * 附件 包装层
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'FileWrap',
        props: {
            width: [String, Number],
            height: [String, Number],
            src: {
                type: String,
                default: ''
            },
            id: {
                type: String,
                default: ''
            },
            name: {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                supportImg: SUPPORT_IMG,
                downloadUrl: '',
                realSrc: '' // 真实路径，传入src则是src，传入id则需要通过接口获取
            }
        },
        computed: {
            layout () {
                return {
                    width: (this.width || '200') + 'px',
                    height: (this.width || '150') + 'px'
                }
            },
            isImage () {
                let suffix = this.name.split('.').pop().toString().toLowerCase()
                return this.supportImg.includes(suffix)
            }
        },
        methods: {
            view () {
                this.$emit('view')
            },

            downloadFile () {
                // 未传入id，其他实现方式，需改
                if (!this.id) return
                Api.get('attachment', {ucmp_file_id: this.id}).then(res => {
                    this.downloadUrl = res.url
                    this.$nextTick(() => {
                        this.$refs.aTag.click()
                    })
                })
            }
        },
        created () {
            if (this.src) this.realSrc = this.src
            else {
                Api.get('attachment', {ucmp_file_id: this.id}).then(res => {
                    this.realSrc = res.url
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    .image-wrap {
        position: relative;
        display: inline-block;
    }

    .other-file {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 36px;
    }

    .image-wrap__operator {
        position: absolute;
        top: 0;
        left: 0;

        &:hover {
            background-color: rgba(0, 0, 0, 0.3);
        }

        .view, .download {
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 24px;
            position: relative;
            color: transparent;
            text-align: center;
            cursor: pointer;
            flex: 1;

            .download-icon {
                color: unset;
            }

            &:hover {
                background-color: rgba(0, 0, 0, 0.5);
                color: $themeColor;
            }
        }

    }
</style>