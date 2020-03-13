/* eslint-disable */
export default [
    {
        "name": "云主机",
        "code": "cloud_ecs",
        "type": "iaas",
        "textField": "instance_name",
        "valueField": "instance_id",
        "attribute": [
            {
                "key": "instance_id",
                "label": "ID",
                "description": "名称",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": false,
                "tableColum": false,
                "quota": false,
                "queryCondition": false,
                "validation": {},
                "dataLink": {}
            },
            {
                "key": "instance_name",
                "label": "名称",
                "description": "名称",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": true,
                "validation": {
                    "max": "150",
                    "min": "2",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {}
            },
            {
                "key": "state",
                "label": "状态",
                "description": "状态",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": false,
                "tableColum": true,
                "quota": true,
                "queryCondition": true,
                "validation": {},
                "dataLink": {}
            },
            {
                "key": "cpu",
                "label": "cpu",
                "description": "cpu",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": false,
                "tableColum": true,
                "quota": true,
                "queryCondition": false,
                "validation": {},
                "dataLink": {}
            },
            {
                "key": "memory",
                "label": "内存",
                "description": "内存",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": false,
                "tableColum": true,
                "quota": true,
                "queryCondition": false,
                "validation": {},
                "dataLink": {}
            },
            {
                "key": "flavor",
                "label": "规格",
                "description": "规格",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": true,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "validation": {
                    "max": "",
                    "min": "",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {
                    "endpoint": "service/cloud_ecs/flavors",
                    "method": "GET",
                    "valueFiled": "id",
                    "textFiled": "description"
                }
            },
            {
                "key": "image",
                "label": "操作系统",
                "description": "操作系统",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": true,
                "tableColum": true,
                "quota": false,
                "queryCondition": true,
                "validation": {
                    "max": "",
                    "min": "",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {
                    "endpoint": "service/cloud_ecs/images",
                    "method": "GET",
                    "valueFiled": "id",
                    "textFiled": "description"
                }
            },
            {
                "key": "sys_disk_size",
                "label": "系统盘容量",
                "description": "系统盘容量",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "validation": {
                    "max": "40",
                    "min": "100",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {}
            },
            {
                "key": "provider",
                "label": "云厂商",
                "description": "云厂商",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "dataLink": {
                    "endpoint": "service/cloud_ecs/images",
                    "method": "GET",
                    "valueFiled": "id",
                    "textFiled": "description"
                }
            },
            {
                "key": "resourcePool",
                "label": "资源池",
                "description": "资源池",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "dataLink": {
                    "endpoint": "service/cloud_ecs/images",
                    "method": "GET",
                    "valueFiled": "id",
                    "textFiled": "description"
                }
            },
            {
                "key": "payCount",
                "label": "购买数量",
                "description": "购买数量",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "validation": {
                    "min": "1"
                },
                "dataLink": {}
            }
        ],
        "supportProviders": [
            "vsphere",
            "openstack",
            "aliyun"
        ],
        "description": "可随时按需获取的云虚拟机，提供高效、稳定、可弹性伸缩的计算服务。",
        "relatedService": [
            {
                "code": "cloud_volume",
                "referType": "o:m"
            }
        ],
        "modifiable": true,
        "normalActions": {
            "create": {
                "enabled": true,
                "label": "申请云主机",
                "endpoint": {
                    "url": "service/cloud_ecs",
                    "method": "POST"
                },
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": []
            },
            "delete": {
                "enabled": true,
                "label": "删除",
                "endpoint": {
                    "url": "service/cloud_ecs",
                    "method": "DELETE"
                },
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": []
            },
            "modify": {
                "enabled": true,
                "label": "修改配置",
                "endpoint": {
                    "url": "service/cloud_ecs",
                    "method": "PUT"
                },
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": []
            },
            "sync": {
                "enabled": true,
                "label": "同步",
                "endpoint": {
                    "url": "service/cloud_ecs/sync",
                    "method": "POST"
                },
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": []
            }
        },
        "actions": [
            {
                "name": "start",
                "label": "启动",
                "endpoint": {
                    "url": "service/cloud_ecs/start",
                    "method": "GET"
                },
                "description": "启动云主机",
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": [],
                "multiple": true
            },
            {
                "name": "stop",
                "label": "停止",
                "endpoint": {
                    "url": "service/cloud_ecs/stop",
                    "method": "GET"
                },
                "description": "关闭云主机",
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": [],
                "multiple": true
            }
        ]
    },
    {
        "name": "云硬盘",
        "code": "cloud_volume",
        "textField": "instance_name",
        "valueField": "instance_id",
        "type": "iaas",
        "attribute": [
            {
                "key": "instance_id",
                "label": "名称",
                "description": "名称",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "validation": {},
                "dataLink": {}
            },
            {
                "key": "instance_name",
                "label": "名称",
                "description": "名称",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": true,
                "validation": {
                    "max": "150",
                    "min": "2",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {}
            },
            {
                "key": "cpu",
                "label": "cpu",
                "description": "cpu",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": false,
                "tableColum": true,
                "quota": true,
                "queryCondition": false,
                "validation": {},
                "dataLink": {}
            },
            {
                "key": "memory",
                "label": "内存",
                "description": "内存",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": false,
                "tableColum": true,
                "quota": true,
                "queryCondition": false,
                "validation": {},
                "dataLink": {}
            },
            {
                "key": "flavor",
                "label": "规格",
                "description": "规格",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": true,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "validation": {
                    "max": "",
                    "min": "",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {
                    "endpoint": "service/cloud_ecs/flavors",
                    "method": "GET",
                    "valueFiled": "id",
                    "textFiled": "description"
                }
            },
            {
                "key": "image",
                "label": "操作系统",
                "description": "操作系统",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": true,
                "tableColum": true,
                "quota": false,
                "queryCondition": true,
                "validation": {
                    "max": "",
                    "min": "",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {
                    "endpoint": "service/cloud_ecs/images",
                    "method": "GET",
                    "valueFiled": "id",
                    "textFiled": "description"
                }
            },
            {
                "key": "sys_disk_size",
                "label": "系统盘容量",
                "description": "系统盘容量",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "validation": {
                    "max": "40",
                    "min": "100",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {}
            },
            {
                "key": "provider",
                "label": "云厂商",
                "description": "云厂商",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "dataLink": {}
            },
            {
                "key": "resourcePool",
                "label": "资源池",
                "description": "资源池",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "dataLink": {}
            },
            {
                "key": "payCount",
                "label": "购买数量",
                "description": "购买数量",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "validation": {
                    "min": "1"
                },
                "dataLink": {}
            }
        ],
        "supportProviders": [
            "vsphere",
            "openstack",
            "aliyun"
        ],
        "description": "基于分布式架构，为云主机提供的低时延、持久性、高可靠的数据块级存储。",
        "relatedService": [
            {
                "code": "cloud_volume",
                "referType": "o:m"
            }
        ],
        "modifiable": true,
        "normalActions": {
            "create": {
                "enabled": true,
                "endpoint": {
                    "url": "service/cloud_ecs",
                    "method": "POST"
                },
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": []
            },
            "delete": {
                "enabled": true,
                "endpoint": {
                    "url": "service/cloud_ecs",
                    "method": "DELETE"
                },
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": []
            },
            "modify": {
                "enabled": true,
                "endpoint": {
                    "url": "service/cloud_ecs",
                    "method": "PUT"
                },
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": []
            }
        },
        "actions": [
            {
                "name": "unmount",
                "label": "卸载",
                "endpoint": {
                    "url": "service/cloud_ecs/start",
                    "method": "GET"
                },
                "description": "卸载云硬盘",
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": [],
                "multiple": true
            },
            {
                "name": "mount",
                "label": "挂载",
                "endpoint": {
                    "url": "service/cloud_ecs/stop",
                    "method": "GET"
                },
                "description": "挂载云硬盘",
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": [],
                "multiple": true
            }
        ]
    },
    {
        "name": "物理机",
        "code": "physical_machine",
        "textField": "instance_name",
        "valueField": "instance_id",
        "type": "iaas",
        "attribute": [
            {
                "key": "instance_id",
                "label": "名称",
                "description": "名称",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "validation": {},
                "dataLink": {}
            },
            {
                "key": "instance_name",
                "label": "名称",
                "description": "名称",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": true,
                "validation": {
                    "max": "150",
                    "min": "2",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {}
            },
            {
                "key": "cpu",
                "label": "cpu",
                "description": "cpu",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": false,
                "tableColum": true,
                "quota": true,
                "queryCondition": false,
                "validation": {},
                "dataLink": {}
            },
            {
                "key": "memory",
                "label": "内存",
                "description": "内存",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": false,
                "tableColum": true,
                "quota": true,
                "queryCondition": false,
                "validation": {},
                "dataLink": {}
            },
            {
                "key": "flavor",
                "label": "规格",
                "description": "规格",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": true,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "validation": {
                    "max": "",
                    "min": "",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {
                    "endpoint": "service/cloud_ecs/flavors",
                    "method": "GET",
                    "valueFiled": "id",
                    "textFiled": "description"
                }
            },
            {
                "key": "image",
                "label": "操作系统",
                "description": "操作系统",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": true,
                "tableColum": true,
                "quota": false,
                "queryCondition": true,
                "validation": {
                    "max": "",
                    "min": "",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {
                    "endpoint": "service/cloud_ecs/images",
                    "method": "GET",
                    "valueFiled": "id",
                    "textFiled": "description"
                }
            },
            {
                "key": "sys_disk_size",
                "label": "系统盘容量",
                "description": "系统盘容量",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "validation": {
                    "max": "40",
                    "min": "100",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {}
            }
        ],
        "supportProviders": [
            "vsphere",
            "openstack",
            "aliyun"
        ],
        "description": "基于分布式架构，为云主机提供的低时延、持久性、高可靠的数据块级存储。",
        "relatedService": [
            {
                "code": "cloud_volume",
                "referType": "o:m"
            }
        ],
        "modifiable": true,
        "normalActions": {
            "create": {
                "enabled": true,
                "endpoint": {
                    "url": "service/cloud_ecs",
                    "method": "POST"
                },
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": []
            },
            "delete": {
                "enabled": true,
                "endpoint": {
                    "url": "service/cloud_ecs",
                    "method": "DELETE"
                },
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": []
            },
            "modify": {
                "enabled": true,
                "endpoint": {
                    "url": "service/cloud_ecs",
                    "method": "PUT"
                },
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": []
            }
        },
        "actions": [
            {
                "name": "unmount",
                "label": "卸载",
                "endpoint": {
                    "url": "service/cloud_ecs/start",
                    "method": "GET"
                },
                "description": "卸载云硬盘",
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": [],
                "multiple": true
            },
            {
                "name": "mount",
                "label": "挂载",
                "endpoint": {
                    "url": "service/cloud_ecs/stop",
                    "method": "GET"
                },
                "description": "挂载云硬盘",
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": [],
                "multiple": true
            }
        ]
    },
    {
        "name": "对象存储服务",
        "code": "obj_stroage",
        "textField": "instance_name",
        "valueField": "instance_id",
        "type": "iaas",
        "attribute": [
            {
                "key": "instance_id",
                "label": "名称",
                "description": "名称",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "validation": {},
                "dataLink": {}
            },
            {
                "key": "instance_name",
                "label": "名称",
                "description": "名称",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": true,
                "validation": {
                    "max": "150",
                    "min": "2",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {}
            },
            {
                "key": "cpu",
                "label": "cpu",
                "description": "cpu",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": false,
                "tableColum": true,
                "quota": true,
                "queryCondition": false,
                "validation": {},
                "dataLink": {}
            },
            {
                "key": "memory",
                "label": "内存",
                "description": "内存",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": false,
                "tableColum": true,
                "quota": true,
                "queryCondition": false,
                "validation": {},
                "dataLink": {}
            },
            {
                "key": "flavor",
                "label": "规格",
                "description": "规格",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": true,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "validation": {
                    "max": "",
                    "min": "",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {
                    "endpoint": "service/cloud_ecs/flavors",
                    "method": "GET",
                    "valueFiled": "id",
                    "textFiled": "description"
                }
            },
            {
                "key": "image",
                "label": "操作系统",
                "description": "操作系统",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": true,
                "tableColum": true,
                "quota": false,
                "queryCondition": true,
                "validation": {
                    "max": "",
                    "min": "",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {
                    "endpoint": "service/cloud_ecs/images",
                    "method": "GET",
                    "valueFiled": "id",
                    "textFiled": "description"
                }
            },
            {
                "key": "sys_disk_size",
                "label": "系统盘容量",
                "description": "系统盘容量",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "validation": {
                    "max": "40",
                    "min": "100",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {}
            }
        ],
        "supportProviders": [
            "vsphere",
            "openstack",
            "aliyun"
        ],
        "description": "基于分布式架构，为云主机提供的低时延、持久性、高可靠的数据块级存储。",
        "relatedService": [
            {
                "code": "cloud_volume",
                "referType": "o:m"
            }
        ],
        "modifiable": true,
        "normalActions": {
            "create": {
                "enabled": true,
                "endpoint": {
                    "url": "service/cloud_ecs",
                    "method": "POST"
                },
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": []
            },
            "delete": {
                "enabled": true,
                "endpoint": {
                    "url": "service/cloud_ecs",
                    "method": "DELETE"
                },
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": []
            },
            "modify": {
                "enabled": true,
                "endpoint": {
                    "url": "service/cloud_ecs",
                    "method": "PUT"
                },
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": []
            }
        },
        "actions": [
            {
                "name": "unmount",
                "label": "卸载",
                "endpoint": {
                    "url": "service/cloud_ecs/start",
                    "method": "GET"
                },
                "description": "卸载云硬盘",
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": [],
                "multiple": true
            },
            {
                "name": "mount",
                "label": "挂载",
                "endpoint": {
                    "url": "service/cloud_ecs/stop",
                    "method": "GET"
                },
                "description": "挂载云硬盘",
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": [],
                "multiple": true
            }
        ]
    },
    {
        "name": "弹性伸缩",
        "code": "elastic_stretch",
        "textField": "instance_name",
        "valueField": "instance_id",
        "type": "iaas",
        "attribute": [
            {
                "key": "instance_id",
                "label": "名称",
                "description": "名称",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "validation": {},
                "dataLink": {}
            },
            {
                "key": "instance_name",
                "label": "名称",
                "description": "名称",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": true,
                "validation": {
                    "max": "150",
                    "min": "2",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {}
            },
            {
                "key": "cpu",
                "label": "cpu",
                "description": "cpu",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": false,
                "tableColum": true,
                "quota": true,
                "queryCondition": false,
                "validation": {},
                "dataLink": {}
            },
            {
                "key": "memory",
                "label": "内存",
                "description": "内存",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": false,
                "tableColum": true,
                "quota": true,
                "queryCondition": false,
                "validation": {},
                "dataLink": {}
            },
            {
                "key": "flavor",
                "label": "规格",
                "description": "规格",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": true,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "validation": {
                    "max": "",
                    "min": "",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {
                    "endpoint": "service/cloud_ecs/flavors",
                    "method": "GET",
                    "valueFiled": "id",
                    "textFiled": "description"
                }
            },
            {
                "key": "image",
                "label": "操作系统",
                "description": "操作系统",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": true,
                "tableColum": true,
                "quota": false,
                "queryCondition": true,
                "validation": {
                    "max": "",
                    "min": "",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {
                    "endpoint": "service/cloud_ecs/images",
                    "method": "GET",
                    "valueFiled": "id",
                    "textFiled": "description"
                }
            },
            {
                "key": "sys_disk_size",
                "label": "系统盘容量",
                "description": "系统盘容量",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "validation": {
                    "max": "40",
                    "min": "100",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {}
            }
        ],
        "supportProviders": [
            "vsphere",
            "openstack",
            "aliyun"
        ],
        "description": "基于分布式架构，为云主机提供的低时延、持久性、高可靠的数据块级存储。",
        "relatedService": [
            {
                "code": "cloud_volume",
                "referType": "o:m"
            }
        ],
        "modifiable": true,
        "normalActions": {
            "create": {
                "enabled": true,
                "endpoint": {
                    "url": "service/cloud_ecs",
                    "method": "POST"
                },
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": []
            },
            "delete": {
                "enabled": true,
                "endpoint": {
                    "url": "service/cloud_ecs",
                    "method": "DELETE"
                },
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": []
            },
            "modify": {
                "enabled": true,
                "endpoint": {
                    "url": "service/cloud_ecs",
                    "method": "PUT"
                },
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": []
            }
        },
        "actions": [
            {
                "name": "unmount",
                "label": "卸载",
                "endpoint": {
                    "url": "service/cloud_ecs/start",
                    "method": "GET"
                },
                "description": "卸载云硬盘",
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": [],
                "multiple": true
            },
            {
                "name": "mount",
                "label": "挂载",
                "endpoint": {
                    "url": "service/cloud_ecs/stop",
                    "method": "GET"
                },
                "description": "挂载云硬盘",
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": [],
                "multiple": true
            }
        ]
    },
    {
        "name": "虚拟桌面",
        "code": "virtual_desktop",
        "textField": "instance_name",
        "valueField": "instance_id",
        "type": "iaas",
        "attribute": [
            {
                "key": "instance_id",
                "label": "名称",
                "description": "名称",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "validation": {},
                "dataLink": {}
            },
            {
                "key": "instance_name",
                "label": "名称",
                "description": "名称",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": true,
                "validation": {
                    "max": "150",
                    "min": "2",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {}
            },
            {
                "key": "cpu",
                "label": "cpu",
                "description": "cpu",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": false,
                "tableColum": true,
                "quota": true,
                "queryCondition": false,
                "validation": {},
                "dataLink": {}
            },
            {
                "key": "memory",
                "label": "内存",
                "description": "内存",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": false,
                "tableColum": true,
                "quota": true,
                "queryCondition": false,
                "validation": {},
                "dataLink": {}
            },
            {
                "key": "flavor",
                "label": "规格",
                "description": "规格",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": true,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "validation": {
                    "max": "",
                    "min": "",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {
                    "endpoint": "service/cloud_ecs/flavors",
                    "method": "GET",
                    "valueFiled": "id",
                    "textFiled": "description"
                }
            },
            {
                "key": "image",
                "label": "操作系统",
                "description": "操作系统",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": true,
                "tableColum": true,
                "quota": false,
                "queryCondition": true,
                "validation": {
                    "max": "",
                    "min": "",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {
                    "endpoint": "service/cloud_ecs/images",
                    "method": "GET",
                    "valueFiled": "id",
                    "textFiled": "description"
                }
            },
            {
                "key": "sys_disk_size",
                "label": "系统盘容量",
                "description": "系统盘容量",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "validation": {
                    "max": "40",
                    "min": "100",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {}
            }
        ],
        "supportProviders": [
            "vsphere",
            "openstack",
            "aliyun"
        ],
        "description": "基于分布式架构，为云主机提供的低时延、持久性、高可靠的数据块级存储。",
        "relatedService": [
            {
                "code": "cloud_volume",
                "referType": "o:m"
            }
        ],
        "modifiable": true,
        "normalActions": {
            "create": {
                "enabled": true,
                "endpoint": {
                    "url": "service/cloud_ecs",
                    "method": "POST"
                },
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": []
            },
            "delete": {
                "enabled": true,
                "endpoint": {
                    "url": "service/cloud_ecs",
                    "method": "DELETE"
                },
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": []
            },
            "modify": {
                "enabled": true,
                "endpoint": {
                    "url": "service/cloud_ecs",
                    "method": "PUT"
                },
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": []
            }
        },
        "actions": [
            {
                "name": "unmount",
                "label": "卸载",
                "endpoint": {
                    "url": "service/cloud_ecs/start",
                    "method": "GET"
                },
                "description": "卸载云硬盘",
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": [],
                "multiple": true
            },
            {
                "name": "mount",
                "label": "挂载",
                "endpoint": {
                    "url": "service/cloud_ecs/stop",
                    "method": "GET"
                },
                "description": "挂载云硬盘",
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": [],
                "multiple": true
            }
        ]
    },
    {
        "name": "虚拟应用",
        "code": "virtual_app",
        "textField": "instance_name",
        "valueField": "instance_id",
        "type": "iaas",
        "attribute": [
            {
                "key": "instance_id",
                "label": "名称",
                "description": "名称",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "validation": {},
                "dataLink": {}
            },
            {
                "key": "instance_name",
                "label": "名称",
                "description": "名称",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": true,
                "validation": {
                    "max": "150",
                    "min": "2",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {}
            },
            {
                "key": "cpu",
                "label": "cpu",
                "description": "cpu",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": false,
                "tableColum": true,
                "quota": true,
                "queryCondition": false,
                "validation": {},
                "dataLink": {}
            },
            {
                "key": "memory",
                "label": "内存",
                "description": "内存",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": false,
                "tableColum": true,
                "quota": true,
                "queryCondition": false,
                "validation": {},
                "dataLink": {}
            },
            {
                "key": "flavor",
                "label": "规格",
                "description": "规格",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": true,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "validation": {
                    "max": "",
                    "min": "",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {
                    "endpoint": "service/cloud_ecs/flavors",
                    "method": "GET",
                    "valueFiled": "id",
                    "textFiled": "description"
                }
            },
            {
                "key": "image",
                "label": "操作系统",
                "description": "操作系统",
                "required": true,
                "type": "string",
                "multiple": false,
                "dependencies": [],
                "created": false,
                "modified": true,
                "tableColum": true,
                "quota": false,
                "queryCondition": true,
                "validation": {
                    "max": "",
                    "min": "",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {
                    "endpoint": "service/cloud_ecs/images",
                    "method": "GET",
                    "valueFiled": "id",
                    "textFiled": "description"
                }
            },
            {
                "key": "sys_disk_size",
                "label": "系统盘容量",
                "description": "系统盘容量",
                "required": true,
                "type": "integer",
                "multiple": false,
                "dependencies": [],
                "created": true,
                "modified": false,
                "tableColum": true,
                "quota": false,
                "queryCondition": false,
                "validation": {
                    "max": "40",
                    "min": "100",
                    "reg": "",
                    "errMsg": ""
                },
                "dataLink": {}
            }
        ],
        "supportProviders": [
            "vsphere",
            "openstack",
            "aliyun"
        ],
        "description": "基于分布式架构，为云主机提供的低时延、持久性、高可靠的数据块级存储。",
        "relatedService": [
            {
                "code": "cloud_volume",
                "referType": "o:m"
            }
        ],
        "modifiable": true,
        "normalActions": {
            "create": {
                "enabled": true,
                "endpoint": {
                    "url": "service/cloud_ecs",
                    "method": "POST"
                },
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": []
            },
            "delete": {
                "enabled": true,
                "endpoint": {
                    "url": "service/cloud_ecs",
                    "method": "DELETE"
                },
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": []
            },
            "modify": {
                "enabled": true,
                "endpoint": {
                    "url": "service/cloud_ecs",
                    "method": "PUT"
                },
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": []
            }
        },
        "actions": [
            {
                "name": "unmount",
                "label": "卸载",
                "endpoint": {
                    "url": "service/cloud_ecs/start",
                    "method": "GET"
                },
                "description": "卸载云硬盘",
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": [],
                "multiple": true
            },
            {
                "name": "mount",
                "label": "挂载",
                "endpoint": {
                    "url": "service/cloud_ecs/stop",
                    "method": "GET"
                },
                "description": "挂载云硬盘",
                "supportProviders": [
                    "vsphere",
                    "openstack",
                    "aliyun"
                ],
                "roles": [],
                "multiple": true
            }
        ]
    }
]
