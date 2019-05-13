const fs = require('fs');
const util = require('util');

const read = util.promisify(fs.readFile);
const write = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);
const exec = util.promisify(require('child_process').exec);

module.exports = {
    /**
     * saves mocodo script into the corresponding room's mcd file
     */
    save: async (fileName, fileContent) => {
        await write('rooms/' + fileName + '.mcd', fileContent);
    },
    /**
     * loads from the room's mcd file, returns false if the room file does not exist
     */
    load: async (fileName) => {
        try {
            var data = (await read('rooms/' + fileName + '.mcd')).toString();
        } catch(err) {
            var data = false;
        }
        return data;
    },
    generate: async (fileName) => {
        const { stdout, stderr } = await exec('python mocodo/mocodo.py --params_path mocodo/params.json --input rooms/' + fileName + '.mcd');
        if (stderr) return false;
        await unlink('rooms/' + fileName + '_svg.py');
        return (await read('rooms/' + fileName + '.svg')).toString();
    },

    /**
     * deletes the room's mcd file, only for unit testing for now
     */
    nuke: async (fileName) => {
        await unlink('rooms/' + fileName + '.mcd');
    }
};