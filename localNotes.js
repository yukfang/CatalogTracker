const fs = require('fs');


async function readLocal(filename) {
    // read the file synchronously
    const data = fs.readFileSync(filename, 'utf8');

    const notes = data.split('\n').map((n) => {return n.trim() })
    // print the file contents to the console
    return notes
}

async function getLocal() {
    const file1 = 'kate.txt'

    const notes = readLocal(file1)

    // console.log(notes)

    return notes
}


module.exports = getLocal