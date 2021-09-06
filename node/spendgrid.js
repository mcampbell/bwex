const axios = require('axios');

const http = axios.create();

http.interceptors.request.use(request => {
    console.log('Spendgrid Request', request);
    return request;
});


async function sendMail(body) {
    try {
        const providerInput = {
            'sender': `${body['from_name']} <${body['from']}>`,
            'recipient': `${body['to_name']} <${body['to']}>`,
            'subject': body['subject'],
            'body': body['body']
        };
        const result = await http.post('https://bw-interviews.herokuapp.com/spendgrid/send_email',
            providerInput,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': 'api_key_LQjNN164SxrNgsUh0ubf1Tf8',
                }
            });
        return { status: 'success', result: result.data };
    } catch (err) {
        return { status: 'error', error: err };
    }
}

module.exports.sendMail = sendMail;