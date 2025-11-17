const userModel = require("../Models/userModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports.registration = async function (req, res) {
    try {
        let data = req.body
        const { email, password,deviceId, deviceType} = data
        let emailExist = await userModel.findOne({ email: email })
        if (emailExist != null) {
            return res.status(400).send({ status: false, message: "Entered email is already exist" })
        }
        if (password && password.length < 8 || password.length > 15) { return res.status(400).send({ status: false, massage: "Password should be 8 to 15 characters long" }) }
        const hash = bcrypt.hashSync(password, 6);
        data.password = hash
        data.devices=[
        {
          deviceId,
          deviceType: deviceType || "mobile",
          lastSync: null,
          lastActive: new Date()
        }
      ]
        const createUser = await userModel.create(data)
        return res.status(201).send({ status: true, message: "User created successfully", data: createUser })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports.login = async function (req, res) {
    try {
        const requestbody = req.body;

        const { email, password,deviceId,deviceType } = requestbody;
        const user = await userModel.findOne({ email: email ,isDeleted:false})
        if (!user) {
            return res.status(401).send({ status: false, message: 'Entered EmailId is wrong' })
        }
        const decrpted = bcrypt.compareSync(password, user.password);
        if (decrpted == true) {
            const token = await jwt.sign({
                UserId: user._id,
                email: user.email
            }, "process.env.PRIVATE_KEY", { expiresIn: "10h" })
             const existingDevice = user.devices.find(d => d.deviceId === deviceId);

    if (existingDevice) {
      // Device already registered — just update timestamps
      existingDevice.lastActive = new Date();
    } else {
      // Add new device entry
      user.devices.push({
        deviceId,
        deviceType: deviceType || 'mobile',
        lastSync: null,
        lastActive: new Date()
      });
      user.save()
    }
            let update = await userModel.findOneAndUpdate({ email: email,isDeleted:false }, { token: token });
            return res.status(200).send({ status: true, message: 'User logged in successfully', data: { userId: user._id, token: token } })
        }
        else {
            res.status(400).send({ status: false, message: "Entered password is incorrect" })
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports.editProfile = async function (req, res) {
    try {
        let profile = req.body
        let userId = req.user._id.toString();
        let updated = await userModel.findOneAndUpdate({ _id: userId,isDeleted:false}, { $set: profile }, { new: true })
        return res.status(200).send({ status: true, message: "Data updated succefully", data: updated })
       } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
       }
}

module.exports.getMinorMembersList = async function (req, res) {
    try {
        // let minorsList = req.user.minorMembers
        // const allData = await userModel.find({
        //     _id: { $in: [minorsList] }
        // });
        if (req.user.role !== 'primary') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const minors = await userModel.find({ parentId: req.user._id.toString(), role: 'minor',isDeleted:false })
            .select('_id userName relation'); 

        return res.status(200).send({ status: true, message: "User List is here", data: minors })
       } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
       }
}

module.exports.deleteUser = async (req, res) => {
  try {
    const doc = await userModel.findOne({_id:req.user.id.toString(),isDeleted:false});
    if (!doc) return res.status(404).json({ message: 'User not found' });

    doc.isDeleted = true;
    doc.version += 1;
    await doc.save();

    return res.status(200).json({ status: true,message: 'User deleted successfully', data: doc });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};

module.exports.addMinor = async function (req, res) {
    try {
        let data = req.body
        data.parentId= req.user._id.toString();
        const [day, month, year] = data.dob.split("-");
        data.dob = new Date(year,month-1,day);
        let parentExist = await userModel.findOne({ _id:req.user._id.toString(),isDeleted:false })
        if (parentExist == null) {
            return res.status(400).send({ status: false, message: "Parent Account does not exist" })
        }
        const createUser = await userModel.create(data);
        parentExist.minorMembers.push(createUser._id);
        await parentExist.save();

        return res.status(201).send({ status: true, message: "Member created successfully", data: createUser })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports.getProfile = async function (req, res) {
    try {
      
        if (req.user.role !== 'primary') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const user = await userModel.findOne({ _id: req.user._id.toString(),isDeleted:false });
            // .select('_id userName relation'); 

        return res.status(200).send({ status: true, message: "User is here", data: user })
       } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
       }
}

module.exports.logout = async function(req,res){
    try{
        let update = await userModel.findOneAndUpdate({ _id: req.user._id.toString(),isDeleted:false }, { token: null });
        return res.status(200).send({ status: true, message: "User logged out", data: update })

    }catch(error){
        return res.status(500).send({ status: false, message: error.message })
    }
}