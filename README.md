# GitHub Pages 测试网站

这是一个使用 GitHub Pages 搭建的简单测试网站。

## 如何部署到 GitHub Pages

### 1. 创建 GitHub 仓库

1. 登录你的 GitHub 账号
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 填写仓库名称（例如：`username.github.io`，其中 username 是你的 GitHub 用户名）
4. 设置为公开仓库
5. 点击 "Create repository"

### 2. 本地初始化并推送

在本地仓库目录运行以下命令：

```bash
# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "Initial commit"

# 添加远程仓库地址
git remote add origin https://github.com/your-username/your-repository-name.git

# 推送代码到 GitHub
git push -u origin main
```

### 3. 启用 GitHub Pages

1. 进入 GitHub 仓库页面
2. 点击 "Settings" 标签
3. 在左侧菜单中找到 "Pages"
4. 在 "Branch" 部分，从下拉菜单中选择 "main" 或 "master" 分支
5. 点击 "Save"
6. 等待几分钟，GitHub 会为你部署网站
7. 部署完成后，你可以通过 https://your-username.github.io/your-repository-name 访问你的网站

## 自定义域名（可选）

如果你想使用自定义域名，可以在 GitHub Pages 设置中添加你的域名，并在你的域名提供商处设置相应的 DNS 记录。

## 更多信息

- [GitHub Pages 官方文档](https://pages.github.com/)
- [GitHub Pages 使用指南](https://docs.github.com/cn/pages)