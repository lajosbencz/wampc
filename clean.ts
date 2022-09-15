import { existsSync, readdirSync, lstatSync, unlinkSync, rmdirSync, mkdirSync } from 'fs';

let [path] = process.argv.slice(2);
path = path ?? './dist';

function deleteFolderRecursive(path: string) {
    if (existsSync(path) && lstatSync(path).isDirectory()) {
        readdirSync(path).forEach(function(file: string) {
            const curPath = path + '/' + file;
            if (lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                unlinkSync(curPath);
            }
        });
        console.log(`Deleting directory "${path}"...`);
        rmdirSync(path);
    }
}

console.log('Cleaning working tree...');
deleteFolderRecursive(path);
mkdirSync(path);
console.log('Cleaned working tree!');
