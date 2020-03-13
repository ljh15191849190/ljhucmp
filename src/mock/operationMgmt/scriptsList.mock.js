export default {
    rst: 'ok',
    data: {
        fileList: [
            {
                id: 'faf88ff8a03511e888bf005056a3edbd',
                name: 'test2',
                type: 'python',
                nodeId: 'root',
                createDate: 1534301433,
                updateDate: 1534301477,
                tags: [{ id: 1, name: '11' }],
                versions: [
                    {
                        name: '1.0.0',
                        gitPath: 'test2.py',
                        gitOid: 'd6c9b38dc7ba184403e69add7c1f4b8bb452a2a8',
                        gitRepo: 'git@192.168.3.124:root/atomflow.git',
                        gitCommit: '1d7f38431ce183e71f1e0c3498e005ee03716f55',
                        downloadUrl:
                            'http://192.168.3.124/root/atomflow/raw/1d7f38431ce183e71f1e0c3498e005ee03716f55/script/test2.py',
                        params: [
                            {
                                key: 'instance_name',
                                type: 'string',
                                label: '实例名称1',
                                default: 'dsssssss',
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '50',
                                    min: '1',
                                    reg: '/^[\\w\\-一-龥]{1,23}$/',
                                    err_msg:
                                        '实例名称名称必填，且可以为英文大小写字符、数字、-、_以及中文字符，最多不能超过23个字符'
                                },
                                description: '名称',
                                disabled: false
                            },
                            {
                                key: 'charset',
                                enum: [
                                    {
                                        id: 'zhs16gbk',
                                        name: 'ZHS16GBK'
                                    },
                                    {
                                        id: 'utf-8',
                                        name: 'UTF-8'
                                    }
                                ],
                                type: 'select',
                                default: 'zhs16gbk',
                                label: '数据库字符集',
                                required: true,
                                description: '数据库字符集'
                            },
                            {
                                key: 'inter_charset',
                                enum: [
                                    {
                                        id: 'zhs16gbk',
                                        name: 'ZHS16GBK'
                                    },
                                    {
                                        id: 'utf-8',
                                        name: 'UTF-8'
                                    }
                                ],
                                default: 'zhs16gbk',
                                type: 'select',
                                label: '国际字符集',
                                required: true,
                                description: '国际字符集'
                            },

                            {
                                key: 'processes_number',
                                type: 'int',
                                label: '进程数',
                                default: 200,
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '1000',
                                    min: '100'
                                },
                                description: '进程数',
                                disabled: false
                            },
                            {
                                key: 'tablespace',
                                type: 'combinedItem',
                                label: '表空间',
                                required: true,
                                description: '表空间',
                                default: [],
                                children: [
                                    {
                                        key: 'app',
                                        type: 'string',
                                        label: '应用表空间名称',
                                        default: '',
                                        multiple: false,
                                        required: true,
                                        validation: {
                                            max: '50',
                                            min: '1'
                                        },
                                        description: '名称',
                                        disabled: false
                                    },
                                    {
                                        key: 'appsize',
                                        type: 'int',
                                        label: '应用表空间大小(M)',
                                        default: 500,
                                        multiple: false,
                                        required: true,
                                        validation: {
                                            max: '1000',
                                            min: '1'
                                        },
                                        description: '名称',
                                        disabled: false
                                    }
                                ],
                                validation: {
                                    max: 20,
                                    min: 1
                                },
                                object_type: true
                            },
                            {
                                key: 'port',
                                type: 'int',
                                label: '监听端口号',
                                default: 1521,
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '1000',
                                    min: '100'
                                },
                                description: '监听端口号',
                                disabled: false
                            },
                            {
                                key: 'log_groups',
                                type: 'int',
                                label: '日志文件组数',
                                default: 6,
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '1000',
                                    min: '1'
                                },
                                description: '日志文件组数',
                                disabled: false
                            },
                            {
                                key: 'log_size',
                                type: 'int',
                                label: '每个日志文件大小(M)',
                                default: 500,
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '5000',
                                    min: '1'
                                },
                                description: '每个日志文件大小(M)',
                                disabled: false
                            },
                            {
                                key: 'system_table_space_size',
                                type: 'int',
                                label: 'SYSTEM表空间大小(M)',
                                default: 2000,
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '5000',
                                    min: '1'
                                },
                                description: 'SYSTEM表空间大小(M)',
                                disabled: false
                            },
                            {
                                key: 'sysaux_table_space_size',
                                type: 'int',
                                label: 'SYSAUX表空间大小(M)',
                                default: 15000,
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '5000',
                                    min: '1'
                                },
                                description: 'SYSAUX表空间大小(M)',
                                disabled: false
                            },
                            {
                                key: 'temp_table_space_size',
                                type: 'int',
                                label: 'TEMP表空间大小(M)',
                                default: 10000,
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '100000',
                                    min: '1'
                                },
                                description: 'TEMP表空间大小(M)',
                                disabled: false
                            },
                            {
                                key: 'undo_table_space_size',
                                type: 'int',
                                label: 'UNDO表空间大小(M)',
                                default: 10000,
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '100000',
                                    min: '1'
                                },
                                description: 'UNDO表空间大小(M)',
                                disabled: false
                            },
                            {
                                key: 'pga_size',
                                type: 'int',
                                label: 'PGA大小(M)',
                                default: 500,
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '5000',
                                    min: '1'
                                },
                                description: 'PGA大小(M)',
                                disabled: false
                            },
                            {
                                key: 'sga_size',
                                type: 'int',
                                label: 'SGA大小(M)',
                                default: 1024,
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '5000',
                                    min: '1'
                                },
                                description: 'SGA大小(M)',
                                disabled: false
                            },
                            {
                                key: 'data_file_url',
                                type: 'string',
                                label: '数据文件目录(外挂NAS)',
                                default: '/oradata',
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '1000',
                                    min: '1'
                                },
                                description: '数据文件目录(外挂NAS)',
                                disabled: true
                            },
                            {
                                key: 'index_url',
                                type: 'string',
                                label: '归档目录(外挂NAS)',
                                default: '/oraarch',
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '1000',
                                    min: '1'
                                },
                                description: '归档目录(外挂NAS)',
                                disabled: true
                            }
                        ],
                        createDate: 1534301433,
                        updateDate: 1534301433,
                        rstCode: [{ code: '0', desc: '\u6210\u529f' }]
                    },
                    {
                        name: '1.2.0',
                        gitPath: 'test2.py',
                        gitOid: '6f6316c83da1ff7f84045a29e9eb4e27b4f0ad6a',
                        gitRepo: 'git@192.168.3.124:root/atomflow.git',
                        gitCommit: '2a02a9c90d83eebcb64936efa1506898ff1c9c20',
                        downloadUrl:
                            'http://192.168.3.124/root/atomflow/raw/2a02a9c90d83eebcb64936efa1506898ff1c9c20/script/test2.py',
                        params: [
                            {
                                key: 'instance_name',
                                type: 'string',
                                label: '实例名称2',
                                default: '',
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '50',
                                    min: '1',
                                    reg: '/^[\\w\\-一-龥]{1,23}$/',
                                    err_msg:
                                        '实例名称名称必填，且可以为英文大小写字符、数字、-、_以及中文字符，最多不能超过23个字符'
                                },
                                description: '名称',
                                disabled: false
                            },
                            {
                                key: 'charset',
                                enum: [
                                    {
                                        id: 'zhs16gbk',
                                        name: 'ZHS16GBK'
                                    },
                                    {
                                        id: 'utf-8',
                                        name: 'UTF-8'
                                    }
                                ],
                                default: 'zhs16gbk',
                                type: 'select',
                                label: '数据库字符集',
                                required: true,
                                description: '数据库字符集'
                            },
                            {
                                key: 'inter_charset',
                                enum: [
                                    {
                                        id: 'zhs16gbk',
                                        name: 'ZHS16GBK'
                                    },
                                    {
                                        id: 'utf-8',
                                        name: 'UTF-8'
                                    }
                                ],
                                default: 'zhs16gbk',
                                type: 'string',
                                label: '国际字符集',
                                required: true,
                                description: '国际字符集'
                            },

                            {
                                key: 'processes_number',
                                type: 'int',
                                label: '进程数',
                                default: 200,
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '1000',
                                    min: '100'
                                },
                                description: '进程数',
                                disabled: false
                            },
                            {
                                key: 'tablespace',
                                type: 'combinedItem',
                                label: '表空间',
                                required: true,
                                default: [],
                                description: '表空间',
                                children: [
                                    {
                                        key: 'app',
                                        type: 'string',
                                        label: '应用表空间名称',
                                        default: '',
                                        multiple: false,
                                        required: true,
                                        validation: {
                                            max: '50',
                                            min: '1'
                                        },
                                        description: '名称',
                                        disabled: false
                                    },
                                    {
                                        key: 'appsize',
                                        type: 'int',
                                        label: '应用表空间大小(M)',
                                        default: 500,
                                        multiple: false,
                                        required: true,
                                        validation: {
                                            max: '1000',
                                            min: '1'
                                        },
                                        description: '名称',
                                        disabled: false
                                    }
                                ],
                                validation: {
                                    max: 20,
                                    min: 1
                                },
                                object_type: true
                            },
                            {
                                key: 'port',
                                type: 'int',
                                label: '监听端口号',
                                default: 1521,
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '1000',
                                    min: '100'
                                },
                                description: '监听端口号',
                                disabled: false
                            },
                            {
                                key: 'log_groups',
                                type: 'int',
                                label: '日志文件组数',
                                default: 6,
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '1000',
                                    min: '1'
                                },
                                description: '日志文件组数',
                                disabled: false
                            },
                            {
                                key: 'log_size',
                                type: 'int',
                                label: '每个日志文件大小(M)',
                                default: 500,
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '5000',
                                    min: '1'
                                },
                                description: '每个日志文件大小(M)',
                                disabled: false
                            },
                            {
                                key: 'system_table_space_size',
                                type: 'int',
                                label: 'SYSTEM表空间大小(M)',
                                default: 2000,
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '5000',
                                    min: '1'
                                },
                                description: 'SYSTEM表空间大小(M)',
                                disabled: false
                            },
                            {
                                key: 'sysaux_table_space_size',
                                type: 'int',
                                label: 'SYSAUX表空间大小(M)',
                                default: 15000,
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '5000',
                                    min: '1'
                                },
                                description: 'SYSAUX表空间大小(M)',
                                disabled: false
                            },
                            {
                                key: 'temp_table_space_size',
                                type: 'int',
                                label: 'TEMP表空间大小(M)',
                                default: 10000,
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '100000',
                                    min: '1'
                                },
                                description: 'TEMP表空间大小(M)',
                                disabled: false
                            },
                            {
                                key: 'undo_table_space_size',
                                type: 'int',
                                label: 'UNDO表空间大小(M)',
                                default: 10000,
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '100000',
                                    min: '1'
                                },
                                description: 'UNDO表空间大小(M)',
                                disabled: false
                            },
                            {
                                key: 'pga_size',
                                type: 'int',
                                label: 'PGA大小(M)',
                                default: 500,
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '5000',
                                    min: '1'
                                },
                                description: 'PGA大小(M)',
                                disabled: false
                            },
                            {
                                key: 'sga_size',
                                type: 'int',
                                label: 'SGA大小(M)',
                                default: 1024,
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '5000',
                                    min: '1'
                                },
                                description: 'SGA大小(M)',
                                disabled: false
                            },
                            {
                                key: 'data_file_url',
                                type: 'string',
                                label: '数据文件目录(外挂NAS)',
                                default: '/oradata',
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '1000',
                                    min: '1'
                                },
                                description: '数据文件目录(外挂NAS)',
                                disabled: true
                            },
                            {
                                key: 'index_url',
                                type: 'string',
                                label: '归档目录(外挂NAS)',
                                default: '/oraarch',
                                multiple: false,
                                required: true,
                                validation: {
                                    max: '1000',
                                    min: '1'
                                },
                                description: '归档目录(外挂NAS)',
                                disabled: true
                            }
                        ],
                        createDate: 1534301477,
                        updateDate: 1534301477,
                        rstCode: [{ code: '0', desc: '\u6210\u529f' }]
                    }
                ]
            },
            {
                id: 'dd1eaf62a03511e888bf005056a3edbd',
                name: 'test1',
                type: 'python',
                nodeId: 'root',
                createDate: 1534301383,
                updateDate: 1534301383,
                tags: [{ id: 1, name: '11' }],
                versions: [
                    {
                        name: '1.0.0',
                        gitPath: 'test1.py',
                        gitOid: 'd6c9b38dc7ba184403e69add7c1f4b8bb452a2a8',
                        gitRepo: 'git@192.168.3.124:root/atomflow.git',
                        gitCommit: '859649573eef7235ac64b2f960128b5d3e669888',
                        downloadUrl:
                            'http://192.168.3.124/root/atomflow/raw/859649573eef7235ac64b2f960128b5d3e669888/script/test1.py',
                        params: [{ key: 'name', default: 'test' }],
                        createDate: 1534301383,
                        updateDate: 1534301383,
                        rstCode: [{ code: '0', desc: '\u6210\u529f' }]
                    }
                ]
            },
            {
                id: '5440135e9ade11e8b758005056a3edbd',
                name: 'test',
                type: 'python',
                nodeId: 'root',
                createDate: 1533714032,
                updateDate: 1534301216,
                tags: [{ id: 1, name: '11' }],
                versions: [
                    {
                        name: '1.0.0',
                        gitPath: 'test.py',
                        gitOid: 'd6c9b38dc7ba184403e69add7c1f4b8bb452a2a8',
                        gitRepo: 'git@192.168.3.124:root/atomflow.git',
                        gitCommit: '4155d03bbc1362d4158dbaeb22660f429519eae3',
                        downloadUrl:
                            'http://192.168.3.124/root/atomflow/raw/4155d03bbc1362d4158dbaeb22660f429519eae3/script/test.py',
                        params: [{ key: 'name', default: 'test' }],
                        createDate: 1533714032,
                        updateDate: 1533714032,
                        rstCode: [{ code: '0', desc: '\u6210\u529f' }]
                    }
                ]
            }
        ],
        offset: 1,
        limit: 20,
        pageCount: 1
    }
}
