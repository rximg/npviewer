import ndarray from 'ndarray'
// import ndarray-imshow from 'ndarray-imshow'
import * as ops from 'ndarray-ops'
type HeatMapValue = {
    x: string
    y: string
    r?: number
    g?: number
    b?: number
    value: any
  }

function isDot(num:number){
    if (String(num).indexOf('.')>-1){
        return true
    }else{
        return false
    }
}


export function formatRGB({rgb}:HeatMapValue) {
    return `R:${rgb.r}\nG:${rgb.g}\nB:${rgb.b}`
}

export function colorRGB({rgb}) {
    var {r,g,b} = rgb
    var hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return hex
}


export function formatNumber(data:HeatMapValue) {
    // console.log('data',data)
    const {value} = data
    if (isDot(value)){
        return `${data.value.toPrecision(2)}`
    }
    if (value>0 && value<256){
        return `${data.value}`
    }else{
        return `${data.value.toPrecision(2)}`
    }
}




export function assignDataToImagedata(array, data, frame?): any {
    if (array.shape.length === 4) {
      return assignDataToImagedata(array.pick(frame), data, 0)
    } else if (array.shape.length === 3) {
      if (array.shape[2] === 3) {
        ops.assign(
          ndarray(data,
            [array.shape[0], array.shape[1], 3],
            [4, 4 * array.shape[0], 1]),
          array)
        ops.assigns(
          ndarray(data,
            [array.shape[0] * array.shape[1]],
            [4],
            3),
          255)
      } else if (array.shape[2] === 4) {
        ops.assign(
          ndarray(data,
            [array.shape[0], array.shape[1], 4],
            [4, array.shape[0] * 4, 1]),
          array)
      } else if (array.shape[2] === 1) {
        ops.assign(
          ndarray(data,
            [array.shape[0], array.shape[1], 3],
            [4, 4 * array.shape[0], 1]),
          ndarray(array.data,
            [array.shape[0], array.shape[1], 3],
            [array.stride[0], array.stride[1], 0],
            array.offset))
        ops.assigns(
          ndarray(data,
            [array.shape[0] * array.shape[1]],
            [4],
            3),
          255)
      } else {
        return new Error('Incompatible array shape')
      }
    } else if (array.shape.length === 2) {
      ops.assign(
        ndarray(data,
          [array.shape[0], array.shape[1], 3],
          [4, 4 * array.shape[0], 1]),
        ndarray(array.data,
          [array.shape[0], array.shape[1], 3],
          [array.stride[0], array.stride[1], 0],
          array.offset))
      ops.assigns(
        ndarray(data,
          [array.shape[0] * array.shape[1]],
          [4],
          3),
        255)
    } else {
      return new Error('Incompatible array shape')
    }
    return data
  }