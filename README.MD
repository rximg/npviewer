# NPY Viewer

## 介绍
npviewer 是一个应用程序，它允许您以热图的形式可视化 numpy 的 npy 文件中的数据。该应用程序根据不同的模式自动选择适当的维度进行显示。

## 特性
- 根据不同的模式自动选择适当的维度进行显示
- 支持不同格式的 numpy 数据的可视化，如 RGB 和灰度
- 用户友好的界面
- 使用现代技术构建，如 vue3、typescript、atdv/g2plot 和 antdesignvue

## 维度说明
| 模式名称 | 数据类型 | 维度 | 显示结果 | 常用格式 |
| --- | --- | --- | --- | --- |
| GRAY | uint8 | 2 | 显示为灰度图 | 常用于opencv读取出的numpy格式的灰度图像 |
| RGB | uint8 | 3 | 显示为RGB彩图 | 常用于opencv读取出的numpy格式的RGB图像 |
| HWC | 其它 | 3 | 显示为彩色热图 | 常用于3维数据，需要在设置中选择通道 |
| BCHW | 其它 | 4 | 显示为彩色热图 | 常用于4维数据，支持选择batch和channel的显示 |
| XCHW | 其它 | 大于4 | 显示为彩色热图 | 常用于大于4维数据，支持选择多个channel的显示 |

## 快速开始
在github项目的[release](https://github.com/rximg/npviewer/releases)里下载对应版本。

有两种方式打开：

1. 点击.npy文件打开。这种方式打开会显示当前关注的矩阵。同时显示该文件夹下的其他矩阵。
   <img src="./doc/openfile.jpg" alt="openfile">
2. 在桌面上打开npyviewr的快捷方式，并在地址栏输入要加载的文件目录或者npy文件。
   <img src="./doc/viewbydir.jpg" alt="viewbydir">
3. 拿这个项目下的Gradient.npy文件试试吧。


## 开发
1. 克隆存储库：`git clone https://github.com/npviewer.git`
2. 安装依赖项：`npm install`
3. 启动开发服务器: `npm run dev`

## 打包
执行`npm run build`进行打包


## License
该项目采用 MIT License.

## 联系我们
欢迎使用并提交issue，可以帮我更好的改善该项目。

