export function getErrorInfo(err) {
	return {
		code: err?.cause?.code || err?.code,
		message: err?.message || String(err),
	};
}

export function sendError(res, err, context, fallbackMessage) {
	const { code, message } = getErrorInfo(err);
	const status = err?.status || 500;

	console.error(`Notion error (${context}):`, { code, message });

	return res.status(status).json({
		error: fallbackMessage,
		code,
		message,
	});
}

export function requireFields(res, source, fields) {
	for (const field of fields) {
		if (!source?.[field]) {
			res.status(400).json({
				error: `${field} is required`,
			});

			return false;
		}
	}

	return true;
}

export function badRequest(message) {
	const err = new Error(message);
	err.status = 400;
	return err;
}
