<template>

  <a-layout class="main">
    <a-layout-sider :style="{ height: winHeight - 350 + 'px' }" class='flex-box-sider '>
      <div class="hscroll" :style="{ height: winHeight - 350 + 'px' }">

        <div v-for="(path, index) in current.list" :key="index">
          <a-button class="box-button" v-on:click="changeCurrentMat(path, index)"
            :style="{ 'border-color': isFocused(index) ? '#1890ff' : '#d9d9d9', color: isFocused(index) ? '#1890ff' : '#000' }">
            {{ getFilename(path) }}
          </a-button>
        </div>
      </div>
      <div class='bottom'>
        <canvas ref="imageShowHandle" height="200" width="200" />
      </div>
    </a-layout-sider>
    <a-layout>

      <a-layout-header>
        <a-row type="flex">
          <a-col span="12">
            <a-input-group compact>
              <a-input v-model:value="current.dir" style="width: calc(100% - 32px) " />
              <a-tooltip title="current dir">
                <a-button @click="setDir">
                  <template #icon>
                    <ReloadOutlined />
                  </template>
                </a-button>
              </a-tooltip>
            </a-input-group>
          </a-col>
          <a-col v-if="currentMat" span="12">
            <div class="axis-input-group">
              <div class="axis-input"><span> TYPE: {{ currentMat.channelMode }}</span></div>


              <div class="axis-input" style="display: flex" v-for="(axis, index) in currentMat.ndaxis">
                <span> {{ axis.name }}: </span>

                <span v-if="axis.val.value == 0 && axis.max == 0">{{ axis.value }}</span>
                <span v-else>

                  <a-input-number  :defaultValue="axis.val.value" :min="0" :max="axis.max" @change="handleAxisChange($event,index,axis.name)" />
                </span>
                <!-- <span>{{ axis.max }}{{ axis.val.value }}</span> -->
              </div>
            </div>
          </a-col>

        </a-row>
      </a-layout-header>
      <a-layout-content class="box-content" ref="contentHandle">
        <div v-if="currentMat">
          <NDArrayPixView :inputarr="currentMat.ndarray" :width="winHeight-200" :height="winHeight - 100" />
        </div>
        <div v-else>
          <a-empty :style="{ height: winHeight - 100 + 'px' }" />
        </div>
      </a-layout-content>
      <a-layout-footer>

      </a-layout-footer>
    </a-layout>
  </a-layout>

</template>

