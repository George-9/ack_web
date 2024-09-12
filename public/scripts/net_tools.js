import { LocalStorageContract } from "./storage/LocalStorageContract.js";

export async function Post(
    url,
    data = {},
    { requiresChurchDetails = false }
) {
    let body = { ...data };

    if (requiresChurchDetails) {
        if ((requiresChurchDetails && requiresChurchDetails === true)) {
            body['church_code'] = LocalStorageContract.churchId();
            body['church_password'] = LocalStorageContract.churchPassword();
        }
    }

    let cli = await fetch(
        url,
        {
            'method': 'POST',
            'headers': { 'content-type': 'application/json', },
            'body': JSON.stringify(body)
        }
    );

    return await cli.json() || await cli.text()
}
