import Polygon from '@server/polygon.class'

let rect = new Polygon(
    'normalRect',
    'rect',
    {
        class: 'node',
        stroke: 'rgb(49, 208, 198)',
        'stroke-width': 2,
        fill: 'transparent',
        rx: 10,
        ry: 10,
        width: 400,
        height: 400
    },
    [],
    'rect text'
)

let circle = new Polygon(
    'normalCircle',
    'circle',
    {
        class: 'node',
        r: 40,
        fill: 'tan'
    },
    [],
    'rect text'
)

let rhombus = new Polygon(
    'normalRhombus',
    'polygon',
    {
        class: 'node',
        points: '45,0 90,27 45,54 0,27',
        stroke: '#31d0c6',
        'stroke-width': '2px',
        fill: 'transparent',
        'stroke-dasharray': 0
    }
)
export default [
    rect, circle, rhombus
]
