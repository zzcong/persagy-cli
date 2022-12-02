#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const {program} = require('commander')
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

const conf = _.assign(defaultConf, userConf)
const spinner = ora('欢迎使用PERSAGTY-VITE模版，下载开始...')

function downTemp (opt) {
  download(opt.url, opt.dir, {clone: true}, opt.cb)
}

program
  .command('init <proName>')
  .description('初始化项目模版')
  .option('-U, --url <url>', 'use your url')
  // 待实现
  // .option('-T --template <temp>', 'choose webpack or vite', 'vite')
  .action((proName, option) => {
    if (fs.existsSync(path.resolve(process.cwd(), proName))) {
      console.log(chalk.red(logSymbol.error, ' error: %s'), '文件夹已存在！！！')
      process.exit(0)
    }
    inquirer.prompt([
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
    ]).then(answers => {
      spinner.start()
      let url = option.url ? option : conf.url
      downTemp({
        url: `direct:${url}`,
        dir: path.resolve(process.cwd(), proName),
        cb: (err) => {
          if (err) {
            spinner.fail('下载失败：' + err.message)
            return
          }
          spinner.succeed('PERSAGTY-VITE：下载成功！')
          const packagePath = path.resolve(process.cwd(), proName, 'package.json')
          const packCont = fs.readFileSync(packagePath, { encoding: 'utf-8' })
          const template = handlebars.compile(packCont)
          fs.writeFileSync(packagePath, template(answers))
          // 追加忽略文件
          fs.open(path.resolve(process.cwd(), proName, '.gitignore'), 'a', (err, fd) => {
            if (err) {
              return
            }
            fs.writeFileSync(fd, `\n${proName}\n`, {encoding: 'utf8'})
            fs.close(fd)
          })

          console.log('-'.repeat(88))
          console.log('cd %s', proName)
          console.log('npm install')
          console.log('npm run dev')
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
