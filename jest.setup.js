const { JSDOM } = require('jsdom');


const dom = new JSDOM('<!doctype html><html><body></body></html>');

global.TextEncoder = require('util').TextEncoder;
global.document = dom.window.document;
global.window = dom.window;
global.navigator = dom.window.navigator;

console.log('Setup file executed');
