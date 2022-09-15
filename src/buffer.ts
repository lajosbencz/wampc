const isNode = new Function('try {return this===global;}catch(e){return false;}');

let bfr: typeof Buffer;
if (isNode) {
    console.log('using node.Buffer');
    bfr = Buffer;
} else {
    console.log('using npm.Buffer');
    const { Buffer } = require('buffer/');
    bfr = Buffer;
}

export default bfr;
