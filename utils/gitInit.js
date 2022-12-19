/** @format */

const execa = require('execa')

module.exports = async function gitInit(proDir) {
  await execa('cd', [proDir])
  await execa('git', ['init'])
}
