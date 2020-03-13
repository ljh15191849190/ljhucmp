
//全局参数
import GlobalParam from '@/components/system/globalParam/GlobalParam'
//操作日志
import OprLog from '@/components/system/OprLog'
//通知公告
import AnnouncementList from '@/components/system/announcement/AnnouncementList'
//公告修改
import EditAnnouncement from '@/components/system/announcement/EditAnnouncement'

export default [
    {
        authority: {
            license: ['forbid']
        },
        path: '/global-param',
        name: 'globalParam',
        component: GlobalParam
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/operlog',
        name: 'oprLog',
        component: OprLog
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/announcement',
        name: 'announcementList',
        component: AnnouncementList
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/edit-announcement/:id',
        name: 'editAnnouncement',
        component: EditAnnouncement
    }
]
