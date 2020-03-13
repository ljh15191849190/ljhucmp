<template lang="pug">
div
    svg.gauge-chart(:width="container.width" :height="container.height")
        g.circle
            circle.inner(:cx="gaugeCenter[0]" :cy="gaugeCenter[1]" :r="pivotRadius")
        g.bands
        g.tickMarks
            g.minorTickMarks
            g.majorTickMarks
        g.tickLabels
        g.titleLabel
            text(
                :x="gaugeCenter[0]"
                :y="gaugeCenter[1] - gaugeRadius + gaugeRadius / 2 + labelFontSize / 2"
                :dy="labelFontSize / 2"
                :text="title"
                text-anchor="middle"
                :font-size="labelFontSize + 'px'"
                fill="#ddd"
                stroke-width="0px"
            ) {{ title }}
        g.unitLabels
            text(
                :x="gaugeCenter[0]"
                :y="gaugeCenter[1] + pivotRadius * 2 + labelFontSize  - gaugeRadius / 2"
                :dy="labelFontSize / 2"
                :text="title"
                text-anchor="middle"
                :font-size="labelFontSize + 'px'"
                fill="#ddd"
                stroke-width="0px"
            ) {{ needleVal + unit }}
        g.needle
</template>
<script>
/**
* @description gauge chart based on D3.js
* @author xinghua.wen
*/
import * as d3 from 'd3'

