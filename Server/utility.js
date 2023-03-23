const formidable = require('formidable');

let isExt = (fileName) => {
    let ext = fileName.slice(fileName.length - 3, fileName.length);
    if(ext === "xml") return true;
    return false;
}

let parseFile = (req) => new Promise((resolve, reject) => {
    const form = formidable({ multiples: true });
    form.parse(req, async(err, fields, {file}) => {
        if(err) reject(err);
        let { originalFilename } = file;
        if(!file) reject(new Error("No file uploaded"));
        if(!isExt(originalFilename)) reject(new Error("File is not an xml file"));
        resolve(file);
    })
}).catch(err => {
    console.log(err)
    throw e;
})

module.exports = { parseFile }