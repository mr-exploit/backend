const { Comment_olahraga, Olahraga } = require("../db/models");
require("dotenv").config;
const { created, ok, notfound, bad, servererror } = require("./statuscode");

const handleCommentOlahragaAll = async (req, res) => {
    const comment_olahraga = await Comment_olahraga.findAll({
        include: {
            model: Olahraga,
            as: 'olahraga'
        }
    });
    const response = {
        status : "SUCCESS",
        message: "Get All Sports Comment",
        meta: {
            total: comment_olahraga.length
        },
        data: comment_olahraga,
    }
    res.status(created).json(response);
    return;
};

const handleCommentOlahragaById = async (req, res) => {
    const uuid = req.params.id;
    const comment_olahraga = await Comment_olahraga.findAll({
        where: {
            uuid: uuid
        }
    });
    let response = {
        status: "SUCCESS",
        message: "Get Comment Detail",
        data: comment_olahraga
    }
    if(!comment_olahraga){
        res.status(notfound);
        res.json({
            message: 'Comment not Found'
        });
        return;
    }
    res.status(created).json(response)
    return
};

const handleCreateCommentOlahraga = async function(req, res) {
    let response = {}
    let code = ok;
    try {
    const newComment = await Comment_olahraga.create({
        id_olahraga: req.params.id,
        bintang: req.body.bintang,
        comment_review: req.body.deskripsi_review
    });

    response = {
        status: "SUCCESS",
        message: "Create New Comment",
        data: newComment
    }
    return res.status(ok).json(response);
} catch(error) {
    response = {
        status: "ERROR",
        message: error.message
    }
       return res.status(bad).json(response)
    }
}

const handleUpdateCommentOlahraga = async function(req,res) {
    let response = {}
    const comment_olahraga = Comment_olahraga.findOne({
        where: {
            uuid: req.params.id
        }
    });

    if(!comment_olahraga){
        response = {
            status: "SUCCESS",
            message: "Comment not Found"
        }
        return;
    } else {
        comment_olahraga.bintang = req.body.bintang
        comment_olahraga.comment_review = req.body.comment_review
        comment_olahraga.save()
        response = {
            status: "SUCCESS",
            message: "Update Comment",
            data: comment_olahraga
        }
    }
    res.status(created).json(response)
    return
}

const handleDeleteCommentOlahragaById = async function(req, res){
    const uuid = req.params.id;

    try {
        const deleteCommentOlahraga = await Comment_olahraga.destroy({
            where: {
                uuid: uuid
            },
        });
        if(deleteCommentOlahraga){
            return res.status(ok).json({
                message: "Comment Has Been Delete"
            });
        }else{
            return res.status(notfound).json({
                error: 'Comment not Found'
            });
        }
    }catch (error){
        console.error(error);
        return res.status(servererror).json({
            error: 'Server error',
            message: error.message
        });
    }
}

const handleDeleteAllCommentOlahraga = async function(req, res){
    try {
        await Comment_olahraga.destroy({
            where: {},
            truncate: true,
        });
        return res.status(ok).send();
    } catch (error){
        return res.status(servererror).json({
            error: 'Server Error',
            message: error.message
        });
    }
};

module.exports = {
    handleCreateCommentOlahraga,
    handleCommentOlahragaAll,
    handleCommentOlahragaById,
    handleUpdateCommentOlahraga,
    handleDeleteCommentOlahragaById,
    handleDeleteAllCommentOlahraga
}