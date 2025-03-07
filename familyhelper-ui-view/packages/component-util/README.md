# component-util

## 项目结构

项目结构示意如下：

```
. - 根目录
├─── scripts - 构建脚本
└─── src - 项目源码
```

`mth` 目录提供了一个 ts 文件，这样保证了即使 src 目录下不存在任何 ts 文件，tsc 也能正常编译。
如果没有这个文件，那么在这种状态下，tsc 编译时会报错，报错信息如下：

```
error TS18003: No inputs were found in config file 'xxx/familyhelper-ui-view/packages/component-util/tsconfig.json'...
```

该项目的构建脚本在 `scripts` 目录下。

## 有关 mth 目录

在任何情况下，开发人员都不应该在 `mth` 目录下添加任何其它文件，也不应该在其它模块下引用此文件。

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
