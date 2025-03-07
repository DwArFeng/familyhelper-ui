# component-iconfont

## 项目结构

项目结构示意如下：

```
. - 根目录
├─── sample - 样本，用于演示组件的使用
├─── scripts - 构建脚本
└─── src - 项目源码
```

`sample` 目录下的 `index.html` 文件用于演示组件的使用，在项目打包完成后，该文件可以直接在浏览器中打开。

该项目的构建脚本在 `scripts` 目录下。

## 样本格式化

该项目的样本代码是基于 [iconfont 图标库](https://www.iconfont.cn/) 自动输出的，
因此每当图标更新后，必须重新对样本代码进行格式化。

可以使用以下命令对样本代码进行格式化。

```
pnpx prettier --write sample/
```

## 构建脚本格式化

当开发人员修改该项目的构建脚本时，必须使用以下命令检查脚本格式。

```
pnpx prettier --check scripts/
```

如果脚本格式检查时发现错误，必须调整格式，直至检查无报错。

可以使用以下命令快速格式化所有脚本。

```
pnpx prettier --write scripts/
```

## 项目源码格式化

该项目的源码是基于 [iconfont 图标库](https://www.iconfont.cn/) 自动输出的，
因此每当图标更新后，必须重新对源码进行格式化。

可以使用以下命令对源码进行格式化。

```
pnpx prettier --write src/
```
