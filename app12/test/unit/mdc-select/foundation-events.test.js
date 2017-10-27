/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {assert} from 'chai';
import td from 'testdouble';

import {setupFoundationTest} from '../helpers/setup';
import {captureHandlers} from '../helpers/foundation';
import {strings as menuStrings} from '../../../packages/mdc-menu/simple/constants';

import MDCSelectFoundation from '../../../packages/mdc-select/foundation';

const {cssClasses} = MDCSelectFoundation;

function setupTest() {
  const {foundation, mockAdapter} = setupFoundationTest(MDCSelectFoundation);
  td.when(mockAdapter.getNumberOfOptions()).thenReturn(2);
  td.when(mockAdapter.getTextForOptionAtIndex(td.matchers.isA(Number))).thenReturn('text');
  td.when(mockAdapter.create2dRenderingContext()).thenReturn({
    font: '',
    measureText: () => ({width: 100}),
  });
  td.when(mockAdapter.getComputedStyleValue('font')).thenReturn('16px Times');
  td.when(mockAdapter.computeBoundingRect()).thenReturn({
    left: 100,
    top: 100,
  });
  td.when(mockAdapter.getWindowInnerHeight()).thenReturn(500);
  td.when(mockAdapter.getMenuElOffsetHeight()).thenReturn(100);
  const handlers = captureHandlers(mockAdapter, 'registerInteractionHandler');
  const menuHandlers = captureHandlers(mockAdapter, 'registerMenuInteractionHandler');
  foundation.init();

  return {foundation, mockAdapter, handlers, menuHandlers};
}

function createEvent(data) {
  return Object.assign({preventDefault: td.func('.preventDefault')}, data);
}

suite('MDCSelectFoundation - Events');

test('on click opens the menu', () => {
  const {mockAdapter, handlers} = setupTest();
  handlers.click(createEvent());
  td.verify(mockAdapter.addClass(cssClasses.OPEN));
  td.verify(mockAdapter.openMenu(0));
});

test('on click does not open the menu if it is already open', () => {
  const {mockAdapter, handlers} = setupTest();
  td.when(mockAdapter.isMenuOpen()).thenReturn(true);
  handlers.click(createEvent());
  td.verify(mockAdapter.addClass(cssClasses.OPEN), {times: 0});
  td.verify(mockAdapter.openMenu(0), {times: 0});
});

test('on click opens the menu focused at the selected index, if any', () => {
  const {foundation, mockAdapter, handlers} = setupTest();
  foundation.setSelectedIndex(1);
  handlers.click(createEvent());
  td.verify(mockAdapter.openMenu(1));
});

test('on click cancels the event to prevent it from propagating', () => {
  const {handlers} = setupTest();
  const evt = createEvent();
  handlers.click(evt);
  td.verify(evt.preventDefault());
});

test('on ArrowUp keydown on the select itself opens the menu', () => {
  const {mockAdapter, handlers} = setupTest();
  const evt = createEvent({key: 'ArrowUp', eventPhase: Event.AT_TARGET});
  handlers.keydown(evt);
  td.verify(mockAdapter.addClass(cssClasses.OPEN));
  td.verify(mockAdapter.openMenu(0));
  td.verify(evt.preventDefault());
});

test('on ArrowUp keydown works with keyCode', () => {
  const {mockAdapter, handlers} = setupTest();
  const evt = createEvent({keyCode: 38, eventPhase: Event.AT_TARGET});
  handlers.keydown(evt);
  td.verify(mockAdapter.addClass(cssClasses.OPEN));
});

test('on ArrowUp keydown does not open the menu on bubbled events', () => {
  const {mockAdapter, handlers} = setupTest();
  const evt = createEvent({key: 'ArrowUp', eventPhase: Event.BUBBLING_PHASE});
  handlers.keydown(evt);
  td.verify(mockAdapter.addClass(cssClasses.OPEN), {times: 0});
});

test('on ArrowDown keydown on the select itself opens the menu', () => {
  const {mockAdapter, handlers} = setupTest();
  const evt = createEvent({key: 'ArrowDown', eventPhase: Event.AT_TARGET});
  handlers.keydown(evt);
  td.verify(mockAdapter.addClass(cssClasses.OPEN));
  td.verify(mockAdapter.openMenu(0));
  td.verify(evt.preventDefault());
});

