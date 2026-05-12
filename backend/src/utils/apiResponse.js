export function success(res, message = "Operation successful", data = {}, statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function list(res, { data = [], total = data.length, page, limit, message = "Operation successful" }) {
  const payload = { success: true, message, count: data.length, total, data };
  if (page && limit) {
    payload.page = Number(page);
    payload.pages = Math.ceil(total / Number(limit));
  }
  return res.json(payload);
}

export function fail(res, message = "Something went wrong", statusCode = 400) {
  return res.status(statusCode).json({ success: false, message });
}
