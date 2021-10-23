const fs = require('fs')
const path = require('path')

//const seedfile = path.resolve('../doc/test.csv')
const seedfile = path.resolve('../doc/BanqueNationale.csv')

console.log(`Open ${seedfile} ...`)

fs.readFile(seedfile, 'utf8', (err, data) => {

    if (err) {
        console.error(err)
    } else {
        let x = 0
        const lines = data.split('\n')
        lines.forEach( line => {
            x += 1
            console.log(line.split(',')[1])
            // line.split(',').forEach( item => {
            //     console.log(`${x}: ${item}`)
            // })
        })
    }
})
