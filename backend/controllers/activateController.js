const Jimp = require('jimp');
const path = require('path');
const userService = require('../services/userService');
const UserDto = require('../dtos/userDto');

class ActivateController {

    async activate(req, res) {    
        // Activation logic
        const { name, avatar } = req.body;

        if (!name || !avatar) {
            res.status(400).json({ message: 'All fields are required!' });
        }

        // Image Base64
        const extension = avatar.split("/")[1].split(";")[0]
        const buffer = Buffer.from(
            avatar.replace(/^data:image\/png;base64,/, ''),
            'base64'
        );


        const imagePath = `${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}.${extension}`;
        // 32478362874-3242342342343432.png


        try {
            const jimResp = await Jimp.read(buffer);
            // console.log("jimResp", jimResp);

            jimResp
                .resize(150, 150)
                .write(path.resolve(__dirname, `../storage/${imagePath}`));
        } catch (err) {
            res.status(500).json({ message: 'Could not process the image' });
        }


        const userId = req.user._id;
        // Update user
        try {
            const user = await userService.findUser({ _id: userId });
            if (!user) {
                res.status(404).json({ message: 'User not found!' });
            }
            user.activated = true;
            user.name = name;
            user.avatar = `/storage/${imagePath}`;
            user.save();
            res.json({ user: new UserDto(user), auth: true });
        } catch (err) {
            res.status(500).json({ message: 'Something went wrong!' });
        }
    }
}

module.exports = new ActivateController();