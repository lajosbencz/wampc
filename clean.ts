const fs = require('fs')

let [path] = process.argv.slice(2)
path = path ?? './dist'

function deleteFolderRecursive(path: string) {
    if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
        fs.readdirSync(path).forEach(function (file: string, index: number) {
            const curPath = path + "/" + file
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath)
            } else {
                fs.unlinkSync(curPath)
            }
        })
        console.log(`Deleting directory "${path}"...`)
        fs.rmdirSync(path)
    }
}

console.log("Cleaning working tree...")
deleteFolderRecursive(path)
fs.mkdirSync(path)
console.log("Cleaned working tree!")