test('on ArrowDown keydown works with keyCode', () => {
  const {mockAdapter, handlers} = setupTest();
  const evt = createEvent({keyCode: 40, eventPhase: Event.AT_TARGET});
  handlers.keydown(evt);
  td.verify(mockAdapter.addClass(cssClasses.OPEN));
});

test('on ArrowDown keydown does not open the menu on bubbled events', () => {
  const {mockAdapter, handlers} = setupTest();
  const evt = createEvent({key: 'ArrowDown', eventPhase: Event.BUBBLING_PHASE});
  handlers.keydown(evt);
  td.verify(mockAdapter.addClass(cssClasses.OPEN), {times: 0});
});

test('on Space keydown prevents default to prevent page from scrolling', () => {
  const {handlers} = setupTest();
  const evt = createEvent({key: 'Space', eventPhase: Event.AT_TARGET});
  handlers.keydown(evt);
  td.verify(evt.preventDefault());
});

test('on Space keydown works with keyCode', () => {
  const {handlers} = setupTest();
  const evt = createEvent({keyCode: 32, eventPhase: Event.AT_TARGET});
  handlers.keydown(evt);
  td.verify(evt.preventDefault());
});

test('on Space keyup on the select itself opens the menu', () => {
  const {mockAdapter, handlers} = setupTest();
  const evt = createEvent({key: 'Space', eventPhase: Event.AT_TARGET});
  handlers.keyup(evt);
  td.verify(mockAdapter.addClass(cssClasses.OPEN));
  td.verify(mockAdapter.openMenu(0));
  td.verify(evt.preventDefault());
});

test('on Space keyup works with keyCode', () => {
  const {mockAdapter, handlers} = setupTest();
  const evt = createEvent({keyCode: 32, eventPhase: Event.AT_TARGET});
  handlers.keyup(evt);
  td.verify(mockAdapter.addClass(cssClasses.OPEN));
});

test('on Space keyup does not open the menu on bubbled events', () => {
  const {mockAdapter, handlers} = setupTest();
  const evt = createEvent({key: 'Space', eventPhase: Event.BUBBLING_PHASE});
  handlers.keydown(evt);
  td.verify(mockAdapter.addClass(cssClasses.OPEN), {times: 0});
});

test(`on ${menuStrings.SELECTED_EVENT} updates the selected index to that given by the event`, () => {
  const {foundation, menuHandlers} = setupTest();
  const selected = menuHandlers[menuStrings.SELECTED_EVENT];
  selected(createEvent({detail: {index: 1}}));
  assert.equal(foundation.getSelectedIndex(), 1);
});

test(`on ${menuStrings.SELECTED_EVENT} fires a change event`, () => {
  const {mockAdapter, menuHandlers} = setupTest();
  const selected = menuHandlers[menuStrings.SELECTED_EVENT];
  selected(createEvent({detail: {index: 1}}));
  td.verify(mockAdapter.notifyChange());
});

test(`on ${menuStrings.SELECTED_EVENT} does not fire change event if the index is already the selected index`, () => {
  const {foundation, mockAdapter, menuHandlers} = setupTest();
  const selected = menuHandlers[menuStrings.SELECTED_EVENT];
  foundation.setSelectedIndex(1);
  selected({detail: {index: 1}});
  td.verify(mockAdapter.notifyChange(), {times: 0});
});

test(`on ${menuStrings.SELECTED_EVENT} closes the menu`, () => {
  const {mockAdapter, menuHandlers} = setupTest();
  const selected = menuHandlers[menuStrings.SELECTED_EVENT];
  selected(createEvent({detail: {index: 1}}));
  td.verify(mockAdapter.removeClass(cssClasses.OPEN));
});

test(`on ${menuStrings.SELECTED_EVENT} refocuses on the select element`, () => {
  const {mockAdapter, menuHandlers} = setupTest();
  const selected = menuHandlers[menuStrings.SELECTED_EVENT];
  selected(createEvent({detail: {index: 1}}));
  td.verify(mockAdapter.focus());
});

