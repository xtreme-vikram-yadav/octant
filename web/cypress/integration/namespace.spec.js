describe('Namespace', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('namespaces navigation', () => {
    cy.exec(
      `kubectl config view --minify --output 'jsonpath={..namespace}'`
    ).then(result => {
      cy.contains(/Namespaces/).click();
      cy.contains(result.stdout).should('be.visible');
    });
  });

  it('namespace dropdown', () => {
    cy.get('h2').contains(/Overview/).should('be.visible');

    cy.get('input[role="combobox"]').click();

    cy.get('span[class="ng-option-label ng-star-inserted"]')
      .contains('octant-cypress')
      .parent()
      .click()

    cy.location('hash').should('include', '/' + 'octant-cypress');
  });
});
