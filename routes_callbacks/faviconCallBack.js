export function faviconCallBack(_req, resp) {
    resp.status(200).sendFile('./favicon.ico');
}