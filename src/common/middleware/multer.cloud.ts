import type { Request } from "express";
import multer from "multer";
import { AppError } from "../utils/globalErrorHandling.js";
import { MulterEnum, StoreEnum } from "../enum/multer.enum.js";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";

const multerCloud = ({
    customTypes = MulterEnum.image,
    store_type = StoreEnum.memory,
}: {
    customTypes?: string[];
    store_type?: StoreEnum;
}) => {
    const storage =
        store_type == StoreEnum.memory
            ? multer.memoryStorage()
            : multer.diskStorage({
                destination: tmpdir(),
                filename: function (req, file, cb) {
                    cb(null, `${randomUUID()}-${file.originalname}`);
                },
            });

    function fileFilter(
        req: Request,
        file: Express.Multer.File,
        cb: multer.FileFilterCallback,
    ) {
        if (customTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new AppError("invalid file type"));
        }
    }

    const upload = multer({ storage, fileFilter });
    return upload;
};

export default multerCloud;
