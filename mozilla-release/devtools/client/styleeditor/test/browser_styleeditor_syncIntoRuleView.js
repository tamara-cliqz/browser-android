/* vim: set ts=2 et sw=2 tw=80: */
/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */
"use strict";

// Test that changes in the style editor are synchronized into the
// style inspector.

const TEST_URI = `
  <style type='text/css'>
  </style>
  <div id='testid' class='testclass'>Styled Node</div>
`;

const TESTCASE_CSS_SOURCE = "#testid { color: chartreuse; }";

add_task(async function() {
  await addTab("data:text/html;charset=utf-8," + encodeURIComponent(TEST_URI));

  let {inspector, view} = await openRuleView();
  await selectNode("#testid", inspector);

  let { panel, ui } = await openStyleEditor();

  let editor = await ui.editors[0].getSourceEditor();

  let waitForRuleView = view.once("ruleview-refreshed");
  await typeInEditor(editor, panel.panelWindow);
  await waitForRuleView;

  let value = getRuleViewPropertyValue(view, "#testid", "color");
  is(value, "chartreuse", "check that edits were synced to rule view");
});

function typeInEditor(editor, panelWindow) {
  return new Promise(resolve => {
    waitForFocus(function() {
      for (let c of TESTCASE_CSS_SOURCE) {
        EventUtils.synthesizeKey(c, {}, panelWindow);
      }
      ok(editor.unsaved, "new editor has unsaved flag");

      resolve();
    }, panelWindow);
  });
}