test(`on ${menuStrings.CANCEL_EVENT} closes the menu`, () => {
  const {mockAdapter, menuHandlers} = setupTest();
  const cancel = menuHandlers[menuStrings.CANCEL_EVENT];
  cancel(createEvent());
  td.verify(mockAdapter.removeClass(cssClasses.OPEN));
});

test(`on ${menuStrings.CANCEL_EVENT} re-focuses the select element`, () => {
  const {mockAdapter, menuHandlers} = setupTest();
  const cancel = menuHandlers[menuStrings.CANCEL_EVENT];
  cancel(createEvent());
  td.verify(mockAdapter.removeClass(cssClasses.OPEN));
});

// NOTE: For purposes of brevity, positioning tests are only done for the click handler.
test('when opened the select positions the menu such that the selected option is over the select', () => {
  const {foundation, mockAdapter, handlers} = setupTest();
  const mockLocation = mockAdapter.computeBoundingRect();
  foundation.setSelectedIndex(1);
  td.when(mockAdapter.getOffsetTopForOptionAtIndex(1)).thenReturn(20);
  handlers.click(createEvent());

  td.verify(mockAdapter.setMenuElStyle('left', `${mockLocation.left}px`));
  td.verify(mockAdapter.setMenuElStyle('top', `${mockLocation.top - 20}px`));
});

test('when opened sets the transform-origin y-coord to be the offset top of the selected item', () => {
  const {foundation, mockAdapter, handlers} = setupTest();
  foundation.setSelectedIndex(1);
  td.when(mockAdapter.getOffsetTopForOptionAtIndex(1)).thenReturn(20);
  handlers.click(createEvent());

  td.verify(mockAdapter.setMenuElStyle('transform-origin', 'center 20px'));
});

test('when opened clamps the menu position to the top of the window if it would be ' +
     'positioned above the window', () => {
  const {foundation, mockAdapter, handlers} = setupTest();
  const mockLocation = mockAdapter.computeBoundingRect();
  foundation.setSelectedIndex(1);
  td.when(mockAdapter.getOffsetTopForOptionAtIndex(1)).thenReturn(mockLocation.top + 20);
  handlers.click(createEvent());

  td.verify(mockAdapter.setMenuElStyle('left', `${mockLocation.left}px`));
  td.verify(mockAdapter.setMenuElStyle('top', '0px'));
});

test('when opened clamps the menu position to the bottom of the window if it would be ' +
          'positioned below the window', () => {
  const {foundation, mockAdapter, handlers} = setupTest();
  const mockInnerHeight = mockAdapter.getWindowInnerHeight();
  const mockMenuHeight = mockAdapter.getMenuElOffsetHeight();

  foundation.setSelectedIndex(1);
  td.when(mockAdapter.computeBoundingRect()).thenReturn({
    left: 100,
    top: mockInnerHeight-40,
  });
  td.when(mockAdapter.getOffsetTopForOptionAtIndex(1)).thenReturn(20);
  handlers.click(createEvent());

  const mockLocation = mockAdapter.computeBoundingRect();
  td.verify(mockAdapter.setMenuElStyle('left', `${mockLocation.left}px`));
  td.verify(
    mockAdapter.setMenuElStyle('top', `${mockInnerHeight - mockMenuHeight}px`)
  );
});

test('when opened clamps the menu position to the top of the window if it cannot ' +
          'find a suitable menu position', () => {
  const {foundation, mockAdapter, handlers} = setupTest();
  const mockMenuHeight = mockAdapter.getMenuElOffsetHeight();

  foundation.setSelectedIndex(1);
  td.when(mockAdapter.getWindowInnerHeight()).thenReturn(mockMenuHeight - 10);
  // Bump off offsetHeight to simulate no good possible placement
  td.when(mockAdapter.getMenuElOffsetHeight()).thenReturn(mockMenuHeight + 10);
  td.when(mockAdapter.getOffsetTopForOptionAtIndex(1)).thenReturn(20);
  handlers.click(createEvent());

  const mockLocation = mockAdapter.computeBoundingRect();
  td.verify(mockAdapter.setMenuElStyle('left', `${mockLocation.left}px`));
  td.verify(mockAdapter.setMenuElStyle('top', '0px'));
});
