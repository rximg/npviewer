<template>
  <div class="main">
        <div ref="pixShowHandle"></div>
        <a-slider  class="sliderv" v-model:value="slider_value.v" :min="0" :max="slider_value.v_max" :reverse="true"
          :vertical="true" />
        <a-slider class="sliderh" v-model:value="slider_value.h" :min="0" :max="slider_value.h_max" :vertical="false" />
  </div>
</template>


<script lang="ts" setup>
//TODO  输入的宽高是反的
import { reactive, onMounted, ref, type Ref, watchEffect } from "vue"
import { Heatmap } from '@antv/g2plot'
import _ from 'lodash'
import { useElementSize } from '@vueuse/core'
const props = defineProps(['inputarr', 'width', 'height'])
// console.log('input data',props.inputarr)
var heatmapPlot: Heatmap = null
var ndview_ist = props.inputarr
const pixShowHandle: Ref<HTMLElement> = ref(null)
const slider_value = reactive(
  {
    v: 0,
    h: 0,
    v_max: 0,
    h_max: 0
  }
)

const { width: elWidth, height: elHeight } = useElementSize(pixShowHandle)


onMounted(
  () => {
    const elSize = { width: props.width, height: props.height }
    console.log('heatmap el size', elSize, elHeight.value, elWidth.value)
    // ndview_ist = new NdView(props.inputarr, elSize,)
    ndview_ist.elementSize = elSize
    const { v_max, h_max } = ndview_ist.get_scroll_region()
    slider_value.v_max = v_max
    slider_value.h_max = h_max
    const data = []
    heatmapPlot = new Heatmap(
      pixShowHandle.value,
      {
        data,
        xField: 'x',
        yField: 'y',
        xAxis: false,
        yAxis: false,
        colorField: 'value',
        color: ['#174c83', '#7eb6d4', '#efefeb', '#efa759', '#9b4d16'],
        tooltip: {
          fields: ['x', 'y', 'value'],
        },
        reflect: 'y',
        label: {
          formatter: (datum) => {
            return datum.format
          },
          style: {
            fill: '#fff',
            shadowBlur: 2,
            shadowColor: 'rgba(0, 0, 0, .45)',
            fontSize: 32,
          },
        },
        autoFit: true,
        width: elSize.width,
        height: elSize.height,
      },

    )
    ndview_ist.register(heatmapPlot)
    // heatmapPlot.render()
    // ndview_ist.viewAsPix(heatmapPlot)
    watchEffect(
      () => {
        // console.log('watchEffect',slider_value,ndview_ist)
        const { v, h } = slider_value
        if (ndview_ist) {
          ndview_ist.set_region(v, h)
          ndview_ist.viewAsPix(heatmapPlot)
          // console.log('get thumbnail', ndview_ist.getThumbnail())
        }
      }
    )
  }

)




</script>

<style scoped>
.main {
  width: 100%;
  height: 100%;
  position: relative;
}
.sliderv{
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  height: 97%;
}
.sliderh{
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 97%;
}
</style>