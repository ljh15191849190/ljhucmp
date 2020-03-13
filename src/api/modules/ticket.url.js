import {UCMP_ROOT, STATS_ROOT} from './root.url'

export default {
    ticket: UCMP_ROOT + '/tickets/:id', // 工单
    ticketReply: UCMP_ROOT + '/ticket/:id/reply', // 工单回复
    ticketStaticStatus: STATS_ROOT + '/user_ticket/status-count', // 工单总览-统计
    ticketStaticCount: STATS_ROOT + '/user_ticket/count', // 工单总览-我的
    ticketGroupCount: UCMP_ROOT + '/tickets/count/:type',
    ticketAction: UCMP_ROOT + '/tickets/handle/:id/:action', // 工单操作
    ticketDownload: UCMP_ROOT + '/tickets/resource/attach/:id', // 工单附件下载
    attachment: UCMP_ROOT + '/attachment' // 获取附件url 或者 上传附件
}
