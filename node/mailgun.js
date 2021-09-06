const axios = require('axios');

const http = axios.create();
http.interceptors.request.use(request => {
    console.log('Snailgun Request', request);
    return request;
});

/**
 * Send a mail async, then wait for the response.
 * @param body
 * @return {Promise<{error, status: string}|{result: any, status: string}>}
 */
async function sendMail(body) {
    // We could do this in the axios instance creation.
    const BASEURL = 'https://bw-interviews.herokuapp.com/snailgun/emails';

    try {
        const providerInput = {
            'from_email': body['from'],
            'from_name': body['from_name'],
            'to_email': body['to'],
            'to_name': body['to_name'],
            'subject': body['subject'],
            'body': body['body']
        };
        const result = await http.post(BASEURL,
            providerInput,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': 'api_key_gRqnui1717Qte6r06BsndZ9Y'
                }
            }
        );

        // Now we poll until we get a terminal state status.
        const id = result?.data?.id;
        if (!id) {
            throw 'no id returned from mailgun response.';
        }

        let pollResult;
        // I'm not a fan of polling since this can get hung up and never respond, leading to weird client side issues
        // if they don't handle timeouts correctly.  This way can also bombard the server with unthrottled requests
        // while we loop.  JS/node doesn't provide a GOOD way to do sync'd sleep()s due to its single threaded nature.
        // I could figure out a better way around this, but I'd have to do some research into best practices.
        while (true) {
            pollResult = await http.get(`${BASEURL}/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': 'api_key_gRqnui1717Qte6r06BsndZ9Y'
                }
            });
            switch (pollResult?.data?.status) {
                case 'sent':
                    // success!
                    return { status: 'success', result: pollResult.data };
                case 'queued':
                    // try, try again.
                    break;
                case 'failed':
                    // something went wrong.
                    throw {
                        providerResponse: pollResult
                    };
                default:
                    throw `Unexpected status (${pollResult.data.status}) from mailgun.`;
            }
        }

    } catch (err) {
        return { status: 'error', error: err };
    }
}

module.exports.sendMail = sendMail;