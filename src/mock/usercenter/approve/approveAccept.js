export default {
    days: [
        {
            count: 0,
            day: '2018-05-13'
        },
        {
            count: 6,
            day: '2018-05-14'
        },
        {
            count: 4,
            day: '2018-05-15'
        },
        {
            count: 0,
            day: '2018-05-16'
        },
        {
            count: 0,
            day: '2018-05-17'
        },
        {
            count: 0,
            day: '2018-05-18'
        },
        {
            count: 0,
            day: '2018-05-19'
        }
    ],
    detailInfo: {
        createdBy: 'system',
        createdDate: '2018-05-15T09:35:44.000Z',
        lastModifiedBy: 'system',
        lastModifiedDate: '2018-05-15T09:35:44.000Z',
        id: 145,
        orderCode: 'O1526376943859778',
        status: 'approving',
        urgencyLevel: 2,
        orderType: 'create',
        relatedOrderId: null,
        orderMemo: '',
        user: {
            createdBy: 'ucmpadmin',
            createdDate: '2018-05-03T04:04:44.000Z',
            lastModifiedBy: 'system',
            lastModifiedDate: '2018-05-09T09:09:09.000Z',
            id: 2,
            login: 'system',
            thirdPartyLogin: null,
            firstName: null,
            lastName: null,
            name: 'system',
            phoneNumber: null,
            telephoneNumber: null,
            defaultRole: 'sysmanager',
            uuid: '3e01d912d11c428c8af7ed7d7e5cc30f',
            email: 'sd@126.com',
            activated: true,
            failedAuthCount: 0,
            failedAuthAt: null,
            langKey: 'zh-cn',
            resetKey: '19168105531528920339',
            resetDate: '2018-05-03T04:04:44.000Z',
            tenants: null,
            orgs: null,
            preOrgIds: null,
            enableFlag: 'Enabled',
            passwordModifyed: true
        },
        orderMoney: null,
        orderDate: '2018-05-15T09:35:44.000Z',
        app: {
            createdBy: 'ucmpadmin',
            createdDate: '2018-05-03T04:04:13.000Z',
            lastModifiedBy: 'system',
            lastModifiedDate: '2018-05-03T08:27:23.000Z',
            id: 4,
            appName: '测试应用系统demi',
            appVersion: null,
            appDesc: null,
            enableFlag: 'Enabled',
            shortName: 'sdf',
            appType: 'normal',
            tenant: null,
            applicationGrade: 'SLA1',
            orgs: [
                {
                    createdBy: 'ucmpadmin',
                    createdDate: '2018-05-03T04:03:45.000Z',
                    lastModifiedBy: 'ucmpadmin',
                    lastModifiedDate: '2018-05-03T04:03:45.000Z',
                    id: 3,
                    orgName: '测试子组织结构',
                    uuid: null,
                    orgLevel: null,
                    orderNum: null,
                    orgDesc: null,
                    enableFlag: 'Enabled',
                    deleted: null,
                    tenant: {
                        createdBy: 'system',
                        createdDate: '2018-05-03T07:30:41.000Z',
                        lastModifiedBy: 'system',
                        lastModifiedDate: '2018-05-18T06:07:34.000Z',
                        id: 2,
                        tenantName: 'VDC2',
                        tenantCode: 'TE1525332626605449',
                        enableFlag: 'Enabled',
                        tenantDesc: null,
                        providers: null
                    },
                    parent: {
                        createdBy: 'ucmpadmin',
                        createdDate: '2018-05-03T04:03:26.000Z',
                        lastModifiedBy: 'ucmpadmin',
                        lastModifiedDate: '2018-05-03T04:03:26.000Z',
                        id: 1,
                        orgName: '测试组织结构',
                        uuid: null,
                        orgLevel: null,
                        orderNum: null,
                        orgDesc: null,
                        enableFlag: 'Enabled',
                        deleted: null,
                        tenant: null,
                        parent: null
                    }
                }
            ],
            users: null,
            user: null,
            org: null
        },
        enableFlag: 'Enabled',
        orderDetails: null
    },
    detailList: [
        {
            id: 152,
            relatedOrderDetailId: null,
            orderDetailMoney: null,
            items: [
                {
                    key: 'tag',
                    name: '',
                    value:
                        '{"entityId":null,"entityType":"CloudEcs","tags":[]}',
                    display: ''
                },
                {
                    key: 'function',
                    name: '',
                    value: 'createCloudEcs',
                    display: ''
                },
                {
                    key: 'provider',
                    name: '云厂商',
                    value: '76',
                    display: 'Vcenter32'
                },
                {
                    key: 'resourcePool',
                    name: '资源池',
                    value: '2',
                    display: 'Vcenter32资源池专用'
                },
                {
                    key: 'packageIds',
                    name: '',
                    value: '13',
                    display: ''
                },
                {
                    key: 'cpu',
                    name: 'CPU',
                    value: '1',
                    display: '1核'
                },
                {
                    key: 'memory',
                    name: '内存',
                    value: '2048',
                    display: '2GB'
                },
                {
                    key: 'specId',
                    name: '系列',
                    value: '',
                    display: ''
                },
                {
                    key: 'imageId',
                    name: '操作系统',
                    value: '1',
                    display: '220模板'
                },
                {
                    key: 'systemDiskSize',
                    name: '系统盘',
                    value: null,
                    display: 'false'
                },
                {
                    key: 'dataDisk',
                    name: '数据盘',
                    value: '[]',
                    display: ''
                },
                {
                    key: 'floatingIp',
                    name: '绑定外网IP',
                    value: 'true',
                    display: '是'
                },
                {
                    key: 'memo',
                    name: '备注',
                    value: '',
                    display: ''
                },
                {
                    key: 'softwareName',
                    name: '安装软件',
                    value: '无',
                    display: '无'
                },
                {
                    key: 'softwares',
                    name: '',
                    value: '[]',
                    display: ''
                },
                {
                    key: 'login',
                    name: '',
                    value: 'system',
                    display: ''
                },
                {
                    key: 'osType',
                    name: '',
                    value: 'CentOS',
                    display: ''
                },
                {
                    key: 'serviceName',
                    name: '云主机名称',
                    value: 'dadd',
                    display: 'dadd'
                },
                {
                    key: 'tenancyPeriod',
                    name: '租期',
                    value: '{"period":1,"timeUnit":"year"}',
                    display: '1年'
                },
                {
                    key: 'networks',
                    name: '网络信息',
                    value:
                        '[{"network_id":"dvportgroup-420","ip_type":"pool","ip_pool":"ff808081632419230163247639af0101"}]',
                    display:
                        '[{"network_id":"dvportgroup-420","ip_type":"pool","ip_pool":"ff808081632419230163247639af0101"}]'
                },
                {
                    key: 'password',
                    name: '登陆密码',
                    value: null,
                    display: '********'
                },
                {
                    key: 'hostname',
                    name: '主机名称',
                    value: 'sdf-system-sde',
                    display: 'sdf-system-sde'
                }
            ],
            effectiveDate: null,
            endDate: null,
            unitPrice: null,
            num: 1,
            status: null,
            prepaidDay: null,
            orderId: 145,
            serviceDefineId: 1,
            serviceDefineCode: 'cloud_ecs',
            serviceDefineName: '云主机',
            instanceSpecId: '5afaa9efc2dc54857209e0cc',
            deliverType: 'adjustconfig',
            instanceSpec: '5afaa9efc2dc54857209e0cc',
            serviceDefine: {
                createdBy: 'admin',
                createdDate: '2016-07-11T18:52:49.000Z',
                lastModifiedBy: 'system',
                lastModifiedDate: '2018-05-17T05:47:45.000Z',
                id: 1,
                serviceName: '云主机',
                serviceCode: 'cloud_ecs',
                cloudType: 'IaaS',
                serviceDesc: '云主机',
                orderNum: 10,
                deliverType: '{"create":"adjustconfig"}',
                serviceDefineImage: null,
                serviceType: {
                    createdBy: 'admin',
                    createdDate: '2016-06-16T05:08:13.000Z',
                    lastModifiedBy: 'admin',
                    lastModifiedDate: '2016-06-16T05:08:13.000Z',
                    id: 1,
                    typeCode: 'compute',
                    typeName: '计算服务',
                    typeDesc: '计算服务'
                },
                resourceRelegation: 'system',
                displayFlag: 'display',
                bpmCode:
                    '{"modify":"cloud-resource-application","create":"datasource-resource-application"}',
                bpmRejectCode: '{"create":"package"}',
                enableFlag: 'Enabled',
                publishedStatus: 'published',
                apps: null,
                bluePrintDefines: null
            },
            enableFlag: 'Enabled',
            createdBy: 'system',
            createdDate: '2018-05-15T09:35:44.000Z',
            lastModifiedBy: 'system',
            lastModifiedDate: '2018-05-15T09:35:44.000Z',
            isAssigned: true
        }
    ],
    transactorList: [
        {
            id: 1,
            login: 'ucmpadmin',
            thirdPartyLogin: '',
            firstName: 'Administrator',
            lastName: 'Administrator',
            name: 'Admin',
            telephoneNumber: '',
            phoneNumber: '',
            email: 'admin@163.com',
            activated: true,
            langKey: 'zh-cn',
            authorities: null,
            authoritieCns: null,
            uuid: null,
            defaultRole: 'admin',
            org: null
        },
        {
            id: 2,
            login: 'system',
            thirdPartyLogin: null,
            firstName: null,
            lastName: null,
            name: 'system',
            telephoneNumber: null,
            phoneNumber: null,
            email: 'sd@126.com',
            activated: true,
            langKey: 'zh-cn',
            authorities: null,
            authoritieCns: null,
            uuid: '3e01d912d11c428c8af7ed7d7e5cc30f',
            defaultRole: 'sysmanager',
            org: null
        },
        {
            id: 6,
            login: 'demi',
            thirdPartyLogin: null,
            firstName: null,
            lastName: null,
            name: 'demi',
            telephoneNumber: null,
            phoneNumber: null,
            email: 'demi@126.com',
            activated: true,
            langKey: 'zh-cn',
            authorities: null,
            authoritieCns: null,
            uuid: '2ab772c24d474cd488732291354dc0ff',
            defaultRole: 'sysmanager',
            org: null
        },
        {
            id: 7,
            login: 'tester1',
            thirdPartyLogin: null,
            firstName: null,
            lastName: null,
            name: '测试',
            telephoneNumber: null,
            phoneNumber: null,
            email: '12345@126.com',
            activated: true,
            langKey: 'zh-cn',
            authorities: null,
            authoritieCns: null,
            uuid: '454a9b0e50a64b84a9f7bc90ed8aa6fb',
            defaultRole: 'sysmanager',
            org: null
        }
    ],
    recordList: [
        {
            node: '云平台管理员审批',
            userName: 'system',
            createTime: '2018-05-04 13:33',
            operation: '退回',
            opinion: '',
            user: {
                id: 2,
                login: 'system',
                thirdPartyLogin: null,
                firstName: null,
                lastName: null,
                name: 'system',
                telephoneNumber: null,
                phoneNumber: null,
                email: 'sd@126.com',
                activated: true,
                langKey: 'zh-cn',
                authorities: null,
                authoritieCns: null,
                uuid: '3e01d912d11c428c8af7ed7d7e5cc30f',
                defaultRole: 'sysmanager',
                org: null
            }
        },
        {
            node: '调整申请',
            userName: 'dtest',
            createTime: '2018-05-04 13:33',
            operation: '重新申请',
            opinion: '',
            user: {
                id: 4,
                login: 'dtest',
                thirdPartyLogin: null,
                firstName: null,
                lastName: null,
                name: '应用系统管理员',
                telephoneNumber: null,
                phoneNumber: null,
                email: '44405@qq.com',
                activated: true,
                langKey: 'zh-cn',
                authorities: null,
                authoritieCns: null,
                uuid: '2a3e9b6d01ea4559a65968a80789f5e2',
                defaultRole: 'user',
                org: null
            }
        }
    ]
}
