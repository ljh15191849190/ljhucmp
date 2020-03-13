/**
 * 添加云厂商时 输入框配置信息
 */
const cloudProvider = {
    // 公有
    // 阿里云
    Aliyun: [
        {
            label: '名称',
            prop: 'name',
            type: 'input',
            placeHolder: '请输入名称'
        },
        {
            label: 'AccessKeyID',
            prop: 'accessKeyID',
            type: 'input',
            placeHolder: ''
        },
        {
            label: 'AccessKeySecret',
            prop: 'accessKeySecret',
            type: 'input',
            placeHolder: ''
        }
    ],
    // Window Azure
    Azure: [
        {
            label: '名称',
            prop: 'name',
            type: 'input',
            placeHolder: '请输入名称'
        },
        {
            label: 'Client',
            prop: 'client',
            type: 'input',
            placeHolder: ''
        },
        {
            label: 'Key',
            prop: 'key',
            type: 'input',
            placeHolder: ''
        },
        {
            label: 'Subscription',
            prop: 'subscription',
            type: 'input',
            placeHolder: ''
        }, {
            label: 'Tenant',
            prop: 'tenant',
            type: 'input',
            placeHolder: ''
        }, {
            label: 'CloudName',
            prop: 'cloudName',
            type: 'input',
            placeHolder: ''
        }
    ],
    // 腾讯云
    QCloud: [
        {
            label: '名称',
            prop: 'name',
            type: 'input',
            placeHolder: '请输入名称'
        },
        {
            label: 'SecretId',
            prop: 'secretId',
            type: 'input',
            placeHolder: ''
        },
        {
            label: 'SecretKey',
            prop: 'secretKey',
            type: 'input',
            placeHolder: ''
        }
    ],
    // 青云
    QingCloud: [
        {
            label: '名称',
            prop: 'name',
            type: 'input',
            placeHolder: '请输入名称'
        },
        {
            label: 'AccessKeyID',
            prop: 'accessKeyID',
            type: 'input',
            placeHolder: ''
        },
        {
            label: 'SecretAccessKey',
            prop: 'secretAccessKey',
            type: 'input',
            placeHolder: ''
        },
        {
            label: 'url',
            prop: 'url',
            type: 'input',
            placeHolder: '请输入访问url  https://api.qingcloud.com'
        },
        {
            label: 'Owner',
            prop: 'owner',
            type: 'input',
            placeHolder: ''
        }
    ],
    //私有
    // Open stack
    OpenStack: [
        {
            label: '名称',
            prop: 'name',
            type: 'input',
            placeHolder: '请输入名称'
        },
        {
            label: '版本',
            prop: 'version',
            type: 'select',
            placeHolder: '请选择版本'
        },
        {
            label: '访问url',
            prop: 'url',
            type: 'input',
            placeHolder: 'http://192.168.126.2:5000/v3/'
        },
        {
            label: '项目',
            prop: 'project',
            type: 'input',
            placeHolder: '请输入项目ID'
        },
        {
            label: '用户名',
            prop: 'userName',
            type: 'input',
            placeHolder: '请输入用户名'
        },
        {
            label: '密码',
            prop: 'userPassword',
            type: 'password',
            placeHolder: '请输入密码'
        },
        {
            label: '代理主机',
            prop: 'proxyHost',
            type: 'input',
            placeHolder: '请输入代理主机',
            optional: true
        },
        {
            label: '代理端口',
            prop: 'proxyPort',
            type: 'input',
            placeHolder: '请输入代理端口',
            optional: true
        },
        {
            label: 'AmazonS3 AccessKey',
            prop: 'accessKey',
            type: 'input',
            placeHolder: '',
            optional: true
        },
        {
            label: 'AmazonS3 SecretKey',
            prop: 'secretKey',
            type: 'input',
            placeHolder: '',
            optional: true
        },
        {
            label: 'AmazonS3 Endpoint',
            prop: 'endpoint',
            type: 'input',
            placeHolder: '',
            optional: true
        }
    ],
    // vm ware
    VMWare: [
        {
            label: '名称',
            prop: 'name',
            type: 'input',
            placeHolder: '请输入名称'
        },
        {
            label: '版本',
            prop: 'version',
            type: 'select',
            placeHolder: '请选择版本'
        },
        {
            label: '访问url',
            prop: 'url',
            type: 'input',
            placeHolder: '请输入访问url：http://192.168.16.32/sdk'
        },
        {
            label: '用户名',
            prop: 'userName',
            type: 'input',
            placeHolder: '请输入用户名'
        },
        {
            label: '密码',
            prop: 'userPassword',
            type: 'password',
            placeHolder: '请输入密码'
        }
    ],
    // Xen server
    XenServer: [
        {
            label: '名称',
            prop: 'name',
            type: 'input',
            placeHolder: '请输入名称'
        },
        {
            label: '访问url',
            prop: 'url',
            type: 'input',
            placeHolder: '请输入访问url：192.168.16.50'
        },
        {
            label: '用户名',
            prop: 'userName',
            type: 'input',
            placeHolder: '请输入用户名'
        },
        {
            label: '密码',
            prop: 'userPassword',
            type: 'password',
            placeHolder: '请输入密码'
        }
    ],
    // Microsoft Hyper-v
    Scvmm: [
        {
            label: '名称',
            prop: 'name',
            type: 'input',
            placeHolder: '请输入名称'
        },
        {
            label: '访问url',
            prop: 'url',
            type: 'input',
            placeHolder: '请输入访问url：192.168.16.194'
        },
        {
            label: '用户名',
            prop: 'userName',
            type: 'input',
            placeHolder: '请输入用户名'
        },
        {
            label: '密码',
            prop: 'userPassword',
            type: 'password',
            placeHolder: '请输入密码'
        }
    ]
}

const comingSoonProviders = [
    {
        code: 'aws',
        name: 'AWS'
    }, {
        code: 'azure',
        name: 'Azure'
    }, {
        code: 'microsoft',
        name: 'microsoft'
    }, {
        code: 'huawei',
        name: '华为云'
    }, {
        code: 'powerVC',
        name: 'PowerVC'
    }, {
        code: 'kubernetes',
        name: 'Kubernetes'
    }, {
        code: 'xen',
        name: 'XenServer'
    }, {
        code: 'systemcenter',
        name: 'SystemCenter'
    }, {
        code: 'vmware-nsx',
        name: 'VMware-NSX'
    }]
export default cloudProvider
export {cloudProvider, comingSoonProviders}
