const fs = require('fs');


async function readLocal(filename) {
    // read the file synchronously
    const data = fs.readFileSync(filename, 'utf8');

    const notes = data.split('\n').map((n) => {return n.trim() })
    // print the file contents to the console
    return notes
}

async function getLocal() {
    let  notes = [];
    notes = notes.concat(await readLocal('kata.txt')).concat(await readLocal('saurabh.txt')).concat(await readLocal('shiwei.txt'))

    // console.log(notes)

    return notes
}


module.exports = getLocal