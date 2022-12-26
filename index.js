#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { program } = require('commander')
const download = require('download-git-repo')
const inquirer = require('inquirer')
const chalk = require('chalk')
const logSymbol = require('log-symbols')
const handlebars = require('handlebars')
const ora = require('ora')

const _ = require('lodash')

const pck = require('./package.json')
const defaultConf = require('./config/default.js')
const userConf = require('./config/config.js')

const { replacePck, gitInit } = require('./utils')

const conf = _.assign(defaultConf, userConf)
const spinner = ora('欢迎使用PERSAGTY-VITE模版，下载开始...')

function downTemp(opt) {
  download(opt.url, opt.dir, { clone: true }, opt.cb)
}

program
  .command('init <proName>')
  .description('初始化项目模版')
  .option('-U, --url <url>', 'use your url')
  .option('-T --type <type>', 'select template type. ex: vite webpack')
  // 待实现
  // .option('-T --template <temp>', 'choose webpack or vite', 'vite')
  .action((proName, option) => {
    const opts = Object.assign({}, { url: conf.url, type: 'vite' }, option)
    if (fs.existsSync(path.resolve(process.cwd(), proName))) {
      console.log(chalk.red(logSymbol.error, ' error: %s'), '文件夹已存在！！！')
      process.exit(0)
    }
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'projectName',
          message: '请输入项目名称：',
          default: proName
        },
        {
          type: 'input',
          name: 'author',
          message: '请输入作者：',
          default: ''
        }
      ])
      .then(answers => {
        spinner.start()
        const projectPath = path.resolve(process.cwd(), proName)
        downTemp({
          url: `direct:${opts.url}#${opts.type}`,
          dir: path.resolve(process.cwd(), proName),
          cb: async err => {
            if (err) {
              spinner.fail('下载失败：' + err.message)
              return
            }
            // 写入项目基本信息
            const packagePath = path.resolve(projectPath, 'package.json')
            const packCont = fs.readFileSync(packagePath, { encoding: 'utf-8' })
            fs.writeFileSync(packagePath, replacePck(packCont, answers))
            // 追加忽略文件
            fs.open(path.resolve(process.cwd(), proName, '.gitignore'), 'a', (err, fd) => {
              if (err) {
                spinner.fail('PERSAGTY-VITE：下载失败,请重试!!!')
                return
              }
              fs.writeFileSync(fd, `\n${proName}\n`, { encoding: 'utf8' })
              fs.close(fd)
            })
            if (opts.type === 'vite') {
              // vite写入env
              fs.open(path.resolve(process.cwd(), proName, 'env', '.env'), 'a', (err, fd) => {
                if (err) {
                  return
                }
                fs.writeFileSync(fd, `VITE_BASE_URL=${proName}\n`, { encoding: 'utf8' })
                fs.close(fd)
              })
            }
            // 初始化git
            await gitInit(projectPath)

            spinner.succeed('PERSAGTY-VITE：下载成功！')
            console.log('-'.repeat(88))
            console.log('cd %s', proName)
            console.log('pnpm install')
            console.log('pnpm run dev')
          }
        })
      })
  })

program.version(pck.version)

program
  .command('set-url <url>')
  .description('设置模版地址')
  .action(url => {
    const filePath = path.resolve(__dirname, 'config', 'config.js')
    const configStr = `module.exports = { url: '${url}' }`
    fs.writeFileSync(filePath, configStr)
  })

program
  .command('reset')
  .description('重制下载模版')
  .action(() => {
    const filePath = path.resolve(__dirname, 'config', 'config.js')
    const configStr = `module.exports = {}`
    fs.writeFileSync(filePath, configStr)
  })

program.parse()
