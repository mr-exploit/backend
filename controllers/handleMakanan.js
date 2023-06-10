require("dotenv").config();
const { Makanan } = require("../db/models");
const { cloudinaryconf } = require("./confcloudinary");
const { created, notfound, ok, bad, servererror } = require("./statuscode");

const cloudinary = require('cloudinary').v2;

// Configuration 
cloudinaryconf();  


const handleMakananGetAll = async function(req, res) {
    const makanan = await Makanan.findAll();
    const response = {
        status: "SUCCESS",
        message: "Get All Foods",
        meta: {
            total: makanan.length
        },
        data: makanan,
    }
    res.status(created).json(response)
    return;
};

const handleMakananGetById = async function(req,res) {
    const uuid = req.params.id;

    const makanan = await Makanan.findAll({
        where:{
            uuid: uuid
        }
    });
    let response = {
        status: "SUCCESS",
        message: "Get Food Detail",
        data: makanan
    }
    if(!makanan){
        res.status(notfound);
        res.json({
            message: 'Foods not Found'
        });
    }
    res.statu(created).json(response)
    return;
};

const handleCreateMakanan = async function(req, res) {
    const body = req.body;
    const kategori = 'makanan';

    try {
        const _base64 = Buffer.from(req.files.img.data, 'base64').toString('base64');
        const base64 = `data:image/jpeg;base64,${_base64}`;

        const cloudinary_Response = await cloudinary.uploader.upload(base64, 
            {folder:"edukasi/makanan", public_id: new Date().getTime()
        });

        const imgmakanan = cloudinary_Response.secure_url;

        const createMakanan = await Makanan.create({
            judul : body.judul,
            deskripsi_singkat: body.deskripsi_singkat,
            deskripsi_lengkap: body.deskripsi_lengkap,
            tips: body.tips,
            img: imgmakanan,
            jumlah_kalori: body.jumlah_kalori,
            level: body.level,
            kategori: kategori
        });
        response = {
            status: "SUCCESS",
            message: "Create Makanan",
            data: createMakanan,
        }
        return res.status(ok).json(response);
    } catch (error){
        response = {
            status: "Bad Request",
            message: error.message
        }
        res.status(bad).json(response)
    } 
}

const handleUpdateMakanan = async function(req, res) {
    try {
        const uuid = req.params.id;
        const body = req.body; 

        const makanan = await Makanan.findOne({
            where: {
                uuid: uuid
            }
        });

        if(!makanan){
            return res.status(notfound).json({
                message: "Food You Looking For Is Not Found"
            });
        }

        // const updateimgmakanan = req.params.img_makanan;
        // const updateimg = await cloudinary.uploader.update(`edukasi/makanan/${updateimgmakanan}`, {type: "fetch", invalidate: true, folder: `edukasi/makanan/${updateimgmakanan}`});
        // console.log(updateimg);

        const judul = body.judul;
        const deskripsi_singkat = body.deskripsi_singkat;
        const deskripsi_lengkap = body.deskripsi_lengkap;
        const tips = body.tips;
        // const img_makanan = body.img_makanan;
        const jumlah_kalori = body.jumlah_kalori;
        const level = body.level;

        const updatemakanan = await Makanan.update({
            judul: judul,
            deskripsi_singkat: deskripsi_singkat,
            deskripsi_lengkap: deskripsi_lengkap,
            tips: tips,
            jumlah_kalori: jumlah_kalori,
            level: level,
        }, {
            where: {
                uuid: uuid
            }
        });

        if(updatemakanan){
            response = {
                status: "SUCCESS",
                message: "Update Success",
            }
            return res.status(created).json(response);
        }
    } catch (error) {
        return res.status(servererror).json({
            error: error.message
        });
    };

}

const handleDeleteMakanan = async function(req, res) {
    const uuid = req.params.id;

    try {
        const fordeletemakanan = await Makanan.findOne({
            where: { uuid : uuid }
        });

        const deletemakanan = await Makanan.destroy({
            where: {uuid: uuid},
        });

        if(!fordeletemakanan){
            return res.status(notfound).json({
                error: 'Makanan Not Found'
            })
        }

        const imgPublicIdSplit = fordeletemakanan.img.split('/');

        const imgPublicId = imgPublicIdSplit[imgPublicIdSplit.length - 1];
        const publicId = imgPublicId.split('.')[0]
        const hapusimg = await cloudinary.uploader.destroy(`edukasi/makanan/${publicId}`,  {folder: `edukasi/makanan/${publicId}`});

        if(deletemakanan){
            return res.status(ok).json({
                message: "FOOD HAS BEEN DELETED",
                img: hapusimg
            });
        } 
    } catch (error) {
        return res.status(servererror).json({
            error: 'SERVER ERROR',
            message: error.message
        });
    }
}

const handleDeleteAllMakanan = async function(req, res) {
    try {
        await Makanan.destroy({
            where: {},
            truncate: true,
        });
        return res.status(ok).send();
    } catch(error) {
        return res.status(servererror).json({
            error: 'Server Error',
            message: error.message
        });
    }
};


module.exports = {
    handleMakananGetAll,
    handleMakananGetById,
    handleCreateMakanan,
    handleDeleteMakanan,
    handleUpdateMakanan,
    handleDeleteAllMakanan
}