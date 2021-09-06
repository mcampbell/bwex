const express = require('express');
const router = express.Router();
const R = require('ramda');
const isEmail = require('is-email');
const { convert } = require('html-to-text');
const mailgun = require('./mailgun');
const spendgrid = require('./spendgrid');

// ORDERED list of providers to try.
const PROVIDERS = ['spendgrid', 'mailgun']

const errHeader = `
    Usage: HTTP POST to /email with body content of:
    {
      to: ...,
      to_name: ...,
      from: ...,
      from_name: ...,
      subject: ...,
      body: ...,
      [provider: {${PROVIDERS.join('|')}]
    }
    All fields but "provider" are required.  to: and from: must be email addresses.
    If not specified, the '${PROVIDERS[0]}' email provider will be used.
    `;

const errReturn = (err) => {
    return `
${errHeader}
${err}
`;

};

/**
 * Return any input validation errors, or false if there weren't any.
 *
 * @param body
 * @return {string|boolean}
 */
const inputErrorsOn = (body) => {
    const errs = [];

    // Ensure everything is as we require.
    if (!body || R.equals({}, body)) {
        return errReturn('Got empty HTTP POST body.');
    }

    if (!body['to']) {
        errs.push('Missing to: email');
    } else {
        if (!isEmail(body['to'])) {
            errs.push(`to: email value of "${body['to']}" doesn't look like a valid email.`);
        }
    }

    if (!body['to_name']) {
        errs.push('Missing to_name: value');
    }

    if (!body['from']) {
        errs.push('Missing from: email');
    } else {
        if (!isEmail(body['from'])) {
            errs.push(`from: email value of "${body['from']}" doesn't look like a valid email.`);
        }
    }
    if (!body['from_name']) {
        errs.push('Missing from_name: value.');
    }
    if (!body['subject']) {
        errs.push('Missing subject: value.');
    }
    if (!body['body']) {
        errs.push('Missing body: value.');
    }
    if (body['provider'] && !PROVIDERS.includes(body['provider'])) {
        errs.push(`Invalid provider '${body['provider']}'.  If a provider is listed, it must be one of ${PROVIDERS.join(', ')}, or left blank.`);
    }


    if (errs.length > 0) {
        return errReturn(errs.join('\n'));
    }

    return false; // no errors.
};

router.post('/', async (req, res, next) => {

    const body = req.body;
    const invalidInput = inputErrorsOn(body);
    if (invalidInput) {
        res.status(400).send(invalidInput);
    } else {
        // Validation passed.
        const bodyText = convert(body['body'], {
            wordwrap: 90
        });

        // Which email sender to use?
        const provider = body['provider'] || PROVIDERS[0];

        // TODO: Time permitting I would put all the provider CODE modules in a map and just call it directly
        // TODO: allowing for ease of adding providers.
        let providerResponse;

        switch (provider) {
            case PROVIDERS[0]: // spendgrid
                providerResponse = await spendgrid.sendMail(body);
                break;
            case PROVIDERS[1]: // mailgun
                providerResponse = await mailgun.sendMail(body);
        }

        if (providerResponse.status === 'success') {
            res.status(200).send({
                status: 'success',
                bodyText,
                provider,
                providerResponse: providerResponse.result
            });
        } else {
            res.status(502).send({
                status: 'error',
                bodyText,
                provider,
                providerResponse: providerResponse?.error?.message || "Unknown error"
            });

        }
    }
});

module.exports = router;