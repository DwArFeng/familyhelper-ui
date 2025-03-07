# component-api

## 项目结构

项目结构示意如下：

```
. - 根目录
├─── scripts - 构建脚本
└─── src - 项目源码
```

该项目的构建脚本在 `scripts` 目录下。

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
