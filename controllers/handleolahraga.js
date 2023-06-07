
const { Olahraga } = require("../db/models");
const { cloudinaryconf } = require("./confcloudinary");
const cloudinary = require('cloudinary').v2;
require("dotenv").config;

const { created, ok, notfound, servererror } = require("./statuscode");

// Configuration 
cloudinaryconf();

const handlecreateolhraga = async (req, res) =>{
    const body = req.body;

    const kategori = 'olahraga';
    
    try {
        const _base64 = Buffer.from(req.files.img_olahraga.data, 'base64').toString('base64');
        const base64 = `data:image/jpeg;base64,${_base64}`;
        
        const cloudinaryResponse = await cloudinary.uploader.upload(base64,{folder: "edukasi/olahraga", public_id: new Date().getTime() });

        const imgolahraga = cloudinaryResponse.secure_url;
        
        const createolahraga = await Olahraga.create({
            judul_olahraga : body.judul_olahraga,
            deskripsi_singkat : body.deskripsi_singkat,
            deskripsi_lengkap :body.deskripsi_lengkap,
            tips_olahraga : body.tips_olahraga,
            img_olahraga : imgolahraga,
            jumlah_kalori: body.jumlah_kalori,
            level : body.level,
            kategori : kategori
        });

        response = {
            status : "Success",
            message : "Create Sport",
            data : createolahraga,
        };

        res.status(created).json(response);
    } catch (error) {
        response ={
            status : "ERROR",
            message : error.message
        }
        res.status(servererror).json(response);
    };
}

const handleolhragaall = async (req, res) => {
   try {
        const olahraga = await Olahraga.findAll();
        const response = {
                    status: "SUCCESS",
                    message: "Get All sport",
                    meta: {
                        total: olahraga.length
                    },
                    data: olahraga,
        };

        res.status(ok).json(response);
        return;
   } catch (error) {
        res.status(servererror).json({
            message : error.message
        });
   };
};

const handleolhragaid = async (req, res) => {
    try {
        const  uuid  = req.params.id;

        const olahraga = await Olahraga.findOne({
            where :{
                uuid : uuid
            }
        });
        
        if(!olahraga){
            res.status(notfound);
            res.json({
                message: "sport not Found"
            });

            return;
        }

        let response = {
            status: "SUCCESS",
            message: "Get Detail sport",
            data: olahraga
        }

        res.status(ok).json(response);
        return;
    } catch (error) {
        res.status(servererror).json({
            message : error.message
        });
    };
};



const handleupdateolahraga = async(req, res) =>{
   
    try {
        const uuid = req.params.id;
        const body = req.body;

        const olahraga = await Olahraga.findOne({
            where: {
                uuid : uuid
            }
        });

        if(!olahraga){
            return res.status(notfound).json({
                message : "Sport not found"
            });
        }

        // scriptnya belum bisa dipakai
        const imgPublicIdSplit = olahraga.img_olahraga.split('/');

        const imgPublicId = imgPublicIdSplit[imgPublicIdSplit.length - 1];
        const publicId = imgPublicId.split('.')[0];
        const updateid = `edukasi/olahraga/${publicId}`;
      
        const _base64 = Buffer.from(req.files.img_olahraga.data, 'base64').toString('base64');
        const base64 = `data:image/jpeg;base64,${_base64}`;
        
        const cloudinaryResponse = await cloudinary.uploader.upload(base64,{ public_id: updateid, overwrite: true });

        const updateimgolahraga = cloudinaryResponse.secure_url;

        // fetch a request body
        const judul_olahraga = body.judul_olahraga;
        const deskripsi_singkat = body.deskripsi_singkat;
        const deskripsi_lengkap = body.deskripsi_lengkap;
        const tips_olahraga = body.tips_olahraga;
        const imgolahraga =  updateimgolahraga;
        const jumlah_kalori= body.jumlah_kalori;
        const level = body.level;
    
        const updateolahraga = await Olahraga.update({
            judul_olahraga : judul_olahraga,
            deskripsi_singkat : deskripsi_singkat,
            deskripsi_lengkap :deskripsi_lengkap,
            tips_olahraga : tips_olahraga,
            img_olahraga : imgolahraga,
            jumlah_kalori: jumlah_kalori,
            level : level,
        },{
            where: {
                uuid : uuid
            }
        });

        if(updateolahraga){
            response = {
                status: "Success",
                message : "Update Sport Success",
            }
            return res.status(created).json(response);
        }
    } catch (error) {
        res.status(servererror).json({ 
            error: error.message });
    };
}

const handledeletolahraga = async (req,res) =>{
    const uuid = req.params.id;
    
    try {
        const fordeleteolahraga = await Olahraga.findOne({
            where: { uuid : uuid }
        });
        const deleteolahraga = await Olahraga.destroy({
            where: { uuid: uuid},
        });
        if(!fordeleteolahraga){
            return res.status(notfound).json({
                error: 'Olahraga Not Found'
            })
        }
        const imgPublicIdSplit = fordeleteolahraga.img_olahraga.split('/');

        const imgPublicId = imgPublicIdSplit[imgPublicIdSplit.length - 1];
        const publicId = imgPublicId.split('.')[0];
        
        // delete img olahraga from cloudinary
        const hapusimg = await cloudinary.uploader.destroy(`edukasi/olahraga/${publicId}`,  {folder: `edukasi/olahraga/${publicId}`});
        if(deleteolahraga){
            return res.status(ok).json({
                message : "Sport Has Been Delete",
                img : hapusimg
            });
        }
    } catch (error) {
        res.status(servererror).json({ 
            error: error.message });
    };
}

module.exports = {
    handleolhragaall,
    handleolhragaid,
    handlecreateolhraga,
    handleupdateolahraga,
    handledeletolahraga
}
