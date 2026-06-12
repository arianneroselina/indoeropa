import { Blob } from "buffer";
import { notion } from "./client.js";

export async function uploadNotionFile(file) {
	if (!file) return [];

	const fileUpload = await notion.fileUploads.create({
		mode: "single_part",
		filename: file.originalname,
		content_type: file.mimetype,
	});

	await notion.fileUploads.send({
		file_upload_id: fileUpload.id,
		file: {
			filename: file.originalname,
			data: new Blob([file.buffer], {
				type: file.mimetype,
			}),
		},
	});

	return [
		{
			type: "file_upload",
			file_upload: {
				id: fileUpload.id,
			},
			name: file.originalname,
		},
	];
}
