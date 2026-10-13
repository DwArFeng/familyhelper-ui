# Contents - 目录

文档正在开发中，欢迎参与贡献。

--- 

## 简介

- [Introduction](./Introduction.md) - 简介，与 `README.md` 基本相同。

## 版本黑名单

- [Version Blacklist](./VersionBlacklist.md) - 版本黑名单，列出了本项目的版本黑名单，请注意避免使用这些版本。

## 安装、部署、初始化

### 安装

- [System Requirements](./SystemRequirements.md) - 系统需求，详细说明本项目推荐的系统要求，以及其它版本的测试报告。
- [Compile by Source](./CompileBySource.md) - 从源码编译，详细说明如何从源码编译本项目，以及编译产物的部署方式。

### 部署

- [Familyhelper UI Deployment](./FamilyhelperUiDeployment.md) - 分发包部署与初始化，
  说明外置配置、WAR 文件、Tomcat 部署和部署后的基础运行检查。

### 配置

- [Conf Directory](./ConfDirectory.md) - 配置目录说明，详细说明如何配置本项目，即 `conf/` 目录下的内容。

## 前端 view 模块

- [Familyhelper UI View](./FamilyhelperUiView.md) - 前端 view 模块（monorepo）导读，
  说明模块定位、包划分与后续文档阅读顺序，细节请参阅该目录内 `README.md`。
- [Familyhelper UI View Development](./FamilyhelperUiViewDevelopment.md) - 前端 view 模块本地开发指南，
  说明环境准备、依赖安装、配置生成、构建、单包开发和代码检查流程。
- [Familyhelper UI View API](./FamilyhelperUiViewApi.md) - API 接口请求模块说明，
  介绍 PC、移动端 API 配置、请求客户端，以及二者与 `component-api` 的协作和修改边界。
- [Familyhelper UI View Build Script](./FamilyhelperUiViewBuildScript.md) - VIM 5 构型下 `scripts/build.js`的原理，
  含 workspace 依赖图、并行调度及与 Vue 官方 `scripts/build.js` 的差异说明。
- [VIM Architecture](./VimArchitecture.md) - VIM 总体架构说明，
  梳理 `vim -> api/compreg/library/navigation/router/store/views` 的职责边界、启动链路与协作时序。
