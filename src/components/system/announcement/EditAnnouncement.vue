<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            el-form(v-model="announcementForm" size="small" label-width="150px")
                el-form-item.is-required(label="标题" prop="announcementForm.title")
                    el-input(v-model="announcementForm.title")

                el-form-item.is-required(label="内容" prop="announcementForm.content")
                    el-input(type="textarea" v-model="announcementForm.content")

                el-form-item(label="立即启用")
                    el-switch(v-model="announcementForm.onlineFlag === 'ON'" active-color="#13ce66" inactive-color="#ff4949")
                el-form-item(label="首页显示")
                    el-switch(v-model="announcementForm.focusFlag === 'ON'" active-color="#13ce66" inactive-color="#ff4949")

                el-form-item
                    el-button(type="primary" @click="onSubmit") 保存
</template>

<script>
    export default {
        name: 'EditAnnouncement',
        data () {
            return {
                announcementForm: {}
            }
        },
        computed: {
            isAddPage () {
                return this.$route.params.id === 'add'
            },
            breadcrumbItems () {
                return [
                    {prop: '/announcement', label: '通知公告'},
                    {prop: '', label: (this.isAddPage ? '新增' : '修改') + '公告'}
                ]
            }
        },
        methods: {
            onSubmit () {
            }
        },
        created () {
            const tempObj = {
                'id': 1,
                'title': 'test',
                'content': 'test content',
                'publishDate': '2018-05-18T02:48:06.000Z',
                'onlineFlag': 'ON',
                'focusFlag': 'ON',
                'enableFlag': 'Enabled',
                'createdBy': 'system',
                'createdDate': '2018-05-18T02:48:09.000Z',
                'lastModifiedBy': 'system',
                'lastModifiedDate': '2018-05-18T02:49:09.000Z'
            }

            if (!this.isAddPage)
                this.announcementForm = tempObj
        }
    }
</script>

<style lang="scss" scoped>

</style>