<script setup lang="ts">
// TODO 优化单个格子的大小
// import { VueMathjax } from 'vue-mathjax-next'
// import HelloWorld from './components/HelloWorld.vue'
// import TheWelcome from './components/TheWelcome.vue'
import NDArrayPixView from './components/NDArrayPixView.vue'
import { NdView } from "./obj/ndaspect"
import { useElementSize } from '@vueuse/core'
// import log from 'electron-log/renderer';
import { reactive } from 'vue';
// log.info('Log from the Vue renderer process');
import ndarray from 'ndarray'
import { ref, shallowRef, shallowReactive, watch, nextTick, onMounted, computed } from "vue"
import { useWindowSize } from '@vueuse/core'
import { EnterOutlined, PlusOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons-vue'

import npyjs from "npyjs";
let n = new npyjs();
const imageShowHandle: Ref<HTMLCanvasElement> = ref(null)
const contentHandle: Ref<HTMLCanvasElement> = ref(null)

// const currentDir = ref("./data")


const current: {
  list: Array<string>,
  currentMat: NdView,
  dir: string,
  index: number
} = shallowReactive(
  { list: [], currentMat: null, dir: ".", index: 0 }
)
const { width: contentWidth, height: contentHeight } = useElementSize(contentHandle)
const { width: thumbnailWidth, height: thumbnailHeight } = useElementSize(imageShowHandle)
const { width: winWidth, height: winHeight } = useWindowSize()
// console.log('win', winWidth, winHeight)
const heatmapElSize = { width: winHeight.value-200, height: winHeight.value - 30 }

const currentMat = computed(() => {
  if (current.currentMat) {
    const axis = current.currentMat.ndaxis.map((axis) => {
      return {
        name: axis.name,
        val: ref(axis.value),
        max: axis.max
      }

    })
    return {
      channelMode: current.currentMat.channelMode,
      ndaxis: axis,
      ndarray: current.currentMat
    }

  }
  else {
    return false
  }
}
)


const isFocused = function (index: number) {
  return current.index == index
}
// const changeDir = async () => {
//   await setDir('init')
// }
// watch(
//   currentDir,async (newVar,oldVar)=>{
//     console.log('watch current Dir',newVar,oldVar)
//     await setDir()
//   }
// )

const handleAxisChange = (event:number,index: number,name:string)=> {
        console.log("handle change",currentMat.value,event)
        currentMat.value.ndaxis[index].val.value = event;
        current.currentMat.ndaxis[index].value = event
        current.currentMat.ndaxis[index].name = name
        current.currentMat.viewAsPix()

    }

function changeCurrentMat(path: string, index: number) {
  imageShowHandle.value.width = thumbnailWidth.value
  imageShowHandle.value.height = thumbnailWidth.value
  n.load(path, async (array) => {
    const temparr = ndarray(array.data, array.shape);
    current.currentMat = null
    current.index = index
    await nextTick()
    // const heatmapElSize = { width: contentWidth.value, height: winHeight.value-100 }
    console.log('heatmap', heatmapElSize)
    current.currentMat = new NdView(temparr, 
          heatmapElSize,
          imageShowHandle.value,)
    current.currentMat.drawImage()
    console.log('ndaxis', current.currentMat, current.currentMat.ndaxis)
  });
}

const setDir = async function (type: string) {
  console.log('set dir', current.dir)
  try {
    const dirs = await window.electronAPI.setDir({ dir: current.dir, type: type })
    if (dirs) {
      const { dir: dir, index: index, fullnames: fullnames } = dirs
      // console.log('files', fullnames)
      current.list = fullnames
      current.index = index
      changeCurrentMat(fullnames[index], index)
    } else {
      console.error("enputy dir", current.dir, dirs)
    }
  } catch (error) {
    console.log(error)
  }
}
function getFilename(path: string) {
  path = path.replace('\\', '/')
  const index = path.lastIndexOf('/')
  return path.substring(index + 1)
}

onMounted(() => {
  setDir('init')
})
// n.load("zero.npy", (array) => {


// const formula = '$$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.$$'
// console.log('formula',formula)

</script>



<style scoped>
.main {
  width: 100%;
  height: 100%;
  background-color: #f0f2f5;
  /* overflow: hidden; */

}

.axis-input-group {
  display: flex;
  justify-content: flex-end;
  width: 100%
}

.axis-input {
  height: 32px;
  line-height: 32px;
}


.axis-input span {
  color: #ccc;
  font-size: 1.2em;
  margin: 0 10px;
}

.ant-layout-header {
  margin-top: 16px;
  height: 32px;
  background: #f0f2f5;
}

.flex-box-sider {
  display: flex;
  min-height: 100%;
  flex-flow: row wrap;
  background-color: white;
  margin-top: 16px;
  margin-bottom: 16px;
  margin-left: 16px;
  /* width: 300px; */
}

.variable {
  width: 100%;
  /* height: 100px;  */
  /* background: green; */
  align-self: flex-start;
}

.bottom {
  width: 100%;
  /* margin-top: 16px;
    margin-left: 16px; */
  /* height: 50px; */
  /* background: blue; */
  align-self: flex-end;
}

.box-content {
  margin-top: 16px;
  margin-left: 16px;
}

.box-button {
  margin-left: 8px;
  margin-right: 8px;
  margin-bottom: 8px;
  width: calc(100% - 8px);
}

.hscroll {
  overflow: hidden;
  overflow-y: scroll;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-button {
  display: none;
}

::-webkit-scrollbar-thumb {
  background: rgba(144, 147, 153, 0.3);
  cursor: pointer;
  border-radius: 4px;
}

::-webkit-scrollbar-corner {
  display: none;
}

::-webkit-resizer {
  display: none;
}
</style>
