const fs = require('fs');
const util = require('util');

const read = util.promisify(fs.readFile);
const write = util.promisify(fs.writeFile);

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
            var data = await read('rooms/' + fileName + '.mcd');
        } catch(err) {
            var data = false;
        }
        return data;
    }
};