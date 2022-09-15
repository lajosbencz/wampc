const isNode = new Function('try {return this===global;}catch(e){return false;}');

let bfr: typeof Buffer;
if (isNode) {
    bfr = Buffer;
} else {
    const { Buffer } = require('buffer/');
    bfr = Buffer;
}

export default bfr;
