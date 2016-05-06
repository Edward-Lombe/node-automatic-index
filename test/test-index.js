'use strict';

const { assert } = require('chai');
const { join } = require('path');

const automaticIndex = require('../index');

describe('automatic-index', function () {
  
  it('should have a test', function() {
    assert(true, 'it doesn\'t have a test');
  });
  
  it('should have exported', function () {
    assert(typeof automaticIndex !== 'undefined');
  });
  
  it('should have a create function', function () {
    const { create } = automaticIndex;
    assert(typeof create === 'function', 'create is not a function');
  });
  
  it('should not throw on the test-module folder', function () {

    const filepath = join(__dirname, 'test-module');
    const { create } = automaticIndex;

    assert.doesNotThrow(testCreate);

    function testCreate() {
      create(filepath);
    }

  })
  
});