export default {
    props: {
        // domain
        domain: {
            type: Array,
            default: function () {
                return [0, 100]
            }
        },
        // range
        range: {
            type: Array,
            default: function () {
                return [60, 300]
            }
        },
        // any diffrent level part for better display
        zoons: {
            type: Array,
            default: function () {
                return []
            }
            // example
            // [
            //     { from: 0, to: 30, color: 'green' },
            //     { from: 30, to: 80, color: 'yellow' },
            //     { from: 0, to: 100, color: 'red' }
            // ]
        },

        // chart real value
        value: {
            type: Number,
            default: 0
        },

        // unit for suffix for better display
        unit: {
            type: String,
            default: ''
        },

        padding: {
            type: Number,
            default: 0.05
        },

        edgeWidth: {
            type: Number,
            default: 0.05
        },

        tickEdgeGap: {
            type: Number,
            default: 0.05
        },

        tickLengthMaj: {
            type: Number,
            default: 0.15
        },

        tickLengthMin: {
            type: Number,
            default: 0.05
        },

        ticknessGaugeBasis: {
            type: Number,
            default: 200
        },

        tickWidthMaj: {
            type: Number,
            default: 3
        },

        tickWidthMin: {
            type: Number,
            default: 1
        },

        tickSpaceMajVal: {
            type: Number,
            default: 10
        },

        tickSpaceMinVal: {
            type: Number,
            default: 1
        },

        pivotRadius: {
           type: Number,
           default: 15
        },

        labelFontSize: {
            type: Number,
            default: 16
        },

        zeroNeedleAngle: {
            type: Number,
            default: 40
        },

        maxNeedleAngle: {
            type: Number,
            default: 320
        },

        needleLengthNeg: {
            type: Number,
            default: 0.2
        },

        needleTickGap: {
            type: Number,
            default: 0.05
        },

        needleWidth: {
            type: Number,
            default: 5
        },

        needleVal: {
            type: Number,
            default: 60
        },

        title: {
            type: String,
            default: ''
        }
    },

    data () {
        return {
            container: {
                width: 20,
                height: 20
            },
            tickCircleRadius: 5,
            gaugeCenter: [5, 5],
            gaugeRadius: 10,
            valueScale: null,
            tickSpacingMajDeg: 0,
            tickSpacingMinDeg: 0
        }
    },

    methods: {
        /**
        * @description draw all ticks of the gauge
         */
        drawTicks () {},

        /**
        * @description draw all zoons for better diplay which exist in the outer circle
         */
        drawZoons () {},

        initCantainerSize () {
            this.container.width = this.$el.offsetWidth
            this.container.height = this.$el.offsetHeight
            if (!this.half) {
                this.gaugeRadius = Math.min(this.container.width, this.container.height) / 2
                this.gaugeCenter = [this.container.width / 2, this.container.height / 2]
            } else {
                this.gaugeRadius = Math.min(this.container.width, (this.container.height - this.pivotRadius - 20) * 2) / 2
                this.gaugeCenter = [this.container.width / 2, this.container.height - this.pivotRadius - 20]
            }
        },

        dToR (tickAngle) {
            return Math.PI * tickAngle / 180
        },

        tickCalcMaj (d, i) {
            let tickAngle = d + 90, tickAngleRad = this.dToR(tickAngle)

            let x1 = this.gaugeCenter[0] + (this.tickStartMaj * Math.cos(tickAngleRad))
            let y1 = this.gaugeCenter[1] + (this.tickStartMaj * Math.sin(tickAngleRad))
            let x2 = this.gaugeCenter[0] + ((this.tickStartMaj + this.gaugeSize.tickLengthMaj) * Math.cos(tickAngleRad))
            let y2 = this.gaugeCenter[1] + ((this.tickStartMaj + this.gaugeSize.tickLengthMaj) * Math.sin(tickAngleRad))

            let lineData = [{x: x1, y: y1}, {x: x2, y: y2}]

            let lineFunc = d3.line()
                .x(d => {
                    return d.x
                })
                .y(d => {
                    return d.y
                })

            return lineFunc(lineData)
        },

        tickCalcMin (d, i) {
            let tickAngle = d + 90, tickAngleRad = this.dToR(tickAngle)

            let x1 = this.gaugeCenter[0] + (this.tickStartMin * Math.cos(tickAngleRad))
            let y1 = this.gaugeCenter[1] + (this.tickStartMin * Math.sin(tickAngleRad))
            let x2 = this.gaugeCenter[0] + ((this.tickStartMin + this.gaugeSize.tickLengthMin) * Math.cos(tickAngleRad))
            let y2 = this.gaugeCenter[1] + ((this.tickStartMin + this.gaugeSize.tickLengthMin) * Math.sin(tickAngleRad))

            let lineData = [{x: x1, y: y1}, {x: x2, y: y2}]

            let lineFunc = d3.line()
                .x(d => {
                    return d.x
                })
                .y(d => {
                    return d.y
                })

            return lineFunc(lineData)
        },

        needleCalc (d, i) {
            let nAngleRad = this.dToR(d + 90)

            let y1 = this.gaugeCenter[1],
                y2 = this.gaugeCenter[1] + (this.needle.needlePathLength * Math.sin(nAngleRad)),
                x1 = this.gaugeCenter[0],
                x2 = this.gaugeCenter[0] + (this.needle.needlePathLength * Math.cos(nAngleRad)),

                lineData = [{x: x1, y: y1}, {x: x2, y: y2}]

            let lineFunc = d3.line()
                .x(d => {
                    return d.x
                })
                .y(d => {
                    return d.y
                })

            let lineSVG = lineFunc(lineData)
            return lineSVG
        },

        /**
        * @description draw all ticks of the gauge
         */
        redrawTicks () {
            let ticksMaj = d3.select(this.$el).select('g.majorTickMarks')

            ticksMaj.selectAll('path')
                .data(this.tickAnglesMaj)
                .enter().append('path')
                .attr('d', this.tickCalcMaj)
                .style('stroke-width', this.gaugeSize.tickWidthMaj + 'px')

            let ticksMin = d3.select(this.$el).select('g.minorTickMarks')

            ticksMin.selectAll('path')
                .data(this.tickAnglesMin)
                .enter().append('path')
                .attr('d', this.tickCalcMin)
                .style('stroke-width', this.gaugeSize.tickWidthMin + 'px')

            let tickLabels = d3.select(this.$el).select('.tickLabels')

            tickLabels.selectAll('text')
                .data(this.tickAnglesMaj)
                .enter().append('text')
                .attr('x', (d, i) => {
                    return this.labelXcalc(d, i)
                })
                .attr('y', (d, i) => {
                    return this.labelYcalc(d, i)
                })
                .attr('font-size', this.labelFontSize)
                .attr('text-anchor', 'middle')
                // .style('fill', opt.tickLabelCol)
                .style('font-weight', 'bold')
                // .attr('font-family', opt.tickFont)
                .text((d, i) => {
                    return this.tickLabelText[i]
                })
        },

        drawNeedle () {
            let needleGroup = d3.select(this.$el).select('g.needle')
            let needlePath = needleGroup.selectAll('path')
                .attr('d', this.needleCalc)
                .data(this.needleAngle)
                .enter().append('path')
                .attr('d', this.needleCalc)
                // .style('stroke', opt.needleCol)
                .style('stroke-width', this.needle.needleWidth + 'px')

            needlePath.transition()
                .duration(1000)
                //.delay(0)
                .ease(d3.easeElasticOut, 1, 0.9)
                //.attr("transform", function(d)
                .attrTween('transform', (d, i, a) => {
                    let needleAngle = this.valueScale(this.needleVal)

                    if (needleAngle > this.range[1])
                        needleAngle = this.maxNeedleAngle
                    if (needleAngle < this.range[0])
                        needleAngle = this.zeroNeedleAngle

                    let needleCentre = this.gaugeCenter[0] + ',' + this.gaugeCenter[1],
                        needleRot = needleAngle - this.zeroNeedleAngle
                    return d3.interpolateString('rotate(0,' + needleCentre + ')', 'rotate(' + needleRot + ',' + needleCentre + ')')
                })
        },

        /**
         * @description re-draw the needle after needle value changed
         */
        redrawNeedle (newVal, oldVal) {
            //Set default values if necessary
            if (oldVal === undefined)
                oldVal = this.domain[0]

            let needleGroup = d3.select(this.$el).select('g.needle')
            let needlePath = needleGroup.selectAll('path')

            needlePath.transition()
                .duration(1000)
                //.delay(0)
                .ease(d3.easeElasticOut, 1, 0.9)
                //.attr("transform", function(d)
                .attrTween('transform', (d, i, a) => {
                    let needleAngleOld = this.valueScale(oldVal) - this.zeroNeedleAngle,
                    needleAngleNew = this.valueScale(newVal) - this.zeroNeedleAngle

                    //Check for min/max ends of the needle
                    if (needleAngleOld + this.zeroNeedleAngle > this.range[1])
                        needleAngleOld = this.maxNeedleAngle - this.zeroNeedleAngle
                    if (needleAngleOld + this.zeroNeedleAngle < this.range[0])
                        needleAngleOld = 0
                    if (needleAngleNew + this.zeroNeedleAngle > this.range[1])
                        needleAngleNew = this.maxNeedleAngle - this.zeroNeedleAngle
                    if (needleAngleNew + this.zeroNeedleAngle < this.range[0])
                        needleAngleNew = 0

                    let needleCentre = this.gaugeCenter[0] + ',' + this.gaugeCenter[1]
                    return d3.interpolateString('rotate(' + needleAngleOld + ',' + needleCentre + ')', 'rotate(' + needleAngleNew + ',' + needleCentre + ')')
                })
        },
        labelXcalc (d, i) {
            let tickAngle = d + 90,
                tickAngleRad = this.dToR(tickAngle),
                labelW = this.labelFontSize / (Math.ceil(this.tickLabelText[i].toString().length / 2)),
                x1 = this.gaugeCenter[0] + ((this.labelStart - labelW + this.labelFontSize / 2) * Math.cos(tickAngleRad))
            return x1
        },

        labelYcalc (d, i) {
            var tickAngle = d + 90,
            tickAngleRad = this.dToR(tickAngle),
            y1 = this.gaugeCenter[1] + ((this.labelStart) * Math.sin(tickAngleRad)) + (this.labelFontSize / 2)

            return y1
        },

        /**
        * @description initialize d3.scaleLinear to get a scale function and get max tick & min tick space value
         */
        initScale () {
            this.valueScale = d3.scaleLinear().domain(this.domain).range(this.range)
            this.tickSpacingMajDeg = this.valueScale(this.tickSpaceMajVal) - this.valueScale(0)
            this.tickSpacingMinDeg = this.valueScale(this.tickSpaceMinVal) - this.valueScale(0)
        },

        drawBand (start, end, color) {
            if (end - start <= 0) return
            d3.select(this.$el).select('.bands').append('svg:path')
                .attr('fill', color)
                .attr('d', d3.arc()
                    .startAngle(this.dToR(this.valueScale(start)))
                    .endAngle(this.dToR(this.valueScale(end)))
                    .innerRadius(this.gaugeRadius - this.gaugeSize.padding - this.gaugeSize.edgeWidth - this.gaugeSize.tickEdgeGap)
                    .outerRadius(this.gaugeRadius - this.gaugeSize.edgeWidth - this.gaugeSize.tickEdgeGap)
                )
                .attr('transform', d => { return 'translate(' + this.gaugeCenter[0] + ',' + this.gaugeCenter[1] + ') rotate(180)' })
        },

        /**
        * @description draw all zoons for better diplay which exist in the outer circle
        */
        drawAllBands () {
            this.zoons.forEach(
                zoon => {
                    this.drawBand(zoon.from, zoon.to, zoon.color)
                }
            )
        }
    },

    computed: {
        half () {
            return this.range[0] === 90 && this.range[1] === 270
        },

        gaugeSize () {
            return {
                padding: this.gaugeRadius * this.padding,
                edgeWidth: this.gaugeRadius * this.edgeWidth,
                tickEdgeGap: this.gaugeRadius * this.tickEdgeGap,
                tickLengthMaj: this.gaugeRadius * this.tickLengthMaj,
                tickLengthMin: this.gaugeRadius * this.tickLengthMin,
                tickWidthMaj: this.tickWidthMaj * this.gaugeRadius / this.ticknessGaugeBasis,
                tickWidthMin: this.tickWidthMin * this.gaugeRadius / this.ticknessGaugeBasis
            }
        },

        needle () {
            let rst = {
                needleLengthNeg: this.needleLengthNeg * this.gaugeRadius
            }
            rst.needleTickGap = this.gaugeRadius * this.needleTickGap
            rst.needleLengthPos = this.tickStartMaj
            rst.needlePathLength = rst.needleLengthPos
            rst.needlePathStart = this.half ? rst.needleLengthNeg : rst.needleLengthNeg * (-1)
            rst.needleWidth = this.needleWidth * (this.gaugeRadius / this.ticknessGaugeBasis)

            return rst
        },

        tickStartMaj () {
            return this.gaugeRadius - this.gaugeSize.padding - this.gaugeSize.edgeWidth - this.gaugeSize.tickEdgeGap - this.gaugeSize.tickLengthMaj
        },

        tickStartMin () {
            return this.gaugeRadius - this.gaugeSize.padding - this.gaugeSize.edgeWidth - this.gaugeSize.tickEdgeGap - this.gaugeSize.tickLengthMin
        },

        tickAnglesMaj () {
            let rst = []
            let counter = 0
            for (let i = this.range[0]; i <= this.range[1]; i = i + this.tickSpacingMajDeg) {
                rst.push(this.range[0] + this.tickSpacingMajDeg * counter)
                counter++
            }
            return rst
        },

        tickAnglesMin () {
            let rst = []
            let counter = 0
            for (let i = this.range[0]; i <= this.range[1]; i = i + this.tickSpacingMinDeg) {
                let degree = this.range[0] + this.tickSpacingMinDeg * counter
                if (this.tickAnglesMaj.indexOf(degree) === -1)
                    rst.push(degree)
                counter++
            }
            return rst
        },

        tickLabelText () {
            let rst = []
            let counter = 0
            for (let i = this.range[0]; i <= this.range[1]; i = i + this.tickSpacingMajDeg) {
                rst.push(this.domain[0] + this.tickSpaceMajVal * counter)
                counter++
            }
            return rst
        },

        labelStart () {
            return this.tickStartMaj - this.labelFontSize
        },

        needleAngle () {
            return [this.zeroNeedleAngle]
        }
    },

    watch: {
        needleVal (newVal, oldVal) {
            this.redrawNeedle(newVal, oldVal)
        }
    },
    mounted () {
        this.initCantainerSize()
        this.initScale()
        this.redrawTicks()
        this.drawNeedle()
        this.drawAllBands()
    }
}
</script>
<style lang="scss">
.gauge-chart{
    margin: 0 auto;
}
.majorTickMarks, .minorTickMarks {
    path {
        stroke: #008fff;
    }
}

.tickLabels {
    text {
        fill: #008fff;
    }
}
.needle {
    path {
        stroke: #008fff;
    }
}
.circle {
    circle.inner {
        fill: #008fff;
    }
}
</style>
