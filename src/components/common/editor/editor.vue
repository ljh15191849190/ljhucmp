<template lang="pug">
    article
        section(ref="editor", style="height: 200px")
</template>

<script>
import Editor from 'wangeditor'
export default {
    name: 'editor',
    props: ['content'], 
    data () {
        return {
            editorDom: ''
        }
    },
    mounted () {
        this.editorDom = new Editor(this.$refs.editor)
        this.editorDom.customConfig.menus = []
        this.editorDom.customConfig.onchangeTimeout = 60
        this.editorDom.customConfig.onchange = (html) => {
            // 设置富文本编辑器的值
            this.editorDom.txt.html(html)
            this.$emit('update:content', html)
        }
        this.editorDom.create()
        // 只设置一次
        this.editorDom.txt.html(this.content)
    }
}
</script>

<style lang="scss">

</style>


