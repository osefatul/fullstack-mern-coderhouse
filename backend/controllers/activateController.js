class ActivateController {
    async activate (req, res){
        const {name, avatar} = req.body;
        if(!name || !avatar){
            req.status(400).json({message:"All fields are required"});
        }

            // Image Base64
            const buffer = Buffer.from(
                avatar.replace(/^data:image\/png;base64,/, ''),
                'base64'
            );
            const imagePath = `${Date.now()}-${Math.round(
                Math.random() * 1e9
            )}.png`;
            // 32478362874-3242342342343432.png
    }
}