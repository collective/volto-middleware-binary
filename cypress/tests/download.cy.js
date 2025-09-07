describe('Download Middleware', () => {
  beforeEach(() => {
    cy.autologin();
  });

  it('Create File', function () {
    cy.createContent({
      contentType: 'File',
      contentId: 'my-file',
      contentTitle: 'My File',
    });
    cy.visit('/my-file');
    cy.get('.documentFirstHeading').should('have.text', 'My File');
    cy.get('.view-wrapper a').should(
      'have.attr',
      'href',
      '/my-file/@@download/file',
    );
    // Use cy.request to be able to inspect the response headers
    cy.request('/my-file/@@download/file').then((response) => {
      expect(response.status).to.eq(200);
      // Check that essential headers are proxied correctly
      expect(response.headers).to.have.property(
        'content-type',
        'text/plain; charset=utf-8',
      );
      expect(response.body).to.equal('testfile\n');
    });
  });

  it('Create Image', function () {
    cy.createContent({
      contentType: 'Image',
      contentId: 'my-image',
      contentTitle: 'My Image',
    });

    cy.visit('/my-image');
    cy.get('.documentFirstHeading').should('have.text', 'My Image');
    cy.get('.view-wrapper img')
      .should('have.attr', 'src')
      .and('include', '/my-image/@@images/');
    cy.get('.view-wrapper img').should('have.attr', 'alt', 'My Image');
    // cy.get('.view-wrapper a').click();
  });
});
