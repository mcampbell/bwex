describe('BrightWheel Coding Exercise tests', function () {
    it('can pong a ping', function () {
        cy.request({
            log: true,
            url: '/ping',
            method: 'GET',
        }).as('query');

        cy.get('@query').its('status').should('equal', 200);
        cy.get('@query').its('body').should('exist').and('equal', 'pong');
    });

    it('validates a missing POST body', function () {
        cy.request({
            log: true,
            url: '/email',
            method: 'POST',
            failOnStatusCode: false // want to not fail so we can check the status.
        }).as('query');

        cy.get('@query').its('status').should('equal', 400);

        // I'm shortcutting here a bit in the interest of time, also, by not checking full error strings but
        // just representative pieces
        cy.get('@query').its('body')
            .should('contain', 'Usage:')
            .and('contain', 'empty HTTP POST body');
    });

    it('validates an EMPTY POST body', function () {
        cy.request({
            log: true,
            url: '/email',
            method: 'POST',
            body: {},
            failOnStatusCode: false
        }).as('query');

        cy.get('@query').its('status').should('equal', 400);

        cy.get('@query').its('body')
            .should('contain', 'Usage:')
            .and('contain', 'empty HTTP POST body');
    });

    it('validates missing required values', function () {
        // Pass EXTRA data, which is silently ignored, but causes the "empty body" check to be false, so it goes
        // on to check all the constituent parts
        cy.request({
            log: true,
            url: '/email',
            method: 'POST',
            body: { foo: 'bar' },
            failOnStatusCode: false
        }).as('query');

        cy.get('@query').its('status').should('equal', 400);

        cy.get('@query').its('body')
            .should('contain', 'Usage:')
            .and('contain', 'Missing to:')
            .and('contain', 'Missing to_name:')
            .and('contain', 'Missing from:')
            .and('contain', 'Missing from_name:')
            .and('contain', 'Missing subject:')
            .and('contain', 'Missing body:')
            .and('contain', 'If not specified, the \'spendgrid\'');
    });

});

describe('happy path from a provider', function () {
    it('can call spendgrid', function () {
        // Make the call to OUR API, with legit input.
        cy.request({
            log: true,
            url: '/email',
            method: 'POST',
            body: {
                'to': 'susan@abcpreschool.org',
                'to_name': 'Miss Susan',
                'from': 'noreply@mybrightwheel.com',
                'from_name': 'brightwheel',
                'subject': 'Your Weekly Report',
                'body': '<h1>Weekly Report</h1><p>You saved 10 hours this week!</p>',
                'provider': 'spendgrid'
            },
        }).as('query');

        cy.get('@query').its('body.bodyText').should('contain', 'WEEKLY REPORT') // converted from H1
        cy.get('@query').its('body.provider').should('equal', 'spendgrid')
        cy.get('@query').its('body.providerResponse.created_at').should('exist')
        cy.get('@query').its('body.providerResponse.subject').should('equal', 'Your Weekly Report')
    });

    it('can call spendgrid, as a default', function () {
        // Make the call to OUR API, with legit input.
        cy.request({
            log: true,
            url: '/email',
            method: 'POST',
            body: {
                'to': 'susan@abcpreschool.org',
                'to_name': 'Miss Susan',
                'from': 'noreply@mybrightwheel.com',
                'from_name': 'brightwheel',
                'subject': 'Your Weekly Report',
                'body': '<h1>Weekly Report</h1><p>You saved 10 hours this week!</p>',
            },
        }).as('query');

        cy.get('@query').its('body.bodyText').should('contain', 'WEEKLY REPORT') // converted from H1
        cy.get('@query').its('body.provider').should('equal', 'spendgrid')
        cy.get('@query').its('body.providerResponse.created_at').should('exist')
        cy.get('@query').its('body.providerResponse.subject').should('equal', 'Your Weekly Report')
    });

    it('can call mailgun', function () {
        cy.request({
            log: true,
            url: '/email',
            method: 'POST',
            body: {
                'to': 'susan@abcpreschool.org',
                'to_name': 'Miss Susan',
                'from': 'noreply@mybrightwheel.com',
                'from_name': 'brightwheel',
                'subject': 'Your Weekly Report',
                'body': '<h1>Weekly Report</h1><p>You saved 10 hours this week!</p>',
                'provider': 'mailgun'
            },
        }).as('query');

        cy.get('@query').its('body');
        cy.get('@query').its('body.bodyText').should('contain', 'WEEKLY REPORT') // converted from H1
        cy.get('@query').its('body.provider').should('equal', 'mailgun')
        cy.get('@query').its('body.providerResponse.id').should('exist')
        cy.get('@query').its('body.providerResponse.status').should('equal', 'sent')
    });

});