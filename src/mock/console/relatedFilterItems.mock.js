/**
 * @description related_service 过滤项
 */
export default {
    tag: [
        {
            type: 'select',
            label: '标签所属类型',
            key: 'service_code',
            default_options: [] // 需从元数据拿
        },
        {
            type: 'select',
            label: '标签类型',
            key: 'tag_type',
            default_options: [] // 需从元数据拿
        },
        {
            type: 'string',
            label: '标签名称',
            key: 'tag_name'
        }
    ]
}
