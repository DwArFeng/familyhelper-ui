# familyhelper-ui

## 项目简介

家庭助手系统的前端。

该项目提供一个标准的网页前端，供用户进行交互。

---

## 特性

- 基于 maven 进行项目托管，可一键打 war 包，使用方便。
- view 模块基于 pnpm + monorepo，实现项目内功能模块最大化复用。
- 使用 vue3 + 自研 vim（Vue Interactive Model）构建 web 应用，最大化优化开发体验。
- 基于自研打包脚本，在 monorepo 项目打包时，多包并行打包，并能正确处理依赖关系。

## 文档

该项目的文档位于 [docs](./docs) 目录下，包括：

### wiki

wiki 为项目的开发人员为本项目编写的详细文档，包含不同语言的版本，主要入口为：

1. [简介](docs/wiki/zh-CN/Introduction.md) - 镜像的 `README.md`，与本文件内容基本相同。
2. [目录](docs/wiki/zh-CN/Contents.md) - 文档目录。

## 使用说明

1. 下载源码

   使用 git 进行源码下载。

   ```shell
   git clone git@github.com:DwArFeng/familyhelper-ui.git
   ```

   对于中国用户，可以使用 gitee 进行高速下载。

   ```shell
   git clone git@gitee.com:dwarfeng/familyhelper-ui.git
   ```

2. 项目打包

   进入项目根目录，执行 maven 命令。

   ```shell
   mvn clean package
   ```

3. 解压

   找到打包后的目标文件。

   ```
   familyhelper-ui-distribute/target/familyhelper-ui-distribute-[version]-release.tar.gz
   ```

   将其解压至 windows 系统或者 linux 系统。

4. 配置

   1. 修改 `conf/familyhelper-ui` 文件夹下的配置文件，着重修改日志记录设置。

5. 部署

   将解压并修改后的文件夹部署至 tomcat 服务器中。
   - 将 `conf` 目录下的配置文件复制到 tomcat 的 `conf` 目录下。
   - 将 `webapps` 目录下的文件复制到 tomcat 的 `webapps` 目录下。

6. enjoy it
