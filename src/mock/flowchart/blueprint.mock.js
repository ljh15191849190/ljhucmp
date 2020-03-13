/* eslint-disable */
export default [
    { "resources": 
        { "b847e90f-37f1-6d46-7e3b-1f5608d6c893": 
            { "id": "b847e90f-37f1-6d46-7e3b-1f5608d6c893",
              "canvas": { 
                  "_x": 475.0103759765625,
                  "_y": 100.70832824707031,
                  "width": 148,
                  "height": 180,
                  "pId": null 
            },
            "service_code": "ecs", 
            "group": "", 
            "attributes": { 
                "os": '222', 
                "flavor": null, 
                "hostname": null, 
                "instance_name": '2we22' 
            }, 
            "display": { "os": null, "flavor": null, "hostname": null, "instance_name": null }, 
            "reference": null, 
            "includings": { 
                "4cd71448-7a3f-33b0-602b-d0b4d44cbefa": { 
                    "id": "4cd71448-7a3f-33b0-602b-d0b4d44cbefa", 
                    "canvas": { "_x": 503.0103759765625, "_y": 159.70834350585938, "width": 100, "height": 100, "pId": "b847e90f-37f1-6d46-7e3b-1f5608d6c893" }, 
                    "service_code": "volume", 
                    "group": "", 
                    "attributes": { "size": 'dfg', 
                        "instance_name": null, 
                        "ecs_instance_id": 'wer' 
                    }, 
                    "display": { "size": null, "instance_name": null, "ecs_instance_id": null }, "reference": "b847e90f-37f1-6d46-7e3b-1f5608d6c893" } 
                } 
            }, 
            "0d2bcd18-c958-abf7-a0c0-57c994159b40": { 
                "id": "0d2bcd18-c958-abf7-a0c0-57c994159b40", 
                "canvas": { "_x": 223.01040649414062, "_y": 181.7083282470703, "width": 100, "height": 100, "pId": null }, 
                "service_code": "volume", 
                "group": "", 
                "attributes": { 
                    "size": '1234', 
                    "instance_name": 'sdf', 
                    "ecs_instance_id": 'ssssss' 
                }, 
                "display": { "size": null, "instance_name": null, "ecs_instance_id": null },
                "reference": null 
            }
        }, 
        "dependencies": { "4cd71448-7a3f-33b0-602b-d0b4d44cbefa": "0d2bcd18-c958-abf7-a0c0-57c994159b40" } 
    }
]