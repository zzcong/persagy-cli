<!-- @format -->

# persagy Vue3 项目 模版生成器

## 下载

```sh
npm i -g persagy-generator-cli
```

## 使用

```sh
persagy-g init <项目名>
```

## 临时使用

```sh
npx persagy-generator-cli init <项目名>
```

## 选择模版类型

```sh
# 默认vite类型, 可选 vite/ webpack
npx persagy-generator-cli init <项目名> --type webpack
```

## 临时指定模版 URL

```sh
persagy-g init <项目名> --url <模版url>
```

## 永久设置模版 URL

```sh
persagy-g set-url <模版url>
```

## 恢复默认模版

```sh
persagy-g reset
```
