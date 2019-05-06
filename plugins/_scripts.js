const fs = require('fs');
const util = require('util');

const read = util.promisify(fs.readFile);
const write = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);

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

    /**
     * deletes the room's mcd file, only for unit testing for now
     */
    nuke: async (fileName) => {
        await unlink('rooms/' + fileName + '.mcd');
    }
};