/**
 * Created by aewn
 * Project : roundmatch
 * Filename : Dummy.js
 * Date: 10/11/2022
 **/
exports.test = (request, result) => {
    // console.log(request);
    result.status(200).send({
        message: request.originalUrl + " not implement"
    });
};