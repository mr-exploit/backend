require("dotenv").config;
// membuat hash passowrd
const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');
const SALT = Number(process.env.PASSWORD_SALT);

const { Users } = require("../db/models");
const { bad, notfound, ok, created } = require("./statuscode");


const handlelogin = async(req, res) =>{
    const audience = req.header('x-audience');

    const email = req.body.email;
    const password = req.body.password;

    const user = await Users.findOne({
        where: {
            email,
        }
    });

    if(!user){
        res.status(notfound);
        res.json({
            message: 'User not Found'
        });

        return;
    }

    if(!bcrypt.compareSync(password, user.password)){
        res.status(bad);
        res.json({
            message : "wrong password",
        });

        return;
    }

    const token = jwt.sign({
        sub : user.id,
        iss : 'skilvul',
        aud : audience,
        exp : parseInt(((new Date()).getTime() / 1000) + 5 * 60 * 60),
    }, process.env.JWT_SECRET);

    res.status(ok);
    res.json({
        message : "Login Success",
        data : token
    });
}

const handleregister = async (req,res) =>{
    try {
        const {name, email, password} = req.body;
        const role = 'user';

        // mencari data user, jika email sama maka ditolak 
        const user = await Users.findOne({
            where:{
                email,
            }
        });
    
        // jika data user email sudah ada, cari yang lain
        if(user){
            res.status(bad);
            res.json({
                error: 'user already exist. Please Login!'
            });
            return;
        }
    
        // encrypt password
        const encryptedPassword = bcrypt.hashSync(password, SALT);
    
        // create user
        const createuser = await Users.create({
            name,
            email,
            password : encryptedPassword,
            role : role
        });
    
        res.status(created).json({
            message : "successfuly",
            data : createuser
        });
    } catch (error) {
        res.status(bad).json(error);
    }
    
}

// const handlechangepassword = async (req,res, next) =>{
    
// }

module.exports = {
    handlelogin,
    handleregister
}