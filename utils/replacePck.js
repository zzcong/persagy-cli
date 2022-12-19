/** @format */

module.exports = function replacePck(pckStr, answers) {
  const nameReg = /("name":).+,/
  const authorReg = /("author":).+,/
  return pckStr
    .replace(nameReg, (m, p1) => {
      return `${p1} "${answers.projectName}",`
    })
    .replace(authorReg, (m, p1) => {
      return `${p1} "${answers.author}",`
    })
}
