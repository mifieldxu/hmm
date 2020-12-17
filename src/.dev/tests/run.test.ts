import * as Mocha from 'mocha';
import * as Chai from 'chai';

Chai.use(require('chai-as-promised'));
Chai.config.includeStack = true;

const { describe } = Mocha;
const { expect } = Chai;
describe('test suite', () => {
    expect(global).to.equal(globalThis);
});
